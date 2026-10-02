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
  ensureIsArray,
  QueryFormData,
  QueryFormMetric,
} from '@superset-ui/core';

function resolveMetrics(formData: QueryFormData): QueryFormMetric[] {
  const metrics = ensureIsArray(
    (formData.metrics as QueryFormMetric[] | undefined) ?? formData.metric,
  );
  return metrics.filter(Boolean);
}

export default function buildQuery(formData: QueryFormData) {
  const metrics = resolveMetrics(formData);
  const { sort_by_metric } = formData;
  const sortMetric = metrics[0];

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      metrics,
      ...(sort_by_metric && sortMetric
        ? { orderby: [[sortMetric, false]] }
        : {}),
    },
  ]);
}
