[🇩🇪 Deutsch](README.md) · [🇬🇧 English](README.en.md) · 🇳🇱 Nederlands · [🇫🇷 Français](README.fr.md) · [🇪🇸 Español](README.es.md)

# ZHA Manager

Beheer de Zigbee-apparaten van ZHA in Home Assistant – een integratie met een eigen Lovelace-kaart. Zelfde opzet als Matter Manager en Zigbee2MQTT Manager.

Experimentele functies: [EXPERIMENTELL.md](EXPERIMENTELL.md) (Duits)

## Status van deze versie

**Versie 0.0.1 is de eerste versie en is nog niet getest met echte Zigbee-hardware of een echte ZHA-installatie.** Getest is met Home Assistant 2026.2.3 en een gesimuleerde ZHA-vermelding (25 automatische tests), en de kaart met testgegevens in een gesimuleerde browseromgeving. Zie “Bekende beperkingen” en [EXPERIMENTELL.md](EXPERIMENTELL.md) (Duits).

## Functies

Basisfuncties (alleen lezen, altijd zichtbaar):

- **Apparaten:** lijst van alle ZHA-apparaten met status (online/offline), fabrikant, model, ruimte, firmware en batterij; zoeken, filteren, sorteren; detailpopup met accordeon-secties.
- **Batterij:** overzicht van apparaten op batterijen met twee instelbare drempels (“laag” en “kritiek”).
- **Updates:** toont beschikbare firmware-updates (uit de `update`-entiteiten van ZHA).
- **Instellingen (tandwiel):** app-versie met updatemelding, verbindingsstatus, opties, gebeurtenislogboek sinds de start.
- **Sensoren en gebeurtenissen** voor automatiseringen (zie hieronder).

Experimentele functies (niet getest, standaard **verborgen**, zie “Experimentele functies”): apparaat hernoemen, apparaat verwijderen, koppelen toestaan (permit join), firmware-update starten / updates opnieuw controleren, gateway-details (LQI, RSSI, laatst gezien, apparaattype, voedingsbron), groepenweergave, koppeling met het Notification Center.

## Vereisten

- Home Assistant 2025.6 of nieuwer (Python 3.13).
- De integratie **ZHA** is ingesteld. Zonder ZHA wordt de installatie afgebroken.
- Voor automatische registratie van de kaart: Lovelace in opslagmodus (standaard). In YAML-modus voeg je de bron handmatig toe.

## Installatie

1. **HACS:** HACS → Integraties → ⋮ → Aangepaste repositories → voeg `https://github.com/meine-smarte-welt/zha_manager` toe als type “Integratie” → “ZHA Manager” downloaden → Home Assistant herstarten.
2. **Handmatig:** kopieer de map `custom_components/zha_manager` naar je `config/custom_components/` en herstart Home Assistant.

## Instellen

1. Instellingen → Apparaten & diensten → Integratie toevoegen → **ZHA Manager**.
2. Bestaan er meerdere ZHA-vermeldingen, kies dan de gewenste. Later te wijzigen via “Opnieuw configureren”.
3. De kaart wordt bij het starten automatisch als Lovelace-bron geregistreerd. Laad daarna de browser opnieuw (Ctrl+F5).

## De kaart

Kaart toevoegen → “ZHA Manager”, of via YAML (zie ook `examples/card.yaml`):

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

Categorieën (elk apart aan/uit met `show_<categorie>`): `devices`, `battery`, `updates`, `groups` (alleen met de experimentele functie “Groepenweergave”), `bridge` (tandwiel). Overige sleutels: `title`, `show_title`, `default_tab`, `max_rows`, `zoom`, `show_stats`, `show_search`, `show_filter_bar`, `default_sort`, `show_col_battery`, `show_col_signal`, `show_col_firmware`, `show_col_area`, `read_only`, `show_experimental`, `color_*`. Alles is ook in de grafische editor beschikbaar.

`read_only: true` verbergt alle bedieningselementen die iets wijzigen. Schrijfacties zijn sowieso alleen voor beheerders.

## Kleuren

Leeg = themastandaard. Toegestaan: hex, `rgb()`, `hsl()` en `var(--…)`; ongeldige waarden worden genegeerd.

| Sleutel | Betekenis |
|---|---|
| `color_tab_active` | Actief tabblad |
| `color_success` | Online, goed signaal, volle batterij |
| `color_warning` | Batterij laag, matig signaal, app-update |
| `color_error` | Offline, batterij kritiek, zwak signaal, fout |
| `color_info` | Firmware-update beschikbaar |
| `color_row_icon` | Rijpictogrammen (overschrijft alle `color_icon_*`) |
| `color_live_banner` | Banner voor lopende taken |
| `color_icon_<categorie>` | Pictogramkleur per categorie |

## Services

| Service | Werking |
|---|---|
| `zha_manager.refresh` | Gegevens opnieuw inlezen. |
| `zha_manager.check_firmware_updates` | Firmware-updates opnieuw controleren (**experimenteel**; geeft een fout zolang de functie uit staat). |

Beide services hebben het optionele veld `entry_id`.

## Gebeurtenissen

Gebeurtenissen worden op de Home Assistant-gebeurtenisbus verzonden (uit te zetten in de opties). Bij het starten en nadat ZHA geladen is, wordt alleen de beginstatus gelezen – geen vloed aan gebeurtenissen.

| Gebeurtenis | Wanneer |
|---|---|
| `zha_manager_device_offline` | Apparaat niet meer bereikbaar (na de ingestelde vertraging). |
| `zha_manager_device_online` | Apparaat weer bereikbaar. |
| `zha_manager_battery_low` | Batterij onder een drempel; `state` is `low` of `critical`. |
| `zha_manager_update_available` | Nieuwe firmware-update voor een apparaat. |
| `zha_manager_device_joined` | Nieuw apparaat in ZHA. |
| `zha_manager_device_left` | Apparaat uit ZHA verwijderd. |

Voorbeelden voor automatiseringen: `examples/automations.yaml`.

## Sensoren

Vijf overzichtssensoren (details als attribuut): apparaten, offline, batterij laag, batterij kritiek, firmware-updates.

## Versieweergave en updatemelding

- De versie staat op drie plekken: kaart → tandwiel → “App-versie”, bovenaan de kaarteditor en in het optiesvenster.
- De integratie vraagt bij het starten en daarna elke 12 uur bij GitHub naar de nieuwste versie. Een nieuwe versie wordt oranje gemarkeerd (“↑” bij het tandwiel).
- Werk bij via HACS, herstart Home Assistant en laad daarna de browser opnieuw (Ctrl+F5).
- Is GitHub onbereikbaar, dan staat er “Controle niet mogelijk”; de kaart blijft gewoon werken. Zolang er geen release is, blijft de weergave leeg (“–”).

## Instellingen

Instellingen → Apparaten & diensten → ZHA Manager → Configureren:

| Optie | Standaard | Betekenis |
|---|---|---|
| Drempel “batterij laag” | 20 % | Vanaf hier geldt de batterij als laag (oranje). |
| Drempel “batterij kritiek” | 10 % | Moet kleiner of gelijk zijn aan “laag” (rood). |
| Vertraging tot “offline” | 0 s | 0 = direct zodra het apparaat als onbereikbaar wordt gemeld. |
| Gebeurtenissen verzenden | aan | Zet bovenstaande gebeurtenissen aan/uit. |
| Experimentele functies tonen | uit | Hoofdschakelaar, zie volgende sectie. |

## Experimentele functies

- Alles wat niet op echte hardware is bevestigd, geldt als **experimenteel**: standaard verborgen en stil in de backend (geen acties, gebeurtenissen of meldingen).
- Inschakelen: Opties → “Experimentele functies tonen” → kies in de tweede stap afzonderlijke functies (elk standaard uit). In de kaart ook: editor → “Experimenteel” → `show_experimental`.
- Welke functies dit zijn en wat getest moet worden, staat in [EXPERIMENTELL.md](EXPERIMENTELL.md) (Duits).

### Notification Center

De koppeling met het Notification Center (interface schema 1: batterij kritiek, apparaat offline, batterij laag, update beschikbaar, apparaat toegevoegd, apparaat verwijderd) is **experimenteel** en niet getest met een echt Notification Center. Ze verzendt alleen als de hoofdschakelaar **en** de eigen schakelaar “Notification Center” aan staan (standaard: uit).

## Beveiliging

- Schrijfacties (hernoemen, verwijderen, koppelen, updates installeren) zijn alleen voor beheerders en werken alleen met de experimentele functie ingeschakeld.
- Risicovolle acties vragen twee klikken in de kaart (geen browserdialogen).
- Invoer wordt in de backend gecontroleerd (lengte, type, bekende apparaten). De coördinator kan niet worden verwijderd.
- Alle teksten in de kaart worden geëscaped; kleurwaarden gaan via een toegestane lijst.
- De diagnose-download bevat geen namen, adressen, id’s of inloggegevens. Release-links worden alleen getoond als ze met `https://github.com/` beginnen.

## Bekende beperkingen

- **Niet op echte hardware getest.** Noch de basisfuncties noch de experimentele functies zijn uitgeprobeerd met een echte Zigbee-stick, echte apparaten of de echte Home Assistant-frontend.
- De onlinestatus komt uit de status van de apparaatentiteiten in Home Assistant (“niet beschikbaar”). Nauwkeurigere gatewaygegevens zijn er alleen met de experimentele functie “Gateway-details”.
- “Gateway-details” en “Groepenweergave” gebruiken de interne ZHA-interface. Die is niet gegarandeerd stabiel; bij wijzigingen in ZHA kunnen deze functies uitvallen terwijl de rest blijft werken.
- De kleurgrenzen voor LQI/RSSI zijn vuistregels, geen fabrikantwaarden.
- De vertalingen (nl, fr, es) zijn machinaal gemaakt en niet door moedertaalsprekers gecontroleerd. Correcties zijn welkom.
- Er zijn nog geen schermafbeeldingen en nog geen GitHub-release.

## Problemen oplossen

- **Kaart verschijnt niet:** laad de browser opnieuw (Ctrl+F5). Voeg in YAML-modus zelf de bron `/zha_manager_files/zha-manager-card.js?v=0.0.1` (type “module”) toe.
- **“ZHA niet ingesteld” bij het instellen:** stel eerst de ZHA-integratie in.
- **Alle apparaten zonder status:** ZHA is niet geladen; de status is dan onbekend, niet “offline”.
- **Fout melden:** voeg de (geanonimiseerde) diagnose-download van de integratie toe en open een issue op GitHub.

## Versiegeschiedenis

- **0.0.1** (2026-11-08): Eerste versie. Apparatenlijst, batterij, updateweergave, instellingen, sensoren, gebeurtenissen, vijf talen; experimentele functies verborgen.

## Bestandsintegriteit

Elk `.py`-, `.js`- en `.yaml`-bestand bevat op de eerste regel een SHA-256-hash van de inhoud vanaf regel 2. Controleren: `tail -n +2 bestand.py | sha256sum`. Afbeeldingen zijn uitgezonderd.

De hashtabel van de JSON-bestanden staat in de Duitse [README.md](README.md#datei-integrität).

## Licentie

MIT, zie [LICENSE](LICENSE).
