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
import { CategoryDataItem, ChartMode } from './types';

type NumberFormatter = (value: number | null | undefined) => string;

type BuildOptionContext = {
  labelColor?: string;
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
    // Theme merges inject legend text styles; configure explicitly so the
    // legend sits below the pie and the series leaves room for it.
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
        // Keep the pie in the upper area so it never collides with the legend.
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

export default function buildEchartsOption(
  mode: ChartMode,
  data: CategoryDataItem[],
  numberFormatter: NumberFormatter,
  context: BuildOptionContext = {},
): EChartsCoreOption {
  const names = data.map(d => d.name);
  const values = data.map(d => d.value);
  const colors = data.map(d => d.color);
  const { labelColor } = context;

  switch (mode) {
    case 'bar':
      return {
        legend: { show: false },
        grid: { containLabel: true, left: 8, right: 48, top: 16, bottom: 24 },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: { name?: string; value?: number }[]) => {
            const p = params[0];
            return `${p?.name}: ${numberFormatter(p?.value)}`;
          },
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => numberFormatter(value),
          },
        },
        yAxis: {
          type: 'category',
          data: [...names].reverse(),
          axisTick: { show: false },
        },
        series: [
          {
            type: 'bar',
            data: [...values].reverse().map((value, i) => ({
              value,
              itemStyle: {
                color: [...colors].reverse()[i],
                borderRadius: [0, 4, 4, 0],
              },
            })),
            label: {
              show: true,
              position: 'right',
              ...valueLabelStyle(labelColor),
              formatter: (params: { value?: number }) =>
                numberFormatter(params.value),
            },
            barMaxWidth: 28,
          },
        ],
      };
    case 'column':
      return {
        legend: { show: false },
        grid: { containLabel: true, left: 16, right: 16, top: 24, bottom: 40 },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: { name?: string; value?: number }[]) => {
            const p = params[0];
            return `${p?.name}: ${numberFormatter(p?.value)}`;
          },
        },
        xAxis: {
          type: 'category',
          data: names,
          axisTick: { show: false },
          axisLabel: { rotate: names.length > 6 ? 30 : 0 },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => numberFormatter(value),
          },
        },
        series: [
          {
            type: 'bar',
            data: values.map((value, i) => ({
              value,
              itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] },
            })),
            label: {
              show: true,
              position: 'top',
              ...valueLabelStyle(labelColor),
              formatter: (params: { value?: number }) =>
                numberFormatter(params.value),
            },
            barMaxWidth: 40,
          },
        ],
      };
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
    case 'funnel':
      return {
        legend: { show: false },
        tooltip: {
          trigger: 'item',
          formatter: (params: { name?: string; value?: number }) =>
            `${params.name}: ${numberFormatter(params.value)}`,
        },
        series: [
          {
            type: 'funnel',
            left: '10%',
            width: '80%',
            sort: 'descending',
            gap: 4,
            label: {
              show: true,
              position: 'inside',
              formatter: (params: { name?: string; value?: number }) =>
                `${params.name}: ${numberFormatter(params.value)}`,
            },
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
