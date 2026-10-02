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
import { css, isThemeDark, useTheme } from '@apache-superset/core/theme';
import { KpiCardProps } from './types';

/** Default light-mode cream from control panel — swapped in dark mode. */
const DEFAULT_LIGHT_BG = '#faf6e5';
const DARK_CARD_BG = '#1a1a1a';
const DARK_CARD_BORDER = '#c9a227';

const TREND_POSITIVE_LIGHT = { background: '#DCFCE7', text: '#16A34A' };
const TREND_NEGATIVE_LIGHT = { background: '#FEE2E2', text: '#DC2626' };
/** Dark-mode badges match the CFO card mock (soft red / green on charcoal). */
const TREND_POSITIVE_DARK = {
  background: 'rgba(22, 163, 74, 0.18)',
  text: '#4ADE80',
};
const TREND_NEGATIVE_DARK = {
  background: 'rgba(220, 38, 38, 0.22)',
  text: '#F87171',
};

function TrendingUpIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendingDownIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

export default function KpiCard(props: KpiCardProps) {
  const {
    height,
    width,
    title,
    bigNumber,
    subValue,
    description,
    trendValue,
    trendValueFormatted,
    showTrend,
    showTrendValue,
    cardBackgroundColor,
    cardBorderColor,
    titleColor,
    valueColor,
    mutedTextColor,
  } = props;

  const theme = useTheme();
  const isDark = isThemeDark(theme);
  const isPositive = trendValue > 0;
  const isNegative = trendValue < 0;
  const showTrendBadge = showTrend && (isPositive || isNegative);

  const usingDefaultLightBg =
    cardBackgroundColor.toLowerCase() === DEFAULT_LIGHT_BG;
  const background = isDark && usingDefaultLightBg ? DARK_CARD_BG : cardBackgroundColor;
  const border =
    isDark && usingDefaultLightBg ? DARK_CARD_BORDER : cardBorderColor;
  const resolvedTitleColor = isDark ? theme.colorTextSecondary : titleColor;
  const resolvedValueColor = isDark ? theme.colorText : valueColor;
  const resolvedMutedColor = isDark ? theme.colorTextSecondary : mutedTextColor;
  const resolvedSubColor = isDark ? theme.colorText : mutedTextColor;

  const trendColors = isPositive
    ? isDark
      ? TREND_POSITIVE_DARK
      : TREND_POSITIVE_LIGHT
    : isDark
      ? TREND_NEGATIVE_DARK
      : TREND_NEGATIVE_LIGHT;

  return (
    <div
      css={css`
        height: ${height}px;
        width: ${width}px;
        padding: ${theme.sizeUnit}px;
        box-sizing: border-box;
      `}
    >
      <div
        css={css`
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          background: ${background};
          border: ${isDark ? 1.5 : 1}px solid ${border};
          border-radius: ${theme.sizeUnit * 5}px;
          padding: ${theme.sizeUnit * 5}px;
          font-family: ${theme.fontFamily};
          overflow: hidden;
        `}
      >
        <div
          css={css`
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: ${theme.sizeUnit * 2}px;
          `}
        >
          {title && (
            <div
              css={css`
                color: ${resolvedTitleColor};
                font-size: ${theme.fontSize}px;
                font-weight: ${theme.fontWeightNormal};
                line-height: 1.3;
              `}
            >
              {title}
            </div>
          )}

          {showTrendBadge && (
            <div
              css={css`
                display: inline-flex;
                align-items: center;
                align-self: flex-start;
                gap: ${theme.sizeUnit}px;
                background: ${trendColors.background};
                color: ${trendColors.text};
                border-radius: ${theme.borderRadiusLG}px;
                padding: ${theme.sizeUnit}px ${theme.sizeUnit * 2.5}px;
                font-size: ${theme.fontSizeSM}px;
                font-weight: ${theme.fontWeightStrong};
                line-height: 1.4;
              `}
            >
              {isPositive ? (
                <TrendingUpIcon color={trendColors.text} />
              ) : (
                <TrendingDownIcon color={trendColors.text} />
              )}
              {showTrendValue && trendValueFormatted && (
                <span>{trendValueFormatted}</span>
              )}
            </div>
          )}

          <div
            css={css`
              color: ${resolvedValueColor};
              font-size: clamp(28px, ${Math.min(height * 0.18, 48)}px, 48px);
              font-weight: ${theme.fontWeightStrong};
              line-height: 1.1;
              letter-spacing: -0.02em;
            `}
          >
            {bigNumber}
          </div>

          {subValue && (
            <div
              css={css`
                color: ${resolvedSubColor};
                font-size: ${theme.fontSizeLG}px;
                font-weight: ${theme.fontWeightNormal};
                line-height: 1.3;
              `}
            >
              {subValue}
            </div>
          )}
        </div>

        {description && (
          <>
            <div
              css={css`
                height: 1px;
                background: ${theme.colorSplit};
                margin: ${theme.sizeUnit * 4}px 0 ${theme.sizeUnit * 3}px;
                flex-shrink: 0;
              `}
            />
            <div
              css={css`
                color: ${resolvedMutedColor};
                font-size: ${theme.fontSizeSM}px;
                line-height: 1.45;
                flex-shrink: 0;
              `}
            >
              {description}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
