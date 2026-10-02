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
import {
  CategoricalColorNamespace,
  DataRecord,
  ensureIsArray,
  getColumnLabel,
  getMetricLabel,
  getNumberFormatter,
  getTimeFormatter,
  getValueFormatter,
  QueryFormMetric,
} from '@superset-ui/core';
import { extractGroupbyLabel, getColtypesMapping } from '../utils/series';
import {
  CategoryDataItem,
  CategoryMetricSeries,
  DEFAULT_FORM_DATA,
  FlexibleCategoryChartProps,
  FlexibleCategoryFormData,
  FlexibleCategoryTransformedProps,
} from './types';

function resolveMetrics(formData: FlexibleCategoryFormData): QueryFormMetric[] {
  return ensureIsArray(
    formData.metrics?.length ? formData.metrics : formData.metric,
  ).filter((metric): metric is QueryFormMetric => Boolean(metric));
}

export default function transformProps(
  chartProps: FlexibleCategoryChartProps,
): FlexibleCategoryTransformedProps {
  const { formData, height, queriesData, width, datasource } = chartProps;
  const data: DataRecord[] = queriesData[0]?.data || [];
  const detectedCurrency = queriesData[0]?.detected_currency;
  const coltypeMapping = getColtypesMapping(queriesData[0] || {});

  const {
    colorScheme,
    groupby,
    numberFormat,
    currencyFormat,
    dateFormat = 'smart_date',
    defaultChartMode,
    showChartSwitcher,
    showTableToggle,
    sliceId,
  }: FlexibleCategoryFormData = {
    ...DEFAULT_FORM_DATA,
    ...formData,
  };

  const {
    currencyFormats = {},
    columnFormats = {},
    currencyCodeColumn,
  } = datasource;

  const metrics = resolveMetrics(formData);
  const metricLabels = metrics.map(getMetricLabel);
  const groupbyLabels = ensureIsArray(groupby).map(getColumnLabel);
  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);
  const primaryMetric = metrics[0];
  const timeFormatter = getTimeFormatter(dateFormat);
  const groupbyNumberFormatter = getNumberFormatter(numberFormat);

  const numberFormatter = primaryMetric
    ? getValueFormatter(
        primaryMetric,
        currencyFormats,
        columnFormats,
        numberFormat,
        currencyFormat,
        undefined,
        data,
        currencyCodeColumn,
        detectedCurrency,
      )
    : groupbyNumberFormatter;

  const hasGroupby = groupbyLabels.length > 0;
  const categories = hasGroupby
    ? data.map(datum =>
        extractGroupbyLabel({
          datum,
          groupby: groupbyLabels,
          coltypeMapping,
          timeFormatter,
          numberFormatter: groupbyNumberFormatter,
        }),
      )
    : metricLabels;

  const series: CategoryMetricSeries[] = hasGroupby
    ? metricLabels.map(metricLabel => ({
        name: metricLabel,
        color: colorFn(metricLabel, sliceId),
        values: data.map(datum => Number(datum[metricLabel] ?? 0)),
      }))
    : [
        {
          name: 'Value',
          color: colorFn('Value', sliceId),
          values: metricLabels.map(metricLabel => {
            const datum = data[0] || {};
            return Number(datum[metricLabel] ?? 0);
          }),
        },
      ];

  // Flattened items for pie / donut / treemap (and single-metric bars).
  let flattened: CategoryDataItem[];
  if (!hasGroupby) {
    flattened = metricLabels.map(metricLabel => {
      const datum = data[0] || {};
      return {
        name: metricLabel,
        value: Number(datum[metricLabel] ?? 0),
        color: colorFn(metricLabel, sliceId),
      };
    });
  } else if (metricLabels.length <= 1) {
    const metricLabel = metricLabels[0] || '';
    flattened = categories.map((name, index) => ({
      name,
      value: Number(data[index]?.[metricLabel] ?? 0),
      color: colorFn(name, sliceId),
    }));
  } else {
    // Multiple metrics × categories → "Category (Metric)" slices.
    flattened = [];
    categories.forEach((category, rowIndex) => {
      metricLabels.forEach(metricLabel => {
        flattened.push({
          name: `${category} (${metricLabel})`,
          value: Number(data[rowIndex]?.[metricLabel] ?? 0),
          color: colorFn(`${category} (${metricLabel})`, sliceId),
        });
      });
    });
  }

  const resolvedDefaultMode =
    defaultChartMode &&
    ['bar', 'column', 'pie', 'donut', 'treemap', 'table'].includes(
      defaultChartMode,
    )
      ? defaultChartMode
      : 'bar';

  return {
    width,
    height,
    data: flattened,
    categories,
    series,
    numberFormatter,
    defaultChartMode: resolvedDefaultMode,
    showChartSwitcher: showChartSwitcher ?? true,
    showTableToggle: showTableToggle ?? true,
    metricLabels,
    groupbyLabel: groupbyLabels.join(', ') || 'Category',
  };
}
