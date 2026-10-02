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
  getColumnLabel,
  getMetricLabel,
  getValueFormatter,
} from '@superset-ui/core';
import { extractGroupbyLabel } from '../utils/series';
import {
  CategoryDataItem,
  DEFAULT_FORM_DATA,
  FlexibleCategoryChartProps,
  FlexibleCategoryFormData,
  FlexibleCategoryTransformedProps,
} from './types';

export default function transformProps(
  chartProps: FlexibleCategoryChartProps,
): FlexibleCategoryTransformedProps {
  const { formData, height, queriesData, width, datasource } = chartProps;
  const data: DataRecord[] = queriesData[0]?.data || [];
  const detectedCurrency = queriesData[0]?.detected_currency;

  const {
    colorScheme,
    groupby,
    metric = '',
    numberFormat,
    currencyFormat,
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

  const metricLabel = getMetricLabel(metric);
  const groupbyLabels = groupby.map(getColumnLabel);
  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  const numberFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    numberFormat,
    currencyFormat,
    undefined,
    data,
    currencyCodeColumn,
    detectedCurrency,
  );

  const transformedData: CategoryDataItem[] = data.map(datum => {
    const name = extractGroupbyLabel({
      datum,
      groupby: groupbyLabels,
      coltypeMapping: {},
    });
    return {
      name,
      value: Number(datum[metricLabel] ?? 0),
      color: colorFn(name, sliceId),
    };
  });

  return {
    width,
    height,
    data: transformedData,
    numberFormatter,
    defaultChartMode: defaultChartMode ?? 'bar',
    showChartSwitcher: showChartSwitcher ?? true,
    showTableToggle: showTableToggle ?? true,
    metricLabel,
    groupbyLabel: groupbyLabels.join(', ') || 'Category',
  };
}
