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
import { useEffect, useMemo, useState } from 'react';
import { css, useTheme } from '@apache-superset/core/theme';
import { t } from '@apache-superset/core/translation';
import Echart from '../components/Echart';
import buildEchartsOption from './buildEchartsOption';
import ChartTypeSwitcher from './ChartTypeSwitcher';
import { ChartMode, FlexibleCategoryTransformedProps } from './types';

export default function FlexibleCategory(
  props: FlexibleCategoryTransformedProps,
) {
  const {
    width,
    height,
    data,
    numberFormatter,
    defaultChartMode,
    showChartSwitcher,
    showTableToggle,
    metricLabel,
    groupbyLabel,
  } = props;

  const theme = useTheme();
  const [mode, setMode] = useState<ChartMode>(defaultChartMode);

  useEffect(() => {
    setMode(defaultChartMode);
  }, [defaultChartMode]);

  const echartOptions = useMemo(
    () =>
      buildEchartsOption(mode, data, numberFormatter, {
        labelColor: theme.colorText,
      }),
    [mode, data, numberFormatter, theme.colorText],
  );

  const toolbarHeight = showChartSwitcher ? theme.sizeUnit * 12 : 0;
  const chartHeight = Math.max(height - toolbarHeight, 80);

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
            onChange={setMode}
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

              td:last-child,
              th:last-child {
                text-align: right;
              }
            `}
          >
            <thead>
              <tr>
                <th>{groupbyLabel || t('Category')}</th>
                <th>{metricLabel || t('Value')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
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
