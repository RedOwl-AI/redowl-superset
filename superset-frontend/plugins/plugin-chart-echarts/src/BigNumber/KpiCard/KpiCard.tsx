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
import { Icons } from '@superset-ui/core/components/Icons';
import { KpiCardProps } from './types';

const TREND_POSITIVE = { background: '#DCFCE7', text: '#16A34A' };
const TREND_NEGATIVE = { background: '#FEE2E2', text: '#DC2626' };

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
    showFooterIcon,
    cardBackgroundColor,
    cardBorderColor,
    titleColor,
    valueColor,
    mutedTextColor,
  } = props;

  const theme = useTheme();
  const isPositive = trendValue > 0;
  const isNegative = trendValue < 0;
  const showTrendBadge = showTrend && (isPositive || isNegative);
  const trendColors = isPositive ? TREND_POSITIVE : TREND_NEGATIVE;

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
          background: ${cardBackgroundColor};
          border: 1px solid ${cardBorderColor};
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
                color: ${titleColor};
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
                border-radius: 999px;
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
              color: ${valueColor};
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
                color: ${mutedTextColor};
                font-size: ${theme.fontSizeLG}px;
                font-weight: ${theme.fontWeightNormal};
                line-height: 1.3;
              `}
            >
              {subValue}
            </div>
          )}
        </div>

        {(description || showFooterIcon) && (
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
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: ${theme.sizeUnit * 3}px;
                flex-shrink: 0;
              `}
            >
              {description ? (
                <div
                  css={css`
                    color: ${mutedTextColor};
                    font-size: ${theme.fontSizeSM}px;
                    line-height: 1.45;
                    flex: 1 1 auto;
                  `}
                >
                  {description}
                </div>
              ) : (
                <div />
              )}
              {showFooterIcon && (
                <Icons.FileTextOutlined
                  iconSize="m"
                  iconColor={theme.colorTextSecondary}
                  css={css`
                    flex-shrink: 0;
                    margin-bottom: 2px;
                  `}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
