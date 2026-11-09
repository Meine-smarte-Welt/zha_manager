# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 6d834a19dd0c9264640ecc54a6e5e57233e2f2390d5dbdf4b107e5057958ae3e
"""Anonymisierter Diagnose-Download."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: Any) -> dict[str, Any]:
    """Keine Namen, IDs, Adressen, Pfade oder Meldungstexte."""
    return entry.runtime_data.diagnostics()
