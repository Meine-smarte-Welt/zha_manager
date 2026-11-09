# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 95b914bac947562d7f7e11a1e6240cc1bc707d1db0bccbc48bb0a1d42ece0f05
"""ZHA Manager: Übersicht und Verwaltung der Zigbee-Geräte von ZHA."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import CARD_FILE, CARD_URL, DOMAIN, STATIC_URL, VERSION
from .manager import ZhaManager, async_get_manager
from .websocket_api import async_register_websocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type ZhaManagerConfigEntry = ConfigEntry[ZhaManager]

SERVICE_SCHEMA = vol.Schema({vol.Optional("entry_id"): cv.string})


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Einmalig: Karte als statische Datei, WebSocket-Befehle und Services."""
    www = Path(__file__).parent / "www"
    await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(www), False)])
    async_register_websocket(hass)

    async def _refresh(call: ServiceCall) -> None:
        try:
            manager = async_get_manager(hass, call.data.get("entry_id"))
        except HomeAssistantError as err:
            raise ServiceValidationError(str(err)) from err
        await manager.async_action("refresh", {})

    async def _check_firmware(call: ServiceCall) -> None:
        try:
            manager = async_get_manager(hass, call.data.get("entry_id"))
            await manager.async_action("check_updates", {})
        except HomeAssistantError as err:
            raise ServiceValidationError(str(err)) from err

    hass.services.async_register(DOMAIN, "refresh", _refresh, schema=SERVICE_SCHEMA)
    hass.services.async_register(DOMAIN, "check_firmware_updates", _check_firmware, schema=SERVICE_SCHEMA)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ZhaManagerConfigEntry) -> bool:
    manager = ZhaManager(hass, entry)
    await manager.async_setup()
    entry.runtime_data = manager
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    await _async_register_resource(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ZhaManagerConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        await entry.runtime_data.async_unload()
    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ZhaManagerConfigEntry) -> None:
    """Optionen geändert: ohne Neuladen übernehmen (die Karte behält ihre Verbindung)."""
    entry.runtime_data.async_options_changed()


async def _async_register_resource(hass: HomeAssistant) -> None:
    """Karte als persistierte Lovelace-Ressource eintragen (im YAML-Modus manuell)."""
    if hass.data.get(f"{DOMAIN}_resource_done"):
        return
    hass.data[f"{DOMAIN}_resource_done"] = True
    url = f"{CARD_URL}?v={VERSION}"
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA  # noqa: PLC0415

        lovelace = hass.data.get(LOVELACE_DATA)
        resources = getattr(lovelace, "resources", None)
        mode = getattr(lovelace, "resource_mode", None) or getattr(lovelace, "mode", None)
        if resources is None or mode != "storage" or not hasattr(resources, "async_create_item"):
            _LOGGER.info("Lovelace im YAML-Modus: Ressource bitte manuell eintragen: %s (Typ: module)", url)
            return
        if not getattr(resources, "loaded", True):
            await resources.async_load()
            resources.loaded = True
        base = f"{STATIC_URL}/{CARD_FILE}"
        for item in resources.async_items():
            if str(item.get("url", "")).split("?")[0] == base:
                if item["url"] != url:
                    await resources.async_update_item(item["id"], {"res_type": "module", "url": url})
                return
        await resources.async_create_item({"res_type": "module", "url": url})
    except Exception as err:  # noqa: BLE001 - die Integration läuft auch ohne automatischen Eintrag
        _LOGGER.warning(
            "Karte konnte nicht automatisch eingetragen werden (%s). Bitte manuell: %s (Typ: module)",
            type(err).__name__,
            url,
        )
