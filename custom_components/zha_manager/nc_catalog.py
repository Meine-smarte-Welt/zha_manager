# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 029739b09e30399743106607be454f8125b478095a4a63d38083d5f257e65e5e
"""Meldungskatalog für das optionale Notification Center (Schnittstelle Schema 1)."""
from __future__ import annotations

from typing import Any

# Nur Meldungsarten, die der ZHA Manager tatsächlich erzeugt.
NC_CATALOG: list[dict[str, Any]] = [
    {
        "type": "battery_critical",
        "severity": "critical",
        "resolvable": True,
        "enabled_default": True,
        "icon": "mdi:battery-alert",
        "texts": {
            "de": {"label": "Batterie kritisch", "title": "Batterie kritisch: {name}", "message": "{name} hat nur noch {level} % Batterie."},
            "en": {"label": "Battery critical", "title": "Battery critical: {name}", "message": "{name} has only {level} % battery left."},
            "nl": {"label": "Batterij kritiek", "title": "Batterij kritiek: {name}", "message": "{name} heeft nog maar {level} % batterij."},
            "fr": {"label": "Batterie critique", "title": "Batterie critique : {name}", "message": "{name} n'a plus que {level} % de batterie."},
            "es": {"label": "Batería crítica", "title": "Batería crítica: {name}", "message": "{name} solo tiene {level} % de batería."},
        },
    },
    {
        "type": "device_offline",
        "severity": "warning",
        "resolvable": True,
        "enabled_default": True,
        "icon": "mdi:lan-disconnect",
        "texts": {
            "de": {"label": "Gerät offline", "title": "{name} ist offline", "message": "{name} ist nicht erreichbar."},
            "en": {"label": "Device offline", "title": "{name} is offline", "message": "{name} is not reachable."},
            "nl": {"label": "Apparaat offline", "title": "{name} is offline", "message": "{name} is niet bereikbaar."},
            "fr": {"label": "Appareil hors ligne", "title": "{name} est hors ligne", "message": "{name} est injoignable."},
            "es": {"label": "Dispositivo sin conexión", "title": "{name} está sin conexión", "message": "{name} no está accesible."},
        },
    },
    {
        "type": "battery_low",
        "severity": "warning",
        "resolvable": True,
        "enabled_default": True,
        "icon": "mdi:battery-30",
        "texts": {
            "de": {"label": "Batterie niedrig", "title": "Batterie niedrig: {name}", "message": "{name} hat noch {level} % Batterie."},
            "en": {"label": "Battery low", "title": "Battery low: {name}", "message": "{name} has {level} % battery left."},
            "nl": {"label": "Batterij laag", "title": "Batterij laag: {name}", "message": "{name} heeft nog {level} % batterij."},
            "fr": {"label": "Batterie faible", "title": "Batterie faible : {name}", "message": "{name} a encore {level} % de batterie."},
            "es": {"label": "Batería baja", "title": "Batería baja: {name}", "message": "A {name} le queda un {level} % de batería."},
        },
    },
    {
        "type": "update_available",
        "severity": "info",
        "resolvable": True,
        "enabled_default": True,
        "icon": "mdi:update",
        "texts": {
            "de": {"label": "Firmware-Update verfügbar", "title": "Update für {name}", "message": "Für {name} ist Firmware {latest} verfügbar."},
            "en": {"label": "Firmware update available", "title": "Update for {name}", "message": "Firmware {latest} is available for {name}."},
            "nl": {"label": "Firmware-update beschikbaar", "title": "Update voor {name}", "message": "Voor {name} is firmware {latest} beschikbaar."},
            "fr": {"label": "Mise à jour du firmware disponible", "title": "Mise à jour pour {name}", "message": "Le firmware {latest} est disponible pour {name}."},
            "es": {"label": "Actualización de firmware disponible", "title": "Actualización para {name}", "message": "Hay firmware {latest} disponible para {name}."},
        },
    },
    {
        "type": "device_joined",
        "severity": "info",
        "resolvable": False,
        "enabled_default": True,
        "icon": "mdi:plus-network",
        "texts": {
            "de": {"label": "Neues Gerät", "title": "Neues Gerät: {name}", "message": "{name} wurde dem Zigbee-Netz hinzugefügt."},
            "en": {"label": "New device", "title": "New device: {name}", "message": "{name} was added to the Zigbee network."},
            "nl": {"label": "Nieuw apparaat", "title": "Nieuw apparaat: {name}", "message": "{name} is aan het Zigbee-netwerk toegevoegd."},
            "fr": {"label": "Nouvel appareil", "title": "Nouvel appareil : {name}", "message": "{name} a été ajouté au réseau Zigbee."},
            "es": {"label": "Dispositivo nuevo", "title": "Dispositivo nuevo: {name}", "message": "{name} se añadió a la red Zigbee."},
        },
    },
    {
        "type": "device_left",
        "severity": "info",
        "resolvable": False,
        "enabled_default": True,
        "icon": "mdi:minus-network",
        "texts": {
            "de": {"label": "Gerät entfernt", "title": "Gerät entfernt: {name}", "message": "{name} wurde aus dem Zigbee-Netz entfernt."},
            "en": {"label": "Device removed", "title": "Device removed: {name}", "message": "{name} was removed from the Zigbee network."},
            "nl": {"label": "Apparaat verwijderd", "title": "Apparaat verwijderd: {name}", "message": "{name} is uit het Zigbee-netwerk verwijderd."},
            "fr": {"label": "Appareil supprimé", "title": "Appareil supprimé : {name}", "message": "{name} a été retiré du réseau Zigbee."},
            "es": {"label": "Dispositivo eliminado", "title": "Dispositivo eliminado: {name}", "message": "{name} se eliminó de la red Zigbee."},
        },
    },
]

NC_TYPES = [item["type"] for item in NC_CATALOG]
