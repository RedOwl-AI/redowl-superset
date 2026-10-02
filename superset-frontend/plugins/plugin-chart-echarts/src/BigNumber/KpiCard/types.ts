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
  /** Raw trend metric value — drives green/red pill and arrow direction. */
  trendValue: number;
  /** Formatted trend value shown in the pill (e.g. "+60.4%"). */
  trendValueFormatted?: string;
  showTrend: boolean;
  /** When true, show the number next to the arrow; when false, arrow only. */
  showTrendValue: boolean;
  showFooterIcon: boolean;
  cardBackgroundColor: string;
  cardBorderColor: string;
  titleColor: string;
  valueColor: string;
  mutedTextColor: string;
}
