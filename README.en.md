[🇩🇪 Deutsch](README.md) · 🇬🇧 English · [🇳🇱 Nederlands](README.nl.md) · [🇫🇷 Français](README.fr.md) · [🇪🇸 Español](README.es.md)

# ZHA Manager

Manage the Zigbee devices of ZHA in Home Assistant – an integration with its own Lovelace card. Same structure as Matter Manager and Zigbee2MQTT Manager.

Experimental features: [EXPERIMENTELL.md](EXPERIMENTELL.md) (German)

## Status of this version

**Version 0.0.1 is the first version and has not yet been tested with real Zigbee hardware or a real ZHA installation.** It was tested against Home Assistant 2026.2.3 with a simulated ZHA entry (25 automated tests) and the card with test data in a simulated browser environment. See “Known limitations” and [EXPERIMENTELL.md](EXPERIMENTELL.md) (in German).

## Features

Core features (read-only, always visible):

- **Devices:** list of all ZHA devices with status (online/offline), manufacturer, model, area, firmware and battery; search, filter, sort; detail popup with accordion sections.
- **Battery:** overview of battery-powered devices with two adjustable thresholds (“low” and “critical”).
- **Updates:** shows available firmware updates (from ZHA’s `update` entities).
- **Settings (cog):** app version with update notice, connection status, options, event log since start.
- **Sensors and events** for automations (see below).

Experimental features (untested, **hidden** by default, see “Experimental features”): rename device, remove device, permit join, start firmware update / re-check updates, gateway details (LQI, RSSI, last seen, device type, power source), groups view, Notification Center connection.

## Requirements

- Home Assistant 2025.6 or newer (Python 3.13).
- The **ZHA** integration is set up. Without ZHA, setup aborts.
- For automatic card registration: Lovelace in storage mode (default). In YAML mode, add the resource manually.

## Installation

1. **HACS:** HACS → Integrations → ⋮ → Custom repositories → add `https://github.com/meine-smarte-welt/zha_manager` as type “Integration” → download “ZHA Manager” → restart Home Assistant.
2. **Manual:** copy the folder `custom_components/zha_manager` into your `config/custom_components/` and restart Home Assistant.

## Setup

1. Settings → Devices & services → Add integration → **ZHA Manager**.
2. If several ZHA entries exist, pick the one you want. You can change it later via “Reconfigure”.
3. The card is registered as a Lovelace resource automatically on start. Then reload the browser (Ctrl+F5).

## The card

Add card → “ZHA Manager”, or in YAML (see also `examples/card.yaml`):

```yaml
type: custom:zha-manager-card
title: Zigbee (ZHA)
default_tab: devices
show_devices: true
show_battery: true
show_updates: true
show_bridge: true
max_rows: 30
default_sort: status
show_stats: true
show_search: true
read_only: false
```

Categories (each can be switched on/off with `show_<category>`): `devices`, `battery`, `updates`, `groups` (only with the experimental “Groups view”), `bridge` (cog). Other keys: `title`, `show_title`, `default_tab`, `max_rows`, `zoom`, `show_stats`, `show_search`, `show_filter_bar`, `default_sort`, `show_col_battery`, `show_col_signal`, `show_col_firmware`, `show_col_area`, `read_only`, `show_experimental`, `color_*`. Everything is also available in the visual editor.

`read_only: true` hides all controls that change something. Write actions are limited to administrators anyway.

## Colors

Empty = theme default. Allowed: hex, `rgb()`, `hsl()` and `var(--…)`; invalid values are discarded.

| Key | Meaning |
|---|---|
| `color_tab_active` | Active tab |
| `color_success` | Online, good signal, full battery |
| `color_warning` | Low battery, medium signal, app update |
| `color_error` | Offline, critical battery, weak signal, error |
| `color_info` | Firmware update available |
| `color_row_icon` | Row icons (overrides all `color_icon_*`) |
| `color_live_banner` | Banner for running jobs |
| `color_icon_<category>` | Icon color per category |

## Services

| Service | Effect |
|---|---|
| `zha_manager.refresh` | Re-read data. |
| `zha_manager.check_firmware_updates` | Re-check firmware updates (**experimental**; returns an error unless the feature is on). |

Both services have the optional field `entry_id`.

## Events

Events are fired on the Home Assistant event bus (can be switched off in the options). On start and after ZHA loads, only the initial state is read – no flood of events.

| Event | When |
|---|---|
| `zha_manager_device_offline` | Device no longer reachable (after the configured delay). |
| `zha_manager_device_online` | Device reachable again. |
| `zha_manager_battery_low` | Battery below a threshold; `state` is `low` or `critical`. |
| `zha_manager_update_available` | New firmware update for a device. |
| `zha_manager_device_joined` | New device in ZHA. |
| `zha_manager_device_left` | Device removed from ZHA. |

Automation examples: `examples/automations.yaml`.

## Sensors

Five overview sensors (details as attribute): devices, offline, battery low, battery critical, firmware updates.

## Version display and update notice

- The version is shown in three places: card → cog → “App version”, at the top of the card editor, and in the options dialog.
- The integration asks GitHub for the latest version on start and every 12 hours. A new version is highlighted in orange (“↑” on the cog).
- Update via HACS, restart Home Assistant, then reload the browser (Ctrl+F5).
- If GitHub is unreachable it says “Check not possible”; the card keeps working. As long as there is no release, the display stays empty (“–”).

## Settings

Settings → Devices & services → ZHA Manager → Configure:

| Option | Default | Meaning |
|---|---|---|
| “Battery low” threshold | 20 % | From here on the battery counts as low (orange). |
| “Battery critical” threshold | 10 % | Must be less than or equal to “low” (red). |
| Delay until “offline” | 0 s | 0 = immediately once the device is reported unreachable. |
| Send events | on | Switches the events above on/off. |
| Show experimental features | off | Master switch, see next section. |

## Experimental features

- Anything not confirmed on real hardware counts as **experimental**: hidden by default and silent in the backend (no actions, events or notifications).
- Enable: Options → “Show experimental features” → pick individual features in the second step (each is off by default). In the card also: editor → “Experimental” → `show_experimental`.
- Which features these are and what has to be tested is listed in [EXPERIMENTELL.md](EXPERIMENTELL.md) (German).

### Notification Center

The Notification Center connection (interface schema 1: battery critical, device offline, battery low, update available, device joined, device left) is **experimental** and not tested against a real Notification Center. It only sends when the master switch **and** its own “Notification Center” switch are on (default: off).

## Security

- Write actions (rename, remove, permit join, install updates) are limited to administrators and only work with the experimental feature switched on.
- Risky actions need two clicks in the card (no browser dialogs).
- Input is validated in the backend (length, type, known devices). The coordinator cannot be removed.
- All texts in the card are escaped; color values go through an allowlist.
- The diagnostics download contains no names, addresses, IDs or credentials. Release links are only shown if they start with `https://github.com/`.

## Known limitations

- **Not tested on real hardware.** Neither the core nor the experimental features have been tried with a real Zigbee stick, real devices or the real Home Assistant frontend.
- Online status comes from the state of the device entities in Home Assistant (“unavailable”). More precise gateway data is only available with the experimental “Gateway details”.
- “Gateway details” and “Groups view” use ZHA’s internal interface. It is not guaranteed to be stable; if ZHA changes, these features may stop working while the rest keeps running.
- The color limits for LQI/RSSI are rules of thumb, not manufacturer values.
- The translations (nl, fr, es) are machine-made and not checked by native speakers. Corrections welcome.
- There are no screenshots and no GitHub release yet.

## Troubleshooting

- **Card does not show up:** reload the browser (Ctrl+F5). In YAML mode add the resource `/zha_manager_files/zha-manager-card.js?v=0.0.1` (type “module”) yourself.
- **“ZHA not set up” during setup:** set up the ZHA integration first.
- **All devices without status:** ZHA is not loaded; the status is then unknown, not “offline”.
- **Reporting a bug:** attach the integration’s (anonymized) diagnostics download and open an issue on GitHub.

## Version history

- **0.0.1** (2026-11-08): First version. Device list, battery, updates view, settings, sensors, events, five languages; experimental features hidden.

## File integrity

Every `.py`, `.js` and `.yaml` file carries a SHA-256 hash of its content from line 2 on, in its first line. Check: `tail -n +2 file.py | sha256sum`. Image files are excluded.

The hash table of the JSON files is in the German [README.md](README.md#datei-integrität).

## License

MIT, see [LICENSE](LICENSE).
