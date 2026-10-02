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
  buildQueryContext,
  QueryFormData,
  QueryFormMetric,
  ensureIsArray,
  getMetricLabel,
} from '@superset-ui/core';

function pushUniqueMetric(
  metrics: QueryFormMetric[],
  metric: QueryFormMetric | undefined,
): void {
  if (!metric) {
    return;
  }
  const label = getMetricLabel(metric);
  if (!metrics.some(existing => getMetricLabel(existing) === label)) {
    metrics.push(metric);
  }
}

export default function buildQuery(formData: QueryFormData) {
  return buildQueryContext(formData, baseQueryObject => {
    const metrics = [...ensureIsArray(baseQueryObject.metrics)];
    // Secondary and trend are independent controls — both must be queried.
    // Compare by metric label (not String(metric)) so distinct adhoc metrics
    // are not treated as duplicates ("[object Object]").
    const secondaryMetric =
      (formData.secondary_metric as QueryFormMetric | undefined) ??
      (formData.secondaryMetric as QueryFormMetric | undefined);
    const trendMetric =
      (formData.trend_metric as QueryFormMetric | undefined) ??
      (formData.trendMetric as QueryFormMetric | undefined);

    pushUniqueMetric(metrics, secondaryMetric);
    pushUniqueMetric(metrics, trendMetric);

    return [
      {
        ...baseQueryObject,
        metrics,
      },
    ];
  });
}
