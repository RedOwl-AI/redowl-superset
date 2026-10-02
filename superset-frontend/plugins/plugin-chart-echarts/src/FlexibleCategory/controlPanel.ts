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
import { t } from '@apache-superset/core/translation';
import {
  ControlPanelConfig,
  D3_FORMAT_DOCS,
  D3_FORMAT_OPTIONS,
  D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT,
  getStandardizedControls,
  sharedControls,
} from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';

const { numberFormat, defaultChartMode, showChartSwitcher, showTableToggle } =
  DEFAULT_FORM_DATA;

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['groupby'],
        ['metric'],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              default: 10,
            },
          },
        ],
        [
          {
            name: 'sort_by_metric',
            config: {
              ...sharedControls.sort_by_metric,
              default: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        [
          {
            name: 'number_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Number format'),
              renderTrigger: true,
              default: numberFormat,
              choices: D3_FORMAT_OPTIONS,
              description: `${D3_FORMAT_DOCS} ${D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT}`,
            },
          },
        ],
        [
          {
            name: 'default_chart_mode',
            config: {
              type: 'SelectControl',
              label: t('Default chart type'),
              description: t(
                'Initial visualization shown when the chart loads. Viewers can still switch types in the chart toolbar.',
              ),
              default: defaultChartMode,
              choices: [
                ['bar', t('Horizontal bar')],
                ['column', t('Vertical bar')],
                ['pie', t('Pie')],
                ['donut', t('Donut')],
                ['treemap', t('Treemap')],
                ['funnel', t('Funnel')],
                ['table', t('Table')],
              ],
              renderTrigger: true,
              clearable: false,
            },
          },
        ],
        [
          {
            name: 'show_chart_switcher',
            config: {
              type: 'CheckboxControl',
              label: t('Show chart type switcher'),
              renderTrigger: true,
              default: showChartSwitcher,
              description: t(
                'Show the toolbar that lets viewers switch between bar, pie, donut, and other views.',
              ),
            },
          },
        ],
        [
          {
            name: 'show_table_toggle',
            config: {
              type: 'CheckboxControl',
              label: t('Show table toggle'),
              renderTrigger: true,
              default: showTableToggle,
              description: t(
                'Show a separate control to switch into a tabular data view.',
              ),
            },
          },
        ],
      ],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    metric: getStandardizedControls().shiftMetric(),
    groupby: getStandardizedControls().popAllColumns(),
  }),
};

export default config;
