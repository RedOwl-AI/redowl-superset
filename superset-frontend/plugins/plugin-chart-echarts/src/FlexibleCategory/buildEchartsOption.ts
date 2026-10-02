/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import type { EChartsCoreOption } from 'echarts/core';
import { CategoryDataItem, CategoryMetricSeries, ChartMode } from './types';

type NumberFormatter = (value: number | null | undefined) => string;

type BuildOptionContext = {
  labelColor?: string;
  categories?: string[];
  series?: CategoryMetricSeries[];
};

function valueLabelStyle(labelColor?: string) {
  return {
    // Disable ECharts' default white text stroke — it looks like a glow in dark mode.
    textBorderWidth: 0,
    textBorderColor: 'transparent',
    ...(labelColor ? { color: labelColor } : {}),
  };
}

function pieLikeOption(
  data: CategoryDataItem[],
  numberFormatter: NumberFormatter,
  donut: boolean,
): EChartsCoreOption {
  return {
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      padding: [8, 8, 0, 8],
      data: data.map(item => item.name),
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { name?: string; value?: number; percent?: number }) =>
        `${params.name}: ${numberFormatter(params.value)} (${params.percent}%)`,
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '44%'],
        radius: donut ? ['32%', '52%'] : '52%',
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4 },
        label: { show: false },
        labelLine: { show: false },
        data: data.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  };
}

function groupedBarOption(
  horizontal: boolean,
  categories: string[],
  series: CategoryMetricSeries[],
  numberFormatter: NumberFormatter,
  labelColor?: string,
): EChartsCoreOption {
  const multiSeries = series.length > 1;
  const categoryAxis = {
    type: 'category' as const,
    data: horizontal ? [...categories].reverse() : categories,
    axisTick: { show: false },
    axisLabel: horizontal
      ? undefined
      : { rotate: categories.length > 6 ? 30 : 0 },
  };
  const valueAxis = {
    type: 'value' as const,
    axisLabel: {
      formatter: (value: number) => numberFormatter(value),
    },
  };

  return {
    legend: multiSeries
      ? {
          show: true,
          type: 'scroll',
          top: 0,
          data: series.map(s => s.name),
        }
      : { show: false },
    grid: {
      containLabel: true,
      left: horizontal ? 8 : 16,
      right: horizontal ? 48 : 16,
      top: multiSeries ? 36 : horizontal ? 16 : 24,
      bottom: horizontal ? 24 : 40,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (
        params: { seriesName?: string; name?: string; value?: number }[],
      ) =>
        params
          .map(
            p =>
              `${p.seriesName && multiSeries ? `${p.seriesName}: ` : ''}${p.name}: ${numberFormatter(p.value)}`,
          )
          .join('<br/>'),
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: series.map(s => {
      const values = horizontal ? [...s.values].reverse() : s.values;
      return {
        name: s.name,
        type: 'bar' as const,
        data: values.map(value => ({
          value,
          itemStyle: {
            color: multiSeries ? s.color : undefined,
            borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        })),
        // Single-metric: color each bar by category (from flattened data colors)
        ...(multiSeries
          ? {}
          : {
              // colors applied below via item override when provided
            }),
        label: {
          show: !multiSeries,
          position: horizontal ? 'right' : 'top',
          ...valueLabelStyle(labelColor),
          formatter: (params: { value?: number }) =>
            numberFormatter(params.value),
        },
        barMaxWidth: multiSeries ? 24 : horizontal ? 28 : 40,
      };
    }),
  };
}

export default function buildEchartsOption(
  mode: ChartMode,
  data: CategoryDataItem[],
  numberFormatter: NumberFormatter,
  context: BuildOptionContext = {},
): EChartsCoreOption {
  const { labelColor, categories = [], series = [] } = context;
  const useGroupedBars =
    (mode === 'bar' || mode === 'column') &&
    categories.length > 0 &&
    series.length > 0;

  switch (mode) {
    case 'bar':
    case 'column': {
      if (useGroupedBars) {
        const option = groupedBarOption(
          mode === 'bar',
          categories,
          series,
          numberFormatter,
          labelColor,
        );
        // Single metric: paint bars with per-category colors from flattened data.
        if (series.length === 1 && data.length === categories.length) {
          const colors = data.map(d => d.color);
          const ordered = mode === 'bar' ? [...colors].reverse() : colors;
          const barSeries = (option.series as { data: { itemStyle?: object }[] }[])[0];
          barSeries.data = barSeries.data.map((item, i) => ({
            ...item,
            itemStyle: {
              ...item.itemStyle,
              color: ordered[i],
            },
          }));
        }
        return option;
      }
      // Fallback to flattened single-series bars.
      const names = data.map(d => d.name);
      const values = data.map(d => d.value);
      const colors = data.map(d => d.color);
      if (mode === 'bar') {
        return groupedBarOption(
          true,
          names,
          [{ name: 'Value', color: colors[0] || '#4472C4', values }],
          numberFormatter,
          labelColor,
        );
      }
      return groupedBarOption(
        false,
        names,
        [{ name: 'Value', color: colors[0] || '#4472C4', values }],
        numberFormatter,
        labelColor,
      );
    }
    case 'pie':
      return pieLikeOption(data, numberFormatter, false);
    case 'donut':
      return pieLikeOption(data, numberFormatter, true);
    case 'treemap':
      return {
        legend: { show: false },
        tooltip: {
          formatter: (params: { name?: string; value?: number }) =>
            `${params.name}: ${numberFormatter(params.value)}`,
        },
        series: [
          {
            type: 'treemap',
            roam: false,
            nodeClick: false,
            breadcrumb: { show: false },
            label: {
              show: true,
              formatter: (params: { name?: string; value?: number }) =>
                `${params.name}\n${numberFormatter(params.value)}`,
            },
            itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2 },
            data: data.map(item => ({
              name: item.name,
              value: item.value,
              itemStyle: { color: item.color },
            })),
          },
        ],
      };
    default:
      return {};
  }
}
