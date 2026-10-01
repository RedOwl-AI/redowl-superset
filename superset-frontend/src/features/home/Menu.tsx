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
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { styled, css, useTheme } from '@apache-superset/core/theme';
import { t } from '@apache-superset/core/translation';
import { ensureStaticPrefix } from 'src/utils/assetUrl';
import { ensureAppRoot, stripAppRoot } from 'src/utils/navigationUtils';
import { getUrlParam, isUrlExternal } from 'src/utils/urlUtils';
import { MainNav, MenuItem } from '@superset-ui/core/components/Menu';
import { Tooltip, Image, Icons } from '@superset-ui/core/components';
import { GenericLink } from 'src/components';
import { NavLink, useLocation } from 'react-router-dom';
import { Typography } from '@superset-ui/core/components/Typography';
import { useUiConfig } from 'src/components/UiConfigContext';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { URL_PARAMS } from 'src/constants';
import { RoutePaths } from 'src/views/routePaths';
import {
  MenuObjectChildProps,
  MenuObjectProps,
  MenuData,
} from 'src/types/bootstrapTypes';
import { datasetsLabel } from 'src/features/semanticLayers/label';
import RightMenu from './RightMenu';

interface MenuProps {
  data: MenuData;
  isFrontendRoute?: (path?: string) => boolean;
}

const SIDEBAR_WIDTH = '13.75rem'; // ~220px — Plumage-style primary side menu
const SIDEBAR_COLLAPSED_WIDTH = '4.5rem'; // 72px — room for centered icons
const SIDEBAR_COLLAPSED_KEY = 'redowl:sidebar-collapsed';

const MENU_ICONS: Record<string, ReactNode> = {
  Home: <Icons.HomeOutlined iconSize="l" />,
  Dashboards: <Icons.DashboardOutlined iconSize="l" />,
  Charts: <Icons.BarChartOutlined iconSize="l" />,
  Datasets: <Icons.TableOutlined iconSize="l" />,
  'SQL Lab': <Icons.ConsoleSqlOutlined iconSize="l" />,
  Sources: <Icons.DatabaseOutlined iconSize="l" />,
  Data: <Icons.DatabaseOutlined iconSize="l" />,
};

const StyledSidebar = styled.aside<{ $collapsed?: boolean }>`
  ${({ theme, $collapsed }) => css`
    display: flex;
    flex-direction: column;
    width: ${$collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH};
    min-width: ${$collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH};
    height: 100%;
    align-self: stretch;
    position: relative;
    flex-shrink: 0;
    /* Keep the edge toggle above the main content column */
    z-index: 100;
    background-color: var(--sidebar);
    background-image: var(--gradient-sidebar);
    border-right: 1px solid var(--sidebar-border);
    box-shadow: inset -1px 0 0 hsl(0 0% 100% / 0.04);
    color: var(--sidebar-foreground);
    padding: ${theme.sizeUnit * 3}px
      ${$collapsed ? theme.sizeUnit * 1.5 : theme.sizeUnit * 2}px;
    box-sizing: border-box;
    overflow: visible;
    transition:
      width 0.22s ease,
      min-width 0.22s ease,
      padding 0.22s ease;

    .caret {
      display: none;
    }
  `}
`;

const CollapseToggle = styled.button`
  position: absolute;
  top: 1.35rem;
  right: -14px;
  z-index: 110;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d4d2c8;
  border-radius: 50%;
  background: #fff;
  color: #111;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  pointer-events: auto;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: #fff;
    color: #000;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.22);
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: 2px solid var(--sidebar-ring);
    outline-offset: 2px;
  }

  /* Beat #main-menu .anticon { color: sidebar-foreground } so the chevron
   * stays dark on the white pill. */
  && .anticon,
  && .anticon svg,
  && [data-icon] {
    color: #111 !important;
    fill: #111 !important;
    font-size: 14px;
  }
`;

/** Compact top bar for narrow viewports (hamburger lives in RightMenu). */
const StyledMobileBar = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color: var(--sidebar);
    background-image: var(--gradient-sidebar);
    border-bottom: 1px solid var(--sidebar-border);
    color: var(--sidebar-foreground);
    padding: 0 ${theme.sizeUnit * 3}px;
    min-height: ${theme.sizeUnit * 12}px;
    position: sticky;
    top: 0;
    z-index: 10;
  `}
`;

const StyledBrandBlock = styled.div<{ $collapsed?: boolean }>`
  ${({ theme, $collapsed }) => css`
    display: flex;
    align-items: center;
    justify-content: ${$collapsed ? 'center' : 'flex-start'};
    gap: ${theme.sizeUnit * 2}px;
    padding: ${theme.sizeUnit * 2}px
      ${$collapsed ? theme.sizeUnit : theme.sizeUnit * 2}px
      ${theme.sizeUnit * 3}px;
    flex-shrink: 0;
    min-height: ${theme.sizeUnit * 10}px;
    /* Keep logo clear of the floating collapse control */
    overflow: hidden;
    position: relative;
    z-index: 0;

    ${$collapsed
      ? css`
          .navbar-brand {
            max-width: 2rem;
            overflow: hidden;
          }

          img {
            max-width: 100%;
            height: auto !important;
          }
        `
      : ''}
  `}
`;

const StyledBrandText = styled.div`
  ${({ theme }) => css`
    color: var(--sidebar-foreground);
    font-size: ${theme.fontSizeLG}px;
    font-weight: ${theme.fontWeightStrong};
    line-height: 1.3;
    min-width: 0;

    span {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}
`;

const StyledNavScroll = styled.div<{ $collapsed?: boolean }>`
  ${({ theme, $collapsed }) => css`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 0 ${$collapsed ? 0 : `-${theme.sizeUnit}px`};
    padding: 0 ${$collapsed ? 0 : `${theme.sizeUnit}px`};
    position: relative;
    z-index: 0;
  `}
`;

const StyledMainNav = styled(MainNav)<{ $collapsed?: boolean }>`
  ${({ theme, $collapsed }) => css`
    background: transparent !important;
    color: var(--sidebar-foreground);
    border-inline-end: none !important;
    width: 100%;

    .ant-menu-item,
    .ant-menu-submenu-title {
      color: var(--sidebar-foreground) !important;
      border-radius: 8px;
      margin-inline: 0;
      width: 100%;
      height: auto !important;
      line-height: 1.4 !important;
      padding: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 3}px !important;
    }

    .ant-menu-item .ant-menu-item-icon,
    .ant-menu-submenu-title .ant-menu-item-icon {
      color: inherit !important;
      font-size: 1.05rem;
    }

    .ant-menu-item .ant-menu-item-icon + span,
    .ant-menu-submenu-title .ant-menu-item-icon + span,
    .ant-menu-item .anticon + span,
    .ant-menu-submenu-title .anticon + span {
      margin-inline-start: ${theme.sizeUnit * 2}px;
    }

    .ant-menu-item:hover,
    .ant-menu-submenu-title:hover {
      background: color-mix(
        in oklab,
        var(--sidebar-foreground) 10%,
        transparent
      ) !important;
      color: var(--sidebar-accent-foreground) !important;
    }

    .ant-menu-item-selected,
    .ant-menu-submenu-selected > .ant-menu-submenu-title {
      background: var(--sidebar-accent) !important;
      color: var(--sidebar-accent-foreground) !important;
    }

    .ant-menu-submenu .ant-menu-sub {
      background: transparent !important;
    }

    .ant-menu-sub .ant-menu-item {
      padding-inline-start: ${theme.sizeUnit * 5}px !important;
      font-size: ${theme.fontSizeSM}px;
    }

    a {
      color: inherit !important;
    }

    .ant-menu-submenu-arrow {
      color: var(--sidebar-muted-foreground) !important;
    }

    ${$collapsed
      ? css`
          &.ant-menu-inline-collapsed {
            width: 100% !important;
          }

          &.ant-menu-inline-collapsed > .ant-menu-item,
          &.ant-menu-inline-collapsed
            > .ant-menu-submenu
            > .ant-menu-submenu-title {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 40px !important;
            height: 40px !important;
            margin: ${theme.sizeUnit}px auto !important;
            padding: 0 !important;
            line-height: 1 !important;
          }

          &.ant-menu-inline-collapsed .ant-menu-item-icon,
          &.ant-menu-inline-collapsed .ant-menu-submenu-title .ant-menu-item-icon {
            margin: 0 !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            width: 1.25rem;
            height: 1.25rem;
          }

          &.ant-menu-inline-collapsed .ant-menu-item-icon > *,
          &.ant-menu-inline-collapsed
            .ant-menu-submenu-title
            .ant-menu-item-icon
            > * {
            margin: 0 !important;
          }

          &.ant-menu-inline-collapsed .ant-menu-title-content {
            display: none !important;
            width: 0 !important;
            opacity: 0 !important;
            overflow: hidden !important;
          }

          &.ant-menu-inline-collapsed .ant-menu-submenu-arrow {
            display: none !important;
          }
        `
      : ''}
  `}
`;

const StyledSidebarFooter = styled.div<{ $collapsed?: boolean }>`
  ${({ theme, $collapsed }) => css`
    flex-shrink: 0;
    border-top: 1px solid var(--sidebar-border);
    padding-top: ${theme.sizeUnit * 2}px;
    margin-top: ${theme.sizeUnit * 2}px;
    overflow: hidden;
    position: relative;
    z-index: 0;

    /* RightMenu is horizontal; keep icons readable on the red rail */
    .ant-menu {
      background: transparent !important;
      border: none !important;
      color: var(--sidebar-foreground);
      justify-content: ${$collapsed ? 'center' : 'flex-start'};
      flex-wrap: ${$collapsed ? 'wrap' : 'nowrap'};
    }

    ${$collapsed
      ? css`
          .ant-menu-title-content {
            display: none;
          }

          .ant-menu-item,
          .ant-menu-submenu-title {
            padding-inline: ${theme.sizeUnit}px !important;
            justify-content: center;
          }

          .submenu-with-caret .ant-menu-item-icon {
            display: none;
          }
        `
      : ''}
  `}
`;

const StyledBrandWrapper = styled.div<{ margin?: string }>`
  ${({ margin }) => css`
    height: ${margin ? 'auto' : '100%'};
    margin: ${margin ?? 0};
    display: flex;
    align-items: center;
  `}
`;

const StyledBrandLink = styled(GenericLink)`
  ${() => css`
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;

    &:focus {
      border-color: transparent;
    }

    &:focus-visible {
      border-color: var(--sidebar-ring);
      outline-color: var(--sidebar-ring);
    }
  `}
`;

const StyledImage = styled(Image)`
  object-fit: contain;
`;

export function Menu({
  data: {
    menu,
    brand,
    navbar_right: navbarRight,
    settings,
    environment_tag: environmentTag,
  },
  isFrontendRoute = () => false,
}: MenuProps) {
  const isMobile = useIsMobile();
  const uiConfig = useUiConfig();
  const theme = useTheme();

  enum Paths {
    Explore = '/explore',
    Dashboard = '/dashboard',
    Chart = '/chart',
    Datasets = '/tablemodelview',
    Dataset = '/dataset',
    SqlLab = '/sqllab',
    SavedQueries = '/savedqueryview',
  }

  enum MenuKeys {
    Dashboards = 'Dashboards',
    Charts = 'Charts',
    Datasets = 'Datasets',
    SqlLab = 'SQL Lab',
  }

  const defaultTabSelection: string[] = [];
  const [activeTabs, setActiveTabs] = useState(defaultTabSelection);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch (_error) {
      return false;
    }
  });
  const location = useLocation();

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch (_error) {
      // ignore storage failures (private mode, etc.)
    }
  }, [collapsed]);

  useEffect(() => {
    const path = location.pathname;
    switch (true) {
      case path.startsWith(Paths.Dashboard):
        setActiveTabs([MenuKeys.Dashboards]);
        break;
      case path.startsWith(Paths.Chart) || path.startsWith(Paths.Explore):
        setActiveTabs([MenuKeys.Charts]);
        break;
      case path.startsWith(Paths.Datasets) ||
        path === Paths.Dataset ||
        path.startsWith(`${Paths.Dataset}/`):
        setActiveTabs([MenuKeys.Datasets]);
        break;
      case path.startsWith(Paths.SqlLab) || path.startsWith(Paths.SavedQueries):
        setActiveTabs([MenuKeys.SqlLab]);
        if (!collapsed) {
          setOpenKeys(keys =>
            keys.includes(MenuKeys.SqlLab) ? keys : [...keys, MenuKeys.SqlLab],
          );
        }
        break;
      default:
        setActiveTabs(defaultTabSelection);
    }
  }, [location.pathname, collapsed]);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      if (next) {
        setOpenKeys([]);
      }
      return next;
    });
  };

  const navItems = useMemo(() => {
    const buildMenuItem = ({
      label,
      childs,
      url,
      isFrontendRoute: itemIsFrontendRoute,
      name,
    }: MenuObjectProps): MenuItem => {
      const key = name ?? label;
      const icon = (name && MENU_ICONS[name]) || MENU_ICONS[label] || (
        <Icons.AppstoreOutlined iconSize="l" />
      );

      if (url && itemIsFrontendRoute) {
        return {
          key,
          icon,
          label: (
            <NavLink to={stripAppRoot(url)} activeClassName="is-active">
              {label}
            </NavLink>
          ),
        };
      }

      if (url) {
        return {
          key,
          icon,
          label: <Typography.Link href={url}>{label}</Typography.Link>,
        };
      }

      const childItems: MenuItem[] = [];
      childs?.forEach((child: MenuObjectChildProps | string, index1: number) => {
        if (typeof child === 'string' && child === '-' && label !== t('Data')) {
          childItems.push({ type: 'divider', key: `divider-${index1}` });
        } else if (typeof child !== 'string') {
          Object.assign(child, { label: t(child.label) });
          childItems.push({
            key: child.name ?? `${child.label}`,
            label: child.isFrontendRoute ? (
              <NavLink
                to={stripAppRoot(child.url || '')}
                exact
                activeClassName="is-active"
              >
                {child.label}
              </NavLink>
            ) : (
              <Typography.Link href={child.url}>{child.label}</Typography.Link>
            ),
          });
        }
      });

      // Parent with children → expandable inline submenu (not a popup).
      return {
        key,
        icon,
        label,
        children: childItems,
      };
    };

    return menu.map(item => {
      const props = {
        ...item,
        label: t(item.label),
        isFrontendRoute: isFrontendRoute(item.url),
        childs: item.childs?.map(c => {
          if (typeof c === 'string') {
            return c;
          }
          return {
            ...c,
            isFrontendRoute: isFrontendRoute(c.url),
          };
        }),
      };
      return buildMenuItem(props);
    });
  }, [menu, isFrontendRoute]);

  const standalone = getUrlParam(URL_PARAMS.standalone);
  const path = location.pathname.replace(/\/$/, '') || '/';
  const isAuthPage =
    path === RoutePaths.LOGIN.replace(/\/$/, '') ||
    path === RoutePaths.LOGOUT.replace(/\/$/, '') ||
    path.startsWith(RoutePaths.REGISTER.replace(/\/$/, ''));
  if (standalone || uiConfig.hideNav || isAuthPage) return <></>;

  // brand.text may be empty; tooltip still needs a readable collapsed label
  const appBrandName =
    (theme as { brandAppName?: string }).brandAppName || brand.alt || 'RedOwl';

  const renderBrand = (showText = true) => {
    if (brand.hide_logo) {
      return null;
    }
    let link;
    if (theme.brandLogoUrl) {
      const brandHref = ensureAppRoot(theme.brandLogoHref);
      const brandImage = (
        <StyledImage
          preview={false}
          src={ensureStaticPrefix(theme.brandLogoUrl)}
          alt={theme.brandLogoAlt || 'Apache Superset'}
          height={theme.brandLogoHeight}
        />
      );
      link = (
        <StyledBrandWrapper margin={theme.brandLogoMargin}>
          {isUrlExternal(brandHref) ? (
            <Typography.Link className="navbar-brand" href={brandHref}>
              {brandImage}
            </Typography.Link>
          ) : (
            <StyledBrandLink to={stripAppRoot(brandHref)}>
              {brandImage}
            </StyledBrandLink>
          )}
        </StyledBrandWrapper>
      );
    } else if (isFrontendRoute(window.location.pathname)) {
      link = (
        <GenericLink className="navbar-brand" to={stripAppRoot(brand.path)}>
          <StyledImage
            preview={false}
            src={ensureStaticPrefix(brand.icon)}
            alt={brand.alt}
          />
        </GenericLink>
      );
    } else {
      link = (
        <Typography.Link
          className="navbar-brand"
          href={ensureAppRoot(brand.path)}
          tabIndex={-1}
        >
          <StyledImage
            preview={false}
            src={ensureStaticPrefix(brand.icon)}
            alt={brand.alt}
          />
        </Typography.Link>
      );
    }

    return (
      <StyledBrandBlock $collapsed={collapsed && showText}>
        <Tooltip
          id="brand-tooltip"
          placement="right"
          title={brand.tooltip || (collapsed ? brand.text || appBrandName : '')}
          arrow={{ pointAtCenter: true }}
        >
          {link}
        </Tooltip>
        {showText && !collapsed && brand.text && (
          <StyledBrandText>
            <span>{brand.text}</span>
          </StyledBrandText>
        )}
      </StyledBrandBlock>
    );
  };

  const rightMenu = (
    <RightMenu
      align="flex-start"
      settings={settings}
      navbarRight={navbarRight}
      isFrontendRoute={isFrontendRoute}
      environmentTag={environmentTag}
      menu={menu}
    />
  );

  if (isMobile) {
    return (
      <StyledMobileBar
        className="mobile"
        id="main-menu"
        aria-label={t('Main navigation')}
      >
        {!brand.hide_logo && renderBrand(false)}
        {rightMenu}
      </StyledMobileBar>
    );
  }

  return (
    <StyledSidebar
      className="sidebar"
      id="main-menu"
      aria-label={t('Main navigation')}
      $collapsed={collapsed}
    >
      <CollapseToggle
        type="button"
        aria-label={collapsed ? t('Expand sidebar') : t('Collapse sidebar')}
        aria-expanded={!collapsed}
        title={collapsed ? t('Expand sidebar') : t('Collapse sidebar')}
        onClick={toggleCollapsed}
      >
        {collapsed ? (
          <Icons.RightOutlined iconSize="m" iconColor="#111111" />
        ) : (
          <Icons.LeftOutlined iconSize="m" iconColor="#111111" />
        )}
      </CollapseToggle>

      {!brand.hide_logo && renderBrand(true)}

      <StyledNavScroll $collapsed={collapsed}>
        <StyledMainNav
          mode="inline"
          inlineCollapsed={collapsed}
          $collapsed={collapsed}
          data-test="navbar-top"
          className="main-nav"
          selectedKeys={activeTabs}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={keys => {
            if (!collapsed) {
              setOpenKeys(keys as string[]);
            }
          }}
          items={navItems}
        />
      </StyledNavScroll>

      <StyledSidebarFooter $collapsed={collapsed}>
        {rightMenu}
      </StyledSidebarFooter>
    </StyledSidebar>
  );
}

// transform the menu data to reorganize components
export default function MenuWrapper({ data, ...rest }: MenuProps) {
  const newMenuData = {
    ...data,
  };
  // Menu items that should go into settings dropdown
  const settingsMenus = {
    Data: true,
    Security: true,
    Manage: true,
  };

  // Remap labels that depend on feature flags so they stay in sync with
  // the active-tab key used in the Menu component above.
  const labelOverrides: Record<string, () => string> = {
    Datasets: datasetsLabel,
  };

  // Cycle through menu.menu to build out cleanedMenu and settings
  const cleanedMenu: MenuObjectProps[] = [];
  const settings: MenuObjectProps[] = [];
  newMenuData.menu.forEach((item: any) => {
    if (!item) {
      return;
    }

    const children: (MenuObjectProps | string)[] = [];
    const newItem = {
      ...item,
      // Apply any label override for this item (keyed by FAB internal name).
      ...(item.name && labelOverrides[item.name]
        ? { label: labelOverrides[item.name]() }
        : { label: t(item.label) }),
    };

    // Filter childs
    if (item.childs) {
      item.childs.forEach((child: MenuObjectChildProps | string) => {
        if (typeof child === 'string') {
          children.push(t(child));
        } else if ((child as MenuObjectChildProps).label) {
          Object.assign(child, { label: t(child.label) });
          children.push(child);
        }
      });

      newItem.childs = children;
    }

    if (!settingsMenus.hasOwnProperty(item.name)) {
      cleanedMenu.push(newItem);
    } else {
      settings.push(newItem);
    }
  });

  newMenuData.menu = cleanedMenu;
  newMenuData.settings = settings;

  return <Menu data={newMenuData} {...rest} />;
}
