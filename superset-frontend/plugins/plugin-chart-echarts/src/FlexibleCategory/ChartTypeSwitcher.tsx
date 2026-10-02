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
import { css, useTheme } from '@apache-superset/core/theme';
import { t } from '@apache-superset/core/translation';
import { Icons } from '@superset-ui/core/components/Icons';
import { CHART_MODES, ChartMode, SwitcherChartMode } from './types';

type ChartTypeSwitcherProps = {
  mode: ChartMode;
  onChange: (mode: ChartMode) => void;
  showTableToggle: boolean;
};

const MODE_LABELS: Record<SwitcherChartMode, string> = {
  bar: t('Horizontal bar'),
  column: t('Vertical bar'),
  pie: t('Pie'),
  donut: t('Donut'),
  treemap: t('Treemap'),
};

function DonutIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function ModeIcon({ mode }: { mode: SwitcherChartMode }) {
  switch (mode) {
    case 'bar':
      return <Icons.AlignLeftOutlined iconSize="m" />;
    case 'column':
      return <Icons.BarChartOutlined iconSize="m" />;
    case 'pie':
      return <Icons.PieChartOutlined iconSize="m" />;
    case 'donut':
      return <DonutIcon />;
    case 'treemap':
      return <Icons.AppstoreOutlined iconSize="m" />;
    default:
      return null;
  }
}

export default function ChartTypeSwitcher({
  mode,
  onChange,
  showTableToggle,
}: ChartTypeSwitcherProps) {
  const theme = useTheme();

  const buttonCss = (active: boolean) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${theme.sizeUnit * 8}px;
    height: ${theme.sizeUnit * 8}px;
    border: none;
    border-radius: ${theme.borderRadius}px;
    background: ${active ? theme.colorBgContainer : 'transparent'};
    color: ${theme.colorTextSecondary};
    box-shadow: ${active ? theme.boxShadowSecondary : 'none'};
    cursor: pointer;
    padding: 0;
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      color: ${theme.colorText};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colorPrimary};
      outline-offset: 1px;
    }
  `;

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.sizeUnit * 2}px;
        flex-shrink: 0;
      `}
    >
      <div
        role="toolbar"
        aria-label={t('Chart type')}
        css={css`
          display: inline-flex;
          align-items: center;
          gap: ${theme.sizeUnit}px;
          padding: ${theme.sizeUnit}px;
          background: ${theme.colorFillQuaternary};
          border: 1px solid ${theme.colorBorderSecondary};
          border-radius: ${theme.borderRadiusLG}px;
        `}
      >
        {CHART_MODES.map(chartMode => {
          const active = mode === chartMode;
          return (
            <button
              key={chartMode}
              type="button"
              aria-label={MODE_LABELS[chartMode]}
              aria-pressed={active}
              title={MODE_LABELS[chartMode]}
              onClick={() => onChange(chartMode)}
              css={buttonCss(active)}
            >
              <ModeIcon mode={chartMode} />
            </button>
          );
        })}
      </div>
      {showTableToggle && (
        <button
          type="button"
          aria-label={t('Table')}
          aria-pressed={mode === 'table'}
          title={t('Table')}
          onClick={() => onChange('table')}
          css={css`
            ${buttonCss(mode === 'table')}
            border: 1px solid ${theme.colorBorderSecondary};
            background: ${mode === 'table'
              ? theme.colorBgContainer
              : theme.colorFillQuaternary};
          `}
        >
          <Icons.TableOutlined iconSize="m" />
        </button>
      )}
    </div>
  );
}
