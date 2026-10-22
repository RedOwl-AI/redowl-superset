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

/** Comfortable reference height for full-size typography. */
const REF_HEIGHT = 280;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TrendingUpIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
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

function TrendingDownIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
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

  // Scale typography / spacing with tile height so footer text stays visible.
  const scale = clamp(height / REF_HEIGHT, 0.5, 1);
  const outerPad = Math.round(theme.sizeUnit * scale);
  const cardPad = Math.round(theme.sizeUnit * 5 * scale);
  const stackGap = Math.round(theme.sizeUnit * 2 * scale);
  const footerGap = Math.round(theme.sizeUnit * 2.5 * scale);

  const titleFont = Math.round(clamp(theme.fontSize * scale, 11, theme.fontSize));
  const badgeFont = Math.round(clamp(theme.fontSizeSM * scale, 10, theme.fontSizeSM));
  const iconSize = Math.round(clamp(14 * scale, 10, 14));
  const badgePadY = Math.round(theme.sizeUnit * scale);
  const badgePadX = Math.round(theme.sizeUnit * 2.5 * scale);

  // Primary value: shrink faster when a description also needs room.
  const valueRatio = description ? 0.13 : 0.16;
  const valueFont = Math.round(
    clamp(height * valueRatio, 18, Math.min(48, width * 0.14)),
  );
  const subFont = Math.round(
    clamp(theme.fontSizeLG * scale, 11, theme.fontSizeLG),
  );
  const descFont = Math.round(
    clamp(theme.fontSizeSM * scale, 10, theme.fontSizeSM),
  );
  // Cap description lines so a long blurb never pushes itself out of view.
  const descMaxLines = height < 200 ? 2 : height < 260 ? 3 : 4;

  return (
    <div
      css={css`
        height: ${height}px;
        width: ${width}px;
        padding: ${outerPad}px;
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
          border-radius: ${Math.round(theme.sizeUnit * 5 * scale)}px;
          padding: ${cardPad}px;
          font-family: ${theme.fontFamily};
          overflow: hidden;
          gap: ${stackGap}px;
        `}
      >
        {title && (
          <div
            css={css`
              color: ${resolvedTitleColor};
              font-size: ${titleFont}px;
              font-weight: ${theme.fontWeightNormal};
              line-height: 1.3;
              flex-shrink: 0;
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
              gap: ${Math.round(theme.sizeUnit * scale)}px;
              background: ${trendColors.background};
              color: ${trendColors.text};
              border-radius: ${theme.borderRadiusLG}px;
              padding: ${badgePadY}px ${badgePadX}px;
              font-size: ${badgeFont}px;
              font-weight: ${theme.fontWeightStrong};
              line-height: 1.3;
              flex-shrink: 0;
            `}
          >
            {isPositive ? (
              <TrendingUpIcon color={trendColors.text} size={iconSize} />
            ) : (
              <TrendingDownIcon color={trendColors.text} size={iconSize} />
            )}
            {showTrendValue && trendValueFormatted && (
              <span>{trendValueFormatted}</span>
            )}
          </div>
        )}

        <div
          css={css`
            color: ${resolvedValueColor};
            font-size: ${valueFont}px;
            font-weight: ${theme.fontWeightStrong};
            line-height: 1.15;
            letter-spacing: -0.02em;
            flex-shrink: 0;
          `}
        >
          {bigNumber}
        </div>

        {subValue && (
          <div
            css={css`
              color: ${resolvedSubColor};
              font-size: ${subFont}px;
              font-weight: ${theme.fontWeightNormal};
              line-height: 1.35;
              flex-shrink: 0;
            `}
          >
            {subValue}
          </div>
        )}

        {description && (
          <div
            css={css`
              margin-top: auto;
              flex: 1 1 auto;
              min-height: 0;
              display: flex;
              flex-direction: column;
              gap: ${footerGap}px;
              min-width: 0;
              padding-top: ${stackGap}px;
            `}
          >
            <div
              css={css`
                height: 1px;
                background: ${theme.colorSplit};
                flex-shrink: 0;
              `}
            />
            <div
              css={css`
                color: ${resolvedMutedColor};
                font-size: ${descFont}px;
                font-weight: ${theme.fontWeightNormal};
                line-height: 1.45;
                word-break: break-word;
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: ${descMaxLines};
              `}
            >
              {description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
