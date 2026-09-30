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

import { t } from '@apache-superset/core/translation';
import { SupersetClient } from '@superset-ui/core';
import { styled, css, useTheme, keyframes } from '@apache-superset/core/theme';
import {
  Button,
  Flex,
  Form,
  Input,
  Typography,
  Icons,
  Image,
} from '@superset-ui/core/components';
import { useState, useEffect, useMemo } from 'react';
import { capitalize } from 'lodash/fp';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import { useDispatch } from 'react-redux';
import getBootstrapData from 'src/utils/getBootstrapData';
import { ensureAppRoot } from 'src/utils/navigationUtils';
import { ensureStaticPrefix } from 'src/utils/assetUrl';

type OAuthProvider = {
  name: string;
  icon: string;
};

type OIDProvider = {
  name: string;
  url: string;
};

type Provider = OAuthProvider | OIDProvider;

interface LoginForm {
  username: string;
  password: string;
}

enum AuthType {
  AuthOID = 0,
  AuthDB = 1,
  AuthLDAP = 2,
  AuthOauth = 4,
  AuthSAML = 5,
}

const rise = keyframes`
  0% { transform: scaleY(0.35); opacity: 0.45; }
  50% { transform: scaleY(1); opacity: 1; }
  100% { transform: scaleY(0.55); opacity: 0.7; }
`;

const drift = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const dashFlow = keyframes`
  to { stroke-dashoffset: -48; }
`;

const nodePulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.35); }
`;

const blobDrift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(18px, -14px) scale(1.06); }
  66% { transform: translate(-12px, 10px) scale(0.96); }
`;

const LoginShell = styled.div`
  ${({ theme }) => css`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 32rem);
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    background: var(--background, ${theme.colorBgBase});
    color: var(--foreground, ${theme.colorText});

    @media (max-width: ${theme.screenMDMax}px) {
      grid-template-columns: 1fr;
    }
  `}
`;

const HeroPane = styled.section`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(2rem, 5vw, 4.5rem);
    background-image: var(--gradient-sidebar);
    background-color: var(--sidebar);
    color: var(--sidebar-foreground);
    overflow: hidden;
    isolation: isolate;

    @media (max-width: ${theme.screenMDMax}px) {
      min-height: 38vh;
      justify-content: center;
      padding: 2rem 1.5rem 1.5rem;
    }
  `}
`;

const ChartVisual = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  gap: clamp(0.5rem, 1.4vw, 1.1rem);
  padding: 18% 10% 12%;
  opacity: 0.28;

  span {
    flex: 1;
    display: block;
    border-radius: 999px 999px 4px 4px;
    background: linear-gradient(
      180deg,
      color-mix(in oklab, white 88%, transparent),
      color-mix(in oklab, white 18%, transparent)
    );
    transform-origin: bottom center;
    animation: ${rise} 4.8s ease-in-out infinite;
  }

  span:nth-of-type(1) {
    height: 34%;
    animation-delay: 0s;
  }
  span:nth-of-type(2) {
    height: 58%;
    animation-delay: 0.35s;
  }
  span:nth-of-type(3) {
    height: 44%;
    animation-delay: 0.7s;
  }
  span:nth-of-type(4) {
    height: 76%;
    animation-delay: 0.15s;
  }
  span:nth-of-type(5) {
    height: 52%;
    animation-delay: 0.9s;
  }
  span:nth-of-type(6) {
    height: 68%;
    animation-delay: 0.45s;
  }
  span:nth-of-type(7) {
    height: 40%;
    animation-delay: 1.1s;
  }
  span:nth-of-type(8) {
    height: 86%;
    animation-delay: 0.25s;
  }
`;

const NetworkLayer = styled.svg`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 1;

  .link {
    fill: none;
    stroke: color-mix(in oklab, white 42%, transparent);
    stroke-width: 1.35;
    stroke-linecap: round;
  }

  .link-dim {
    stroke: color-mix(in oklab, white 22%, transparent);
    stroke-width: 1;
  }

  .link-flow {
    stroke: color-mix(in oklab, white 88%, transparent);
    stroke-width: 1.65;
    stroke-dasharray: 5 9;
    animation: ${dashFlow} 1.6s linear infinite;
  }

  .link-flow-slow {
    animation-duration: 2.6s;
    animation-direction: reverse;
    stroke: color-mix(in oklab, oklch(0.78 0.14 220) 75%, white);
  }

  .node {
    fill: color-mix(in oklab, white 92%, transparent);
  }

  .node-glow {
    fill: color-mix(in oklab, white 28%, transparent);
    animation: ${nodePulse} 3s ease-in-out infinite;
  }

  .node-glow:nth-of-type(3n) {
    animation-delay: 0.5s;
  }

  .node-glow:nth-of-type(3n + 1) {
    animation-delay: 1.1s;
  }

  .packet {
    fill: #fff;
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.85));
  }

  .packet-blue {
    fill: oklch(0.82 0.1 230);
    filter: drop-shadow(0 0 5px oklch(0.75 0.12 230 / 80%));
  }
`;

const Orbit = styled.div`
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  border: 1px solid color-mix(in oklab, white 18%, transparent);
  animation: ${drift} 9s ease-in-out infinite;

  &.orbit-a {
    width: min(48vw, 28rem);
    height: min(48vw, 28rem);
    top: -12%;
    right: -8%;
    opacity: 0.55;
  }

  &.orbit-b {
    width: min(32vw, 18rem);
    height: min(32vw, 18rem);
    bottom: 18%;
    left: -6%;
    animation-delay: -3s;
    opacity: 0.4;
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  max-width: 34rem;
  animation: ${fadeUp} 0.7s ease-out both;

  .brand-row {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.75rem;
  }

  .brand-name {
    font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
    font-size: clamp(2.4rem, 5vw, 3.75rem);
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 0.95;
    color: #fff;
  }

  .brand-mark {
    width: clamp(2.75rem, 4vw, 3.5rem);
    height: clamp(2.75rem, 4vw, 3.5rem);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 12px 30px -16px rgba(0, 0, 0, 0.55);
  }

  h1 {
    margin: 0 0 0.85rem;
    font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
    font-size: clamp(1.35rem, 2.6vw, 1.85rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: color-mix(in oklab, white 92%, transparent);
  }

  p {
    margin: 0;
    max-width: 28rem;
    font-size: 1.05rem;
    line-height: 1.55;
    color: color-mix(in oklab, white 72%, transparent);
  }
`;

const FormPane = styled.section`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 3rem);
    isolation: isolate;
    overflow: hidden;
    background:
      radial-gradient(
        60% 48% at 92% 6%,
        color-mix(in oklab, var(--brand) 32%, transparent),
        transparent 68%
      ),
      radial-gradient(
        55% 42% at 4% 92%,
        color-mix(in oklab, var(--info) 34%, transparent),
        transparent 70%
      ),
      radial-gradient(
        45% 38% at 48% 48%,
        color-mix(in oklab, var(--warning) 16%, transparent),
        transparent 72%
      ),
      linear-gradient(
        155deg,
        color-mix(in oklab, var(--card) 88%, white) 0%,
        color-mix(in oklab, var(--background, ${theme.colorBgBase}) 90%, white) 42%,
        color-mix(in oklab, var(--info) 12%, var(--background)) 78%,
        color-mix(in oklab, var(--brand) 10%, var(--accent)) 100%
      );
    animation: ${fadeUp} 0.75s ease-out 0.12s both;

    @media (max-width: ${theme.screenMDMax}px) {
      align-items: flex-start;
      padding-top: 1.25rem;
      padding-bottom: 2.5rem;
    }
  `}
`;

const FormBlob = styled.div`
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(42px);
  animation: ${blobDrift} 11s ease-in-out infinite;

  &.blob-a {
    width: min(52vw, 22rem);
    height: min(52vw, 22rem);
    top: -8%;
    right: -12%;
    background: color-mix(in oklab, var(--brand) 42%, transparent);
    opacity: 0.7;
  }

  &.blob-b {
    width: min(44vw, 18rem);
    height: min(44vw, 18rem);
    bottom: -6%;
    left: -10%;
    background: color-mix(in oklab, var(--info) 48%, transparent);
    opacity: 0.65;
    animation-delay: -4s;
  }

  &.blob-c {
    width: min(28vw, 12rem);
    height: min(28vw, 12rem);
    top: 42%;
    right: 18%;
    background: color-mix(in oklab, var(--warning) 38%, transparent);
    opacity: 0.45;
    animation-delay: -7s;
  }
`;

const FormMesh = styled.svg`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.78;

  .mesh-line {
    fill: none;
    stroke: color-mix(in oklab, var(--brand) 38%, var(--info));
    stroke-width: 1.15;
    stroke-dasharray: 4 10;
    animation: ${dashFlow} 3.4s linear infinite;
  }

  .mesh-line-b {
    stroke: color-mix(in oklab, var(--info) 55%, transparent);
    animation-duration: 4.8s;
    animation-direction: reverse;
  }

  .mesh-line-c {
    stroke: color-mix(in oklab, var(--brand) 45%, transparent);
    stroke-width: 1;
    animation-duration: 5.2s;
  }

  .mesh-node {
    fill: color-mix(in oklab, var(--brand) 65%, var(--info));
    opacity: 0.7;
    animation: ${nodePulse} 3.2s ease-in-out infinite;
  }

  .mesh-packet {
    fill: var(--brand);
    opacity: 0.85;
  }

  .mesh-packet-b {
    fill: var(--info);
  }
`;

const FormPanel = styled.div`
  ${({ theme }) => css`
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 24rem;
    padding: 1.85rem 1.6rem 1.6rem;
    border-radius: 1.1rem;
    border: 1px solid
      color-mix(in oklab, var(--brand) 22%, var(--border, ${theme.colorBorder}));
    background: color-mix(
      in oklab,
      var(--card, ${theme.colorBgContainer}) 88%,
      white
    );
    backdrop-filter: blur(20px) saturate(175%);
    box-shadow:
      0 1px 0 0 color-mix(in oklab, white 80%, transparent) inset,
      0 0 0 1px color-mix(in oklab, var(--info) 14%, transparent),
      0 26px 52px -22px color-mix(in oklab, var(--brand) 38%, transparent),
      0 14px 32px -18px color-mix(in oklab, var(--info) 42%, transparent);

    .form-title {
      margin: 0 0 0.35rem;
      font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
      font-size: 1.4rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--foreground, ${theme.colorText});
    }

    .form-hint {
      display: block;
      margin-bottom: 1.25rem;
      color: var(--muted-foreground, ${theme.colorTextSecondary});
      font-size: ${theme.fontSizeSM}px;
      line-height: 1.45;
    }

    .ant-form-item-label label {
      color: var(--foreground, ${theme.colorText}) !important;
    }

    .ant-input-affix-wrapper,
    .ant-input {
      border-radius: 0.5rem;
      background: color-mix(in oklab, var(--background) 40%, white) !important;
    }

    .ant-input-affix-wrapper-focused,
    .ant-input-affix-wrapper:focus,
    .ant-input:focus {
      border-color: color-mix(in oklab, var(--brand) 50%, var(--info)) !important;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 16%, transparent) !important;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      width: 100%;
    }
  `}
`;

const StyledLabel = styled(Typography.Text)`
  ${({ theme }) => css`
    font-size: ${theme.fontSizeSM}px;
  `}
`;

export default function Login() {
  const [form] = Form.useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();

  const bootstrapData = getBootstrapData();
  const appName =
    (theme as { brandAppName?: string }).brandAppName ||
    bootstrapData.common?.conf?.APP_NAME ||
    'RedOwl';
  const logoUrl =
    theme.brandLogoUrl ||
    ensureStaticPrefix('/static/assets/images/redowl-logo.svg');

  const nextUrl = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('next') || '';
    } catch (_error) {
      return '';
    }
  }, []);

  const loginEndpoint = useMemo(
    () =>
      ensureAppRoot(
        nextUrl ? `/login/?next=${encodeURIComponent(nextUrl)}` : '/login/',
      ),
    [nextUrl],
  );

  const buildProviderLoginUrl = (providerName: string) => {
    const base = `/login/${encodeURIComponent(providerName)}`;
    return ensureAppRoot(
      nextUrl ? `${base}?next=${encodeURIComponent(nextUrl)}` : base,
    );
  };

  const authType: AuthType = bootstrapData.common.conf.AUTH_TYPE;
  const providers: Provider[] = bootstrapData.common.conf.AUTH_PROVIDERS;
  const authRegistration: boolean =
    bootstrapData.common.conf.AUTH_USER_REGISTRATION;

  useEffect(() => {
    const loginAttempted = sessionStorage.getItem('login_attempted');

    if (loginAttempted === 'true') {
      sessionStorage.removeItem('login_attempted');
      dispatch(addDangerToast(t('Invalid username or password')));
      form.setFieldsValue({ password: '' });
    }
  }, [dispatch, form]);

  const onFinish = (values: LoginForm) => {
    setLoading(true);
    sessionStorage.setItem('login_attempted', 'true');
    SupersetClient.postForm(ensureAppRoot(loginEndpoint), values, '');
  };

  const getAuthIconElement = (
    providerName: string,
  ): React.JSX.Element | undefined => {
    if (!providerName || typeof providerName !== 'string') {
      return undefined;
    }
    const iconComponentName = `${capitalize(providerName)}Outlined`;
    const IconComponent = (Icons as Record<string, React.ComponentType<any>>)[
      iconComponentName
    ];

    if (IconComponent && typeof IconComponent === 'function') {
      return <IconComponent />;
    }
    return undefined;
  };

  const renderAuthForm = () => {
    if (authType === AuthType.AuthOID) {
      return (
        <Flex justify="center" vertical gap="middle">
          <Form layout="vertical" requiredMark="optional" form={form}>
            {providers.map((provider: OIDProvider) => (
              <Form.Item key={provider.name}>
                <Button
                  href={buildProviderLoginUrl(provider.name)}
                  block
                  iconPosition="start"
                  icon={getAuthIconElement(provider.name)}
                >
                  {t('Sign in with')} {capitalize(provider.name)}
                </Button>
              </Form.Item>
            ))}
          </Form>
        </Flex>
      );
    }

    if (authType === AuthType.AuthOauth || authType === AuthType.AuthSAML) {
      return (
        <Flex justify="center" gap={0} vertical>
          <Form layout="vertical" requiredMark="optional" form={form}>
            {providers.map((provider: OAuthProvider) => (
              <Form.Item key={provider.name}>
                <Button
                  href={buildProviderLoginUrl(provider.name)}
                  block
                  iconPosition="start"
                  icon={getAuthIconElement(provider.name)}
                >
                  {t('Sign in with')} {capitalize(provider.name)}
                </Button>
              </Form.Item>
            ))}
          </Form>
        </Flex>
      );
    }

    if (authType === AuthType.AuthDB || authType === AuthType.AuthLDAP) {
      return (
        <Flex justify="center" vertical gap="middle">
          <Typography.Text type="secondary" className="form-hint">
            {t('Enter your login and password below:')}
          </Typography.Text>
          <Form
            layout="vertical"
            requiredMark="optional"
            form={form}
            onFinish={onFinish}
          >
            <Form.Item<LoginForm>
              label={<StyledLabel>{t('Username:')}</StyledLabel>}
              name="username"
              rules={[
                { required: true, message: t('Please enter your username') },
              ]}
            >
              <Input
                autoFocus
                prefix={<Icons.UserOutlined iconSize="l" />}
                data-test="username-input"
              />
            </Form.Item>
            <Form.Item<LoginForm>
              label={<StyledLabel>{t('Password:')}</StyledLabel>}
              name="password"
              rules={[
                { required: true, message: t('Please enter your password') },
              ]}
            >
              <Input.Password
                prefix={<Icons.KeyOutlined iconSize="l" />}
                data-test="password-input"
              />
            </Form.Item>
            <Form.Item label={null}>
              <div className="actions">
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  data-test="login-button"
                >
                  {t('Sign in')}
                </Button>
                {authRegistration && (
                  <Button
                    block
                    type="default"
                    href={ensureAppRoot('/register/')}
                    data-test="register-button"
                  >
                    {t('Register')}
                  </Button>
                )}
              </div>
            </Form.Item>
          </Form>
        </Flex>
      );
    }

    return null;
  };

  return (
    <LoginShell data-test="login-form">
      <HeroPane aria-label={t('RedOwl analytics')}>
        <Orbit className="orbit-a" />
        <Orbit className="orbit-b" />
        <NetworkLayer viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path
            id="n-path-a"
            className="link"
            d="M120 160 C220 120, 280 210, 360 190 S520 120, 620 170"
          />
          <path
            className="link link-flow"
            d="M120 160 C220 120, 280 210, 360 190 S520 120, 620 170"
          />
          <path
            id="n-path-b"
            className="link"
            d="M90 420 C180 360, 260 470, 360 430 S540 350, 700 410"
          />
          <path
            className="link link-flow link-flow-slow"
            d="M90 420 C180 360, 260 470, 360 430 S540 350, 700 410"
          />
          <path
            id="n-path-c"
            className="link"
            d="M160 700 C260 640, 300 760, 420 720 S600 640, 720 690"
          />
          <path
            className="link link-flow"
            d="M160 700 C260 640, 300 760, 420 720 S600 640, 720 690"
          />
          <path id="n-path-d" className="link" d="M360 190 L360 430 L420 720" />
          <path
            className="link link-flow link-flow-slow"
            d="M360 190 L360 430 L420 720"
          />
          <path id="n-path-e" className="link" d="M620 170 L700 410" />
          <path className="link link-flow" d="M620 170 L700 410" />
          <path id="n-path-f" className="link" d="M120 160 L90 420 L160 700" />
          <path
            className="link link-flow link-flow-slow"
            d="M120 160 L90 420 L160 700"
          />
          <path
            className="link link-dim"
            d="M620 170 C540 280, 480 320, 360 430"
          />
          <path
            className="link link-flow"
            d="M620 170 C540 280, 480 320, 360 430"
          />
          <path
            className="link link-dim"
            d="M700 410 C580 520, 500 600, 420 720"
          />
          <path
            className="link link-flow link-flow-slow"
            d="M700 410 C580 520, 500 600, 420 720"
          />
          <path
            className="link link-dim"
            d="M240 280 C300 340, 320 380, 360 430"
          />
          <path
            className="link link-flow"
            d="M240 280 C300 340, 320 380, 360 430"
          />

          <circle className="node-glow" cx="120" cy="160" r="14" />
          <circle className="node" cx="120" cy="160" r="4.5" />
          <circle className="node-glow" cx="360" cy="190" r="16" />
          <circle className="node" cx="360" cy="190" r="5" />
          <circle className="node-glow" cx="620" cy="170" r="13" />
          <circle className="node" cx="620" cy="170" r="4" />
          <circle className="node-glow" cx="90" cy="420" r="15" />
          <circle className="node" cx="90" cy="420" r="4.5" />
          <circle className="node-glow" cx="360" cy="430" r="18" />
          <circle className="node" cx="360" cy="430" r="5.5" />
          <circle className="node-glow" cx="700" cy="410" r="14" />
          <circle className="node" cx="700" cy="410" r="4.5" />
          <circle className="node-glow" cx="160" cy="700" r="13" />
          <circle className="node" cx="160" cy="700" r="4" />
          <circle className="node-glow" cx="420" cy="720" r="16" />
          <circle className="node" cx="420" cy="720" r="5" />
          <circle className="node-glow" cx="720" cy="690" r="12" />
          <circle className="node" cx="720" cy="690" r="4" />
          <circle className="node-glow" cx="240" cy="280" r="11" />
          <circle className="node" cx="240" cy="280" r="3.5" />

          <circle className="packet" r="3.2">
            <animateMotion dur="4.2s" repeatCount="indefinite">
              <mpath href="#n-path-a" />
            </animateMotion>
          </circle>
          <circle className="packet packet-blue" r="2.8">
            <animateMotion dur="5.4s" begin="1s" repeatCount="indefinite">
              <mpath href="#n-path-b" />
            </animateMotion>
          </circle>
          <circle className="packet" r="3">
            <animateMotion dur="4.8s" begin="0.6s" repeatCount="indefinite">
              <mpath href="#n-path-c" />
            </animateMotion>
          </circle>
          <circle className="packet packet-blue" r="2.6">
            <animateMotion dur="3.6s" begin="1.4s" repeatCount="indefinite">
              <mpath href="#n-path-d" />
            </animateMotion>
          </circle>
          <circle className="packet" r="2.4">
            <animateMotion dur="3.2s" begin="0.3s" repeatCount="indefinite">
              <mpath href="#n-path-e" />
            </animateMotion>
          </circle>
          <circle className="packet packet-blue" r="2.8">
            <animateMotion dur="5s" begin="2s" repeatCount="indefinite">
              <mpath href="#n-path-f" />
            </animateMotion>
          </circle>
        </NetworkLayer>
        <ChartVisual aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </ChartVisual>
        <HeroCopy>
          <div className="brand-row">
            <div className="brand-mark">
              <Image
                preview={false}
                src={logoUrl}
                alt={appName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="brand-name">{appName}</div>
          </div>
          <h1>{t('Analytics that move with your business')}</h1>
          <p>
            {t(
              'Explore dashboards, charts, and SQL in one place — built to turn operational data into clear decisions.',
            )}
          </p>
        </HeroCopy>
      </HeroPane>

      <FormPane>
        <FormBlob className="blob-a" />
        <FormBlob className="blob-b" />
        <FormBlob className="blob-c" />
        <FormMesh viewBox="0 0 480 760" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path
            id="m-path-a"
            className="mesh-line"
            d="M40 80 C120 40, 180 140, 260 100 S400 40, 450 110"
          />
          <path
            id="m-path-b"
            className="mesh-line mesh-line-b"
            d="M20 280 C110 230, 170 340, 270 300 S400 240, 470 320"
          />
          <path
            id="m-path-c"
            className="mesh-line"
            d="M30 520 C130 470, 190 580, 300 540 S420 470, 460 560"
          />
          <path
            className="mesh-line mesh-line-b"
            d="M260 100 L270 300 L300 540"
          />
          <path className="mesh-line" d="M40 80 L20 280 L30 520" />
          <path
            className="mesh-line mesh-line-c"
            d="M450 110 C380 200, 320 260, 270 300"
          />
          <path
            className="mesh-line mesh-line-c"
            d="M470 320 C390 400, 340 480, 300 540"
          />
          <path
            className="mesh-line mesh-line-b"
            d="M80 180 C160 220, 200 250, 260 100"
          />
          <path
            className="mesh-line"
            d="M100 620 C200 580, 280 640, 380 600 S440 640, 460 560"
          />
          <circle className="mesh-node" cx="40" cy="80" r="3.5" />
          <circle className="mesh-node" cx="260" cy="100" r="4" />
          <circle className="mesh-node" cx="450" cy="110" r="3" />
          <circle className="mesh-node" cx="20" cy="280" r="3.5" />
          <circle className="mesh-node" cx="270" cy="300" r="4.5" />
          <circle className="mesh-node" cx="470" cy="320" r="3" />
          <circle className="mesh-node" cx="30" cy="520" r="3" />
          <circle className="mesh-node" cx="300" cy="540" r="4" />
          <circle className="mesh-node" cx="460" cy="560" r="3.5" />
          <circle className="mesh-node" cx="80" cy="180" r="3" />
          <circle className="mesh-node" cx="100" cy="620" r="3" />
          <circle className="mesh-node" cx="380" cy="600" r="3.5" />
          <circle className="mesh-packet" r="2.4">
            <animateMotion dur="5.5s" repeatCount="indefinite">
              <mpath href="#m-path-a" />
            </animateMotion>
          </circle>
          <circle className="mesh-packet mesh-packet-b" r="2.2">
            <animateMotion dur="6.2s" begin="1.2s" repeatCount="indefinite">
              <mpath href="#m-path-b" />
            </animateMotion>
          </circle>
          <circle className="mesh-packet" r="2">
            <animateMotion dur="5.8s" begin="0.8s" repeatCount="indefinite">
              <mpath href="#m-path-c" />
            </animateMotion>
          </circle>
        </FormMesh>
        <FormPanel>
          <h2 className="form-title">{t('Sign in')}</h2>
          {renderAuthForm()}
        </FormPanel>
      </FormPane>
    </LoginShell>
  );
}
