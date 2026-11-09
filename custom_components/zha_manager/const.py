# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): fab6ab4936e8bf0ca02e1a40936f3bc0f7ff39b84f0a9bffa7845269b318c21f
"""Konstanten des ZHA Managers."""
from __future__ import annotations

from datetime import timedelta

DOMAIN = "zha_manager"
ZHA_DOMAIN = "zha"
NAME = "ZHA Manager"
VERSION = "0.0.1"

GITHUB_REPO = "meine-smarte-welt/zha_manager"
GITHUB_URL = f"https://github.com/{GITHUB_REPO}"
GITHUB_RELEASES_URL = f"{GITHUB_URL}/releases"

CARD_FILE = "zha-manager-card.js"
STATIC_URL = f"/{DOMAIN}_files"
CARD_URL = f"{STATIC_URL}/{CARD_FILE}"

CONF_ZHA_ENTRY_ID = "zha_entry_id"

# Optionen
OPT_BATTERY_LOW = "battery_low"
OPT_BATTERY_CRITICAL = "battery_critical"
OPT_OFFLINE_DELAY = "offline_delay"
OPT_EVENTS = "events_enabled"
OPT_EXPERIMENTAL = "experimental_enabled"
OPT_EXPERIMENTAL_FEATURES = "experimental_features"
OPT_NC_ENABLED = "nc_enabled"
OPT_NC_TYPES = "nc_types"

DEFAULT_BATTERY_LOW = 20
DEFAULT_BATTERY_CRITICAL = 10
DEFAULT_OFFLINE_DELAY = 0  # Sekunden; 0 = sofort, wenn ZHA das Gerät als nicht erreichbar meldet
DEFAULT_EVENTS = True
DEFAULT_EXPERIMENTAL = False

# Zeiten
FLUSH_DELAY = 0.5
TICK_INTERVAL = timedelta(minutes=1)
UPDATE_CHECK_INTERVAL = timedelta(hours=12)
READY_DELAY = 30  # Sekunden nach dem Laden von ZHA, bevor Ereignisse gesendet werden
STORE_VERSION = 1
STORE_SAVE_DELAY = 30
EVENT_LOG_SIZE = 50

# Ereignisse (Home-Assistant-Ereignisbus)
EVENT_DEVICE_OFFLINE = f"{DOMAIN}_device_offline"
EVENT_DEVICE_ONLINE = f"{DOMAIN}_device_online"
EVENT_BATTERY_LOW = f"{DOMAIN}_battery_low"
EVENT_UPDATE_AVAILABLE = f"{DOMAIN}_update_available"
EVENT_DEVICE_JOINED = f"{DOMAIN}_device_joined"
EVENT_DEVICE_LEFT = f"{DOMAIN}_device_left"

# Experimentelle Funktionen (Regeln 07). Registry an EINER Stelle, in der Karte schlüsselgleich.
# own_switch: Die Funktion hat einen eigenen Optionsschalter statt der Liste "experimental_features".
EXPERIMENTAL_FEATURES: list[dict[str, str]] = [
    {"key": "device_rename", "since": "0.0.1", "icon": "mdi:pencil"},
    {"key": "device_remove", "since": "0.0.1", "icon": "mdi:delete-outline"},
    {"key": "permit_join", "since": "0.0.1", "icon": "mdi:plus-network"},
    {"key": "firmware_update", "since": "0.0.1", "icon": "mdi:update"},
    {"key": "gateway_details", "since": "0.0.1", "icon": "mdi:radar"},
    {"key": "groups_view", "since": "0.0.1", "icon": "mdi:google-circles-communities"},
    {"key": "notification_center", "since": "0.0.1", "icon": "mdi:bell-ring-outline", "own_switch": OPT_NC_ENABLED},
]
LISTED_FEATURE_KEYS = [f["key"] for f in EXPERIMENTAL_FEATURES if not f.get("own_switch")]

# Aktionen der WebSocket-Schnittstelle
ACTIONS = [
    "refresh",
    "check_app_update",
    "rename",
    "remove",
    "permit_join",
    "install_update",
    "check_updates",
    "exp_set_feature",
    "nc_set_master",
    "nc_set_type",
]
