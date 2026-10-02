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
import 'dayjs/plugin/utc';
import { Metric } from '@superset-ui/chart-controls';
import {
  ChartProps,
  getMetricLabel,
  getValueFormatter,
  getNumberFormatter,
  rgbToHex,
} from '@superset-ui/core';
import { extendedDayjs as dayjs } from '@superset-ui/core/utils/dates';
import { getOriginalLabel } from '../utils';
import { KpiCardProps } from './types';

const DEFAULT_BG = { r: 250, g: 246, b: 229, a: 1 };
const DEFAULT_BORDER = { r: 235, g: 203, b: 139, a: 1 };

const parseMetricValue = (metricValue: number | string | null) => {
  if (typeof metricValue === 'string') {
    const dateObject = dayjs.utc(metricValue, undefined, true);
    if (dateObject.isValid()) {
      return dateObject.valueOf();
    }
    const asNumber = Number(metricValue);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }
  return metricValue ?? 0;
};

const colorToHex = (
  color: { r: number; g: number; b: number } | undefined,
  fallback: { r: number; g: number; b: number },
) => {
  const c = color ?? fallback;
  return rgbToHex(c.r, c.g, c.b);
};

export default function transformProps(chartProps: ChartProps): KpiCardProps {
  const {
    width,
    height,
    formData,
    queriesData,
    datasource: {
      currencyFormats = {},
      columnFormats = {},
      currencyCodeColumn,
    },
  } = chartProps;

  const {
    metric,
    secondaryMetric,
    secondaryLabel = '',
    trendMetric,
    title = '',
    subheader = '',
    description = '',
    yAxisFormat,
    currencyFormat,
    trendMetricFormat = '+,.1%',
    showTrend = true,
    showTrendValue = true,
    showFooterIcon = true,
    cardBackgroundColor = DEFAULT_BG,
    cardBorderColor = DEFAULT_BORDER,
  } = formData;

  const { data: dataA = [], detected_currency: detectedCurrency } =
    queriesData[0] || {};
  const data = dataA;

  const metricName = metric ? getMetricLabel(metric) : '';
  const secondaryMetricName = secondaryMetric
    ? getMetricLabel(secondaryMetric)
    : '';
  const trendMetricName = trendMetric ? getMetricLabel(trendMetric) : '';
  const metrics = chartProps.datasource?.metrics || [];
  const originalLabel = getOriginalLabel(metric, metrics);

  let metricEntry: Metric | undefined;
  if (chartProps.datasource?.metrics) {
    metricEntry = chartProps.datasource.metrics.find(
      metricItem => metricItem.metric_name === metric,
    );
  }

  const rawValue =
    data.length === 0 ? null : (data[0][metricName] as number | string | null);
  const bigNumberRaw = rawValue == null ? 0 : parseMetricValue(rawValue);

  const numberFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    metricEntry?.d3format || yAxisFormat,
    currencyFormat,
    undefined,
    data,
    currencyCodeColumn,
    detectedCurrency,
  );

  let trendValue = 0;
  let trendValueFormatted: string | undefined;
  let hasTrendValue = false;

  if (trendMetricName && data.length > 0) {
    const trendRaw = data[0][trendMetricName];
    if (trendRaw != null) {
      trendValue = parseMetricValue(trendRaw as number | string | null);
      hasTrendValue = Number.isFinite(trendValue) && trendValue !== 0;
      trendValueFormatted = getNumberFormatter(trendMetricFormat)(trendValue);
    }
  }

  let subValue: string | undefined;
  if (secondaryMetricName && data.length > 0) {
    const secondaryRaw = data[0][secondaryMetricName];
    const secondaryParsed = parseMetricValue(
      secondaryRaw as number | string | null,
    );
    const secondaryFormatter = getValueFormatter(
      secondaryMetric,
      currencyFormats,
      columnFormats,
      undefined,
      undefined,
      undefined,
      data,
      currencyCodeColumn,
      detectedCurrency,
    );
    const formattedSecondary = secondaryFormatter(secondaryParsed);
    subValue = secondaryLabel
      ? `${formattedSecondary} ${secondaryLabel}`
      : formattedSecondary;
  } else if (subheader?.trim()) {
    subValue = subheader.trim();
  }

  return {
    width,
    height,
    title: title?.trim() ? title : originalLabel,
    bigNumber: numberFormatter(bigNumberRaw),
    subValue,
    description: description?.trim() || undefined,
    trendValue,
    trendValueFormatted,
    showTrend: Boolean(showTrend && hasTrendValue),
    showTrendValue: Boolean(showTrendValue),
    showFooterIcon: Boolean(showFooterIcon),
    cardBackgroundColor: colorToHex(cardBackgroundColor, DEFAULT_BG),
    cardBorderColor: colorToHex(cardBorderColor, DEFAULT_BORDER),
    titleColor: '#6B7280',
    valueColor: '#1A202C',
    mutedTextColor: '#6B7280',
  };
}
