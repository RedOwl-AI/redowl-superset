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

// @fontsource/* v5.1+ doesn't play nice with eslint-import plugin v2.31+
/* eslint-disable import/extensions */
import '@fontsource/inter/200.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
/* eslint-enable import/extensions */

import { css, useTheme, Global } from '@emotion/react';
import { useThemeMode } from './utils/themeUtils';

export const GlobalStyles = () => {
  const theme = useTheme();
  const isDark = useThemeMode();
  return (
    <Global
      key={`global-${theme.colorLink}`}
      styles={css`
        /* SPA */
        html {
          color-scheme: ${isDark ? 'dark' : 'light'};
        }

        html,
        body,
        #app {
          height: 100%;
          overflow: hidden;
        }

        /*
         * Plumage semantic color tokens (Story 1 :root / .dark) — colors only.
         * Consumed by the ambient wash below; Ant chrome still comes from
         * THEME_* hex conversions of the same OKLCH values.
         */
        html[data-theme-mode='light'] {
          color-scheme: light;
          --background: oklch(0.966 0.008 95.6);
          --foreground: oklch(24.1% 0.028 141.6);
          --card: oklch(0.9935 0.003 100);
          --primary: oklch(24.1% 0.028 141.6);
          --primary-foreground: oklch(1 0 0);
          --secondary: oklch(86.256% 0.01367 97.52);
          --secondary-foreground: oklch(0.24 0.016 110);
          --muted: oklch(0.955 0.008 100);
          --muted-foreground: oklch(0.51 0.012 100);
          --accent: oklch(92.294% 0.01738 99.671);
          --destructive: oklch(0.577 0.245 27.325);
          --success: oklch(0.62 0.15 155);
          --warning: oklch(0.78 0.15 75);
          --info: oklch(0.62 0.15 245);
          --brand: oklch(63.7% 0.258 29.2);
          --border: oklch(0.92 0.008 100);
          --ring: oklch(0.62 0.009 100);
          /* Plumage sidebar tokens — left rail chrome */
          --sidebar: oklch(0.32 0.13 26);
          --sidebar-foreground: oklch(0.99 0.003 60);
          --sidebar-muted-foreground: color-mix(
            in oklab,
            var(--sidebar-foreground) 62%,
            transparent
          );
          --sidebar-primary: oklch(0.42 0.16 26);
          --sidebar-primary-foreground: oklch(0.99 0 0);
          --sidebar-accent: oklch(0.36 0.14 26);
          --sidebar-accent-foreground: oklch(0.99 0 0);
          --sidebar-border: oklch(0.24 0.09 26 / 60%);
          --sidebar-ring: oklch(0.55 0.18 26);
          /* Endpoints sampled #88000F → #440001 (Plumage gradient-sidebar) */
          --gradient-sidebar: linear-gradient(
            180deg,
            oklch(0.395 0.16 26) 0%,
            oklch(0.243 0.099 28) 100%
          );
        }

        html[data-theme-mode='dark'] {
          color-scheme: dark;
          --background: oklch(0.16 0.005 250);
          --foreground: oklch(96.5% 0.006 142.4);
          --card: oklch(0.235 0.006 250);
          --primary: oklch(96.5% 0.006 142.4);
          --primary-foreground: oklch(18.5% 0.012 142);
          --secondary: oklch(38.426% 0.01222 253.019);
          --secondary-foreground: oklch(96.5% 0.006 142.4);
          --muted: oklch(0.27 0.006 250);
          --muted-foreground: oklch(0.74 0.01 250);
          --accent: oklch(0.32 0.008 250);
          --destructive: oklch(65% 0.22 27);
          --success: oklch(0.72 0.16 155);
          --warning: oklch(0.82 0.15 75);
          --info: oklch(0.7 0.15 245);
          --brand: oklch(63.7% 0.258 29.2);
          --border: oklch(1 0 0 / 14%);
          --ring: oklch(0.72 0.008 250);
          --sidebar: oklch(0.22 0.06 22);
          --sidebar-foreground: oklch(0.97 0.003 60);
          --sidebar-muted-foreground: color-mix(
            in oklab,
            var(--sidebar-foreground) 58%,
            transparent
          );
          --sidebar-primary: oklch(0.55 0.18 22);
          --sidebar-primary-foreground: oklch(0.99 0 0);
          --sidebar-accent: oklch(0.32 0.11 22);
          --sidebar-accent-foreground: oklch(0.98 0 0);
          --sidebar-border: oklch(1 0 0 / 10%);
          --sidebar-ring: oklch(0.6 0.2 25);
          --gradient-sidebar: linear-gradient(
            180deg,
            oklch(0.28 0.11 22) 0%,
            oklch(0.17 0.06 22) 100%
          );
        }

        /*
         * Soft blob gradient canvas (Plumage settings-style wash).
         * Red / blue / gray blobs over --background; heavily blurred.
         */
        html[data-theme-mode='light'] body,
        html[data-theme-mode='dark'] body {
          background-color: transparent;
        }

        html[data-theme-mode='light'] body::before,
        html[data-theme-mode='dark'] body::before {
          content: '';
          position: fixed;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background-color: var(--background);
          background-repeat: no-repeat;
          background-image:
            /* red — top-left */
            radial-gradient(
              closest-side,
              color-mix(in oklab, var(--brand) 18%, transparent),
              transparent
            ),
            /* blue — mid-right */
            radial-gradient(
              closest-side,
              color-mix(in oklab, var(--info) 20%, transparent),
              transparent
            ),
            /* gray — bottom-center */
            radial-gradient(
              closest-side,
              color-mix(in oklab, var(--muted-foreground) 12%, transparent),
              transparent
            );
          background-size:
            55vmax 55vmax,
            60vmax 60vmax,
            50vmax 50vmax;
          background-position:
            -8% -12%,
            95% 42%,
            42% 105%;
          filter: blur(90px);
          opacity: 0.55;
        }

        html[data-theme-mode='dark'] body::before {
          background-image:
            radial-gradient(
              closest-side,
              color-mix(in oklab, var(--brand) 22%, transparent),
              transparent
            ),
            radial-gradient(
              closest-side,
              color-mix(in oklab, var(--info) 20%, transparent),
              transparent
            ),
            radial-gradient(
              closest-side,
              color-mix(in oklab, var(--muted-foreground) 10%, transparent),
              transparent
            );
          opacity: 0.45;
        }

        html[data-theme-mode='light'] #app,
        html[data-theme-mode='dark'] #app,
        html[data-theme-mode='light'] .ant-layout,
        html[data-theme-mode='dark'] .ant-layout,
        html[data-theme-mode='light'] .ant-layout-content,
        html[data-theme-mode='dark'] .ant-layout-content {
          background: transparent !important;
        }

        /*
         * Superset left rail ← Plumage sidebar tokens (deep red gradient,
         * light nav ink). Expanding parents open as inline submenus.
         */
        #main-menu.sidebar,
        #main-menu.mobile {
          background-color: var(--sidebar) !important;
          background-image: var(--gradient-sidebar) !important;
          color: var(--sidebar-foreground);
          /* Light thumb on dark red rail */
          --scrollbar-thumb: oklch(1 0 0 / 30%);
          --scrollbar-thumb-hover: oklch(1 0 0 / 50%);
        }

        #main-menu.sidebar {
          border-right: 1px solid var(--sidebar-border) !important;
          box-shadow: inset -1px 0 0 hsl(0 0% 100% / 0.04);
        }

        #main-menu.mobile {
          border-bottom: 1px solid var(--sidebar-border) !important;
        }

        #main-menu .ant-menu,
        #main-menu .ant-menu-sub,
        #main-menu .ant-menu-inline {
          background: transparent !important;
          border: none !important;
          color: var(--sidebar-foreground);
        }

        #main-menu .ant-menu-item,
        #main-menu .ant-menu-submenu .ant-menu-submenu-title,
        #main-menu .ant-menu-title-content,
        #main-menu a,
        #main-menu .anticon,
        #main-menu [data-icon] {
          color: var(--sidebar-foreground) !important;
        }

        #main-menu .ant-menu-item-group-title {
          color: var(--sidebar-muted-foreground) !important;
          font-size: 0.6875rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        #main-menu .ant-menu-item:hover,
        #main-menu .ant-menu-submenu:hover > .ant-menu-submenu-title,
        #main-menu .ant-menu-submenu-active > .ant-menu-submenu-title,
        #main-menu .ant-menu-item-active {
          background: color-mix(
            in oklab,
            var(--sidebar-foreground) 10%,
            transparent
          ) !important;
          color: var(--sidebar-accent-foreground) !important;
          border-radius: 8px;
        }

        #main-menu .ant-menu-item-selected,
        #main-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          background: var(--sidebar-accent) !important;
          color: var(--sidebar-accent-foreground) !important;
          border-radius: 8px;
        }

        #main-menu .ant-menu-item:hover .ant-menu-title-content,
        #main-menu .ant-menu-submenu:hover .ant-menu-title-content,
        #main-menu .ant-menu-submenu-active .ant-menu-title-content,
        #main-menu .ant-menu-submenu-selected .ant-menu-title-content,
        #main-menu .ant-menu-item-selected .ant-menu-title-content {
          color: var(--sidebar-accent-foreground) !important;
        }

        #main-menu .ant-menu-submenu-arrow {
          color: var(--sidebar-muted-foreground) !important;
        }

        /*
         * Plumage button styles (design kit + SubMenu actions like
         * Import / Bulk select / + Dashboard).
         */
        .ant-btn,
        .superset-button {
          border-radius: 6px;
          font-weight: 500;
          box-shadow: none;
        }

        /* Primary — dark ink fill */
        .ant-btn-primary:not(:disabled),
        .ant-btn-variant-solid.ant-btn-color-primary:not(:disabled),
        .superset-button-primary:not(:disabled) {
          background: var(--primary) !important;
          border-color: transparent !important;
          color: var(--primary-foreground) !important;
        }

        .ant-btn-primary:not(:disabled):hover,
        .ant-btn-variant-solid.ant-btn-color-primary:not(:disabled):hover,
        .superset-button-primary:not(:disabled):hover {
          background: color-mix(
            in oklab,
            var(--primary) 88%,
            var(--background)
          ) !important;
          color: var(--primary-foreground) !important;
        }

        /* Secondary — taupe fill (Bulk select) */
        .ant-btn-variant-filled:not(:disabled),
        .superset-button-secondary:not(:disabled) {
          background: var(--secondary) !important;
          border-color: transparent !important;
          color: var(--secondary-foreground, var(--foreground)) !important;
        }

        .ant-btn-variant-filled:not(:disabled):hover,
        .superset-button-secondary:not(:disabled):hover {
          background: var(--muted) !important;
          color: var(--foreground) !important;
        }

        /* Outline (tertiary) */
        .ant-btn-variant-outlined,
        .superset-button-tertiary {
          background: color-mix(
            in oklab,
            var(--card) 80%,
            var(--background)
          ) !important;
          border-color: var(--border) !important;
          color: var(--foreground) !important;
        }

        .ant-btn-variant-outlined:not(:disabled):hover,
        .superset-button-tertiary:not(:disabled):hover {
          background: var(--muted) !important;
          border-color: var(--border) !important;
          color: var(--foreground) !important;
        }

        /* Ghost / text */
        .ant-btn-variant-text,
        .ant-btn-text {
          background: transparent !important;
          border-color: transparent !important;
          color: var(--foreground) !important;
          box-shadow: none !important;
        }

        .ant-btn-variant-text:not(:disabled):hover,
        .ant-btn-text:not(:disabled):hover {
          background: color-mix(
            in oklab,
            var(--foreground) 6%,
            transparent
          ) !important;
          color: var(--foreground) !important;
        }

        /* Link / icon actions (Import download) — ink, not blue */
        .ant-btn-link,
        .superset-button-link {
          color: var(--foreground) !important;
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }

        .ant-btn-link:not(:disabled):hover,
        .superset-button-link:not(:disabled):hover {
          color: var(--foreground) !important;
          opacity: 0.75;
        }

        /* Destructive */
        .ant-btn-dangerous:not(:disabled),
        .ant-btn-variant-solid.ant-btn-color-dangerous:not(:disabled),
        .superset-button-danger:not(:disabled) {
          background: var(--destructive) !important;
          border-color: transparent !important;
          color: #ffffff !important;
        }

        /* Disabled filled (primary / danger) */
        .ant-btn-variant-solid:disabled,
        .ant-btn-primary:disabled,
        .ant-btn-dangerous:disabled,
        .superset-button-primary:disabled,
        .superset-button-danger:disabled {
          background: color-mix(
            in oklab,
            var(--muted-foreground) 45%,
            var(--muted)
          ) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          opacity: 1;
        }

        /* SubMenu action cluster spacing */
        .nav-right .superset-button + .superset-button {
          margin-left: 12px;
        }

        /*
         * Draft / Published status pills — match Plumage primary / success
         * when theme label* tokens are not yet loaded from the backend.
         */
        .ant-tag-primary {
          background: var(--primary) !important;
          color: var(--primary-foreground) !important;
          border-color: transparent !important;
          border-radius: 6px;
        }

        .ant-tag-success {
          background: var(--success) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          border-radius: 6px;
        }

        body {
          background-color: var(--background, ${theme.colorBgBase});
          color: ${theme.colorText};
          -webkit-font-smoothing: antialiased;
          margin: 0;
          font-family: ${theme.fontFamily};
        }

        a {
          color: ${theme.colorLink};
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        strong,
        th {
          font-weight: ${theme.fontWeightStrong};
        }

        .echarts-tooltip[style*='visibility: hidden'] {
          display: none !important;
        }

        .no-wrap {
          white-space: nowrap;
        }

        .column-config-popover {
          & .ant-input-number {
            width: 100%;
          }
          && .btn-group svg {
            line-height: 0;
            top: 0;
          }
          & .btn-group > .btn {
            padding: 5px 10px 6px;
          }
        }

        /* Overriding bootstrap styles */
        #app {
          flex: 1 1 auto;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        [role='button'] {
          cursor: pointer;
        }

        /* antd 6 removed the Tag's default trailing margin (v5 shipped */
        /* margin-inline-end: 8px on every tag) in favor of parents spacing */
        /* tags via flex/Space gaps. The app's layouts predate that and rely */
        /* on the v5 default (e.g. the dashboard header's Published tag), */
        /* so restore it for visual parity. Remove once Tag-adjacent layouts */
        /* declare their own gaps. */
        .ant-tag {
          margin-inline-end: ${theme.marginXS}px;
        }

        /* Override geostyler CSS that hides AntD ColorPicker alpha input */
        /* See: https://github.com/apache/superset/issues/34721 */
        .ant-color-picker .ant-color-picker-alpha-input {
          display: block;
        }

        .ant-color-picker .ant-color-picker-slider-alpha {
          display: flex;
          margin-top: ${theme.marginXS}px;
        }

        .superset-explore-popover.ant-popover
          .ant-popover-container:has(.ant-popover-title) {
          padding-top: 0;
        }
        .superset-explore-popover.ant-popover .ant-popover-title {
          padding-top: ${theme.paddingXS}px;
          margin-bottom: ${theme.paddingSM}px;
          line-height: 1;
        }
        .superset-explore-popover.ant-popover
          .ant-popover-container:has(.ant-popover-title)
          .ant-tabs-tab {
          padding-top: 0;
        }
      `}
    />
  );
};
