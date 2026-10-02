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
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@superset-ui/core';
import { BaseChartProps } from '../types';

export type ChartMode =
  | 'bar'
  | 'column'
  | 'pie'
  | 'donut'
  | 'treemap'
  | 'table';

/** Modes shown inside the segmented toolbar (excludes the separate table toggle). */
export type SwitcherChartMode = Exclude<ChartMode, 'table'>;

export const CHART_MODES: SwitcherChartMode[] = [
  'bar',
  'column',
  'pie',
  'donut',
  'treemap',
];

export type FlexibleCategoryFormData = QueryFormData & {
  colorScheme?: string;
  groupby: QueryFormColumn[];
  /** Preferred multi-metric control. */
  metrics?: QueryFormMetric[];
  /** Legacy single-metric charts. */
  metric?: QueryFormMetric;
  numberFormat: string;
  dateFormat?: string;
  defaultChartMode: ChartMode;
  showChartSwitcher: boolean;
  showTableToggle: boolean;
};

export interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
}

/** One metric series aligned to `categories` (used for grouped bar/column). */
export interface CategoryMetricSeries {
  name: string;
  color: string;
  values: number[];
}

export interface FlexibleCategoryChartProps
  extends BaseChartProps<FlexibleCategoryFormData> {
  formData: FlexibleCategoryFormData;
}

export interface FlexibleCategoryTransformedProps {
  width: number;
  height: number;
  /** Flattened items for pie / donut / treemap / single-metric bars. */
  data: CategoryDataItem[];
  /** Category axis labels (groupby values, or metric names when no groupby). */
  categories: string[];
  /** One series per metric for grouped bar/column charts. */
  series: CategoryMetricSeries[];
  numberFormatter: (value: number | null | undefined) => string;
  defaultChartMode: ChartMode;
  showChartSwitcher: boolean;
  showTableToggle: boolean;
  metricLabels: string[];
  groupbyLabel: string;
  /** Stable id so the selected chart mode survives data reloads / remounts. */
  chartKey: string;
  setControlValue?: (name: string, value: unknown) => void;
}

export const DEFAULT_FORM_DATA: Partial<FlexibleCategoryFormData> = {
  groupby: [],
  metrics: [],
  numberFormat: 'SMART_NUMBER',
  dateFormat: 'smart_date',
  defaultChartMode: 'bar',
  showChartSwitcher: true,
  showTableToggle: true,
};
