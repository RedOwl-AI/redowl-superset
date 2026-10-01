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
  getStandardizedControls,
  sharedControls,
} from '@superset-ui/chart-controls';

const DEFAULT_BG = { r: 250, g: 246, b: 229, a: 1 };
const DEFAULT_BORDER = { r: 235, g: 203, b: 139, a: 1 };

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metric'],
        [
          {
            name: 'secondary_metric',
            config: {
              ...sharedControls.metric,
              label: t('Secondary metric'),
              description: t(
                'Optional metric under the main value (e.g. transaction count). Combined with Secondary label.',
              ),
              validators: [],
            },
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: sharedControls.row_limit,
          },
        ],
      ],
    },
    {
      label: t('Card content'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'title',
            config: {
              type: 'TextControl',
              label: t('Title'),
              renderTrigger: true,
              description: t(
                'Top label on the card (e.g. "Total leakage"). Defaults to the metric name.',
              ),
              default: '',
            },
          },
        ],
        [
          {
            name: 'subheader',
            config: {
              type: 'TextControl',
              label: t('Subheader'),
              renderTrigger: true,
              description: t(
                'Text under the main value. Example: "122 leaking transactions". If Secondary metric is set, use Secondary label for the suffix instead.',
              ),
              default: '',
            },
          },
        ],
        [
          {
            name: 'secondary_label',
            config: {
              type: 'TextControl',
              label: t('Secondary label'),
              renderTrigger: true,
              description: t(
                'Suffix after the secondary metric value, e.g. "leaking transactions" → "122 leaking transactions".',
              ),
              default: '',
            },
          },
        ],
        [
          {
            name: 'description',
            config: {
              type: 'TextAreaControl',
              label: t('Description'),
              renderTrigger: true,
              description: t(
                'Footer insight below the divider. Supports placeholders: {percent}, {direction}, {trend}. Example: "14% of company spend is leaking — {trend} versus the previous period."',
              ),
              default: '',
            },
          },
        ],
        [
          {
            name: 'show_trend',
            config: {
              type: 'CheckboxControl',
              label: t('Show trend icon'),
              renderTrigger: true,
              default: true,
              description: t(
                'Show a green up-arrow or red down-arrow pill under the title. Set Manual trend percent (positive or negative).',
              ),
            },
          },
        ],
        [
          {
            name: 'manual_trend_percent',
            config: {
              type: 'TextControl',
              label: t('Manual trend percent'),
              renderTrigger: true,
              default: '',
              description: t(
                'Positive number → green ↑ pill. Negative number → red ↓ pill. Example: 59.5 or -12.3',
              ),
            },
          },
        ],
        [
          {
            name: 'show_footer_icon',
            config: {
              type: 'CheckboxControl',
              label: t('Show footer icon'),
              renderTrigger: true,
              default: true,
              description: t('Show the document icon in the card footer'),
            },
          },
        ],
      ],
    },
    {
      label: t('Number formats'),
      expanded: true,
      controlSetRows: [
        ['y_axis_format'],
        ['currency_format'],
      ],
    },
    {
      label: t('Card style'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'card_background_color',
            config: {
              type: 'ColorPickerControl',
              label: t('Background color'),
              default: DEFAULT_BG,
              renderTrigger: true,
            },
          },
          {
            name: 'card_border_color',
            config: {
              type: 'ColorPickerControl',
              label: t('Border color'),
              default: DEFAULT_BORDER,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    y_axis_format: {
      label: t('Number format'),
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    metric: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
