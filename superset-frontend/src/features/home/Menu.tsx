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
import { useState, useEffect, useMemo } from 'react';
import { styled, css, useTheme } from '@apache-superset/core/theme';
import { t } from '@apache-superset/core/translation';
import { ensureStaticPrefix } from 'src/utils/assetUrl';
import { ensureAppRoot, stripAppRoot } from 'src/utils/navigationUtils';
import { getUrlParam, isUrlExternal } from 'src/utils/urlUtils';
import { MainNav, MenuItem } from '@superset-ui/core/components/Menu';
import { Tooltip, Image } from '@superset-ui/core/components';
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

const StyledSidebar = styled.aside`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: ${SIDEBAR_WIDTH};
    min-width: ${SIDEBAR_WIDTH};
    height: 100vh;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--sidebar);
    background-image: var(--gradient-sidebar);
    border-right: 1px solid var(--sidebar-border);
    box-shadow: inset -1px 0 0 hsl(0 0% 100% / 0.04);
    color: var(--sidebar-foreground);
    padding: ${theme.sizeUnit * 3}px ${theme.sizeUnit * 2}px;
    box-sizing: border-box;

    .caret {
      display: none;
    }
  `}
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

const StyledBrandBlock = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.sizeUnit * 2}px;
    padding: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 2}px
      ${theme.sizeUnit * 4}px;
    flex-shrink: 0;
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

const StyledNavScroll = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 -${({ theme }) => theme.sizeUnit}px;
  padding: 0 ${({ theme }) => theme.sizeUnit}px;
`;

const StyledMainNav = styled(MainNav)`
  ${({ theme }) => css`
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
  `}
`;

const StyledSidebarFooter = styled.div`
  ${({ theme }) => css`
    flex-shrink: 0;
    border-top: 1px solid var(--sidebar-border);
    padding-top: ${theme.sizeUnit * 2}px;
    margin-top: ${theme.sizeUnit * 2}px;

    /* RightMenu is horizontal; keep icons readable on the red rail */
    .ant-menu {
      background: transparent !important;
      border: none !important;
      color: var(--sidebar-foreground);
      justify-content: flex-start;
    }
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
  const location = useLocation();

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
        setOpenKeys(keys =>
          keys.includes(MenuKeys.SqlLab) ? keys : [...keys, MenuKeys.SqlLab],
        );
        break;
      default:
        setActiveTabs(defaultTabSelection);
    }
  }, [location.pathname]);

  const navItems = useMemo(() => {
    const buildMenuItem = ({
      label,
      childs,
      url,
      isFrontendRoute: itemIsFrontendRoute,
      name,
    }: MenuObjectProps): MenuItem => {
      const key = name ?? label;
      if (url && itemIsFrontendRoute) {
        return {
          key,
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
      <StyledBrandBlock>
        <Tooltip
          id="brand-tooltip"
          placement="right"
          title={brand.tooltip}
          arrow={{ pointAtCenter: true }}
        >
          {link}
        </Tooltip>
        {showText && brand.text && (
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
    >
      {!brand.hide_logo && renderBrand(true)}

      <StyledNavScroll>
        <StyledMainNav
          mode="inline"
          data-test="navbar-top"
          className="main-nav"
          selectedKeys={activeTabs}
          openKeys={openKeys}
          onOpenChange={keys => setOpenKeys(keys as string[])}
          items={navItems}
        />
      </StyledNavScroll>

      <StyledSidebarFooter>{rightMenu}</StyledSidebarFooter>
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
