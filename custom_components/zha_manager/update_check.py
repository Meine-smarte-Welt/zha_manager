# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 0d523024f47529f4752ed8a3ea8e3855e503436fc90aa1905761cfbe128be65a
"""Prüfung auf neue Versionen auf GitHub (beim Start und danach alle 12 Stunden)."""
from __future__ import annotations

import asyncio
import logging
import re
import time
from typing import Any

from aiohttp import ClientError
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from packaging.version import InvalidVersion, Version

from .const import GITHUB_RELEASES_URL, GITHUB_REPO, VERSION

_LOGGER = logging.getLogger(__name__)

API = f"https://api.github.com/repos/{GITHUB_REPO}"
HEADERS = {"Accept": "application/vnd.github+json", "User-Agent": "ZHA-Manager-HomeAssistant"}
TIMEOUT = 10


def parse_version(text: str | None) -> Version | None:
    """Version aus Tag oder Text lesen ("v1.2.3", "1.0.0b1"); None bei Unlesbarem."""
    if not text:
        return None
    try:
        return Version(str(text).strip().lstrip("vV"))
    except InvalidVersion:
        return None


def safe_release_url(url: Any) -> str:
    """Nur GitHub-Links anzeigen, sonst die feste Releases-Seite."""
    if isinstance(url, str) and url.startswith("https://github.com/"):
        return url
    return GITHUB_RELEASES_URL


def _empty() -> dict[str, Any]:
    return {
        "latest_version": None,
        "release_url": GITHUB_RELEASES_URL,
        "update_available": False,
        "checked_at": None,
        "check_failed": False,
        "no_release": False,
    }


class UpdateChecker:
    """Fragt GitHub nach der neuesten Version."""

    def __init__(self, hass: HomeAssistant, current: str = VERSION) -> None:
        self.hass = hass
        self.current = current
        self.info: dict[str, Any] = _empty()

    async def _get_json(self, url: str) -> Any:
        session = async_get_clientsession(self.hass)
        async with asyncio.timeout(TIMEOUT):
            resp = await session.get(url, headers=HEADERS)
            if resp.status == 404:
                return None
            resp.raise_for_status()
            return await resp.json()

    async def async_check(self) -> dict[str, Any]:
        """Neueste Version holen. Bei Beta/RC zählen auch Pre-releases."""
        info = _empty()
        current = parse_version(self.current)
        include_pre = bool(current and current.is_prerelease)
        candidates: list[tuple[Version, str]] = []
        try:
            latest = await self._get_json(f"{API}/releases/latest")
            if isinstance(latest, dict):
                ver = parse_version(latest.get("tag_name"))
                if ver:
                    candidates.append((ver, safe_release_url(latest.get("html_url"))))
            if include_pre:
                listing = await self._get_json(f"{API}/releases?per_page=5")
                for rel in listing or []:
                    if not isinstance(rel, dict) or rel.get("draft"):
                        continue
                    ver = parse_version(rel.get("tag_name"))
                    if ver:
                        candidates.append((ver, safe_release_url(rel.get("html_url"))))
            if not candidates:
                tags = await self._get_json(f"{API}/tags?per_page=30")
                for tag in tags or []:
                    ver = parse_version(tag.get("name")) if isinstance(tag, dict) else None
                    if ver and (include_pre or not ver.is_prerelease):
                        candidates.append((ver, GITHUB_RELEASES_URL))
        except (ClientError, TimeoutError, ValueError, re.error) as err:
            _LOGGER.debug("Update-Prüfung fehlgeschlagen: %s", type(err).__name__)
            info["check_failed"] = True
            info["checked_at"] = time.time()
            self.info = info
            return info

        info["checked_at"] = time.time()
        if not candidates:
            info["no_release"] = True
        else:
            best_ver, best_url = max(candidates, key=lambda c: c[0])
            info["latest_version"] = str(best_ver)
            info["release_url"] = best_url
            info["update_available"] = bool(current and best_ver > current)
        self.info = info
        return info

    def short_text(self) -> str:
        """Kurztext für den Optionen-Dialog (sprachneutral)."""
        if self.info["check_failed"] or self.info["checked_at"] is None:
            return "–"
        if self.info["update_available"]:
            return f"{self.info['latest_version']} ↑"
        if self.info["no_release"]:
            return "–"
        return "✓"
