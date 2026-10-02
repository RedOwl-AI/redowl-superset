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
import { Behavior } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import exampleBar from './images/example_bar.png';
import exampleBarDark from './images/example_bar-dark.png';
import examplePie from './images/example_pie.jpg';
import examplePieDark from './images/example_pie-dark.jpg';
import exampleDonut from './images/example_donut.jpg';
import exampleDonutDark from './images/example_donut-dark.jpg';
import { FlexibleCategoryChartProps, FlexibleCategoryFormData } from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsFlexibleCategoryChartPlugin extends EchartsChartPlugin<
  FlexibleCategoryFormData,
  FlexibleCategoryChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./FlexibleCategory'),
      metadata: {
        behaviors: [Behavior.InteractiveChart, Behavior.DrillToDetail],
        category: t('CFO Dashboard charts'),
        credits: ['https://echarts.apache.org'],
        description: t(
          'A categorical chart with an on-chart toolbar to switch between horizontal bar, vertical bar, pie, donut, treemap, funnel, and table views — without changing the query.',
        ),
        exampleGallery: [
          { url: exampleBar, urlDark: exampleBarDark },
          { url: examplePie, urlDark: examplePieDark },
          { url: exampleDonut, urlDark: exampleDonutDark },
        ],
        name: t('Flexible Category Chart'),
        tags: [
          t('Categorical'),
          t('Comparison'),
          t('ECharts'),
          t('Featured'),
          t('Proportional'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
