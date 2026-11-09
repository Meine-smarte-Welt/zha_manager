# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 5c34afa34451dddd7f85f89bbccbfab21c81b3d75fa2053a6792022b6c9cf5a7
"""WebSocket-Schnittstelle der Karte (Schreiben und Details nur für Administratoren)."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError

from .const import ACTIONS, DOMAIN, EXPERIMENTAL_FEATURES, VERSION
from .manager import async_get_manager

_LOGGER = logging.getLogger(__name__)

ERR_FAILED = "failed"


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_info)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_action)
    websocket_api.async_register_command(hass, ws_details)


def _manager_or_error(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> Any | None:
    try:
        return async_get_manager(hass, msg.get("entry_id"))
    except HomeAssistantError:
        connection.send_error(msg["id"], "not_loaded", "ZHA Manager is not loaded")
        return None


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/info"})
@websocket_api.async_response
async def ws_info(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Versionen und Einträge für den Karten-Editor (ohne Schreibzugriff)."""
    entries = [
        {"entry_id": e.entry_id, "title": e.title}
        for e in hass.config_entries.async_entries(DOMAIN)
        if e.state is ConfigEntryState.LOADED
    ]
    result: dict[str, Any] = {
        "version": VERSION,
        "entries": entries,
        "experimental_count": len(EXPERIMENTAL_FEATURES),
        "app": None,
    }
    if entries:
        manager = hass.config_entries.async_get_entry(entries[0]["entry_id"]).runtime_data
        result["app"] = {**manager.update_checker.info, "current": VERSION}
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe", vol.Optional("entry_id"): str})
@websocket_api.async_response
async def ws_subscribe(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    manager = _manager_or_error(hass, connection, msg)
    if manager is None:
        return

    @callback
    def _forward(payload: dict[str, Any]) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], payload))

    unsub = manager.async_subscribe_ws(_forward)

    @callback
    def _cleanup() -> None:
        unsub()

    connection.subscriptions[msg["id"]] = _cleanup
    connection.send_result(msg["id"])
    _forward({"type": "snapshot", "data": manager.snapshot()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/action",
        vol.Required("action"): vol.In(ACTIONS),
        vol.Optional("entry_id"): str,
        vol.Optional("device"): str,
        vol.Optional("value"): vol.All(str, vol.Length(max=120)),
        vol.Optional("flag"): bool,
        vol.Optional("duration"): vol.All(int, vol.Range(min=0, max=254)),
        vol.Optional("topic"): vol.All(str, vol.Length(max=80)),
    }
)
@websocket_api.async_response
async def ws_action(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Aktion annehmen und im Hintergrund ausführen; das Ergebnis kommt als response-Ereignis."""
    manager = _manager_or_error(hass, connection, msg)
    if manager is None:
        return
    action = msg["action"]
    topic = msg.get("topic") or action
    connection.send_result(msg["id"], {"accepted": True})

    async def _run() -> None:
        try:
            data = await manager.async_action(action, msg)
        except HomeAssistantError as err:
            manager.async_push_response(topic, "error", str(err))
        except Exception:  # noqa: BLE001 - nie die Verbindung abbrechen
            _LOGGER.exception("Aktion %s fehlgeschlagen", action)
            manager.async_push_response(topic, "error", ERR_FAILED)
        else:
            manager.async_push_response(topic, "ok", None, data if isinstance(data, dict) else None)

    hass.async_create_task(_run(), f"{DOMAIN}_action_{action}")


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/details", vol.Required("device"): str, vol.Optional("entry_id"): str}
)
@websocket_api.async_response
async def ws_details(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    manager = _manager_or_error(hass, connection, msg)
    if manager is None:
        return
    try:
        connection.send_result(msg["id"], manager.async_details(msg["device"]))
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "unknown_device", str(err))
