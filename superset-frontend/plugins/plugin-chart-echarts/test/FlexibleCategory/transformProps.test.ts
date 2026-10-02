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
import { ChartProps, VizType } from '@superset-ui/core';
import { GenericDataType } from '@apache-superset/core/common';
import { supersetTheme } from '@apache-superset/core/theme';
import transformProps from '../../src/FlexibleCategory/transformProps';
import { FlexibleCategoryChartProps } from '../../src/FlexibleCategory/types';
import buildEchartsOption from '../../src/FlexibleCategory/buildEchartsOption';
import buildQuery from '../../src/FlexibleCategory/buildQuery';

const formData = {
  colorScheme: 'supersetColors',
  datasource: '3__table',
  viz_type: VizType.FlexibleCategory,
  metrics: ['sum__num'],
  groupby: ['merchant'],
  numberFormat: 'SMART_NUMBER',
  defaultChartMode: 'bar' as const,
  showChartSwitcher: true,
  showTableToggle: true,
};

const queriesData: { data: Record<string, string | number>[] }[] = [
  {
    data: [
      { merchant: 'Upwork', sum__num: 22200 },
      { merchant: 'Apple Store', sum__num: 15500 },
    ],
  },
];

function createChartProps(
  overrides: Record<string, unknown> = {},
  customQueriesData: {
    data: Record<string, string | number>[];
    colnames?: string[];
    coltypes?: number[];
  }[] = queriesData,
): FlexibleCategoryChartProps {
  return new ChartProps({
    formData: { ...formData, ...overrides },
    width: 800,
    height: 600,
    queriesData: customQueriesData,
    theme: supersetTheme,
    datasource: {
      verboseMap: {},
      columnFormats: {},
      currencyFormats: {},
    },
  }) as FlexibleCategoryChartProps;
}

test('transforms query data into category items', () => {
  const result = transformProps(createChartProps());

  expect(result.width).toBe(800);
  expect(result.height).toBe(600);
  expect(result.defaultChartMode).toBe('bar');
  expect(result.metricLabels).toEqual(['sum__num']);
  expect(result.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Upwork', value: 22200 }),
      expect.objectContaining({ name: 'Apple Store', value: 15500 }),
    ]),
  );
});

test('supports multiple metrics as independent series', () => {
  const result = transformProps(
    createChartProps(
      { metrics: ['sum__num', 'count'] },
      [
        {
          data: [
            { merchant: 'Upwork', sum__num: 22200, count: 12 },
            { merchant: 'Apple Store', sum__num: 15500, count: 8 },
          ],
        },
      ],
    ),
  );

  expect(result.metricLabels).toEqual(['sum__num', 'count']);
  expect(result.categories).toEqual(['Upwork', 'Apple Store']);
  expect(result.series).toHaveLength(2);
  expect(result.series[0].values).toEqual([22200, 15500]);
  expect(result.series[1].values).toEqual([12, 8]);
  expect(result.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Upwork (sum__num)', value: 22200 }),
      expect.objectContaining({ name: 'Upwork (count)', value: 12 }),
    ]),
  );
});

test('buildQuery includes all metrics', () => {
  const queryContext = buildQuery({
    datasource: '1__table',
    viz_type: VizType.FlexibleCategory,
    metrics: ['sum__num', 'count'],
    groupby: ['merchant'],
    sort_by_metric: true,
  } as any);

  expect(queryContext.queries[0].metrics).toEqual(['sum__num', 'count']);
  expect(queryContext.queries[0].orderby).toEqual([['sum__num', false]]);
});

test('formats temporal dimensions instead of raw epoch timestamps', () => {
  const result = transformProps(
    createChartProps(
      {
        groupby: ['year', 'genre'],
        metrics: ['sum__jp_sales'],
        dateFormat: '%Y',
      },
      [
        {
          colnames: ['year', 'genre', 'sum__jp_sales'],
          coltypes: [
            GenericDataType.Temporal,
            GenericDataType.String,
            GenericDataType.Numeric,
          ],
          data: [
            {
              year: 1262304000000,
              genre: 'Role-Playing',
              sum__jp_sales: 6.04,
            },
          ],
        },
      ],
    ),
  );

  expect(result.categories[0]).toBe('2010, Role-Playing');
  expect(result.categories[0]).not.toMatch(/1262304000000/);
});

test('builds horizontal bar echarts options', () => {
  const { data, numberFormatter, categories, series } = transformProps(
    createChartProps(),
  );
  const option = buildEchartsOption('bar', data, numberFormatter, {
    labelColor: '#ffffff',
    categories,
    series,
  });
  const chartSeries = option.series as {
    type: string;
    label: { textBorderWidth: number; color: string };
  }[];

  expect(chartSeries[0].type).toBe('bar');
  expect(chartSeries[0].label.textBorderWidth).toBe(0);
  expect(chartSeries[0].label.color).toBe('#ffffff');
  expect(option.yAxis).toEqual(
    expect.objectContaining({ type: 'category' }),
  );
});

test('builds grouped column bars for multiple metrics', () => {
  const { data, numberFormatter, categories, series } = transformProps(
    createChartProps(
      { metrics: ['sum__num', 'count'] },
      [
        {
          data: [
            { merchant: 'Upwork', sum__num: 22200, count: 12 },
            { merchant: 'Apple Store', sum__num: 15500, count: 8 },
          ],
        },
      ],
    ),
  );
  const option = buildEchartsOption('column', data, numberFormatter, {
    categories,
    series,
  });
  const chartSeries = option.series as { name: string; type: string }[];

  expect(chartSeries).toHaveLength(2);
  expect(chartSeries.map(s => s.name)).toEqual(['sum__num', 'count']);
  expect(option.legend).toEqual(expect.objectContaining({ show: true }));
});

test('builds donut echarts options with inner radius, no labels, and room for legend', () => {
  const { data, numberFormatter } = transformProps(createChartProps());
  const option = buildEchartsOption('donut', data, numberFormatter);
  const chartSeries = option.series as {
    type: string;
    radius: string[];
    center: string[];
    label: { show: boolean };
    labelLine: { show: boolean };
  }[];
  const legend = option.legend as { show: boolean; bottom: number };

  expect(chartSeries[0].type).toBe('pie');
  expect(chartSeries[0].radius).toEqual(['32%', '52%']);
  expect(chartSeries[0].center).toEqual(['50%', '44%']);
  expect(chartSeries[0].label.show).toBe(false);
  expect(chartSeries[0].labelLine.show).toBe(false);
  expect(legend.show).toBe(true);
  expect(legend.bottom).toBe(0);
});

test('builds pie echarts options without labels or leader lines', () => {
  const { data, numberFormatter } = transformProps(createChartProps());
  const option = buildEchartsOption('pie', data, numberFormatter);
  const chartSeries = option.series as {
    type: string;
    radius: string;
    center: string[];
    label: { show: boolean };
    labelLine: { show: boolean };
  }[];

  expect(chartSeries[0].type).toBe('pie');
  expect(chartSeries[0].radius).toBe('52%');
  expect(chartSeries[0].center).toEqual(['50%', '44%']);
  expect(chartSeries[0].label.show).toBe(false);
  expect(chartSeries[0].labelLine.show).toBe(false);
});
