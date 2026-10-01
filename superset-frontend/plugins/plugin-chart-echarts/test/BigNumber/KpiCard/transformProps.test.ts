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

test('transforms KPI card props with metric and secondary metric', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [
      {
        data: [{ sum__amount: 176163, count: 122 }],
        colnames: ['sum__amount', 'count'],
        coltypes: [0, 0],
      },
    ],
    formData: {
      metric: 'sum__amount',
      secondaryMetric: 'count',
      secondaryLabel: 'leaking transactions',
      title: 'Total leakage',
      description:
        '14% of company spend is leaking — {trend} versus the previous period.',
      yAxisFormat: '$,.0f',
      manualTrendPercent: '59.5',
      showTrend: true,
      showFooterIcon: true,
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    rawFormData: {
      viz_type: 'kpi_card',
      metric: 'sum__amount',
      secondary_metric: 'count',
    },
    datasource: {
      metrics: [
        { metric_name: 'sum__amount', verbose_name: 'Total leakage' },
        { metric_name: 'count', verbose_name: 'Count' },
      ],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.title).toBe('Total leakage');
  expect(result.bigNumber).toContain('176');
  expect(result.subValue).toContain('122');
  expect(result.showTrend).toBe(true);
  expect(result.percentDifferenceNumber).toBeCloseTo(0.595);
  expect(result.description).toMatch(/up .*59\.5/);
});

test('negative manual trend drives down icon', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [{ data: [{ sum__amount: 10 }], colnames: ['sum__amount'] }],
    formData: {
      metric: 'sum__amount',
      manualTrendPercent: '-12.3',
      showTrend: true,
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    rawFormData: { viz_type: 'kpi_card', metric: 'sum__amount' },
    datasource: {
      metrics: [{ metric_name: 'sum__amount', verbose_name: 'Amount' }],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.showTrend).toBe(true);
  expect(result.percentDifferenceNumber).toBeLessThan(0);
});

test('uses free-text subheader when secondary metric is absent', () => {
  const result = transformProps({
    width: 300,
    height: 280,
    queriesData: [{ data: [{ sum__amount: 10 }], colnames: ['sum__amount'] }],
    formData: {
      metric: 'sum__amount',
      subheader: '122 leaking transactions',
      title: 'Total leakage',
      showTrend: false,
      cardBackgroundColor: { r: 250, g: 246, b: 229, a: 1 },
      cardBorderColor: { r: 235, g: 203, b: 139, a: 1 },
    },
    rawFormData: { viz_type: 'kpi_card', metric: 'sum__amount' },
    datasource: {
      metrics: [{ metric_name: 'sum__amount', verbose_name: 'Amount' }],
      currencyFormats: {},
      columnFormats: {},
    },
  } as any);

  expect(result.subValue).toBe('122 leaking transactions');
});
