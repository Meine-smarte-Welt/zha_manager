🇩🇪 Deutsch · [🇬🇧 English](README.en.md) · [🇳🇱 Nederlands](README.nl.md) · [🇫🇷 Français](README.fr.md) · [🇪🇸 Español](README.es.md)

# ZHA Manager

Verwaltung der Zigbee-Geräte von ZHA in Home Assistant – als Integration mit eigener Lovelace-Karte. Gleicher Aufbau wie der Matter Manager und der Zigbee2MQTT Manager.

Experimentelle Funktionen: [EXPERIMENTELL.md](EXPERIMENTELL.md)

## Status dieser Version

**Version 0.0.1 ist die erste Version und noch nicht an echter Zigbee-Hardware oder einer echten ZHA-Installation geprüft.** Getestet wurde gegen Home Assistant 2026.2.3 mit einem simulierten ZHA-Eintrag (25 automatische Tests) und die Karte mit Testdaten in einer simulierten Browserumgebung. Details unter „Bekannte Einschränkungen“ und in [EXPERIMENTELL.md](EXPERIMENTELL.md).

## Funktionsumfang

Grundfunktionen (nur lesend, immer sichtbar):

- **Geräte:** Liste aller ZHA-Geräte mit Status (online/offline), Hersteller, Modell, Bereich, Firmware und Batterie; Suche, Filter, Sortierung; Detail-Popup mit Akkordeon-Abschnitten.
- **Batterie:** Übersicht der batteriebetriebenen Geräte mit zwei einstellbaren Schwellen („niedrig“ und „kritisch“).
- **Updates:** Anzeige vorhandener Firmware-Updates (aus den `update`-Entitäten von ZHA).
- **Einstellungen (Zahnrad):** App-Version mit Update-Hinweis, Verbindungsstatus, Optionen, Ereignisprotokoll seit Start.
- **Sensoren und Ereignisse** für Automationen (siehe unten).

Experimentelle Funktionen (ungeprüft, standardmäßig **ausgeblendet**, siehe Abschnitt „Experimentelle Funktionen“): Gerät umbenennen, Gerät entfernen, Geräte anlernen (Permit Join), Firmware-Update starten bzw. Updates neu prüfen, Gateway-Details (LQI, RSSI, zuletzt gesehen, Gerätetyp, Stromquelle), Gruppen-Ansicht, Anbindung an das Notification Center.

## Voraussetzungen

- Home Assistant ab 2025.6 (Python 3.13).
- Die Integration **ZHA** ist eingerichtet. Ohne ZHA bricht die Einrichtung ab.
- Für die automatische Eintragung der Karte: Lovelace im Speichermodus (Standard). Im YAML-Modus trägst Du die Ressource von Hand ein.

## Installation

1. **HACS:** HACS → Integrationen → ⋮ → Benutzerdefinierte Repositories → `https://github.com/meine-smarte-welt/zha_manager` als Typ „Integration“ hinzufügen → „ZHA Manager“ herunterladen → Home Assistant neu starten.
2. **Manuell:** Den Ordner `custom_components/zha_manager` in Dein `config/custom_components/` kopieren und Home Assistant neu starten.

## Einrichtung

1. Einstellungen → Geräte & Dienste → Integration hinzufügen → **ZHA Manager**.
2. Falls mehrere ZHA-Einträge existieren, wählst Du den gewünschten aus. Später änderbar über „Neu konfigurieren“.
3. Die Karte wird beim Start automatisch als Lovelace-Ressource eingetragen. Danach den Browser neu laden (Strg+F5).

## Die Karte

Karte hinzufügen → „ZHA Manager“, oder per YAML (siehe auch `examples/card.yaml`):

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

Kategorien (je einzeln ein-/ausschaltbar über `show_<kategorie>`): `devices`, `battery`, `updates`, `groups` (nur mit der experimentellen Funktion „Gruppen-Ansicht“), `bridge` (Zahnrad). Weitere Schlüssel: `title`, `show_title`, `default_tab`, `max_rows`, `zoom`, `show_stats`, `show_search`, `show_filter_bar`, `default_sort`, `show_col_battery`, `show_col_signal`, `show_col_firmware`, `show_col_area`, `read_only`, `show_experimental`, `color_*`. Alle Einstellungen gibt es auch im grafischen Editor.

`read_only: true` blendet alle Bedienelemente zum Ändern aus. Schreibende Aktionen sind ohnehin nur für Administratoren möglich.

## Farben

Leer = Theme-Standard. Erlaubt sind Hex, `rgb()`, `hsl()` und `var(--…)`; Ungültiges wird verworfen.

| Schlüssel | Bedeutung |
|---|---|
| `color_tab_active` | Aktiver Tab |
| `color_success` | Online, Signal gut, Batterie voll |
| `color_warning` | Batterie niedrig, Signal mittel, App-Update |
| `color_error` | Offline, Batterie kritisch, Signal schwach, Fehler |
| `color_info` | Firmware-Update verfügbar |
| `color_row_icon` | Zeilensymbole (überschreibt alle `color_icon_*`) |
| `color_live_banner` | Banner für laufende Aufträge |
| `color_icon_<kategorie>` | Symbolfarbe je Kategorie |

## Services

| Service | Wirkung |
|---|---|
| `zha_manager.refresh` | Daten neu einlesen. |
| `zha_manager.check_firmware_updates` | Firmware-Updates neu prüfen lassen (**experimentell**; ohne eingeschaltete Funktion Fehlermeldung). |

Beide Services haben das optionale Feld `entry_id`.

## Ereignisse

Ereignisse werden auf dem Home-Assistant-Ereignisbus gesendet (abschaltbar in den Optionen). Beim Start und nach dem Laden von ZHA wird nur der Ausgangszustand gelesen, es gibt keine Ereignisflut.

| Ereignis | Wann |
|---|---|
| `zha_manager_device_offline` | Gerät nicht mehr erreichbar (nach der eingestellten Verzögerung). |
| `zha_manager_device_online` | Gerät wieder erreichbar. |
| `zha_manager_battery_low` | Batterie unter einer Schwelle; `state` ist `low` oder `critical`. |
| `zha_manager_update_available` | Neues Firmware-Update für ein Gerät. |
| `zha_manager_device_joined` | Neues Gerät in ZHA. |
| `zha_manager_device_left` | Gerät aus ZHA entfernt. |

Beispiele für Automationen: `examples/automations.yaml`.

## Sensoren

Fünf Übersichts-Sensoren (Details als Attribut): Geräte, Offline, Batterie niedrig, Batterie kritisch, Firmware-Updates.

## Versionsanzeige und Update-Hinweis

- Die Version steht an drei Stellen: Karte → Zahnrad → „App-Version“, oben im Karten-Editor und im Optionen-Dialog.
- Die Integration fragt beim Start und danach alle 12 Stunden bei GitHub nach der neuesten Version. Eine neue Version wird orange hervorgehoben („↑“ am Zahnrad).
- Aktualisiere über HACS, starte Home Assistant neu und lade danach den Browser neu (Strg+F5).
- Ist GitHub nicht erreichbar, steht dort „Prüfung nicht möglich“; die Karte läuft normal weiter. Solange es noch kein Release gibt, bleibt die Anzeige leer („–“).

## Einstellungen

Einstellungen → Geräte & Dienste → ZHA Manager → Konfigurieren:

| Option | Standard | Bedeutung |
|---|---|---|
| Schwelle „Batterie niedrig“ | 20 % | Ab hier gilt die Batterie als niedrig (orange). |
| Schwelle „Batterie kritisch“ | 10 % | Muss kleiner oder gleich „niedrig“ sein (rot). |
| Verzögerung bis „offline“ | 0 s | 0 = sofort, sobald das Gerät als nicht erreichbar gemeldet wird. |
| Ereignisse senden | an | Schaltet die Ereignisse oben ein/aus. |
| Experimentelle Funktionen anzeigen | aus | Hauptschalter, siehe nächster Abschnitt. |

## Experimentelle Funktionen

- Alles, was nicht an echter Hardware bestätigt ist, gilt als **experimentell** und ist standardmäßig ausgeblendet und im Backend still (keine Aktionen, Ereignisse oder Meldungen).
- Einschalten: Optionen → „Experimentelle Funktionen anzeigen“ → im zweiten Schritt einzelne Funktionen wählen (jede ist standardmäßig aus). In der Karte zusätzlich im Editor → „Experimentell“ → `show_experimental`.
- Welche Funktionen das sind und was jeweils zu prüfen ist, steht in [EXPERIMENTELL.md](EXPERIMENTELL.md).

### Notification Center

Die Anbindung an das Notification Center (Schnittstelle Schema 1: Meldungsarten Batterie kritisch, Gerät offline, Batterie niedrig, Update verfügbar, Gerät hinzugefügt, Gerät entfernt) ist **experimentell** und nicht gegen ein echtes Notification Center getestet. Sie sendet nur, wenn der Hauptschalter **und** der eigene Schalter „Notification Center“ an sind (Standard: aus).

## Sicherheit

- Schreibende Aktionen (Umbenennen, Entfernen, Anlernen, Updates installieren) sind nur für Administratoren möglich und nur mit eingeschalteter experimenteller Funktion.
- Riskante Aktionen verlangen zwei Klicks in der Karte (keine Browser-Dialoge).
- Eingaben werden im Backend geprüft (Länge, Typ, bekannte Geräte). Der Koordinator kann nicht entfernt werden.
- Alle Texte in der Karte werden maskiert, Farbwerte laufen über eine Allowlist.
- Der Diagnose-Download enthält keine Namen, Adressen, IDs oder Zugangsdaten. Release-Links werden nur angezeigt, wenn sie mit `https://github.com/` beginnen.

## Bekannte Einschränkungen

- **Nicht an echter Hardware geprüft.** Weder die Grundfunktionen noch die experimentellen Funktionen wurden mit einem echten Zigbee-Stick, echten Geräten oder im echten Home-Assistant-Frontend ausprobiert.
- Der Online-Status stammt aus den Zuständen der Geräte-Entitäten in Home Assistant („nicht verfügbar“). Genauere Angaben des Gateways gibt es nur mit der experimentellen Funktion „Gateway-Details“.
- „Gateway-Details“ und „Gruppen-Ansicht“ nutzen die interne ZHA-Schnittstelle. Sie ist nicht dauerhaft stabil; bei Änderungen in ZHA können diese Funktionen ausfallen, der Rest läuft weiter.
- Die Farbgrenzen für LQI/RSSI sind Richtwerte, keine Herstellerangaben.
- Die Übersetzungen (nl, fr, es) sind maschinell erstellt und nicht von Muttersprachlern geprüft. Korrekturen sind willkommen.
- Es gibt noch keine Screenshots und noch kein GitHub-Release.

## Fehlerbehebung

- **Karte erscheint nicht:** Browser neu laden (Strg+F5). Im YAML-Modus die Ressource `/zha_manager_files/zha-manager-card.js?v=0.0.1` (Typ „module“) selbst eintragen.
- **„ZHA nicht eingerichtet“ bei der Einrichtung:** Zuerst die Integration ZHA einrichten.
- **Alle Geräte ohne Status:** ZHA ist nicht geladen; der Status ist dann unbekannt, nicht „offline“.
- **Fehler melden:** Diagnose-Download der Integration anhängen (anonymisiert) und ein Issue auf GitHub öffnen.

## Versionshistorie

- **0.0.1** (2026-11-08): Erste Version. Geräteliste, Batterie, Updates-Anzeige, Einstellungen, Sensoren, Ereignisse, fünf Sprachen; experimentelle Funktionen ausgeblendet.

## Datei-Integrität

Jede `.py`-, `.js`- und `.yaml`-Datei trägt in der ersten Zeile einen SHA-256-Hash des Inhalts ab Zeile 2. Prüfen: `tail -n +2 datei.py | sha256sum`. Bilddateien sind ausgenommen. Hashes der JSON-Dateien (über die gesamte Datei):

| Datei | SHA-256 |
|---|---|
| `hacs.json` | `97ec25f3c2e05d68414e11002356c19b8053115057f606f1b8005b593b184710` |
| `custom_components/zha_manager/icons.json` | `3bc4690f3ba400117b2d6e5c33a5dd25eb7f926657fa9b44bc94afcacb2e2b9a` |
| `custom_components/zha_manager/manifest.json` | `0cf2e740b2ad900f65bf7c2620cf16c3d722fe281e1ec23555bd414af1371419` |
| `custom_components/zha_manager/strings.json` | `22506c7196e87b6c4e7ca47e33b84b5bf3fedcabdf77490dc98cf258f33eb5ca` |
| `custom_components/zha_manager/translations/de.json` | `22506c7196e87b6c4e7ca47e33b84b5bf3fedcabdf77490dc98cf258f33eb5ca` |
| `custom_components/zha_manager/translations/en.json` | `6a6aa95e9903be2474765a862c7042c64f869f567e33fcf46ef0d78f7807c654` |
| `custom_components/zha_manager/translations/es.json` | `c4191e0cdce8220b952940931c711275c4273221a2c953103cc5d7ddc4cd2158` |
| `custom_components/zha_manager/translations/fr.json` | `cfaec4a9f870ed1abc9cf5f96bb8447db292e5b82e69979f3862ba5144479da2` |
| `custom_components/zha_manager/translations/nl.json` | `1490fe6aec1ee1152be902280918fea4c62dc62b3a64d50d58e70ca1136b1b48` |

## Lizenz

MIT, siehe [LICENSE](LICENSE).
