# Experimentelle Funktionen – ZHA Manager

Stand: 2026-11-08 · Version: 0.0.1

Diese Funktionen sind **ungeprüft** und standardmäßig ausgeblendet.
Einschalten: Optionen → „Experimentelle Funktionen anzeigen“, in der Karte Editor → „Experimentell“.

Hinweis zum Stand: Version 0.0.1 ist die erste Version. Es gibt noch keine von Thorsten bestätigte Funktion. Die Grundfunktionen (Geräteliste, Batterie, Updates-Anzeige, Einstellungen, Sensoren, Ereignisse) sind nur lesend und nicht hinter dem Hauptschalter versteckt, **sind aber ebenfalls noch nicht an echter Hardware geprüft** (siehe unten, Abschnitt „Grundfunktionen“).

## Offen (noch zu prüfen)

| Funktion | Schlüssel | Seit | Warum experimentell | Was zu prüfen ist | Status |
|---|---|---|---|---|---|
| Gerät umbenennen | `device_rename` | 0.0.1 | Neu gebaut; nur gegen ein simuliertes Geräteregister getestet. | 1. Hauptschalter und Funktion einschalten. 2. Im Popup eines Geräts den Abschnitt „Umbenennen“ öffnen, neuen Namen speichern. 3. Erwartet: Name erscheint in Karte und in Home Assistant (Geräteregister, `name_by_user`). 4. Leeres Feld speichern: ursprünglicher Name kommt zurück. | offen |
| Gerät entfernen | `device_remove` | 0.0.1 | Neu gebaut; ruft `zha.remove` auf, nur gegen einen simulierten Service getestet. | 1. Funktion einschalten. 2. Ein entbehrliches Gerät im Popup unter „Gerät entfernen“ mit zwei Klicks („Wirklich entfernen? Nochmal tippen“) entfernen. 3. Erwartet: Gerät verschwindet aus ZHA und aus der Karte, Ereignis `zha_manager_device_left` kommt. 4. Der Koordinator lässt sich nicht entfernen (Fehlermeldung). | offen |
| Geräte anlernen (Permit Join) | `permit_join` | 0.0.1 | Neu gebaut; ruft `zha.permit` auf, nur gegen einen simulierten Service getestet. | 1. Funktion einschalten. 2. Im Zahnrad-Tab den Abschnitt „Neue Geräte anlernen“ öffnen und das Pairing starten. 3. Ein Gerät in den Anlernmodus versetzen. 4. Erwartet: Gerät wird gefunden und erscheint in der Liste, Ereignis `zha_manager_device_joined`; die Restzeit läuft ab und endet. | offen |
| Firmware-Update starten, Updates neu prüfen | `firmware_update` | 0.0.1 | Neu gebaut; ruft `update.install` und `homeassistant.update_entity` auf, nur simuliert getestet. | 1. Funktion einschalten. 2. Im Zahnrad-Tab unter Wartung „Firmware-Updates suchen“ drücken (oder den Dienst `zha_manager.check_firmware_updates` aufrufen). 3. Bei einem Gerät mit verfügbarem Update im Popup „Update installieren“ (zwei Klicks). 4. Erwartet: Update läuft, Fortschritt in Home Assistant sichtbar, danach neue Firmware-Version in der Karte. Nur an einem unkritischen Gerät ausprobieren. | offen |
| Gateway-Details | `gateway_details` | 0.0.1 | Nutzt die interne ZHA-Schnittstelle (`get_zha_gateway`), die sich ändern kann; nur gegen ein Attrappen-Objekt getestet. | 1. Funktion einschalten. 2. Karte öffnen: im Geräte-Popup Verbindungsqualität (LQI), Signalstärke (RSSI), „Zuletzt gesehen“, Gerätetyp, Stromversorgung und im Zahnrad-Tab Funkkanal und Funkmodul prüfen. 3. Erwartet: Werte passen zu ZHA (Einstellungen → ZHA → Gerät → Zigbee-Informationen). 4. Ein Gerät stromlos machen: Status wechselt auf offline. 5. Fehlen Daten, darf nichts abstürzen. | offen |
| Gruppen-Ansicht | `groups_view` | 0.0.1 | Nutzt die interne ZHA-Schnittstelle; nur gegen ein Attrappen-Objekt getestet. | 1. Funktion einschalten, in der Karte `show_groups` aktiv lassen. 2. Tab „Gruppen“ öffnen. 3. Erwartet: Alle ZHA-Gruppen mit Namen und Mitgliedern (Gerät, Endpunkt) wie in ZHA → Gruppen. | offen |
| Notification Center | `notification_center` | 0.0.1 | Anbindung nach Schnittstelle 06 (Schema 1); nicht gegen ein echtes Notification Center getestet. Hat zusätzlich einen eigenen Schalter (`nc_enabled`, Standard aus). | 1. Hauptschalter und „Notification Center“ einschalten, gewünschte Meldungsarten wählen. 2. Mit installiertem Notification Center prüfen, ob die Integration sich registriert und die sechs Meldungsarten erscheinen. 3. Batterie-Schwelle unterschreiten oder ein Gerät offline nehmen: Meldung erscheint. 4. Gerät wieder online/Batterie tauschen: Meldung verschwindet. 5. Neustart von Home Assistant: aktive Meldungen werden abgeglichen, keine Doppelten. | offen |

## Grundfunktionen (nicht experimentell eingestuft, aber ungeprüft)

Diese Funktionen sind nur lesend und deshalb sichtbar, damit die Integration nicht leer ist. Sie sind **nicht** von Thorsten bestätigt, also nicht „geprüft“. Bitte beim ersten Test mit echtem ZHA prüfen:

- Geräteliste vollständig, Namen, Hersteller, Modell, Bereich und Firmware stimmen mit Home Assistant überein.
- Batterie: Wert und Schwellen („niedrig“/„kritisch“) stimmen; Ereignis `zha_manager_battery_low` kommt einmal pro Zustandswechsel.
- Offline/Online: Gerät abstecken → Status offline (nach eingestellter Verzögerung), Ereignis `zha_manager_device_offline`; Wiederkehr → `zha_manager_device_online`.
- Updates-Anzeige: Gerät mit offener Firmware zeigt „Update verfügbar“.
- Version und Update-Hinweis in Karte, Editor und Optionen (erst sinnvoll, sobald ein Release auf GitHub existiert).

Offene Frage an Thorsten: Sollen diese Grundfunktionen ebenfalls hinter den Experimentell-Hauptschalter, bis sie geprüft sind? (Dann wäre die Integration nach der Installation zunächst leer.)

## Geprüft (Historie)

| Funktion | Geprüft am | In Version | Bestätigt von |
|---|---|---|---|
| – | – | – | – |
