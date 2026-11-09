# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 21032e4898f5820affca1d478f15db7d02defacb6fab3af94b15f12d0f22df87
"""Einrichtung, Optionen und Neu-Konfigurieren des ZHA Managers."""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import (
    CONF_ZHA_ENTRY_ID,
    DEFAULT_BATTERY_CRITICAL,
    DEFAULT_BATTERY_LOW,
    DEFAULT_EVENTS,
    DEFAULT_EXPERIMENTAL,
    DEFAULT_OFFLINE_DELAY,
    DOMAIN,
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
    VERSION,
    ZHA_DOMAIN,
)
from .nc_catalog import NC_CATALOG, NC_TYPES


def _entry_selector(entries: list[ConfigEntry]) -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[{"value": e.entry_id, "label": e.title} for e in entries],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


class ZhaManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Einrichtung: ZHA muss eingerichtet sein."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        zha_entries = self.hass.config_entries.async_entries(ZHA_DOMAIN)
        if not zha_entries:
            return self.async_abort(reason="no_zha")

        if user_input is not None:
            chosen = (user_input or {}).get(CONF_ZHA_ENTRY_ID) or zha_entries[0].entry_id
            await self.async_set_unique_id(chosen)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title=NAME, data={CONF_ZHA_ENTRY_ID: chosen})

        if len(zha_entries) == 1:
            schema = vol.Schema({})
        else:
            schema = vol.Schema({vol.Required(CONF_ZHA_ENTRY_ID): _entry_selector(zha_entries)})
        return self.async_show_form(step_id="user", data_schema=schema)

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        zha_entries = self.hass.config_entries.async_entries(ZHA_DOMAIN)
        if not zha_entries:
            return self.async_abort(reason="no_zha")
        if user_input is not None:
            chosen = user_input[CONF_ZHA_ENTRY_ID]
            return self.async_update_reload_and_abort(
                entry, unique_id=chosen, data_updates={CONF_ZHA_ENTRY_ID: chosen}
            )
        current = entry.data.get(CONF_ZHA_ENTRY_ID)
        default = current if any(e.entry_id == current for e in zha_entries) else zha_entries[0].entry_id
        schema = vol.Schema({vol.Required(CONF_ZHA_ENTRY_ID, default=default): _entry_selector(zha_entries)})
        return self.async_show_form(step_id="reconfigure", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return ZhaManagerOptionsFlow()


def _number(minimum: int, maximum: int, unit: str | None = None) -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=minimum, max=maximum, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement=unit
        )
    )


class ZhaManagerOptionsFlow(OptionsFlow):
    """Optionen: Schwellen, Ereignisse und (nur bei Hauptschalter an) die experimentellen Funktionen."""

    def __init__(self) -> None:
        self._opts: dict[str, Any] = {}

    def _placeholders(self) -> dict[str, str]:
        manager = getattr(self.config_entry, "runtime_data", None)
        return {
            "version": VERSION,
            "update_info": manager.update_checker.short_text() if manager is not None else "–",
        }

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        opts = self.config_entry.options
        errors: dict[str, str] = {}
        if user_input is not None:
            low = int(user_input[OPT_BATTERY_LOW])
            crit = int(user_input[OPT_BATTERY_CRITICAL])
            if crit > low:
                errors["base"] = "critical_above_low"
            else:
                self._opts = {
                    **opts,
                    OPT_BATTERY_LOW: low,
                    OPT_BATTERY_CRITICAL: crit,
                    OPT_OFFLINE_DELAY: int(user_input[OPT_OFFLINE_DELAY]),
                    OPT_EVENTS: bool(user_input[OPT_EVENTS]),
                    OPT_EXPERIMENTAL: bool(user_input[OPT_EXPERIMENTAL]),
                }
                if self._opts[OPT_EXPERIMENTAL]:
                    return await self.async_step_experimental()
                return self.async_create_entry(data=self._opts)

        def pick(key: str, default: Any) -> Any:
            if user_input is not None and key in user_input:
                return user_input[key]
            return opts.get(key, default)

        schema = vol.Schema(
            {
                vol.Required(OPT_BATTERY_LOW, default=pick(OPT_BATTERY_LOW, DEFAULT_BATTERY_LOW)): _number(1, 99, "%"),
                vol.Required(
                    OPT_BATTERY_CRITICAL, default=pick(OPT_BATTERY_CRITICAL, DEFAULT_BATTERY_CRITICAL)
                ): _number(1, 99, "%"),
                vol.Required(OPT_OFFLINE_DELAY, default=pick(OPT_OFFLINE_DELAY, DEFAULT_OFFLINE_DELAY)): _number(
                    0, 3600, "s"
                ),
                vol.Required(OPT_EVENTS, default=pick(OPT_EVENTS, DEFAULT_EVENTS)): BooleanSelector(),
                vol.Required(OPT_EXPERIMENTAL, default=pick(OPT_EXPERIMENTAL, DEFAULT_EXPERIMENTAL)): BooleanSelector(),
            }
        )
        return self.async_show_form(
            step_id="init", data_schema=schema, errors=errors, description_placeholders=self._placeholders()
        )

    async def async_step_experimental(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        opts = self._opts or dict(self.config_entry.options)
        if user_input is not None:
            chosen_types = set(user_input.get(OPT_NC_TYPES, []))
            data = {
                **opts,
                OPT_EXPERIMENTAL_FEATURES: [k for k in user_input.get(OPT_EXPERIMENTAL_FEATURES, []) if k in LISTED_FEATURE_KEYS],
                OPT_NC_ENABLED: bool(user_input.get(OPT_NC_ENABLED, False)),
                OPT_NC_TYPES: {t: t in chosen_types for t in NC_TYPES},
            }
            return self.async_create_entry(data=data)

        stored_types = opts.get(OPT_NC_TYPES, {}) or {}
        default_types = [
            item["type"] for item in NC_CATALOG if stored_types.get(item["type"], item.get("enabled_default", True))
        ]
        schema = vol.Schema(
            {
                vol.Optional(
                    OPT_EXPERIMENTAL_FEATURES,
                    default=[k for k in opts.get(OPT_EXPERIMENTAL_FEATURES, []) if k in LISTED_FEATURE_KEYS],
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=LISTED_FEATURE_KEYS,
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        translation_key="experimental_features",
                    )
                ),
                vol.Required(OPT_NC_ENABLED, default=bool(opts.get(OPT_NC_ENABLED, False))): BooleanSelector(),
                vol.Optional(OPT_NC_TYPES, default=default_types): SelectSelector(
                    SelectSelectorConfig(
                        options=NC_TYPES,
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        translation_key="nc_types",
                    )
                ),
            }
        )
        return self.async_show_form(step_id="experimental", data_schema=schema)
