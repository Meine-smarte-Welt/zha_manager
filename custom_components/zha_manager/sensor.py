# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): cc5c1529c69ccf0bcb89f40951870ff47656b3ea136350d80df91a607605cdd5
"""Übersichts-Sensoren des ZHA Managers."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, NAME, VERSION
from .manager import ZhaManager


@dataclass(frozen=True, kw_only=True)
class ZhaManagerSensorDescription(SensorEntityDescription):
    """Beschreibung eines Übersichts-Sensors."""

    value_fn: Callable[[dict[str, Any]], int]
    names_fn: Callable[[list[dict[str, Any]]], list[str]] | None = None


def _names(pred: Callable[[dict[str, Any]], bool]) -> Callable[[list[dict[str, Any]]], list[str]]:
    return lambda devices: [d["name"] for d in devices if pred(d)][:50]


SENSORS: tuple[ZhaManagerSensorDescription, ...] = (
    ZhaManagerSensorDescription(
        key="devices",
        translation_key="devices",
        icon="mdi:zigbee",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s["total"],
    ),
    ZhaManagerSensorDescription(
        key="offline",
        translation_key="offline",
        icon="mdi:lan-disconnect",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s["offline"],
        names_fn=_names(lambda d: d["online"] is False),
    ),
    ZhaManagerSensorDescription(
        key="battery_low",
        translation_key="battery_low",
        icon="mdi:battery-30",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s["battery_low"] + s["battery_critical"],
        names_fn=_names(lambda d: d["battery_state"] in ("low", "critical")),
    ),
    ZhaManagerSensorDescription(
        key="battery_critical",
        translation_key="battery_critical",
        icon="mdi:battery-alert",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s["battery_critical"],
        names_fn=_names(lambda d: d["battery_state"] == "critical"),
    ),
    ZhaManagerSensorDescription(
        key="updates",
        translation_key="updates",
        icon="mdi:update",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s["updates"],
        names_fn=_names(lambda d: bool(d["update"] and d["update"]["available"])),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: Any, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    manager: ZhaManager = entry.runtime_data
    async_add_entities(ZhaManagerSensor(manager, entry, desc) for desc in SENSORS)


class ZhaManagerSensor(SensorEntity):
    """Zahl der Geräte je Zustand; Namen stehen als Attribut."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    entity_description: ZhaManagerSensorDescription

    def __init__(self, manager: ZhaManager, entry: Any, description: ZhaManagerSensorDescription) -> None:
        self._manager = manager
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=NAME,
            manufacturer="Meine smarte Welt",
            model=NAME,
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def native_value(self) -> int:
        return self.entity_description.value_fn(self._manager.data["stats"])

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.names_fn
        if fn is None:
            return None
        return {"devices": fn(self._manager.data["devices"])}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._manager.async_add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()
