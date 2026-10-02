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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { css, useTheme } from '@apache-superset/core/theme';
import { t } from '@apache-superset/core/translation';
import Echart from '../components/Echart';
import buildEchartsOption from './buildEchartsOption';
import ChartTypeSwitcher from './ChartTypeSwitcher';
import {
  CHART_MODES,
  ChartMode,
  FlexibleCategoryTransformedProps,
} from './types';

const MODE_STORAGE_PREFIX = 'superset:flexible_category_mode:';
const modeMemoryCache = new Map<string, ChartMode>();

const VALID_MODES = new Set<ChartMode>([...CHART_MODES, 'table']);

function isChartMode(value: string | null | undefined): value is ChartMode {
  return Boolean(value && VALID_MODES.has(value as ChartMode));
}

function readPersistedMode(chartKey: string): ChartMode | undefined {
  const cached = modeMemoryCache.get(chartKey);
  if (cached) {
    return cached;
  }
  try {
    const stored = sessionStorage.getItem(`${MODE_STORAGE_PREFIX}${chartKey}`);
    if (isChartMode(stored)) {
      modeMemoryCache.set(chartKey, stored);
      return stored;
    }
  } catch {
    // sessionStorage may be unavailable (private mode / SSR)
  }
  return undefined;
}

function writePersistedMode(chartKey: string, mode: ChartMode): void {
  modeMemoryCache.set(chartKey, mode);
  try {
    sessionStorage.setItem(`${MODE_STORAGE_PREFIX}${chartKey}`, mode);
  } catch {
    // ignore quota / access errors
  }
}

export default function FlexibleCategory(
  props: FlexibleCategoryTransformedProps,
) {
  const {
    width,
    height,
    data,
    categories,
    series,
    numberFormatter,
    defaultChartMode,
    showChartSwitcher,
    showTableToggle,
    metricLabels,
    groupbyLabel,
    chartKey,
    setControlValue,
  } = props;

  const theme = useTheme();
  const [mode, setMode] = useState<ChartMode>(
    () => readPersistedMode(chartKey) ?? defaultChartMode,
  );

  // Only re-hydrate when the chart identity changes — never on data refresh.
  useEffect(() => {
    setMode(readPersistedMode(chartKey) ?? defaultChartMode);
  }, [chartKey]); // eslint-disable-line react-hooks/exhaustive-deps -- defaultChartMode is fallback only

  const handleModeChange = useCallback(
    (nextMode: ChartMode) => {
      setMode(nextMode);
      writePersistedMode(chartKey, nextMode);
      // Keep Explore form_data in sync when available (dashboard may no-op).
      setControlValue?.('default_chart_mode', nextMode);
    },
    [chartKey, setControlValue],
  );

  const echartOptions = useMemo(
    () =>
      buildEchartsOption(mode, data, numberFormatter, {
        labelColor: theme.colorText,
        categories,
        series,
      }),
    [mode, data, numberFormatter, theme.colorText, categories, series],
  );

  const toolbarHeight = showChartSwitcher ? theme.sizeUnit * 12 : 0;
  const chartHeight = Math.max(height - toolbarHeight, 80);
  const multiMetric = metricLabels.length > 1;

  return (
    <div
      css={css`
        width: ${width}px;
        height: ${height}px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      `}
    >
      {showChartSwitcher && (
        <div
          css={css`
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: ${theme.sizeUnit}px ${theme.sizeUnit * 2}px 0;
            flex-shrink: 0;
          `}
        >
          <ChartTypeSwitcher
            mode={mode}
            onChange={handleModeChange}
            showTableToggle={showTableToggle}
          />
        </div>
      )}

      {mode === 'table' ? (
        <div
          css={css`
            flex: 1 1 auto;
            min-height: 0;
            overflow: auto;
            padding: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 3}px;
          `}
        >
          <table
            css={css`
              width: 100%;
              border-collapse: collapse;
              font-size: ${theme.fontSizeSM}px;

              th,
              td {
                text-align: left;
                padding: ${theme.sizeUnit * 1.5}px ${theme.sizeUnit * 2}px;
                border-bottom: 1px solid ${theme.colorSplit};
              }

              th {
                color: ${theme.colorTextSecondary};
                font-weight: ${theme.fontWeightStrong};
              }

              td:not(:first-child),
              th:not(:first-child) {
                text-align: right;
              }
            `}
          >
            <thead>
              <tr>
                <th>{groupbyLabel || t('Category')}</th>
                {multiMetric
                  ? metricLabels.map(label => <th key={label}>{label}</th>)
                  : (
                      <th>{metricLabels[0] || t('Value')}</th>
                    )}
              </tr>
            </thead>
            <tbody>
              {multiMetric
                ? categories.map((category, rowIndex) => (
                    <tr key={category}>
                      <td>{category}</td>
                      {series.map(metricSeries => (
                        <td key={metricSeries.name}>
                          {numberFormatter(metricSeries.values[rowIndex])}
                        </td>
                      ))}
                    </tr>
                  ))
                : data.map(row => (
                    <tr key={row.name}>
                      <td>
                        <span
                          css={css`
                            display: inline-flex;
                            align-items: center;
                            gap: ${theme.sizeUnit * 2}px;
                          `}
                        >
                          <span
                            css={css`
                              width: ${theme.sizeUnit * 2}px;
                              height: ${theme.sizeUnit * 2}px;
                              border-radius: 2px;
                              background: ${row.color};
                              flex-shrink: 0;
                            `}
                          />
                          {row.name}
                        </span>
                      </td>
                      <td>{numberFormatter(row.value)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Echart
          height={chartHeight}
          width={width}
          echartOptions={echartOptions}
          refs={{}}
        />
      )}
    </div>
  );
}
