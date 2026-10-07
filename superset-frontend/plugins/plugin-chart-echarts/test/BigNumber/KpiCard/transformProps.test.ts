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
import transformProps from '../../../src/BigNumber/KpiCard/transformProps';

test('renders trend pill from dragged trend metric without multiplying by 100', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [
      {
        data: [
          { sum__amount: 177199, count: 122, pct_change: 60.4 },
        ],
        colnames: ['sum__amount', 'count', 'pct_change'],
      },
    ],
    formData: {
      metric: 'sum__amount',
      secondaryMetric: 'count',
      secondaryLabel: 'leaking transactions',
      trendMetric: 'pct_change',
      title: 'Total leakage',
      description: '14% of company spend is leaking.',
      showTrend: true,
      showTrendValue: true,
      yAxisFormat: '$,.0f',
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    rawFormData: {
      viz_type: 'kpi_card',
      metric: 'sum__amount',
      trend_metric: 'pct_change',
      secondary_metric: 'count',
    },
    datasource: {
      metrics: [
        { metric_name: 'sum__amount', verbose_name: 'Total leakage' },
        { metric_name: 'count', verbose_name: 'Count' },
        { metric_name: 'pct_change', verbose_name: 'Pct change' },
      ],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.showTrend).toBe(true);
  expect(result.trendValue).toBeCloseTo(60.4);
  expect(result.trendValueFormatted).toBe('+60.4%');
  expect(result.bigNumber).toContain('177');
});

test('trend and secondary metrics are resolved independently', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [
      {
        data: [
          { sum__amount: 177199, count: 122, pct_change: 60.4 },
        ],
      },
    ],
    formData: {
      metric: 'sum__amount',
      secondaryMetric: 'count',
      secondaryLabel: 'leaking transactions',
      trendMetric: 'pct_change',
      showTrend: true,
      showTrendValue: true,
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    datasource: {
      metrics: [
        { metric_name: 'sum__amount', verbose_name: 'Amount' },
        { metric_name: 'count', verbose_name: 'Count' },
        { metric_name: 'pct_change', verbose_name: 'Pct change' },
      ],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.subValue).toContain('122');
  expect(result.subValue).toContain('leaking transactions');
  expect(result.showTrend).toBe(true);
  expect(result.trendValue).toBeCloseTo(60.4);
  expect(result.trendValueFormatted).toBe('+60.4%');
});

test('ignores legacy percent d3 format so values are not multiplied by 100', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [{ data: [{ sum__amount: 10, pct_change: 12.5 }] }],
    formData: {
      metric: 'sum__amount',
      trendMetric: 'pct_change',
      trendMetricFormat: '+,.1%',
      showTrend: true,
      showTrendValue: true,
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    datasource: {
      metrics: [
        { metric_name: 'sum__amount', verbose_name: 'Amount' },
        { metric_name: 'pct_change', verbose_name: 'Pct change' },
      ],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.trendValueFormatted).toBe('+12.5%');
});

test('negative trend metric is marked for red down pill', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [{ data: [{ sum__amount: 10, pct_change: -12 }] }],
    formData: {
      metric: 'sum__amount',
      trendMetric: 'pct_change',
      showTrend: true,
      showTrendValue: true,
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    rawFormData: {
      viz_type: 'kpi_card',
      metric: 'sum__amount',
      trend_metric: 'pct_change',
    },
    datasource: {
      metrics: [
        { metric_name: 'sum__amount', verbose_name: 'Amount' },
        { metric_name: 'pct_change', verbose_name: 'Pct change' },
      ],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.showTrend).toBe(true);
  expect(result.trendValue).toBeLessThan(0);
  expect(result.trendValueFormatted).toBe('-12.0%');
});

test('empty title does not fall back to metric label', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [{ data: [{ sum__amount: 100 }] }],
    formData: {
      metric: 'sum__amount',
      title: '',
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    rawFormData: {
      viz_type: 'kpi_card',
      metric: 'sum__amount',
    },
    datasource: {
      metrics: [
        { metric_name: 'sum__amount', verbose_name: 'Total leakage' },
      ],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.title).toBe('');
});
