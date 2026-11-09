# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 7dc4faedcf6e3aa6e738b49fd8c1f51fadb01ce22abbfe580c5f9d4898db8fd3
"""Manager: Daten, Aktionen und Ereignisse des ZHA Managers.

Grundfunktionen lesen nur aus den Registries und Zuständen von Home Assistant.
Alles, was in ZHA schreibt oder interne ZHA-Daten liest, ist experimentell
und nur bei eingeschaltetem Hauptschalter und eigenem Schalter aktiv.
"""
from __future__ import annotations

import logging
import time
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import EVENT_STATE_CHANGED, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store

from .const import (
    ACTIONS,
    CONF_ZHA_ENTRY_ID,
    DEFAULT_BATTERY_CRITICAL,
    DEFAULT_BATTERY_LOW,
    DEFAULT_EVENTS,
    DEFAULT_EXPERIMENTAL,
    DEFAULT_OFFLINE_DELAY,
    DOMAIN,
    EVENT_BATTERY_LOW,
    EVENT_DEVICE_JOINED,
    EVENT_DEVICE_LEFT,
    EVENT_DEVICE_OFFLINE,
    EVENT_DEVICE_ONLINE,
    EVENT_LOG_SIZE,
    EVENT_UPDATE_AVAILABLE,
    EXPERIMENTAL_FEATURES,
    FLUSH_DELAY,
    LISTED_FEATURE_KEYS,
    NAME,
    OPT_BATTERY_CRITICAL,
    OPT_BATTERY_LOW,
    OPT_EVENTS,
    OPT_EXPERIMENTAL,
    OPT_EXPERIMENTAL_FEATURES,
    OPT_NC_ENABLED,
    OPT_NC_TYPES,
    OPT_OFFLINE_DELAY,
    READY_DELAY,
    STORE_SAVE_DELAY,
    STORE_VERSION,
    TICK_INTERVAL,
    UPDATE_CHECK_INTERVAL,
    VERSION,
    ZHA_DOMAIN,
)
from .nc_catalog import NC_CATALOG, NC_TYPES
from .notification_bridge import NotificationBridge
from .update_check import UpdateChecker

_LOGGER = logging.getLogger(__name__)


@dataclass
class _Meta:
    """Zuordnung eines Zigbee-Geräts zu Registry-Einträgen."""

    ieee: str
    device_id: str
    coordinator: bool = False
    entities: list[str] = field(default_factory=list)
    battery: str | None = None
    update: str | None = None
    lqi: str | None = None
    rssi: str | None = None


def _state_number(state: Any) -> float | None:
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    try:
        return float(state.state)
    except (TypeError, ValueError):
        return None


def _num(value: Any) -> float | int | None:
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, (int, float)):
        return value
    return None


def _text(value: Any, limit: int = 120) -> str | None:
    if value is None:
        return None
    name = getattr(value, "name", None)
    return str(name if isinstance(name, str) else value)[:limit]


class ZhaManager:
    """Hält den Zustand je Config Entry und stellt ihn Karte, Sensoren und Ereignissen bereit."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.update_checker = UpdateChecker(hass, VERSION)
        self.nc = NotificationBridge(
            hass,
            entry,
            source=DOMAIN,
            name=NAME,
            version=VERSION,
            icon="mdi:zigbee",
            catalog=NC_CATALOG,
        )
        self.nc.set_state_provider(self._nc_active_state)
        self.data: dict[str, Any] = {
            "devices": [],
            "groups": None,
            "stats": {"total": 0, "offline": 0, "battery_low": 0, "battery_critical": 0, "updates": 0},
            "connection": {"zha_present": False, "zha_loaded": False, "radio_type": None, "gateway": False},
        }
        self._meta: dict[str, _Meta] = {}
        self._entity_map: dict[str, str] = {}
        self._listeners: list[Callable[[], None]] = []
        self._ws_listeners: list[Callable[[dict[str, Any]], None]] = []
        self._flush_unsub: Callable[[], None] | None = None
        self._map_dirty = True
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self._known: set[str] | None = None
        self._offline_since: dict[str, float] = {}
        self._prev: dict[str, dict[str, Any]] = {}
        self._names: dict[str, str] = {}
        self._events: deque[dict[str, Any]] = deque(maxlen=EVENT_LOG_SIZE)
        self._nc_counts: dict[str, int] = {}
        self._permit_until: float | None = None
        self._loaded_since: float | None = None
        self._ready = False
        self._started = False
        self._gw_warned = False
        self._last_zha_state: ConfigEntryState | None = None

    # ------------------------------------------------------------------
    # Optionen und Experimentell-Registry
    # ------------------------------------------------------------------
    def _opt(self, key: str, default: Any) -> Any:
        return self.entry.options.get(key, default)

    @property
    def experimental_master(self) -> bool:
        return bool(self._opt(OPT_EXPERIMENTAL, DEFAULT_EXPERIMENTAL))

    def feature_enabled(self, key: str) -> bool:
        """Experimentelle Funktion aktiv? Nur mit Hauptschalter und eigenem Schalter."""
        if not self.experimental_master:
            return False
        feat = next((f for f in EXPERIMENTAL_FEATURES if f["key"] == key), None)
        if feat is None:
            return False
        own = feat.get("own_switch")
        if own:
            return bool(self._opt(own, False))
        return key in (self._opt(OPT_EXPERIMENTAL_FEATURES, []) or [])

    def experimental_snapshot(self) -> dict[str, Any]:
        """Ohne Hauptschalter erscheint von den Funktionen nichts."""
        if not self.experimental_master:
            return {"master": False, "features": []}
        return {
            "master": True,
            "features": [
                {
                    "key": f["key"],
                    "since": f["since"],
                    "icon": f["icon"],
                    "own_switch": bool(f.get("own_switch")),
                    "enabled": self.feature_enabled(f["key"]),
                }
                for f in EXPERIMENTAL_FEATURES
            ],
        }

    # ------------------------------------------------------------------
    # Lebenszyklus
    # ------------------------------------------------------------------
    async def async_setup(self) -> None:
        stored = await self._store.async_load() or {}
        known = stored.get("known")
        self._known = {str(k) for k in known} if isinstance(known, list) else None
        offline = stored.get("offline_since") or {}
        self._offline_since = {str(k): float(v) for k, v in offline.items() if isinstance(v, (int, float))}

        self._rebuild_map()
        self._evaluate(silent=True)

        entry = self.entry
        hass = self.hass
        entry.async_on_unload(hass.bus.async_listen(dr.EVENT_DEVICE_REGISTRY_UPDATED, self._on_registry_event))
        entry.async_on_unload(hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, self._on_registry_event))
        entry.async_on_unload(
            hass.bus.async_listen(EVENT_STATE_CHANGED, self._on_state_event, event_filter=self._state_filter)
        )
        entry.async_on_unload(async_track_time_interval(hass, self._on_tick, TICK_INTERVAL))
        entry.async_on_unload(
            async_track_time_interval(hass, self._on_app_update_tick, UPDATE_CHECK_INTERVAL)
        )
        entry.async_on_unload(self._cancel_flush)

        self._started = True
        self.nc.async_start()
        entry.async_create_background_task(hass, self._async_check_app_update(), "zha_manager_update_check")

    async def async_unload(self) -> None:
        self._cancel_flush()
        await self._store.async_save(self._store_data())

    @callback
    def _cancel_flush(self) -> None:
        if self._flush_unsub is not None:
            self._flush_unsub()
            self._flush_unsub = None

    def _store_data(self) -> dict[str, Any]:
        return {"known": sorted(self._known or []), "offline_since": self._offline_since}

    @callback
    def _save_later(self) -> None:
        self._store.async_delay_save(self._store_data, STORE_SAVE_DELAY)

    # ------------------------------------------------------------------
    # Listener
    # ------------------------------------------------------------------
    def async_add_listener(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(cb)

        def _remove() -> None:
            if cb in self._listeners:
                self._listeners.remove(cb)

        return _remove

    def async_subscribe_ws(self, cb: Callable[[dict[str, Any]], None]) -> Callable[[], None]:
        self._ws_listeners.append(cb)

        def _remove() -> None:
            if cb in self._ws_listeners:
                self._ws_listeners.remove(cb)

        return _remove

    @callback
    def _notify(self) -> None:
        for cb in list(self._listeners):
            try:
                cb()
            except Exception:  # noqa: BLE001 - ein defekter Listener darf die anderen nicht blockieren
                _LOGGER.exception("Fehler in einem Listener des ZHA Managers")
        if self._ws_listeners:
            msg = {"type": "update", "data": self.snapshot()}
            for cb in list(self._ws_listeners):
                try:
                    cb(msg)
                except Exception:  # noqa: BLE001
                    _LOGGER.debug("Senden an eine Karte fehlgeschlagen")

    @callback
    def async_push_response(
        self, topic: str, status: str, error: str | None = None, data: dict[str, Any] | None = None
    ) -> None:
        msg = {"type": "response", "topic": topic, "status": status, "error": error, "data": data or {}}
        for cb in list(self._ws_listeners):
            try:
                cb(msg)
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Senden an eine Karte fehlgeschlagen")

    # ------------------------------------------------------------------
    # Ereignisse von Home Assistant
    # ------------------------------------------------------------------
    @callback
    def _state_filter(self, data: Any) -> bool:
        return data.get("entity_id") in self._entity_map

    @callback
    def _on_registry_event(self, _event: Any) -> None:
        self._map_dirty = True
        self._schedule_flush()

    @callback
    def _on_state_event(self, _event: Any) -> None:
        self._schedule_flush()

    @callback
    def _on_tick(self, _now: Any) -> None:
        zha = self._zha_entry()
        zha_state = zha.state if zha else None
        if zha_state is not self._last_zha_state:
            self._last_zha_state = zha_state
            self._map_dirty = True
        if self._map_dirty:
            self._rebuild_map()
        self._evaluate()

    async def _on_app_update_tick(self, _now: Any) -> None:
        await self._async_check_app_update()

    async def _async_check_app_update(self) -> None:
        await self.update_checker.async_check()
        self._notify()

    @callback
    def _schedule_flush(self) -> None:
        if self._flush_unsub is None:
            self._flush_unsub = async_call_later(self.hass, FLUSH_DELAY, self._flush)

    @callback
    def _flush(self, _now: Any = None) -> None:
        self._flush_unsub = None
        if self._map_dirty:
            self._rebuild_map()
        self._evaluate()

    @callback
    def async_options_changed(self) -> None:
        """Optionen geändert: still neu bewerten (keine Ereignisse für Schwellenwechsel)."""
        self._evaluate(silent=True)
        self.nc.async_options_changed()

    # ------------------------------------------------------------------
    # Registry-Zuordnung
    # ------------------------------------------------------------------
    def _zha_entry(self) -> ConfigEntry | None:
        eid = self.entry.data.get(CONF_ZHA_ENTRY_ID)
        return self.hass.config_entries.async_get_entry(eid) if eid else None

    @callback
    def _rebuild_map(self) -> None:
        self._map_dirty = False
        zha = self._zha_entry()
        meta: dict[str, _Meta] = {}
        emap: dict[str, str] = {}
        if zha is not None:
            dev_reg = dr.async_get(self.hass)
            ent_reg = er.async_get(self.hass)
            devices = dr.async_entries_for_config_entry(dev_reg, zha.entry_id)
            parents = {d.via_device_id for d in devices if d.via_device_id}
            for dev in devices:
                ieee = None
                for ident in dev.identifiers:
                    if ident[0] == ZHA_DOMAIN:
                        ieee = str(ident[1]).lower()
                        break
                if not ieee:
                    continue
                m = _Meta(ieee=ieee, device_id=dev.id, coordinator=dev.id in parents)
                for ent in er.async_entries_for_device(ent_reg, dev.id):
                    if ent.platform != ZHA_DOMAIN:
                        continue
                    m.entities.append(ent.entity_id)
                    emap[ent.entity_id] = ieee
                    domain = ent.entity_id.split(".", 1)[0]
                    dclass = ent.device_class or ent.original_device_class
                    if domain == "sensor" and dclass == "battery" and m.battery is None:
                        m.battery = ent.entity_id
                    elif domain == "update" and m.update is None:
                        m.update = ent.entity_id
                    elif domain == "sensor" and ent.translation_key == "lqi" and m.lqi is None:
                        m.lqi = ent.entity_id
                    elif domain == "sensor" and ent.translation_key == "rssi" and m.rssi is None:
                        m.rssi = ent.entity_id
                meta[ieee] = m
        self._meta = meta
        self._entity_map = emap

    # ------------------------------------------------------------------
    # Interne ZHA-Daten (nur experimentell, defensiv)
    # ------------------------------------------------------------------
    def _get_gateway(self) -> Any | None:
        try:
            from homeassistant.components.zha.helpers import get_zha_gateway  # noqa: PLC0415

            return get_zha_gateway(self.hass)
        except Exception as err:  # noqa: BLE001 - interne API kann sich ändern
            if not self._gw_warned:
                _LOGGER.debug("ZHA-Gateway nicht verfügbar: %s", type(err).__name__)
                self._gw_warned = True
            return None

    def _gateway_devices(self, gw: Any) -> dict[str, dict[str, Any]]:
        out: dict[str, dict[str, Any]] = {}
        try:
            for ieee, dev in dict(getattr(gw, "devices", {}) or {}).items():
                available = getattr(dev, "available", None)
                out[str(ieee).lower()] = {
                    "lqi": _num(getattr(dev, "lqi", None)),
                    "rssi": _num(getattr(dev, "rssi", None)),
                    "last_seen": _num(getattr(dev, "last_seen", None)),
                    "device_type": _text(getattr(dev, "device_type", None), 40),
                    "power_source": _text(getattr(dev, "power_source", None), 40),
                    "quirk": _text(getattr(dev, "quirk_class", None)),
                    "available": available if isinstance(available, bool) else None,
                }
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Gerätedaten aus ZHA nicht lesbar: %s", type(err).__name__)
        return out

    def _coordinator_info(self, gw: Any) -> dict[str, Any]:
        try:
            state = gw.application_controller.state
            node, net = state.node_info, state.network_info
            return {
                "model": _text(getattr(node, "model", None), 60),
                "manufacturer": _text(getattr(node, "manufacturer", None), 60),
                "firmware": _text(getattr(node, "version", None), 60),
                "channel": _num(getattr(net, "channel", None)),
            }
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Koordinator-Daten aus ZHA nicht lesbar: %s", type(err).__name__)
            return {}

    def _build_groups(self, gw: Any, names: dict[str, str]) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        try:
            for gid, grp in sorted(dict(getattr(gw, "groups", {}) or {}).items(), key=lambda kv: str(kv[0])):
                members = []
                for mem in list(getattr(grp, "members", []) or []):
                    ieee = str(getattr(getattr(mem, "device", None), "ieee", "")).lower()
                    members.append(
                        {"ieee": ieee, "name": names.get(ieee, ieee), "endpoint": _num(getattr(mem, "endpoint_id", None))}
                    )
                try:
                    group_id = int(getattr(grp, "group_id", gid))
                except (TypeError, ValueError):
                    group_id = 0
                out.append({"id": group_id, "name": str(getattr(grp, "name", gid))[:80], "members": members})
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Gruppen aus ZHA nicht lesbar: %s", type(err).__name__)
        return out

    # ------------------------------------------------------------------
    # Daten aufbauen
    # ------------------------------------------------------------------
    def _build(self, now: float, loaded: bool) -> dict[str, Any]:
        hass = self.hass
        states = hass.states
        dev_reg = dr.async_get(hass)
        area_reg = ar.async_get(hass)
        low = int(self._opt(OPT_BATTERY_LOW, DEFAULT_BATTERY_LOW))
        crit = int(self._opt(OPT_BATTERY_CRITICAL, DEFAULT_BATTERY_CRITICAL))
        delay = int(self._opt(OPT_OFFLINE_DELAY, DEFAULT_OFFLINE_DELAY))
        zha = self._zha_entry()

        gw = self._get_gateway() if loaded and self.feature_enabled("gateway_details") else None
        gw_dev = self._gateway_devices(gw) if gw is not None else {}

        rows: list[dict[str, Any]] = []
        for m in self._meta.values():
            dev = dev_reg.async_get(m.device_id)
            if dev is None:
                continue
            name = dev.name_by_user or dev.name or m.ieee
            extra = gw_dev.get(m.ieee, {})

            # Erreichbarkeit
            online: bool | None
            if not loaded:
                online = None
            else:
                ent_states = [s for s in (states.get(e) for e in m.entities) if s is not None]
                alive = (
                    extra["available"]
                    if extra.get("available") is not None
                    else (True if not ent_states else any(s.state != STATE_UNAVAILABLE for s in ent_states))
                )
                if alive:
                    self._offline_since.pop(m.ieee, None)
                    online = True
                else:
                    since = self._offline_since.setdefault(m.ieee, now)
                    online = not (now - since >= delay)

            # Batterie
            level = _state_number(states.get(m.battery)) if m.battery else None
            if level is not None:
                level = max(0, min(100, int(round(level))))
            battery_state = None
            if level is not None:
                battery_state = "critical" if level <= crit else "low" if level <= low else "ok"

            # Firmware
            upd = None
            ustate = states.get(m.update) if m.update else None
            if ustate is not None and ustate.state != STATE_UNAVAILABLE:
                attrs = ustate.attributes
                prog = attrs.get("in_progress")
                pct = attrs.get("update_percentage")
                if isinstance(prog, (int, float)) and not isinstance(prog, bool):
                    pct = prog
                upd = {
                    "available": ustate.state == "on",
                    "installed": _text(attrs.get("installed_version"), 40),
                    "latest": _text(attrs.get("latest_version"), 40),
                    "in_progress": bool(prog),
                    "percentage": _num(pct),
                }

            area = None
            if dev.area_id and (area_obj := area_reg.async_get_area(dev.area_id)):
                area = area_obj.name

            row: dict[str, Any] = {
                "ieee": m.ieee,
                "id": m.device_id,
                "name": name,
                "custom_name": bool(dev.name_by_user),
                "manufacturer": dev.manufacturer,
                "model": dev.model,
                "sw_version": dev.sw_version,
                "area": area,
                "online": online,
                "offline_since": self._offline_since.get(m.ieee) if online is False else None,
                "coordinator": m.coordinator or extra.get("device_type") == "Coordinator",
                "battery": level,
                "battery_state": battery_state,
                "update": upd,
                "lqi": _num(extra.get("lqi")) if extra else None,
                "rssi": _num(extra.get("rssi")) if extra else None,
                "entity_count": len(m.entities),
            }
            if row["lqi"] is None and m.lqi:
                val = _state_number(states.get(m.lqi))
                row["lqi"] = int(val) if val is not None else None
            if row["rssi"] is None and m.rssi:
                val = _state_number(states.get(m.rssi))
                row["rssi"] = int(val) if val is not None else None
            if extra:
                row["last_seen"] = extra.get("last_seen")
                row["device_type"] = extra.get("device_type")
                row["power_source"] = extra.get("power_source")
                row["quirk"] = extra.get("quirk")
            rows.append(row)

        rows.sort(key=lambda r: r["name"].casefold())
        for ieee in [k for k in self._offline_since if k not in self._meta]:
            self._offline_since.pop(ieee, None)

        connection: dict[str, Any] = {
            "zha_present": zha is not None,
            "zha_loaded": loaded,
            "radio_type": zha.data.get("radio_type") if zha is not None else None,
            "gateway": gw is not None,
        }
        groups = None
        if gw is not None:
            connection.update(self._coordinator_info(gw))
            if self.feature_enabled("groups_view"):
                groups = self._build_groups(gw, {r["ieee"]: r["name"] for r in rows})

        stats = {
            "total": len(rows),
            "offline": sum(1 for r in rows if r["online"] is False),
            "battery_low": sum(1 for r in rows if r["battery_state"] == "low"),
            "battery_critical": sum(1 for r in rows if r["battery_state"] == "critical"),
            "updates": sum(1 for r in rows if r["update"] and r["update"]["available"]),
        }
        return {"devices": rows, "groups": groups, "stats": stats, "connection": connection}

    # ------------------------------------------------------------------
    # Bewerten, Ereignisse, Notification Center
    # ------------------------------------------------------------------
    @callback
    def _evaluate(self, silent: bool = False) -> None:
        now = time.time()
        zha = self._zha_entry()
        loaded = bool(zha is not None and zha.state is ConfigEntryState.LOADED)
        if loaded:
            if self._loaded_since is None:
                self._loaded_since = now
        else:
            self._loaded_since = None
        ready = loaded and self._loaded_since is not None and now - self._loaded_since >= READY_DELAY
        if self._permit_until and now >= self._permit_until:
            self._permit_until = None

        before = dict(self._offline_since)
        self.data = self._build(now, loaded)
        if before != self._offline_since:
            self._save_later()

        became_ready = ready and not self._ready
        self._ready = ready
        devices = self.data["devices"]
        if ready and not became_ready and not silent:
            self._diff(devices)
        else:
            self._remember(devices, loaded)
        if became_ready and self._started:
            self.nc.async_sync()
        self._notify()

    @callback
    def _remember(self, devices: list[dict[str, Any]], loaded: bool) -> None:
        self._prev = {
            d["ieee"]: {
                "online": d["online"],
                "battery_state": d["battery_state"],
                "update": bool(d["update"] and d["update"]["available"]),
            }
            for d in devices
        }
        self._names = {d["ieee"]: d["name"] for d in devices}
        if loaded:
            current = {d["ieee"] for d in devices}
            if self._known != current:
                self._known = current
                self._save_later()

    @callback
    def _diff(self, devices: list[dict[str, Any]]) -> None:
        cur = {d["ieee"]: d for d in devices}
        known = self._known if self._known is not None else set(cur)

        for ieee, d in cur.items():
            if ieee not in known:
                self._emit(EVENT_DEVICE_JOINED, "device_joined", d)
                self._nc("device_joined", d, "active")
                continue
            prev = self._prev.get(ieee)
            if prev is None:
                continue
            # Erreichbarkeit
            if d["online"] is False and prev["online"] is not False:
                self._emit(EVENT_DEVICE_OFFLINE, "device_offline", d)
                self._nc("device_offline", d, "active")
            elif d["online"] is True and prev["online"] is False:
                self._emit(EVENT_DEVICE_ONLINE, "device_online", d)
                self._nc("device_offline", d, "resolved")
            # Batterie
            pb, cb = prev["battery_state"], d["battery_state"]
            if cb != pb:
                if cb in ("low", "critical") and (pb in (None, "ok") or (cb == "critical" and pb == "low")):
                    self._emit(EVENT_BATTERY_LOW, "battery_low", d, level=d["battery"], state=cb)
                if pb == "low" and cb != "low":
                    self._nc("battery_low", d, "resolved")
                if pb == "critical" and cb != "critical":
                    self._nc("battery_critical", d, "resolved")
                if cb == "low":
                    self._nc("battery_low", d, "active", level=d["battery"])
                if cb == "critical":
                    self._nc("battery_critical", d, "active", level=d["battery"])
            # Firmware
            cu = bool(d["update"] and d["update"]["available"])
            if cu and not prev["update"]:
                latest = d["update"].get("latest") or ""
                self._emit(EVENT_UPDATE_AVAILABLE, "update_available", d, latest=latest)
                self._nc("update_available", d, "active", latest=latest)
            elif prev["update"] and not cu:
                self._nc("update_available", d, "resolved")

        for ieee in sorted(known - set(cur)):
            gone = {"ieee": ieee, "id": None, "name": self._names.get(ieee, ieee)}
            self._emit(EVENT_DEVICE_LEFT, "device_left", gone)
            self._nc("device_left", gone, "active")
            prev = self._prev.get(ieee, {})
            if prev.get("online") is False:
                self._nc("device_offline", gone, "resolved")
            if prev.get("battery_state") in ("low", "critical"):
                self._nc("battery_" + prev["battery_state"], gone, "resolved")
            if prev.get("update"):
                self._nc("update_available", gone, "resolved")

        self._remember(devices, True)

    @callback
    def _emit(self, event: str, log_type: str, d: dict[str, Any], **extra: Any) -> None:
        self._events.appendleft({"t": time.time(), "type": log_type, "name": d["name"]})
        if self._opt(OPT_EVENTS, DEFAULT_EVENTS):
            self.hass.bus.async_fire(
                event,
                {"entry_id": self.entry.entry_id, "name": d["name"], "ieee": d["ieee"], "device_id": d.get("id"), **extra},
            )

    @callback
    def _nc(self, type_: str, d: dict[str, Any], state: str, **placeholders: Any) -> None:
        if not self.nc.type_enabled(type_):
            return
        self._nc_counts[type_] = self._nc_counts.get(type_, 0) + 1
        self.nc.report(
            type_,
            d["ieee"],
            state,
            subject={"id": d["ieee"], "name": d["name"], "kind": "device"},
            placeholders={"name": d["name"], **placeholders},
        )

    def _nc_active_state(self) -> dict[str, list[dict[str, Any]]]:
        out: dict[str, list[dict[str, Any]]] = {
            "device_offline": [],
            "battery_low": [],
            "battery_critical": [],
            "update_available": [],
        }
        for d in self.data.get("devices", []):
            base = {"key": d["ieee"], "subject": {"id": d["ieee"], "name": d["name"], "kind": "device"}}
            ph = {"name": d["name"]}
            if d["online"] is False:
                out["device_offline"].append({**base, "placeholders": ph})
            if d["battery_state"] in ("low", "critical"):
                out["battery_" + d["battery_state"]].append({**base, "placeholders": {**ph, "level": d["battery"]}})
            if d["update"] and d["update"]["available"]:
                out["update_available"].append({**base, "placeholders": {**ph, "latest": d["update"].get("latest") or ""}})
        return out

    # ------------------------------------------------------------------
    # Momentaufnahme für Karte, Sensoren und Diagnose
    # ------------------------------------------------------------------
    def snapshot(self) -> dict[str, Any]:
        d = self.data
        master = self.experimental_master
        return {
            "version": VERSION,
            "entry_id": self.entry.entry_id,
            "connection": d["connection"],
            "stats": d["stats"],
            "devices": d["devices"],
            "groups": d.get("groups"),
            "app": {**self.update_checker.info, "current": VERSION},
            "events": list(self._events),
            "options": {
                "battery_low": int(self._opt(OPT_BATTERY_LOW, DEFAULT_BATTERY_LOW)),
                "battery_critical": int(self._opt(OPT_BATTERY_CRITICAL, DEFAULT_BATTERY_CRITICAL)),
                "offline_delay": int(self._opt(OPT_OFFLINE_DELAY, DEFAULT_OFFLINE_DELAY)),
                "events_enabled": bool(self._opt(OPT_EVENTS, DEFAULT_EVENTS)),
            },
            "experimental": self.experimental_snapshot(),
            "nc": self.nc.snapshot() if master else None,
            "permit_until": self._permit_until,
            "server_time": time.time(),
        }

    def diagnostics(self) -> dict[str, Any]:
        """Anonymisiert: keine Namen, IDs, Adressen oder Pfade."""
        devices = [
            {
                "index": i,
                "manufacturer": d["manufacturer"],
                "model": d["model"],
                "online": d["online"],
                "coordinator": d["coordinator"],
                "battery_state": d["battery_state"],
                "has_update_entity": d["update"] is not None,
                "update_available": bool(d["update"] and d["update"]["available"]),
                "entities": d["entity_count"],
            }
            for i, d in enumerate(self.data["devices"])
        ]
        return {
            "version": VERSION,
            "stats": self.data["stats"],
            "connection": {k: v for k, v in self.data["connection"].items() if k in ("zha_present", "zha_loaded", "radio_type", "gateway")},
            "options": self.snapshot()["options"],
            "experimental": self.experimental_snapshot(),
            "notification_center": {
                "master": self.nc.master_enabled,
                "available": self.nc.available,
                "types": {t: self.nc.type_enabled(t) for t in NC_TYPES},
                "sent": dict(self._nc_counts),
            },
            "app_update": {k: v for k, v in self.update_checker.info.items() if k != "release_url"},
            "devices": devices,
        }

    # ------------------------------------------------------------------
    # Aktionen (Aufruf nur für Administratoren, siehe websocket_api)
    # ------------------------------------------------------------------
    async def async_action(self, action: str, data: dict[str, Any]) -> dict[str, Any] | None:
        if action not in ACTIONS:
            raise HomeAssistantError("unknown_action")
        handler = getattr(self, f"_act_{action}")
        return await handler(data)

    def _require(self, key: str) -> None:
        if not self.feature_enabled(key):
            raise HomeAssistantError("experimental_disabled")

    def _device(self, ieee: Any) -> _Meta:
        meta = self._meta.get(str(ieee or "").lower())
        if meta is None:
            raise HomeAssistantError("unknown_device")
        return meta

    def _set_option(self, **values: Any) -> None:
        self.hass.config_entries.async_update_entry(self.entry, options={**self.entry.options, **values})

    async def _act_refresh(self, _data: dict[str, Any]) -> None:
        self._map_dirty = True
        self._rebuild_map()
        self._evaluate(silent=True)

    async def _act_check_app_update(self, _data: dict[str, Any]) -> None:
        await self._async_check_app_update()

    async def _act_rename(self, data: dict[str, Any]) -> None:
        self._require("device_rename")
        meta = self._device(data.get("device"))
        raw = "".join(ch for ch in str(data.get("value") or "") if ch.isprintable())
        name = " ".join(raw.split())[:80]
        dr.async_get(self.hass).async_update_device(meta.device_id, name_by_user=name or None)

    async def _act_remove(self, data: dict[str, Any]) -> None:
        self._require("device_remove")
        meta = self._device(data.get("device"))
        if meta.coordinator:
            raise HomeAssistantError("coordinator")
        await self.hass.services.async_call(ZHA_DOMAIN, "remove", {"ieee": meta.ieee}, blocking=True)

    async def _act_permit_join(self, data: dict[str, Any]) -> None:
        self._require("permit_join")
        try:
            duration = max(0, min(254, int(data.get("duration", 60))))
        except (TypeError, ValueError) as err:
            raise HomeAssistantError("invalid_value") from err
        await self.hass.services.async_call(ZHA_DOMAIN, "permit", {"duration": duration}, blocking=True)
        self._permit_until = time.time() + duration if duration else None
        self._notify()

    async def _act_install_update(self, data: dict[str, Any]) -> None:
        self._require("firmware_update")
        meta = self._device(data.get("device"))
        if not meta.update:
            raise HomeAssistantError("no_update")
        await self.hass.services.async_call("update", "install", {"entity_id": meta.update}, blocking=False)

    async def _act_check_updates(self, _data: dict[str, Any]) -> None:
        self._require("firmware_update")
        ids = [m.update for m in self._meta.values() if m.update]
        if not ids:
            raise HomeAssistantError("no_update")
        await self.hass.services.async_call("homeassistant", "update_entity", {"entity_id": ids}, blocking=False)

    async def _act_exp_set_feature(self, data: dict[str, Any]) -> None:
        if not self.experimental_master:
            raise HomeAssistantError("experimental_disabled")
        key = data.get("value")
        if key not in LISTED_FEATURE_KEYS:
            raise HomeAssistantError("invalid_value")
        current = [k for k in (self._opt(OPT_EXPERIMENTAL_FEATURES, []) or []) if k in LISTED_FEATURE_KEYS]
        if data.get("flag"):
            if key not in current:
                current.append(key)
        else:
            current = [k for k in current if k != key]
        self._set_option(**{OPT_EXPERIMENTAL_FEATURES: current})

    async def _act_nc_set_master(self, data: dict[str, Any]) -> None:
        if not self.experimental_master:
            raise HomeAssistantError("experimental_disabled")
        self._set_option(**{OPT_NC_ENABLED: bool(data.get("flag"))})

    async def _act_nc_set_type(self, data: dict[str, Any]) -> None:
        if not self.experimental_master:
            raise HomeAssistantError("experimental_disabled")
        type_ = data.get("value")
        if type_ not in NC_TYPES:
            raise HomeAssistantError("invalid_value")
        chosen = dict(self._opt(OPT_NC_TYPES, {}) or {})
        chosen[type_] = bool(data.get("flag"))
        self._set_option(**{OPT_NC_TYPES: chosen})

    # ------------------------------------------------------------------
    # Details für das Popup (nur Administratoren)
    # ------------------------------------------------------------------
    def async_details(self, ieee: Any) -> dict[str, Any]:
        meta = self._device(ieee)
        ent_reg = er.async_get(self.hass)
        entities = []
        for ent in er.async_entries_for_device(ent_reg, meta.device_id, include_disabled_entities=True):
            state = self.hass.states.get(ent.entity_id)
            entities.append(
                {
                    "entity_id": ent.entity_id,
                    "name": ent.name or ent.original_name,
                    "state": state.state[:40] if state else None,
                    "disabled": bool(ent.disabled_by),
                }
            )
        return {"entities": entities[:100]}


def async_get_manager(hass: HomeAssistant, entry_id: str | None = None) -> ZhaManager:
    """Manager eines geladenen Eintrags holen."""
    entries = [e for e in hass.config_entries.async_entries(DOMAIN) if e.state is ConfigEntryState.LOADED]
    if entry_id:
        entries = [e for e in entries if e.entry_id == entry_id]
    if not entries:
        raise HomeAssistantError("not_loaded")
    return entries[0].runtime_data
