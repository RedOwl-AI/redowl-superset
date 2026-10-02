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
import { supersetTheme } from '@apache-superset/core/theme';
import transformProps from '../../src/FlexibleCategory/transformProps';
import { FlexibleCategoryChartProps } from '../../src/FlexibleCategory/types';
import buildEchartsOption from '../../src/FlexibleCategory/buildEchartsOption';

const formData = {
  colorScheme: 'supersetColors',
  datasource: '3__table',
  viz_type: VizType.FlexibleCategory,
  metric: 'sum__num',
  groupby: ['merchant'],
  numberFormat: 'SMART_NUMBER',
  defaultChartMode: 'bar' as const,
  showChartSwitcher: true,
  showTableToggle: true,
};

const queriesData = [
  {
    data: [
      { merchant: 'Upwork', sum__num: 22200 },
      { merchant: 'Apple Store', sum__num: 15500 },
    ],
  },
];

function createChartProps(
  overrides: Partial<typeof formData> = {},
): FlexibleCategoryChartProps {
  return new ChartProps({
    formData: { ...formData, ...overrides },
    width: 800,
    height: 600,
    queriesData,
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
  expect(result.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Upwork', value: 22200 }),
      expect.objectContaining({ name: 'Apple Store', value: 15500 }),
    ]),
  );
});

test('builds horizontal bar echarts options', () => {
  const { data, numberFormatter } = transformProps(createChartProps());
  const option = buildEchartsOption('bar', data, numberFormatter, {
    labelColor: '#ffffff',
  });
  const series = option.series as {
    type: string;
    label: { textBorderWidth: number; color: string };
  }[];

  expect(series[0].type).toBe('bar');
  expect(series[0].label.textBorderWidth).toBe(0);
  expect(series[0].label.color).toBe('#ffffff');
  expect(option.yAxis).toEqual(
    expect.objectContaining({ type: 'category' }),
  );
});

test('builds donut echarts options with inner radius, no labels, and room for legend', () => {
  const { data, numberFormatter } = transformProps(createChartProps());
  const option = buildEchartsOption('donut', data, numberFormatter);
  const series = option.series as {
    type: string;
    radius: string[];
    center: string[];
    label: { show: boolean };
    labelLine: { show: boolean };
  }[];
  const legend = option.legend as { show: boolean; bottom: number };

  expect(series[0].type).toBe('pie');
  expect(series[0].radius).toEqual(['32%', '52%']);
  expect(series[0].center).toEqual(['50%', '44%']);
  expect(series[0].label.show).toBe(false);
  expect(series[0].labelLine.show).toBe(false);
  expect(legend.show).toBe(true);
  expect(legend.bottom).toBe(0);
});

test('builds pie echarts options without labels or leader lines', () => {
  const { data, numberFormatter } = transformProps(createChartProps());
  const option = buildEchartsOption('pie', data, numberFormatter);
  const series = option.series as {
    type: string;
    radius: string;
    center: string[];
    label: { show: boolean };
    labelLine: { show: boolean };
  }[];

  expect(series[0].type).toBe('pie');
  expect(series[0].radius).toBe('52%');
  expect(series[0].center).toEqual(['50%', '44%']);
  expect(series[0].label.show).toBe(false);
  expect(series[0].labelLine.show).toBe(false);
});
