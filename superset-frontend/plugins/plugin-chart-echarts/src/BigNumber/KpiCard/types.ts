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
export interface KpiCardProps {
  height: number;
  width: number;
  title: string;
  bigNumber: string;
  subValue?: string;
  description?: string;
  percentDifferenceNumber: number;
  showTrend: boolean;
  showFooterIcon: boolean;
  cardBackgroundColor: string;
  cardBorderColor: string;
  titleColor: string;
  valueColor: string;
  mutedTextColor: string;
}

/** Apply description placeholders using computed trend values. */
export function applyDescriptionTemplate(
  template: string,
  percentDifferenceNumber: number,
): string {
  const absPercent = `${Math.abs(percentDifferenceNumber * 100).toFixed(1)}%`;
  const direction =
    percentDifferenceNumber > 0
      ? 'up'
      : percentDifferenceNumber < 0
        ? 'down'
        : 'unchanged';
  const trend =
    percentDifferenceNumber === 0
      ? 'unchanged'
      : `${direction} ${absPercent}`;

  return template
    .replaceAll('{percent}', absPercent)
    .replaceAll('{direction}', direction)
    .replaceAll('{trend}', trend);
}
