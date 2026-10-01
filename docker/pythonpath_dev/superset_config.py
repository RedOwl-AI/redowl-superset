# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
# This file is included in the final Docker image and SHOULD be overridden when
# deploying the image to prod. Settings configured here are intended for use in local
# development environments. Also note that superset_config_docker.py is imported
# as a final step as a means to override "defaults" configured here
#
import logging
import os
import sys

from celery.schedules import crontab
from flask_caching.backends.filesystemcache import FileSystemCache

logger = logging.getLogger()

DATABASE_DIALECT = os.getenv("DATABASE_DIALECT")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = os.getenv("DATABASE_PORT")
DATABASE_DB = os.getenv("DATABASE_DB")

EXAMPLES_USER = os.getenv("EXAMPLES_USER")
EXAMPLES_PASSWORD = os.getenv("EXAMPLES_PASSWORD")
EXAMPLES_HOST = os.getenv("EXAMPLES_HOST")
EXAMPLES_PORT = os.getenv("EXAMPLES_PORT")
EXAMPLES_DB = os.getenv("EXAMPLES_DB")

# The SQLAlchemy connection string.
SQLALCHEMY_DATABASE_URI = (
    f"{DATABASE_DIALECT}://"
    f"{DATABASE_USER}:{DATABASE_PASSWORD}@"
    f"{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_DB}"
)

# Use environment variable if set, otherwise construct from components
# This MUST take precedence over any other configuration
SQLALCHEMY_EXAMPLES_URI = os.getenv(
    "SUPERSET__SQLALCHEMY_EXAMPLES_URI",
    (
        f"{DATABASE_DIALECT}://"
        f"{EXAMPLES_USER}:{EXAMPLES_PASSWORD}@"
        f"{EXAMPLES_HOST}:{EXAMPLES_PORT}/{EXAMPLES_DB}"
    ),
)


REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_CELERY_DB = os.getenv("REDIS_CELERY_DB", "0")
REDIS_RESULTS_DB = os.getenv("REDIS_RESULTS_DB", "1")

RESULTS_BACKEND = FileSystemCache("/app/superset_home/sqllab")

CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_",
    "CACHE_REDIS_HOST": REDIS_HOST,
    "CACHE_REDIS_PORT": REDIS_PORT,
    "CACHE_REDIS_DB": REDIS_RESULTS_DB,
}
DATA_CACHE_CONFIG = CACHE_CONFIG
THUMBNAIL_CACHE_CONFIG = CACHE_CONFIG


class CeleryConfig:
    broker_url = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_CELERY_DB}"
    imports = (
        "superset.sql_lab",
        "superset.tasks.deletion_retention",
        "superset.tasks.scheduler",
        "superset.tasks.thumbnails",
        "superset.tasks.cache",
        "superset.tasks.export_dashboard_excel",
    )
    result_backend = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_RESULTS_DB}"
    worker_prefetch_multiplier = 1
    task_acks_late = False
    beat_schedule = {
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*", hour="*"),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=10, hour=0),
        },
        # Gated on the SOFT_DELETE feature flag, which is off by default: the
        # task is scheduled either way, but purges nothing while the flag is
        # unset. Enable it in FEATURE_FLAGS below to exercise retention locally.
        "deletion_retention.purge_soft_deleted": {
            "task": "deletion_retention.purge_soft_deleted",
            "schedule": crontab(minute=0, hour=0),
        },
    }


CELERY_CONFIG = CeleryConfig

FEATURE_FLAGS = {
    "ALERT_REPORTS": True,
    "DATASET_FOLDERS": True,
    "ENABLE_EXTENSIONS": True,
    "MOBILE_CONSUMPTION_MODE": True,
    "SEMANTIC_LAYERS": True,
}
EXTENSIONS_PATH = "/app/docker/extensions"
ALERT_REPORTS_NOTIFICATION_DRY_RUN = True
# The Docker Compose app service is named "superset" and listens on 8088. Report
# paths are root-relative, so urljoin drops the base path; only the scheme, host,
# and port must be correct here. SUPERSET_APP_ROOT is kept for consumers that
# concatenate paths directly (e.g. cache warm-up). For screenshots in the dev
# stack (unbuilt static assets) point this at the nginx service instead:
# http://nginx{SUPERSET_APP_ROOT}/
WEBDRIVER_BASEURL = f"http://superset:8088{os.environ.get('SUPERSET_APP_ROOT', '/')}/"
# The base URL for the email report hyperlinks.
WEBDRIVER_BASEURL_USER_FRIENDLY = (
    f"http://localhost:8888/{os.environ.get('SUPERSET_APP_ROOT', '/')}/"
)
SQLLAB_CTAS_NO_LIMIT = True

# RedOwl Plumage categorical palette for bar / line / area (and other) charts.
# Appears under Customize > Color Scheme; isDefault makes it the registry default.
REDOWL_CATEGORICAL_COLORS = [
    "#900f21",
    "#3080bc",
    "#0fa05c",
    "#de9c31",
    "#73599e",
    "#0d9298",
]

EXTRA_CATEGORICAL_COLOR_SCHEMES = [
    {
        "id": "redowl",
        "label": "RedOwl Plumage",
        "description": "RedOwl categorical palette",
        "isDefault": True,
        "colors": REDOWL_CATEGORICAL_COLORS,
    }
]

# Brand chrome (header logo, app name, favicon).
APP_NAME = "RedOwl"
APP_ICON = "/static/assets/images/redowl-logo.svg"
FAVICONS = [{"href": "/static/assets/images/favicon.png"}]

# Hide the navbar/sidebar environment pill (flask-debug shifts the footer).
ENVIRONMENT_TAG_CONFIG = {
    "variable": "SUPERSET_ENV",
    "values": {
        "debug": {"color": "error", "text": ""},
        "development": {"color": "processing", "text": ""},
        "production": {"color": "", "text": ""},
    },
}

# Brand app chrome + ECharts base color fallback (series still prefer color_scheme /
# label_colors when set). Partial THEME_* is deep-merged with built-in tokens.
# Hex values are sRGB conversions of Plumage :root / .dark semantic OKLCH tokens.
THEME_DEFAULT = {
    "token": {
        # --primary / --foreground (Plumage primary button fill)
        "colorPrimary": "#182316",
        "colorPrimaryHover": "#2e352c",
        "colorPrimaryActive": "#10160f",
        "colorTextBase": "#182316",
        # --background (warm cream canvas)
        "colorBgBase": "#f5f4ee",
        "colorBgLayout": "#f5f4ee",
        # --card
        "colorBgContainer": "#fdfdfb",
        # --border
        "colorBorder": "#e6e5df",
        "colorBorderSecondary": "#eae8e0",
        # --info / --success / --warning / --destructive
        "colorLink": "#168dd9",
        "colorInfo": "#168dd9",
        "colorSuccess": "#0fa05c",
        "colorWarning": "#efa831",
        "colorError": "#e7000b",
        "colorErrorHover": "#c40009",
        "colorErrorActive": "#a30008",
        # --radius + Plumage button chrome
        "borderRadius": 8,
        "buttonBorderRadius": 6,
        "buttonControlHeight": 36,
        "buttonPaddingInline": 16,
        "buttonFontSize": 14,
        # Secondary = Plumage taupe fill (--secondary)
        "buttonSecondaryColor": "#182316",
        "buttonSecondaryBg": "#d4d2c8",
        "buttonSecondaryBorderColor": "transparent",
        "buttonSecondaryHoverColor": "#182316",
        "buttonSecondaryHoverBg": "#f1f0ea",
        "buttonSecondaryHoverBorderColor": "transparent",
        "buttonSecondaryActiveColor": "#182316",
        "buttonSecondaryActiveBg": "#e8e6d9",
        "buttonSecondaryActiveBorderColor": "transparent",
        # Draft / Published badges (card status pills)
        "labelDraftColor": "#ffffff",
        "labelDraftBg": "#182316",
        "labelDraftBorderColor": "transparent",
        "labelDraftIconColor": "#ffffff",
        "labelPublishedColor": "#ffffff",
        "labelPublishedBg": "#0fa05c",
        "labelPublishedBorderColor": "transparent",
        "labelPublishedIconColor": "#ffffff",
        "labelBorderRadius": 6,
        "brandAppName": "RedOwl",
        "brandLogoAlt": "RedOwl",
        "brandLogoUrl": APP_ICON,
        "brandLogoHeight": "28px",
    },
    "echartsOptionsOverrides": {
        "color": REDOWL_CATEGORICAL_COLORS,
    },
}

THEME_DARK = {
    "algorithm": "dark",
    "token": {
        # --primary / --foreground
        "colorPrimary": "#f1f4f1",
        "colorPrimaryHover": "#dfe3df",
        "colorPrimaryActive": "#c9cec9",
        "colorTextBase": "#f1f4f1",
        # --background / --card
        "colorBgBase": "#0c0d0f",
        "colorBgLayout": "#0c0d0f",
        "colorBgContainer": "#1c1e21",
        # --border (oklch(1 0 0 / 14%))
        "colorBorder": "rgba(255, 255, 255, 0.14)",
        "colorBorderSecondary": "rgba(255, 255, 255, 0.10)",
        # --info / --success / --warning / --destructive
        "colorLink": "#3ba6f5",
        "colorInfo": "#3ba6f5",
        "colorSuccess": "#35c177",
        "colorWarning": "#fcb442",
        "colorError": "#f9423d",
        "colorErrorHover": "#ff6b66",
        "colorErrorActive": "#d93632",
        "borderRadius": 8,
        "buttonBorderRadius": 6,
        "buttonControlHeight": 36,
        "buttonPaddingInline": 16,
        "buttonFontSize": 14,
        # Secondary = Plumage dark --secondary
        "buttonSecondaryColor": "#f1f4f1",
        "buttonSecondaryBg": "#3f444a",
        "buttonSecondaryBorderColor": "transparent",
        "buttonSecondaryHoverColor": "#f1f4f1",
        "buttonSecondaryHoverBg": "#303337",
        "buttonSecondaryHoverBorderColor": "transparent",
        "buttonSecondaryActiveColor": "#f1f4f1",
        "buttonSecondaryActiveBg": "#242729",
        "buttonSecondaryActiveBorderColor": "transparent",
        "labelDraftColor": "#10140f",
        "labelDraftBg": "#f1f4f1",
        "labelDraftBorderColor": "transparent",
        "labelDraftIconColor": "#10140f",
        "labelPublishedColor": "#052516",
        "labelPublishedBg": "#35c177",
        "labelPublishedBorderColor": "transparent",
        "labelPublishedIconColor": "#052516",
        "labelBorderRadius": 6,
        "brandAppName": "RedOwl",
        "brandLogoAlt": "RedOwl",
        "brandLogoUrl": APP_ICON,
        "brandLogoHeight": "28px",
    },
    "echartsOptionsOverrides": {
        "color": REDOWL_CATEGORICAL_COLORS,
    },
}

log_level_text = os.getenv("SUPERSET_LOG_LEVEL", "INFO")
LOG_LEVEL = getattr(logging, log_level_text.upper(), logging.INFO)

if os.getenv("CYPRESS_CONFIG") == "true":
    # When running the service as a cypress backend, we need to import the config
    # located @ tests/integration_tests/superset_test_config.py
    base_dir = os.path.dirname(__file__)
    module_folder = os.path.abspath(
        os.path.join(base_dir, "../../tests/integration_tests/")
    )
    sys.path.insert(0, module_folder)
    from superset_test_config import *  # noqa

    sys.path.pop(0)

#
# Optionally import superset_config_docker.py (which will have been included on
# the PYTHONPATH) in order to allow for local settings to be overridden
#
try:
    import superset_config_docker
    from superset_config_docker import *  # noqa: F403

    logger.info(
        "Loaded your Docker configuration at [%s]", superset_config_docker.__file__
    )
except ImportError:
    logger.info("Using default Docker config...")
