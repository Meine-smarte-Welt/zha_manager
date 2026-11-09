// SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 37e7b1078e428973e45f277e47203d0774d32b62bf52db7ca077e23e09d26e97
/* ZHA Manager – Lovelace-Karte. Anzeige und Verwaltung der Zigbee-Geräte von ZHA. */
const CARD_VERSION = "0.0.1";
const CARD_TAG = "zha-manager-card";
const EDITOR_TAG = "zha-manager-card-editor";
const DOMAIN = "zha_manager";
const RELEASES_URL = "https://github.com/meine-smarte-welt/zha_manager/releases";

const TAB_ORDER = ["devices", "battery", "updates", "groups", "bridge"];
const TAB_META = {
  devices: { icon: "mdi:zigbee", label: "tab_devices" },
  battery: { icon: "mdi:battery-70", label: "tab_battery" },
  updates: { icon: "mdi:update", label: "tab_updates" },
  groups: { icon: "mdi:google-circles-communities", label: "tab_groups" },
  bridge: { icon: "mdi:cog", label: "tab_bridge" },
};
const TAB_FEATURE = { groups: "groups_view" };
const CATEGORY_ICON_COLOR_KEYS = Object.fromEntries(TAB_ORDER.map((k) => [k, `color_icon_${k}`]));

const COLOR_CONFIG_KEYS = {
  tab_active: { cssVar: "--zm-color-tab-active", short: "tab", fallback: "var(--primary-color, #03a9f4)" },
  success: { cssVar: "--zm-color-success", short: "ok", fallback: "var(--success-color, #43a047)" },
  warning: { cssVar: "--zm-color-warning", short: "warn", fallback: "var(--warning-color, #ff9800)" },
  error: { cssVar: "--zm-color-error", short: "err", fallback: "var(--error-color, #db4437)" },
  info: { cssVar: "--zm-color-info", short: "info", fallback: "var(--info-color, #039be5)" },
  row_icon: { cssVar: "--zm-color-row-icon", short: "icon", fallback: "var(--secondary-text-color, #727272)" },
  live_banner: { cssVar: "--zm-color-live-banner", short: "banner", fallback: "var(--state-icon-active-color, #03a9f4)" },
};
const SAFE_COLOR_RE = /^[a-zA-Z0-9#(),.%\-\s]+$/;
function sanitizeColor(v) {
  const t = String(v || "").trim();
  return t && SAFE_COLOR_RE.test(t) ? t : "";
}

// Experimentelle Funktionen: schlüsselgleich zu EXPERIMENTAL_FEATURES in const.py
const EXPERIMENTAL = {
  device_rename: { icon: "mdi:pencil" },
  device_remove: { icon: "mdi:delete-outline" },
  permit_join: { icon: "mdi:plus-network" },
  firmware_update: { icon: "mdi:update" },
  gateway_details: { icon: "mdi:radar" },
  groups_view: { icon: "mdi:google-circles-communities" },
  notification_center: { icon: "mdi:bell-ring-outline", own: true },
};

const DEFAULTS = {
  title: "ZHA Manager",
  show_title: true,
  show_devices: true,
  show_battery: true,
  show_updates: true,
  show_groups: true,
  show_bridge: true,
  default_tab: "devices",
  max_rows: 30,
  zoom: 100,
  show_stats: true,
  show_search: true,
  show_filter_bar: true,
  default_sort: "name",
  show_col_battery: true,
  show_col_signal: true,
  show_col_firmware: true,
  show_col_area: true,
  read_only: false,
  show_experimental: false,
};

const I18N = {
  "de": {
    "tab_devices": "Geräte",
    "tab_battery": "Batterie",
    "tab_updates": "Updates",
    "tab_groups": "Gruppen",
    "tab_bridge": "Einstellungen",
    "stat_total": "Gesamt",
    "stat_offline": "Offline",
    "stat_battery": "Batterie niedrig",
    "stat_updates": "Updates",
    "search_ph": "Suchen …",
    "sort_label": "Sortierung",
    "sort_name": "Name",
    "sort_status": "Status",
    "sort_battery": "Batterie",
    "sort_model": "Modell",
    "more_rows": "Weitere {n} anzeigen",
    "empty_list": "Keine Geräte gefunden.",
    "loading": "Lade Daten …",
    "banner_conn_error": "Verbindung zum ZHA Manager fehlgeschlagen. Neuer Versuch läuft …",
    "banner_zha_missing": "ZHA ist nicht eingerichtet.",
    "banner_zha_not_loaded": "ZHA ist nicht geladen. Der Gerätestatus ist unbekannt.",
    "banner_permit": "Pairing aktiv, noch",
    "banner_cancel": "Abbrechen",
    "banner_update": "Firmware wird installiert: {name}",
    "badge_coordinator": "Koordinator",
    "badge_exp": "Experimentell",
    "offline_since": "offline ({ago})",
    "status_online": "Online",
    "status_offline": "Offline",
    "status_unknown": "Unbekannt",
    "battery_ok": "Batterie in Ordnung",
    "battery_low": "Batterie niedrig",
    "battery_critical": "Batterie kritisch",
    "close": "Schließen",
    "pop_info": "Informationen",
    "pop_rename": "Umbenennen",
    "pop_firmware": "Firmware",
    "pop_diag": "Diagnose",
    "pop_remove": "Entfernen",
    "lbl_ieee": "IEEE-Adresse",
    "lbl_manufacturer": "Hersteller",
    "lbl_model": "Modell",
    "lbl_area": "Bereich",
    "lbl_firmware": "Firmware",
    "lbl_status": "Status",
    "lbl_battery": "Batterie",
    "lbl_lqi": "Verbindungsqualität (LQI)",
    "lbl_rssi": "Signalstärke (RSSI)",
    "lbl_last_seen": "Zuletzt gesehen",
    "lbl_type": "Gerätetyp",
    "lbl_power": "Stromversorgung",
    "lbl_quirk": "Quirk",
    "lbl_entities": "Entitäten",
    "rename_ph": "Neuer Name",
    "rename_hint": "Ein leerer Name setzt den ursprünglichen Namen zurück. Entitäts-IDs ändern sich nicht.",
    "btn_save": "Speichern",
    "fw_installed": "Installiert",
    "fw_latest": "Verfügbar",
    "fw_in_progress": "Installation läuft ({pct} %)",
    "btn_install": "Update installieren",
    "diag_loading": "Lade Entitäten …",
    "diag_error": "Entitäten konnten nicht geladen werden.",
    "diag_none": "Keine Entitäten.",
    "diag_disabled": "deaktiviert",
    "remove_hint": "Entfernt das Gerät aus dem Zigbee-Netz und aus Home Assistant. Zum erneuten Verwenden musst du es neu anlernen.",
    "remove_coord": "Der Koordinator kann hier nicht entfernt werden.",
    "btn_remove": "Gerät entfernen",
    "btn_remove_confirm": "Wirklich entfernen? Nochmal tippen",
    "grp_none": "Keine Gruppen gefunden.",
    "grp_empty": "Keine Mitglieder.",
    "grp_members": "{n} Mitglieder",
    "acc_app": "App-Version",
    "acc_status": "ZHA-Status",
    "acc_pairing": "Neue Geräte anlernen",
    "acc_options": "Optionen",
    "acc_nc": "Notification Center",
    "acc_exp": "Experimentelle Funktionen",
    "acc_maint": "Wartung",
    "acc_events": "Ereignisse",
    "app_integration": "Integration",
    "app_card": "Karte",
    "app_latest": "Neueste Version",
    "app_checked": "Zuletzt geprüft",
    "app_check_now": "Jetzt prüfen",
    "app_release": "Release ansehen",
    "app_update_hint": "Version {v} ist verfügbar. Aktualisiere über HACS und starte Home Assistant neu. Danach Browser neu laden (Strg+F5).",
    "app_mismatch": "Karte und Integration haben unterschiedliche Versionen. Leere den Browser-Cache (Strg+F5).",
    "app_failed": "Prüfung nicht möglich.",
    "app_no_release": "Noch kein Release",
    "unknown": "Unbekannt",
    "never": "nie",
    "yes": "Ja",
    "no": "Nein",
    "on": "An",
    "off": "Aus",
    "st_zha": "ZHA geladen",
    "st_devices": "Geräte",
    "st_radio": "Funkmodul-Typ",
    "st_coord_model": "Koordinator",
    "st_coord_fw": "Koordinator-Firmware",
    "st_channel": "Funkkanal",
    "pair_start": "Pairing starten",
    "pair_hint": "Öffnet das Zigbee-Netz für neue Geräte. Versetze das Gerät danach in den Anlernmodus.",
    "opt_battery_low": "Schwelle „Batterie niedrig“",
    "opt_battery_critical": "Schwelle „Batterie kritisch“",
    "opt_offline_delay": "Verzögerung bis „offline“",
    "opt_events": "Ereignisse senden",
    "opt_hint": "Ändern unter Einstellungen → Geräte & Dienste → ZHA Manager → Konfigurieren.",
    "nc_found": "Notification Center erkannt.",
    "nc_missing": "Notification Center nicht installiert. Meldungen werden gesendet, sobald es installiert ist.",
    "nc_master": "Meldungen an das Notification Center senden",
    "sev_critical": "Kritisch",
    "sev_warning": "Warnung",
    "sev_info": "Info",
    "sev_ok": "In Ordnung",
    "exp_hint": "Diese Funktionen sind ungeprüft. Sie verändern Geräte oder lesen interne ZHA-Daten. Nutze sie mit Vorsicht.",
    "exp_device_rename": "Geräte umbenennen",
    "exp_device_remove": "Geräte entfernen",
    "exp_permit_join": "Neue Geräte anlernen (Pairing)",
    "exp_firmware_update": "Firmware-Updates suchen und installieren",
    "exp_gateway_details": "Zusatzdaten aus ZHA (Signal, zuletzt gesehen, Gerätetyp)",
    "exp_groups_view": "Gruppen anzeigen",
    "maint_refresh": "Neu einlesen",
    "maint_check_fw": "Firmware-Updates suchen",
    "maint_admin": "Wartung ist nur für Administratoren verfügbar.",
    "ev_none": "Seit dem Start gab es keine Ereignisse.",
    "ev_device_offline": "Gerät offline",
    "ev_device_online": "Gerät online",
    "ev_battery_low": "Batterie niedrig",
    "ev_update_available": "Update verfügbar",
    "ev_device_joined": "Neues Gerät",
    "ev_device_left": "Gerät entfernt",
    "toast_done": "Erledigt",
    "err_generic": "Fehler",
    "err_experimental_disabled": "Diese experimentelle Funktion ist nicht eingeschaltet.",
    "err_unknown_device": "Gerät nicht gefunden.",
    "err_coordinator": "Der Koordinator kann nicht entfernt werden.",
    "err_no_update": "Kein Firmware-Update möglich.",
    "err_invalid_value": "Ungültiger Wert.",
    "err_failed": "Aktion fehlgeschlagen. Details stehen im Log.",
    "err_not_loaded": "ZHA Manager ist nicht geladen.",
    "err_unknown_action": "Unbekannte Aktion."
  },
  "en": {
    "tab_devices": "Devices",
    "tab_battery": "Battery",
    "tab_updates": "Updates",
    "tab_groups": "Groups",
    "tab_bridge": "Settings",
    "stat_total": "Total",
    "stat_offline": "Offline",
    "stat_battery": "Battery low",
    "stat_updates": "Updates",
    "search_ph": "Search …",
    "sort_label": "Sort by",
    "sort_name": "Name",
    "sort_status": "Status",
    "sort_battery": "Battery",
    "sort_model": "Model",
    "more_rows": "Show {n} more",
    "empty_list": "No devices found.",
    "loading": "Loading data …",
    "banner_conn_error": "Connection to ZHA Manager failed. Retrying …",
    "banner_zha_missing": "ZHA is not set up.",
    "banner_zha_not_loaded": "ZHA is not loaded. Device status is unknown.",
    "banner_permit": "Pairing active,",
    "banner_cancel": "Cancel",
    "banner_update": "Installing firmware: {name}",
    "badge_coordinator": "Coordinator",
    "badge_exp": "Experimental",
    "offline_since": "offline ({ago})",
    "status_online": "Online",
    "status_offline": "Offline",
    "status_unknown": "Unknown",
    "battery_ok": "Battery OK",
    "battery_low": "Battery low",
    "battery_critical": "Battery critical",
    "close": "Close",
    "pop_info": "Information",
    "pop_rename": "Rename",
    "pop_firmware": "Firmware",
    "pop_diag": "Diagnostics",
    "pop_remove": "Remove",
    "lbl_ieee": "IEEE address",
    "lbl_manufacturer": "Manufacturer",
    "lbl_model": "Model",
    "lbl_area": "Area",
    "lbl_firmware": "Firmware",
    "lbl_status": "Status",
    "lbl_battery": "Battery",
    "lbl_lqi": "Link quality (LQI)",
    "lbl_rssi": "Signal strength (RSSI)",
    "lbl_last_seen": "Last seen",
    "lbl_type": "Device type",
    "lbl_power": "Power source",
    "lbl_quirk": "Quirk",
    "lbl_entities": "Entities",
    "rename_ph": "New name",
    "rename_hint": "An empty name restores the original name. Entity IDs do not change.",
    "btn_save": "Save",
    "fw_installed": "Installed",
    "fw_latest": "Available",
    "fw_in_progress": "Installation in progress ({pct} %)",
    "btn_install": "Install update",
    "diag_loading": "Loading entities …",
    "diag_error": "Entities could not be loaded.",
    "diag_none": "No entities.",
    "diag_disabled": "disabled",
    "remove_hint": "Removes the device from the Zigbee network and from Home Assistant. To use it again you have to pair it again.",
    "remove_coord": "The coordinator cannot be removed here.",
    "btn_remove": "Remove device",
    "btn_remove_confirm": "Really remove? Tap again",
    "grp_none": "No groups found.",
    "grp_empty": "No members.",
    "grp_members": "{n} members",
    "acc_app": "App version",
    "acc_status": "ZHA status",
    "acc_pairing": "Add new devices",
    "acc_options": "Options",
    "acc_nc": "Notification Center",
    "acc_exp": "Experimental features",
    "acc_maint": "Maintenance",
    "acc_events": "Events",
    "app_integration": "Integration",
    "app_card": "Card",
    "app_latest": "Latest version",
    "app_checked": "Last checked",
    "app_check_now": "Check now",
    "app_release": "View release",
    "app_update_hint": "Version {v} is available. Update via HACS and restart Home Assistant. Then reload the browser (Ctrl+F5).",
    "app_mismatch": "Card and integration have different versions. Clear the browser cache (Ctrl+F5).",
    "app_failed": "Check not possible.",
    "app_no_release": "No release yet",
    "unknown": "Unknown",
    "never": "never",
    "yes": "Yes",
    "no": "No",
    "on": "On",
    "off": "Off",
    "st_zha": "ZHA loaded",
    "st_devices": "Devices",
    "st_radio": "Radio type",
    "st_coord_model": "Coordinator",
    "st_coord_fw": "Coordinator firmware",
    "st_channel": "Radio channel",
    "pair_start": "Start pairing",
    "pair_hint": "Opens the Zigbee network for new devices. Then put the device into pairing mode.",
    "opt_battery_low": "Threshold “battery low”",
    "opt_battery_critical": "Threshold “battery critical”",
    "opt_offline_delay": "Delay until “offline”",
    "opt_events": "Send events",
    "opt_hint": "Change under Settings → Devices & services → ZHA Manager → Configure.",
    "nc_found": "Notification Center detected.",
    "nc_missing": "Notification Center not installed. Messages will be sent once it is installed.",
    "nc_master": "Send messages to the Notification Center",
    "sev_critical": "Critical",
    "sev_warning": "Warning",
    "sev_info": "Info",
    "sev_ok": "OK",
    "exp_hint": "These features are untested. They change devices or read internal ZHA data. Use them with care.",
    "exp_device_rename": "Rename devices",
    "exp_device_remove": "Remove devices",
    "exp_permit_join": "Pair new devices",
    "exp_firmware_update": "Check and install firmware updates",
    "exp_gateway_details": "Extra data from ZHA (signal, last seen, device type)",
    "exp_groups_view": "Show groups",
    "maint_refresh": "Reload data",
    "maint_check_fw": "Check firmware updates",
    "maint_admin": "Maintenance is only available to administrators.",
    "ev_none": "No events since start.",
    "ev_device_offline": "Device offline",
    "ev_device_online": "Device online",
    "ev_battery_low": "Battery low",
    "ev_update_available": "Update available",
    "ev_device_joined": "New device",
    "ev_device_left": "Device removed",
    "toast_done": "Done",
    "err_generic": "Error",
    "err_experimental_disabled": "This experimental feature is not enabled.",
    "err_unknown_device": "Device not found.",
    "err_coordinator": "The coordinator cannot be removed.",
    "err_no_update": "No firmware update possible.",
    "err_invalid_value": "Invalid value.",
    "err_failed": "Action failed. See the log for details.",
    "err_not_loaded": "ZHA Manager is not loaded.",
    "err_unknown_action": "Unknown action."
  },
  "nl": {
    "tab_devices": "Apparaten",
    "tab_battery": "Batterij",
    "tab_updates": "Updates",
    "tab_groups": "Groepen",
    "tab_bridge": "Instellingen",
    "stat_total": "Totaal",
    "stat_offline": "Offline",
    "stat_battery": "Batterij laag",
    "stat_updates": "Updates",
    "search_ph": "Zoeken …",
    "sort_label": "Sorteren",
    "sort_name": "Naam",
    "sort_status": "Status",
    "sort_battery": "Batterij",
    "sort_model": "Model",
    "more_rows": "Nog {n} tonen",
    "empty_list": "Geen apparaten gevonden.",
    "loading": "Gegevens laden …",
    "banner_conn_error": "Verbinding met ZHA Manager mislukt. Opnieuw proberen …",
    "banner_zha_missing": "ZHA is niet ingesteld.",
    "banner_zha_not_loaded": "ZHA is niet geladen. De apparaatstatus is onbekend.",
    "banner_permit": "Koppelen actief, nog",
    "banner_cancel": "Annuleren",
    "banner_update": "Firmware wordt geïnstalleerd: {name}",
    "badge_coordinator": "Coördinator",
    "badge_exp": "Experimenteel",
    "offline_since": "offline ({ago})",
    "status_online": "Online",
    "status_offline": "Offline",
    "status_unknown": "Onbekend",
    "battery_ok": "Batterij in orde",
    "battery_low": "Batterij laag",
    "battery_critical": "Batterij kritiek",
    "close": "Sluiten",
    "pop_info": "Informatie",
    "pop_rename": "Hernoemen",
    "pop_firmware": "Firmware",
    "pop_diag": "Diagnose",
    "pop_remove": "Verwijderen",
    "lbl_ieee": "IEEE-adres",
    "lbl_manufacturer": "Fabrikant",
    "lbl_model": "Model",
    "lbl_area": "Gebied",
    "lbl_firmware": "Firmware",
    "lbl_status": "Status",
    "lbl_battery": "Batterij",
    "lbl_lqi": "Verbindingskwaliteit (LQI)",
    "lbl_rssi": "Signaalsterkte (RSSI)",
    "lbl_last_seen": "Laatst gezien",
    "lbl_type": "Apparaattype",
    "lbl_power": "Voeding",
    "lbl_quirk": "Quirk",
    "lbl_entities": "Entiteiten",
    "rename_ph": "Nieuwe naam",
    "rename_hint": "Een lege naam herstelt de oorspronkelijke naam. Entiteits-ID's veranderen niet.",
    "btn_save": "Opslaan",
    "fw_installed": "Geïnstalleerd",
    "fw_latest": "Beschikbaar",
    "fw_in_progress": "Installatie bezig ({pct} %)",
    "btn_install": "Update installeren",
    "diag_loading": "Entiteiten laden …",
    "diag_error": "Entiteiten konden niet worden geladen.",
    "diag_none": "Geen entiteiten.",
    "diag_disabled": "uitgeschakeld",
    "remove_hint": "Verwijdert het apparaat uit het Zigbee-netwerk en uit Home Assistant. Om het opnieuw te gebruiken moet je het opnieuw koppelen.",
    "remove_coord": "De coördinator kan hier niet worden verwijderd.",
    "btn_remove": "Apparaat verwijderen",
    "btn_remove_confirm": "Echt verwijderen? Tik nogmaals",
    "grp_none": "Geen groepen gevonden.",
    "grp_empty": "Geen leden.",
    "grp_members": "{n} leden",
    "acc_app": "App-versie",
    "acc_status": "ZHA-status",
    "acc_pairing": "Nieuwe apparaten koppelen",
    "acc_options": "Opties",
    "acc_nc": "Notification Center",
    "acc_exp": "Experimentele functies",
    "acc_maint": "Onderhoud",
    "acc_events": "Gebeurtenissen",
    "app_integration": "Integratie",
    "app_card": "Kaart",
    "app_latest": "Nieuwste versie",
    "app_checked": "Laatst gecontroleerd",
    "app_check_now": "Nu controleren",
    "app_release": "Release bekijken",
    "app_update_hint": "Versie {v} is beschikbaar. Update via HACS en herstart Home Assistant. Laad daarna de browser opnieuw (Ctrl+F5).",
    "app_mismatch": "Kaart en integratie hebben verschillende versies. Leeg de browsercache (Ctrl+F5).",
    "app_failed": "Controle niet mogelijk.",
    "app_no_release": "Nog geen release",
    "unknown": "Onbekend",
    "never": "nooit",
    "yes": "Ja",
    "no": "Nee",
    "on": "Aan",
    "off": "Uit",
    "st_zha": "ZHA geladen",
    "st_devices": "Apparaten",
    "st_radio": "Radiotype",
    "st_coord_model": "Coördinator",
    "st_coord_fw": "Coördinator-firmware",
    "st_channel": "Radiokanaal",
    "pair_start": "Koppelen starten",
    "pair_hint": "Opent het Zigbee-netwerk voor nieuwe apparaten. Zet het apparaat daarna in koppelmodus.",
    "opt_battery_low": "Drempel “batterij laag”",
    "opt_battery_critical": "Drempel “batterij kritiek”",
    "opt_offline_delay": "Vertraging tot “offline”",
    "opt_events": "Gebeurtenissen verzenden",
    "opt_hint": "Wijzig via Instellingen → Apparaten & services → ZHA Manager → Configureren.",
    "nc_found": "Notification Center gevonden.",
    "nc_missing": "Notification Center niet geïnstalleerd. Meldingen worden verzonden zodra het is geïnstalleerd.",
    "nc_master": "Meldingen naar het Notification Center sturen",
    "sev_critical": "Kritiek",
    "sev_warning": "Waarschuwing",
    "sev_info": "Info",
    "sev_ok": "In orde",
    "exp_hint": "Deze functies zijn niet getest. Ze wijzigen apparaten of lezen interne ZHA-gegevens. Gebruik ze voorzichtig.",
    "exp_device_rename": "Apparaten hernoemen",
    "exp_device_remove": "Apparaten verwijderen",
    "exp_permit_join": "Nieuwe apparaten koppelen",
    "exp_firmware_update": "Firmware-updates zoeken en installeren",
    "exp_gateway_details": "Extra gegevens uit ZHA (signaal, laatst gezien, apparaattype)",
    "exp_groups_view": "Groepen tonen",
    "maint_refresh": "Opnieuw inlezen",
    "maint_check_fw": "Firmware-updates zoeken",
    "maint_admin": "Onderhoud is alleen beschikbaar voor beheerders.",
    "ev_none": "Geen gebeurtenissen sinds de start.",
    "ev_device_offline": "Apparaat offline",
    "ev_device_online": "Apparaat online",
    "ev_battery_low": "Batterij laag",
    "ev_update_available": "Update beschikbaar",
    "ev_device_joined": "Nieuw apparaat",
    "ev_device_left": "Apparaat verwijderd",
    "toast_done": "Klaar",
    "err_generic": "Fout",
    "err_experimental_disabled": "Deze experimentele functie is niet ingeschakeld.",
    "err_unknown_device": "Apparaat niet gevonden.",
    "err_coordinator": "De coördinator kan niet worden verwijderd.",
    "err_no_update": "Geen firmware-update mogelijk.",
    "err_invalid_value": "Ongeldige waarde.",
    "err_failed": "Actie mislukt. Details staan in het logboek.",
    "err_not_loaded": "ZHA Manager is niet geladen.",
    "err_unknown_action": "Onbekende actie."
  },
  "fr": {
    "tab_devices": "Appareils",
    "tab_battery": "Batterie",
    "tab_updates": "Mises à jour",
    "tab_groups": "Groupes",
    "tab_bridge": "Réglages",
    "stat_total": "Total",
    "stat_offline": "Hors ligne",
    "stat_battery": "Batterie faible",
    "stat_updates": "Mises à jour",
    "search_ph": "Rechercher …",
    "sort_label": "Trier par",
    "sort_name": "Nom",
    "sort_status": "État",
    "sort_battery": "Batterie",
    "sort_model": "Modèle",
    "more_rows": "Afficher {n} de plus",
    "empty_list": "Aucun appareil trouvé.",
    "loading": "Chargement des données …",
    "banner_conn_error": "Échec de la connexion à ZHA Manager. Nouvelle tentative …",
    "banner_zha_missing": "ZHA n'est pas configuré.",
    "banner_zha_not_loaded": "ZHA n'est pas chargé. L'état des appareils est inconnu.",
    "banner_permit": "Appairage actif, encore",
    "banner_cancel": "Annuler",
    "banner_update": "Installation du firmware : {name}",
    "badge_coordinator": "Coordinateur",
    "badge_exp": "Expérimental",
    "offline_since": "hors ligne ({ago})",
    "status_online": "En ligne",
    "status_offline": "Hors ligne",
    "status_unknown": "Inconnu",
    "battery_ok": "Batterie OK",
    "battery_low": "Batterie faible",
    "battery_critical": "Batterie critique",
    "close": "Fermer",
    "pop_info": "Informations",
    "pop_rename": "Renommer",
    "pop_firmware": "Firmware",
    "pop_diag": "Diagnostic",
    "pop_remove": "Supprimer",
    "lbl_ieee": "Adresse IEEE",
    "lbl_manufacturer": "Fabricant",
    "lbl_model": "Modèle",
    "lbl_area": "Zone",
    "lbl_firmware": "Firmware",
    "lbl_status": "État",
    "lbl_battery": "Batterie",
    "lbl_lqi": "Qualité du lien (LQI)",
    "lbl_rssi": "Puissance du signal (RSSI)",
    "lbl_last_seen": "Dernière activité",
    "lbl_type": "Type d'appareil",
    "lbl_power": "Alimentation",
    "lbl_quirk": "Quirk",
    "lbl_entities": "Entités",
    "rename_ph": "Nouveau nom",
    "rename_hint": "Un nom vide rétablit le nom d'origine. Les ID d'entité ne changent pas.",
    "btn_save": "Enregistrer",
    "fw_installed": "Installée",
    "fw_latest": "Disponible",
    "fw_in_progress": "Installation en cours ({pct} %)",
    "btn_install": "Installer la mise à jour",
    "diag_loading": "Chargement des entités …",
    "diag_error": "Impossible de charger les entités.",
    "diag_none": "Aucune entité.",
    "diag_disabled": "désactivée",
    "remove_hint": "Supprime l'appareil du réseau Zigbee et de Home Assistant. Pour le réutiliser, tu dois l'appairer à nouveau.",
    "remove_coord": "Le coordinateur ne peut pas être supprimé ici.",
    "btn_remove": "Supprimer l'appareil",
    "btn_remove_confirm": "Vraiment supprimer ? Appuie encore",
    "grp_none": "Aucun groupe trouvé.",
    "grp_empty": "Aucun membre.",
    "grp_members": "{n} membres",
    "acc_app": "Version de l'application",
    "acc_status": "État de ZHA",
    "acc_pairing": "Ajouter de nouveaux appareils",
    "acc_options": "Options",
    "acc_nc": "Notification Center",
    "acc_exp": "Fonctions expérimentales",
    "acc_maint": "Maintenance",
    "acc_events": "Événements",
    "app_integration": "Intégration",
    "app_card": "Carte",
    "app_latest": "Dernière version",
    "app_checked": "Dernière vérification",
    "app_check_now": "Vérifier maintenant",
    "app_release": "Voir la version",
    "app_update_hint": "La version {v} est disponible. Mets à jour via HACS et redémarre Home Assistant. Recharge ensuite le navigateur (Ctrl+F5).",
    "app_mismatch": "La carte et l'intégration ont des versions différentes. Vide le cache du navigateur (Ctrl+F5).",
    "app_failed": "Vérification impossible.",
    "app_no_release": "Aucune version publiée",
    "unknown": "Inconnu",
    "never": "jamais",
    "yes": "Oui",
    "no": "Non",
    "on": "Activé",
    "off": "Désactivé",
    "st_zha": "ZHA chargé",
    "st_devices": "Appareils",
    "st_radio": "Type de radio",
    "st_coord_model": "Coordinateur",
    "st_coord_fw": "Firmware du coordinateur",
    "st_channel": "Canal radio",
    "pair_start": "Démarrer l'appairage",
    "pair_hint": "Ouvre le réseau Zigbee aux nouveaux appareils. Mets ensuite l'appareil en mode appairage.",
    "opt_battery_low": "Seuil « batterie faible »",
    "opt_battery_critical": "Seuil « batterie critique »",
    "opt_offline_delay": "Délai avant « hors ligne »",
    "opt_events": "Envoyer les événements",
    "opt_hint": "Modifie dans Paramètres → Appareils et services → ZHA Manager → Configurer.",
    "nc_found": "Notification Center détecté.",
    "nc_missing": "Notification Center non installé. Les messages seront envoyés dès son installation.",
    "nc_master": "Envoyer les messages au Notification Center",
    "sev_critical": "Critique",
    "sev_warning": "Avertissement",
    "sev_info": "Info",
    "sev_ok": "OK",
    "exp_hint": "Ces fonctions ne sont pas testées. Elles modifient des appareils ou lisent des données internes de ZHA. Utilise-les avec prudence.",
    "exp_device_rename": "Renommer les appareils",
    "exp_device_remove": "Supprimer des appareils",
    "exp_permit_join": "Appairer de nouveaux appareils",
    "exp_firmware_update": "Rechercher et installer les mises à jour du firmware",
    "exp_gateway_details": "Données supplémentaires de ZHA (signal, dernière activité, type d'appareil)",
    "exp_groups_view": "Afficher les groupes",
    "maint_refresh": "Relire les données",
    "maint_check_fw": "Rechercher les mises à jour du firmware",
    "maint_admin": "La maintenance est réservée aux administrateurs.",
    "ev_none": "Aucun événement depuis le démarrage.",
    "ev_device_offline": "Appareil hors ligne",
    "ev_device_online": "Appareil en ligne",
    "ev_battery_low": "Batterie faible",
    "ev_update_available": "Mise à jour disponible",
    "ev_device_joined": "Nouvel appareil",
    "ev_device_left": "Appareil supprimé",
    "toast_done": "Terminé",
    "err_generic": "Erreur",
    "err_experimental_disabled": "Cette fonction expérimentale n'est pas activée.",
    "err_unknown_device": "Appareil introuvable.",
    "err_coordinator": "Le coordinateur ne peut pas être supprimé.",
    "err_no_update": "Aucune mise à jour du firmware possible.",
    "err_invalid_value": "Valeur non valide.",
    "err_failed": "Échec de l'action. Détails dans le journal.",
    "err_not_loaded": "ZHA Manager n'est pas chargé.",
    "err_unknown_action": "Action inconnue."
  },
  "es": {
    "tab_devices": "Dispositivos",
    "tab_battery": "Batería",
    "tab_updates": "Actualizaciones",
    "tab_groups": "Grupos",
    "tab_bridge": "Ajustes",
    "stat_total": "Total",
    "stat_offline": "Sin conexión",
    "stat_battery": "Batería baja",
    "stat_updates": "Actualizaciones",
    "search_ph": "Buscar …",
    "sort_label": "Ordenar por",
    "sort_name": "Nombre",
    "sort_status": "Estado",
    "sort_battery": "Batería",
    "sort_model": "Modelo",
    "more_rows": "Mostrar {n} más",
    "empty_list": "No se encontraron dispositivos.",
    "loading": "Cargando datos …",
    "banner_conn_error": "Error de conexión con ZHA Manager. Reintentando …",
    "banner_zha_missing": "ZHA no está configurado.",
    "banner_zha_not_loaded": "ZHA no está cargado. Se desconoce el estado de los dispositivos.",
    "banner_permit": "Emparejamiento activo, quedan",
    "banner_cancel": "Cancelar",
    "banner_update": "Instalando firmware: {name}",
    "badge_coordinator": "Coordinador",
    "badge_exp": "Experimental",
    "offline_since": "sin conexión ({ago})",
    "status_online": "En línea",
    "status_offline": "Sin conexión",
    "status_unknown": "Desconocido",
    "battery_ok": "Batería correcta",
    "battery_low": "Batería baja",
    "battery_critical": "Batería crítica",
    "close": "Cerrar",
    "pop_info": "Información",
    "pop_rename": "Renombrar",
    "pop_firmware": "Firmware",
    "pop_diag": "Diagnóstico",
    "pop_remove": "Eliminar",
    "lbl_ieee": "Dirección IEEE",
    "lbl_manufacturer": "Fabricante",
    "lbl_model": "Modelo",
    "lbl_area": "Área",
    "lbl_firmware": "Firmware",
    "lbl_status": "Estado",
    "lbl_battery": "Batería",
    "lbl_lqi": "Calidad del enlace (LQI)",
    "lbl_rssi": "Intensidad de señal (RSSI)",
    "lbl_last_seen": "Visto por última vez",
    "lbl_type": "Tipo de dispositivo",
    "lbl_power": "Alimentación",
    "lbl_quirk": "Quirk",
    "lbl_entities": "Entidades",
    "rename_ph": "Nuevo nombre",
    "rename_hint": "Un nombre vacío restablece el nombre original. Los ID de entidad no cambian.",
    "btn_save": "Guardar",
    "fw_installed": "Instalada",
    "fw_latest": "Disponible",
    "fw_in_progress": "Instalación en curso ({pct} %)",
    "btn_install": "Instalar actualización",
    "diag_loading": "Cargando entidades …",
    "diag_error": "No se pudieron cargar las entidades.",
    "diag_none": "Sin entidades.",
    "diag_disabled": "desactivada",
    "remove_hint": "Elimina el dispositivo de la red Zigbee y de Home Assistant. Para volver a usarlo tienes que emparejarlo de nuevo.",
    "remove_coord": "El coordinador no se puede eliminar aquí.",
    "btn_remove": "Eliminar dispositivo",
    "btn_remove_confirm": "¿Eliminar de verdad? Toca otra vez",
    "grp_none": "No se encontraron grupos.",
    "grp_empty": "Sin miembros.",
    "grp_members": "{n} miembros",
    "acc_app": "Versión de la aplicación",
    "acc_status": "Estado de ZHA",
    "acc_pairing": "Añadir dispositivos nuevos",
    "acc_options": "Opciones",
    "acc_nc": "Notification Center",
    "acc_exp": "Funciones experimentales",
    "acc_maint": "Mantenimiento",
    "acc_events": "Eventos",
    "app_integration": "Integración",
    "app_card": "Tarjeta",
    "app_latest": "Última versión",
    "app_checked": "Última comprobación",
    "app_check_now": "Comprobar ahora",
    "app_release": "Ver versión",
    "app_update_hint": "La versión {v} está disponible. Actualiza con HACS y reinicia Home Assistant. Después recarga el navegador (Ctrl+F5).",
    "app_mismatch": "La tarjeta y la integración tienen versiones distintas. Vacía la caché del navegador (Ctrl+F5).",
    "app_failed": "Comprobación no posible.",
    "app_no_release": "Aún sin versión publicada",
    "unknown": "Desconocido",
    "never": "nunca",
    "yes": "Sí",
    "no": "No",
    "on": "Activado",
    "off": "Desactivado",
    "st_zha": "ZHA cargado",
    "st_devices": "Dispositivos",
    "st_radio": "Tipo de radio",
    "st_coord_model": "Coordinador",
    "st_coord_fw": "Firmware del coordinador",
    "st_channel": "Canal de radio",
    "pair_start": "Iniciar emparejamiento",
    "pair_hint": "Abre la red Zigbee a dispositivos nuevos. Después pon el dispositivo en modo de emparejamiento.",
    "opt_battery_low": "Umbral «batería baja»",
    "opt_battery_critical": "Umbral «batería crítica»",
    "opt_offline_delay": "Retraso hasta «sin conexión»",
    "opt_events": "Enviar eventos",
    "opt_hint": "Cámbialo en Ajustes → Dispositivos y servicios → ZHA Manager → Configurar.",
    "nc_found": "Notification Center detectado.",
    "nc_missing": "Notification Center no instalado. Los mensajes se enviarán en cuanto esté instalado.",
    "nc_master": "Enviar mensajes al Notification Center",
    "sev_critical": "Crítico",
    "sev_warning": "Advertencia",
    "sev_info": "Info",
    "sev_ok": "Correcto",
    "exp_hint": "Estas funciones no están probadas. Modifican dispositivos o leen datos internos de ZHA. Úsalas con cuidado.",
    "exp_device_rename": "Renombrar dispositivos",
    "exp_device_remove": "Eliminar dispositivos",
    "exp_permit_join": "Emparejar dispositivos nuevos",
    "exp_firmware_update": "Buscar e instalar actualizaciones de firmware",
    "exp_gateway_details": "Datos adicionales de ZHA (señal, visto por última vez, tipo de dispositivo)",
    "exp_groups_view": "Mostrar grupos",
    "maint_refresh": "Releer datos",
    "maint_check_fw": "Buscar actualizaciones de firmware",
    "maint_admin": "El mantenimiento solo está disponible para administradores.",
    "ev_none": "Sin eventos desde el inicio.",
    "ev_device_offline": "Dispositivo sin conexión",
    "ev_device_online": "Dispositivo en línea",
    "ev_battery_low": "Batería baja",
    "ev_update_available": "Actualización disponible",
    "ev_device_joined": "Dispositivo nuevo",
    "ev_device_left": "Dispositivo eliminado",
    "toast_done": "Hecho",
    "err_generic": "Error",
    "err_experimental_disabled": "Esta función experimental no está activada.",
    "err_unknown_device": "Dispositivo no encontrado.",
    "err_coordinator": "El coordinador no se puede eliminar.",
    "err_no_update": "No es posible actualizar el firmware.",
    "err_invalid_value": "Valor no válido.",
    "err_failed": "Acción fallida. Los detalles están en el registro.",
    "err_not_loaded": "ZHA Manager no está cargado.",
    "err_unknown_action": "Acción desconocida."
  }
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function tr(lang, key, vars) {
  const l = String(lang || "en").split("-")[0];
  let s = (I18N[l] && I18N[l][key]) ?? I18N.en[key] ?? key;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(String(b));
  return s;
}

const CSS = `
:host { display: block; ${Object.values(COLOR_CONFIG_KEYS)
  .map((c) => `--zm-${c.short}: var(${c.cssVar}, ${c.fallback});`)
  .join(" ")} }
* { box-sizing: border-box; }
ha-card { container-type: inline-size; container-name: zm; overflow: hidden; }
.title { font-size: var(--ha-card-header-font-size, 24px); line-height: 1.2; padding: 16px 16px 0; }
.wrap { padding: 8px 16px 16px; }
.grow { flex: 1; min-width: 0; }
.banner { display: flex; align-items: center; gap: 8px; padding: 8px 12px; margin: 8px 0; border-radius: 8px; border: 1px solid var(--c); color: var(--primary-text-color); background: color-mix(in srgb, var(--c) 12%, transparent); font-size: 14px; }
.banner ha-icon { color: var(--c); --mdc-icon-size: 20px; }
.tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--divider-color); margin: 4px 0 8px; overflow-x: auto; }
.tab { position: relative; display: flex; align-items: center; gap: 6px; padding: 10px 12px; border: 0; background: none; color: var(--secondary-text-color); font: inherit; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }
.tab.active { color: var(--zm-tab); border-bottom-color: var(--zm-tab); }
.tab ha-icon { --mdc-icon-size: 22px; }
.tab .count { min-width: 18px; padding: 0 5px; border-radius: 9px; font-size: 11px; line-height: 18px; text-align: center; color: #fff; background: var(--c); }
@container zm (max-width: 480px) { .tab .lbl { display: none; } }
.chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 4px 0 8px; }
.chip { display: flex; flex-direction: column; align-items: center; min-width: 72px; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; cursor: pointer; }
.chip b { font-size: 18px; color: var(--c, var(--primary-text-color)); }
.chip small { color: var(--secondary-text-color); }
.chip.on { border-color: var(--c, var(--zm-tab)); background: color-mix(in srgb, var(--c, var(--zm-tab)) 12%, transparent); }
.bar { display: flex; gap: 8px; margin: 4px 0 8px; }
.bar input, .bar select, .field { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font: inherit; min-width: 0; }
.bar input { flex: 1; }
.row { display: flex; align-items: center; gap: 12px; padding: 10px 4px; border-bottom: 1px solid var(--divider-color); cursor: pointer; }
.row:hover { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
.ico { position: relative; width: 36px; height: 36px; flex: none; display: flex; align-items: center; justify-content: center; }
.ico .dot { position: absolute; right: 0; bottom: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--c); border: 2px solid var(--card-background-color); }
.name { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-weight: 500; }
.sub { color: var(--secondary-text-color); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.pill, .badge { display: inline-block; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--c, var(--divider-color)); color: var(--c, var(--secondary-text-color)); font-size: 12px; white-space: nowrap; }
.badge.exp { --c: var(--zm-warn); }
.batt { width: 56px; height: 8px; border-radius: 4px; background: var(--divider-color); overflow: hidden; flex: none; }
.batt i { display: block; height: 100%; background: var(--c); }
.empty { padding: 24px 8px; text-align: center; color: var(--secondary-text-color); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; border-radius: 6px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; cursor: pointer; }
.btn.primary { background: var(--zm-tab); border-color: var(--zm-tab); color: #fff; }
.btn.danger { border-color: var(--zm-err); color: var(--zm-err); }
.btn.danger.primary { background: var(--zm-err); color: #fff; }
.btn.small { padding: 4px 10px; font-size: 13px; }
.btn.icon { padding: 6px; border: 0; }
.btn[disabled] { opacity: .5; cursor: default; }
.btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.settings-accordion { border: 1px solid var(--divider-color); border-radius: 8px; margin: 8px 0; }
.settings-accordion.update { border-color: var(--zm-warn); }
.settings-accordion.danger { border-color: var(--zm-err); }
.settings-accordion-summary { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: pointer; list-style: none; font-weight: 500; }
.settings-accordion-summary::-webkit-details-marker { display: none; }
.settings-accordion-summary::after { content: ""; width: 7px; height: 7px; border-right: 2px solid var(--secondary-text-color); border-bottom: 2px solid var(--secondary-text-color); transform: rotate(45deg); margin: 0 4px 3px 4px; transition: transform .15s; }
.settings-accordion[open] > .settings-accordion-summary::after { transform: rotate(-135deg); margin-bottom: -3px; }
.settings-accordion-summary ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
.settings-accordion.update > .settings-accordion-summary ha-icon { color: var(--zm-warn); }
.settings-accordion.danger > .settings-accordion-summary ha-icon { color: var(--zm-err); }
.settings-accordion .meta { color: var(--secondary-text-color); font-weight: 400; font-size: 13px; }
.settings-accordion-body { padding: 4px 12px 12px; }
.settings-line { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; font-size: 14px; }
.settings-line .k { color: var(--secondary-text-color); }
.settings-line .v { font-weight: 600; text-align: right; overflow-wrap: anywhere; }
.note { margin: 8px 0 0; padding: 8px 10px; border-radius: 6px; font-size: 13px; border: 1px solid var(--c, var(--divider-color)); background: color-mix(in srgb, var(--c, transparent) 10%, transparent); }
.hint { margin: 8px 0 0; font-size: 13px; color: var(--secondary-text-color); }
.inline { display: flex; gap: 8px; align-items: center; }
.inline .field { flex: 1; }
.mono { font-family: var(--code-font-family, monospace); font-size: 12px; }
.sw { position: relative; display: inline-block; width: 38px; height: 22px; flex: none; }
.sw input { opacity: 0; width: 0; height: 0; }
.sw span { position: absolute; inset: 0; border-radius: 11px; background: var(--divider-color); transition: .15s; cursor: pointer; }
.sw span::before { content: ""; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; border-radius: 50%; background: #fff; transition: .15s; }
.sw input:checked + span { background: var(--zm-tab); }
.sw input:checked + span::before { transform: translateX(16px); }
.sw input:disabled + span { opacity: .5; cursor: default; }
.switchrow { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.sev { width: 8px; height: 8px; border-radius: 50%; flex: none; background: var(--c); }
.off { opacity: .55; }
.ev { display: flex; gap: 8px; padding: 3px 0; font-size: 13px; }
.ev .t { color: var(--secondary-text-color); white-space: nowrap; }
.popup-backdrop { position: fixed; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, .5); }
.popup { width: calc(100% - 32px); max-width: 440px; max-height: 86vh; display: flex; flex-direction: column; border-radius: 12px; background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 8px 32px rgba(0, 0, 0, .35); }
.popup-head { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px 16px; border-bottom: 1px solid var(--divider-color); }
.popup-title { font-size: 18px; font-weight: 500; overflow-wrap: anywhere; }
.popup-sub { font-size: 13px; color: var(--secondary-text-color); }
.popup-body { padding: 8px 12px 12px; overflow-y: auto; }
.toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 9; max-width: calc(100% - 32px); padding: 10px 16px; border-radius: 8px; color: #fff; background: #323232; box-shadow: 0 4px 16px rgba(0, 0, 0, .35); }
.toast.err { background: var(--zm-err); }
`;

class ZhaManagerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = { ...DEFAULTS };
    this._hass = null;
    this._data = null;
    this._err = null;
    this._unsub = null;
    this._subscribing = false;
    this._offset = 0;
    this._lastHtml = "";
    this._timers = {};
    this._s = {
      tab: null, filter: "all", search: "", sort: null, open: {}, limit: null, popup: null,
      confirm: null, toast: null, busy: {}, rename: {}, details: {}, permitDur: 60,
    };
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => this._onClick(e));
    root.addEventListener("input", (e) => this._onInput(e));
    root.addEventListener("change", (e) => this._onChange(e));
    root.addEventListener("toggle", (e) => this._onToggle(e), true);
    this._onKey = (e) => {
      if (e.key === "Escape" && this._s.popup) {
        this._s.popup = null;
        this._render();
      }
    };
  }

  // ---------- Lebenszyklus ----------
  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }
  static getStubConfig() {
    return {};
  }
  getCardSize() {
    return 6;
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    const prevEntry = this._cfg.entry_id;
    this._cfg = { ...DEFAULTS, ...config };
    if (config.title === undefined) this._cfg.title = DEFAULTS.title;
    this._s.tab = null;
    this._s.sort = null;
    this._s.limit = null;
    this._applyColors();
    if (prevEntry !== this._cfg.entry_id) this._unsubscribe();
    this._subscribe();
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    const langChanged = this._hass && this._hass.language !== hass.language;
    this._hass = hass;
    if (first) this._subscribe();
    if (langChanged) this._render();
    else if (first) this._render();
  }

  connectedCallback() {
    window.addEventListener("keydown", this._onKey);
    this._subscribe();
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this._onKey);
    this._unsubscribe();
    for (const k of Object.keys(this._timers)) {
      clearTimeout(this._timers[k]);
      clearInterval(this._timers[k]);
    }
    this._timers = {};
  }

  async _subscribe() {
    if (!this._hass || this._unsub || this._subscribing || !this.isConnected) return;
    this._subscribing = true;
    try {
      const req = { type: `${DOMAIN}/subscribe` };
      if (this._cfg.entry_id) req.entry_id = this._cfg.entry_id;
      this._unsub = await this._hass.connection.subscribeMessage((m) => this._onMsg(m), req);
      this._err = null;
    } catch (e) {
      this._unsub = null;
      this._err = (e && (e.message || e.code)) || "error";
      clearTimeout(this._timers.retry);
      this._timers.retry = setTimeout(() => this._subscribe(), 10000);
    } finally {
      this._subscribing = false;
      this._render();
    }
  }

  _unsubscribe() {
    clearTimeout(this._timers.retry);
    if (this._unsub) {
      try {
        this._unsub();
      } catch (_e) {
        /* Verbindung schon geschlossen */
      }
    }
    this._unsub = null;
  }

  _onMsg(m) {
    if (!m) return;
    if (m.type === "snapshot" || m.type === "update") {
      this._data = m.data;
      this._offset = (m.data.server_time || Date.now() / 1000) - Date.now() / 1000;
      this._err = null;
      this._render();
    } else if (m.type === "response") {
      delete this._s.busy[m.topic];
      if (m.status === "ok") this._toast(this._t("toast_done"), false);
      else this._toast(this._errText(m.error), true);
      this._render();
    }
  }

  // ---------- Hilfen ----------
  get _lang() {
    return (this._hass && this._hass.language) || "en";
  }
  _t(key, vars) {
    return tr(this._lang, key, vars);
  }
  _now() {
    return Date.now() / 1000 + this._offset;
  }
  _errText(code) {
    const key = `err_${code}`;
    return I18N.en[key] ? this._t(key) : `${this._t("err_generic")}${code ? `: ${code}` : ""}`;
  }
  _ago(ts) {
    if (!ts) return "–";
    const diff = Math.round(ts - this._now());
    const a = Math.abs(diff);
    let rtf;
    try {
      rtf = new Intl.RelativeTimeFormat(this._lang, { numeric: "auto" });
    } catch (_e) {
      rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    }
    if (a < 60) return rtf.format(diff, "second");
    if (a < 3600) return rtf.format(Math.round(diff / 60), "minute");
    if (a < 86400) return rtf.format(Math.round(diff / 3600), "hour");
    return rtf.format(Math.round(diff / 86400), "day");
  }
  _date(ts) {
    if (!ts) return this._t("never");
    try {
      return new Date(ts * 1000).toLocaleString(this._lang);
    } catch (_e) {
      return new Date(ts * 1000).toLocaleString();
    }
  }
  _toast(msg, err) {
    this._s.toast = { msg, err };
    clearTimeout(this._timers.toast);
    this._timers.toast = setTimeout(() => {
      this._s.toast = null;
      this._render();
    }, 5000);
  }

  _applyColors() {
    const cfg = this._cfg;
    const set = (cssVar, val) => (val ? this.style.setProperty(cssVar, val) : this.style.removeProperty(cssVar));
    for (const [key, meta] of Object.entries(COLOR_CONFIG_KEYS)) set(meta.cssVar, sanitizeColor(cfg[`color_${key}`]));
    const override = sanitizeColor(cfg.color_row_icon);
    for (const tab of TAB_ORDER) set(`--zm-icon-${tab}`, override ? "" : sanitizeColor(cfg[CATEGORY_ICON_COLOR_KEYS[tab]]));
  }

  // ---------- Zustand aus den Daten ----------
  _admin() {
    return !this._cfg.read_only && !(this._hass && this._hass.user && this._hass.user.is_admin === false);
  }
  _expOn() {
    const ex = this._data && this._data.experimental;
    return !!(this._cfg.show_experimental && ex && ex.master);
  }
  _feat(key) {
    if (!this._expOn()) return false;
    const f = this._data.experimental.features.find((x) => x.key === key);
    return !!(f && f.enabled);
  }
  _can(key) {
    return this._admin() && this._feat(key);
  }
  _tabs() {
    const list = TAB_ORDER.filter((k) => {
      if (TAB_FEATURE[k]) return this._feat(TAB_FEATURE[k]) && this._cfg[`show_${k}`] !== false;
      return this._cfg[`show_${k}`] !== false;
    });
    return list.length ? list : ["devices"];
  }
  _activeTab() {
    const tabs = this._tabs();
    if (this._s.tab && tabs.includes(this._s.tab)) return this._s.tab;
    return tabs.includes(this._cfg.default_tab) ? this._cfg.default_tab : tabs[0];
  }
  _devColor(d) {
    if (d.online === false || d.battery_state === "critical") return "var(--zm-err)";
    if (d.battery_state === "low" || (d.update && d.update.in_progress)) return "var(--zm-warn)";
    if (d.update && d.update.available) return "var(--zm-info)";
    if (d.online === null) return "var(--secondary-text-color)";
    return "var(--zm-ok)";
  }
  _battColor(state) {
    return state === "critical" ? "var(--zm-err)" : state === "low" ? "var(--zm-warn)" : "var(--zm-ok)";
  }
  _sigColor(d) {
    if (d.lqi != null) return d.lqi >= 150 ? "var(--zm-ok)" : d.lqi >= 80 ? "var(--zm-warn)" : "var(--zm-err)";
    if (d.rssi != null) return d.rssi >= -70 ? "var(--zm-ok)" : d.rssi >= -85 ? "var(--zm-warn)" : "var(--zm-err)";
    return "var(--secondary-text-color)";
  }
  _rank(d) {
    if (d.online === false) return 0;
    if (d.battery_state === "critical") return 1;
    if (d.battery_state === "low") return 2;
    if (d.update && d.update.available) return 3;
    return 4;
  }
  _rows(tab) {
    let list = [...this._data.devices];
    if (tab === "battery") list = list.filter((d) => d.battery != null);
    if (tab === "updates") list = list.filter((d) => d.update);
    const f = this._s.filter;
    if (f === "offline") list = list.filter((d) => d.online === false);
    else if (f === "battery") list = list.filter((d) => d.battery_state === "low" || d.battery_state === "critical");
    else if (f === "updates") list = list.filter((d) => d.update && d.update.available);
    const q = this._s.search.trim().toLowerCase();
    if (q) list = list.filter((d) => [d.name, d.manufacturer, d.model, d.area, d.ieee].some((x) => String(x || "").toLowerCase().includes(q)));
    const sort = this._s.sort || (tab === "battery" ? "battery" : tab === "updates" ? "status" : this._cfg.default_sort);
    const byName = (a, b) => a.name.localeCompare(b.name, this._lang, { sensitivity: "base" });
    if (sort === "status") list.sort((a, b) => this._rank(a) - this._rank(b) || byName(a, b));
    else if (sort === "battery") list.sort((a, b) => (a.battery ?? 101) - (b.battery ?? 101) || byName(a, b));
    else if (sort === "model") list.sort((a, b) => String(a.model || "").localeCompare(String(b.model || ""), this._lang) || byName(a, b));
    else list.sort(byName);
    return list;
  }

  // ---------- HTML-Bausteine ----------
  _acc(k, icon, title, body, o = {}) {
    const open = this._s.open[k] !== undefined ? this._s.open[k] : !!o.open;
    return `<details class="settings-accordion ${o.cls || ""}" data-k="${esc(k)}" ${open ? "open" : ""}>
      <summary class="settings-accordion-summary"><ha-icon icon="${icon}"></ha-icon><span class="grow">${esc(title)}</span>${o.meta ? `<span class="meta">${o.meta}</span>` : ""}</summary>
      <div class="settings-accordion-body">${body}</div></details>`;
  }
  _line(k, v) {
    return `<div class="settings-line"><span class="k">${esc(k)}</span><span class="v">${v}</span></div>`;
  }
  _btn(cls, act, label, extra = "") {
    return `<button class="btn ${cls}" data-act="${act}" ${extra}>${esc(label)}</button>`;
  }
  _banner(color, icon, text, extra = "") {
    return `<div class="banner" style="--c:${color}"><ha-icon icon="${icon}"></ha-icon><span class="grow">${text}</span>${extra}</div>`;
  }
  _sw(change, key, checked, disabled) {
    return `<label class="sw"><input type="checkbox" data-change="${change}" data-key="${esc(key)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}><span></span></label>`;
  }
  _expBadge() {
    return `<span class="badge exp">${esc(this._t("badge_exp"))}</span>`;
  }

  _banners() {
    const d = this._data;
    const out = [];
    if (this._err) out.push(this._banner("var(--zm-err)", "mdi:lan-disconnect", esc(this._t("banner_conn_error"))));
    else if (!d) out.push(this._banner("var(--zm-banner)", "mdi:loading", esc(this._t("loading"))));
    if (!d) return out.join("");
    if (!d.connection.zha_present) out.push(this._banner("var(--zm-warn)", "mdi:alert", esc(this._t("banner_zha_missing"))));
    else if (!d.connection.zha_loaded) out.push(this._banner("var(--zm-warn)", "mdi:alert", esc(this._t("banner_zha_not_loaded"))));
    const left = d.permit_until ? Math.round(d.permit_until - this._now()) : 0;
    if (left > 0) {
      const stop = this._can("permit_join") ? this._btn("small", "permit_stop", this._t("banner_cancel")) : "";
      out.push(this._banner("var(--zm-banner)", "mdi:plus-network", `${esc(this._t("banner_permit"))} <b data-cd="${d.permit_until}">${left}</b> s`, stop));
    }
    for (const dev of d.devices) {
      if (dev.update && dev.update.in_progress) {
        const pct = dev.update.percentage != null ? ` (${Math.round(dev.update.percentage)} %)` : "";
        out.push(this._banner("var(--zm-banner)", "mdi:update", `${esc(this._t("banner_update", { name: dev.name }))}${pct}`));
      }
    }
    return out.join("");
  }

  _tabBar(tabs, active) {
    if (tabs.length < 2) return "";
    const s = this._data ? this._data.stats : null;
    const badge = (k) => {
      if (!s) return "";
      let n = 0, c = "";
      if (k === "devices") { n = s.offline; c = "var(--zm-err)"; }
      else if (k === "battery") { n = s.battery_low + s.battery_critical; c = "var(--zm-warn)"; }
      else if (k === "updates") { n = s.updates; c = "var(--zm-info)"; }
      else if (k === "bridge") {
        const a = this._data.app;
        if (a && (a.update_available || this._data.version !== CARD_VERSION)) return `<span class="count" style="--c:var(--zm-warn)">↑</span>`;
        return "";
      }
      return n > 0 ? `<span class="count" style="--c:${c}">${n}</span>` : "";
    };
    return `<div class="tabs" role="tablist">${tabs
      .map((k) => {
        const m = TAB_META[k];
        const label = this._t(m.label);
        return `<button class="tab ${k === active ? "active" : ""}" role="tab" data-act="tab" data-tab="${k}" title="${esc(label)}"><ha-icon icon="${m.icon}"></ha-icon><span class="lbl">${esc(label)}</span>${badge(k)}</button>`;
      })
      .join("")}</div>`;
  }

  _chips() {
    if (!this._cfg.show_stats) return "";
    const s = this._data.stats;
    const f = this._s.filter;
    const chip = (key, n, label, color) =>
      `<button class="chip ${f === key ? "on" : ""}" data-act="chip" data-filter="${key}" style="${color ? `--c:${color}` : ""}"><b>${n}</b><small>${esc(label)}</small></button>`;
    return `<div class="chips">${chip("all", s.total, this._t("stat_total"), "")}${chip("offline", s.offline, this._t("stat_offline"), "var(--zm-err)")}${chip("battery", s.battery_low + s.battery_critical, this._t("stat_battery"), "var(--zm-warn)")}${chip("updates", s.updates, this._t("stat_updates"), "var(--zm-info)")}</div>`;
  }

  _filterBar(tab) {
    if (!this._cfg.show_filter_bar) return "";
    const sort = this._s.sort || (tab === "battery" ? "battery" : tab === "updates" ? "status" : this._cfg.default_sort);
    const opts = ["name", "status", "battery", "model"]
      .map((k) => `<option value="${k}" ${k === sort ? "selected" : ""}>${esc(this._t(`sort_${k}`))}</option>`)
      .join("");
    const search = this._cfg.show_search
      ? `<input type="search" data-fk="search" data-change="search" placeholder="${esc(this._t("search_ph"))}" value="${esc(this._s.search)}">`
      : `<span class="grow"></span>`;
    return `<div class="bar">${search}<select data-fk="sort" data-change="sort" title="${esc(this._t("sort_label"))}">${opts}</select></div>`;
  }

  _pills(d, tab) {
    const c = this._cfg;
    const out = [];
    if (c.show_col_battery && d.battery != null) {
      const col = this._battColor(d.battery_state);
      out.push(`<span class="batt" style="--c:${col}" title="${esc(this._t(`battery_${d.battery_state}`))}"><i style="width:${d.battery}%"></i></span><span class="pill" style="--c:${col}">${d.battery} %</span>`);
    }
    if (c.show_col_signal && (d.lqi != null || d.rssi != null)) {
      const txt = d.lqi != null ? `LQI ${Math.round(d.lqi)}` : `${Math.round(d.rssi)} dBm`;
      out.push(`<span class="pill" style="--c:${this._sigColor(d)}">${esc(txt)}</span>`);
    }
    if (c.show_col_firmware) {
      if (d.update && d.update.available) {
        const txt = tab === "updates" && d.update.installed ? `${d.update.installed} → ${d.update.latest || "?"}` : `↑ ${d.update.latest || ""}`;
        out.push(`<span class="pill" style="--c:var(--zm-info)">${esc(txt)}</span>`);
      } else if (d.sw_version || (d.update && d.update.installed)) {
        out.push(`<span class="pill">${esc((d.update && d.update.installed) || d.sw_version)}</span>`);
      }
    }
    return out.join("");
  }

  _row(d, tab) {
    const icon = d.coordinator ? "mdi:router-wireless" : TAB_META[tab] && tab !== "bridge" ? TAB_META[tab].icon : "mdi:zigbee";
    const sub = [[d.manufacturer, d.model].filter(Boolean).join(" ")];
    if (this._cfg.show_col_area && d.area) sub.push(d.area);
    if (d.online === false && d.offline_since) sub.push(this._t("offline_since", { ago: this._ago(d.offline_since) }));
    const iconColor = `var(--zm-icon-${tab}, var(--zm-icon))`;
    return `<div class="row" data-act="open" data-dev="${esc(d.ieee)}" tabindex="0">
      <div class="ico" style="--c:${this._devColor(d)}"><ha-icon icon="${icon}" style="color:${iconColor}"></ha-icon><span class="dot"></span></div>
      <div class="grow"><div class="name">${esc(d.name)}${d.coordinator ? `<span class="badge">${esc(this._t("badge_coordinator"))}</span>` : ""}</div><div class="sub">${esc(sub.filter(Boolean).join(" · "))}</div></div>
      <div class="pills">${this._pills(d, tab)}</div></div>`;
  }

  _list(tab) {
    const rows = this._rows(tab);
    if (!rows.length) return `<div class="empty">${esc(this._t("empty_list"))}</div>`;
    const max = Number(this._cfg.max_rows) || 0;
    const limit = max > 0 ? this._s.limit || max : rows.length;
    const shown = rows.slice(0, limit);
    const more = rows.length - shown.length;
    return `${shown.map((d) => this._row(d, tab)).join("")}${more > 0 ? `<div class="btns">${this._btn("small", "more", this._t("more_rows", { n: more }))}</div>` : ""}`;
  }

  _groups() {
    const g = this._data.groups;
    if (!g || !g.length) return `<div class="empty">${esc(this._t("grp_none"))}</div>`;
    return g
      .map((grp) =>
        this._acc(`g:${grp.id}`, "mdi:google-circles-communities", grp.name, grp.members.map((m) => this._line(m.name, esc(m.endpoint != null ? `EP ${m.endpoint}` : ""))).join("") || `<div class="hint">${esc(this._t("grp_empty"))}</div>`, {
          meta: esc(this._t("grp_members", { n: grp.members.length })),
        }),
      )
      .join("");
  }

  // ---------- Einstellungen (Zahnrad) ----------
  _bridge() {
    const d = this._data;
    const a = d.app || {};
    const admin = this._admin();
    let h = "";

    // 1. App-Version
    const mismatch = d.version !== CARD_VERSION;
    const flagged = a.update_available || mismatch;
    let note = "";
    if (a.update_available) note += `<div class="note" style="--c:var(--zm-warn)">${esc(this._t("app_update_hint", { v: a.latest_version }))}</div>`;
    if (mismatch) note += `<div class="note" style="--c:var(--zm-warn)">${esc(this._t("app_mismatch"))}</div>`;
    if (a.check_failed) note += `<div class="note" style="--c:var(--zm-err)">${esc(this._t("app_failed"))}</div>`;
    const latest = a.latest_version ? esc(a.latest_version) : esc(a.no_release ? this._t("app_no_release") : this._t("unknown"));
    const url = typeof a.release_url === "string" && a.release_url.startsWith("https://github.com/") ? a.release_url : RELEASES_URL;
    h += this._acc(
      "app", "mdi:tag-outline", this._t("acc_app"),
      `${this._line(this._t("app_integration"), esc(d.version))}${this._line(this._t("app_card"), esc(CARD_VERSION))}${this._line(this._t("app_latest"), latest)}${this._line(this._t("app_checked"), esc(a.checked_at ? this._date(a.checked_at) : this._t("never")))}${note}
       <div class="btns">${admin ? this._btn("small", "app_check", this._t("app_check_now"), this._s.busy.check_app_update ? "disabled" : "") : ""}<a class="btn small" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(this._t("app_release"))}</a></div>`,
      { open: true, cls: flagged ? "update" : "", meta: esc(d.version) },
    );

    // 2. Status
    const c = d.connection;
    const yes = (v) => esc(this._t(v ? "yes" : "no"));
    let st = this._line(this._t("st_zha"), yes(c.zha_loaded)) + this._line(this._t("st_devices"), esc(d.stats.total));
    if (c.radio_type) st += this._line(this._t("st_radio"), esc(c.radio_type));
    if (c.gateway) {
      if (c.model) st += this._line(this._t("st_coord_model"), esc([c.manufacturer, c.model].filter(Boolean).join(" ")));
      if (c.firmware) st += this._line(this._t("st_coord_fw"), esc(c.firmware));
      if (c.channel != null) st += this._line(this._t("st_channel"), esc(c.channel));
    }
    h += this._acc("status", "mdi:access-point-network", this._t("acc_status"), st, { open: true });

    // 3. Pairing (experimentell)
    if (this._can("permit_join")) {
      const durs = [30, 60, 120, 254].map((s) => `<option value="${s}" ${s === this._s.permitDur ? "selected" : ""}>${s} s</option>`).join("");
      h += this._acc(
        "pair", "mdi:plus-network", this._t("acc_pairing"),
        `<div class="inline"><select class="field" data-fk="permit_dur" data-change="permit_dur">${durs}</select>${this._btn("primary", "permit", this._t("pair_start"), this._s.busy.permit_join ? "disabled" : "")}</div><div class="hint">${esc(this._t("pair_hint"))}</div>`,
        { meta: this._expBadge() },
      );
    }

    // 4. Optionen
    const o = d.options;
    h += this._acc(
      "options", "mdi:tune", this._t("acc_options"),
      `${this._line(this._t("opt_battery_low"), `${o.battery_low} %`)}${this._line(this._t("opt_battery_critical"), `${o.battery_critical} %`)}${this._line(this._t("opt_offline_delay"), `${o.offline_delay} s`)}${this._line(this._t("opt_events"), yes(o.events_enabled))}<div class="hint">${esc(this._t("opt_hint"))}</div>`,
    );

    // 5. Notification Center (experimentell)
    if (this._expOn() && d.nc) {
      const nc = d.nc;
      const sev = { critical: "var(--zm-err)", warning: "var(--zm-warn)", info: "var(--zm-info)", ok: "var(--zm-ok)" };
      const lang = this._lang.split("-")[0];
      const rows = nc.types
        .map((t) => `<div class="switchrow ${nc.enabled ? "" : "off"}"><span class="sev" style="--c:${sev[t.severity]}" title="${esc(this._t(`sev_${t.severity}`))}"></span><ha-icon icon="${esc(t.icon || "mdi:bell")}"></ha-icon><span class="grow">${esc(t.labels[lang] || t.labels.en || t.type)}</span>${admin ? this._sw("nc_type", t.type, t.enabled, !nc.enabled) : `<span class="pill">${esc(this._t(t.enabled ? "on" : "off"))}</span>`}</div>`)
        .join("");
      h += this._acc(
        "nc", "mdi:bell-ring-outline", this._t("acc_nc"),
        `<div class="note" style="--c:${nc.available ? "var(--zm-ok)" : "var(--zm-info)"}">${esc(this._t(nc.available ? "nc_found" : "nc_missing"))}</div>
         <div class="switchrow"><span class="grow"><b>${esc(this._t("nc_master"))}</b></span>${admin ? this._sw("nc_master", "master", this._feat("notification_center"), false) : `<span class="pill">${esc(this._t(this._feat("notification_center") ? "on" : "off"))}</span>`}</div>
         ${rows}`,
        { meta: this._expBadge() },
      );
    }

    // 6. Experimentell
    if (this._expOn()) {
      const feats = d.experimental.features.filter((f) => !f.own_switch);
      const lines = feats
        .map((f) => `<div class="switchrow"><ha-icon icon="${esc((EXPERIMENTAL[f.key] || {}).icon || "mdi:flask")}"></ha-icon><span class="grow">${esc(this._t(`exp_${f.key}`))}</span>${admin ? this._sw("exp", f.key, f.enabled, false) : `<span class="pill">${esc(this._t(f.enabled ? "on" : "off"))}</span>`}</div>`)
        .join("");
      h += this._acc("exp", "mdi:flask-outline", this._t("acc_exp"), `<div class="note" style="--c:var(--zm-warn)">${esc(this._t("exp_hint"))}</div>${lines}`, { meta: this._expBadge() });
    }

    // 7. Wartung
    let maint = `<div class="btns">${admin ? this._btn("", "refresh", this._t("maint_refresh"), this._s.busy.refresh ? "disabled" : "") : ""}${this._can("firmware_update") ? this._btn("", "check_updates", this._t("maint_check_fw"), this._s.busy.check_updates ? "disabled" : "") : ""}</div>`;
    if (!admin) maint = `<div class="hint">${esc(this._t("maint_admin"))}</div>`;
    h += this._acc("maint", "mdi:wrench-outline", this._t("acc_maint"), maint);

    // 8. Ereignisse
    const ev = d.events.length
      ? d.events.map((e) => `<div class="ev"><span class="t">${esc(this._ago(e.t))}</span><span>${esc(this._t(`ev_${e.type}`))}: ${esc(e.name)}</span></div>`).join("")
      : `<div class="hint">${esc(this._t("ev_none"))}</div>`;
    h += this._acc("events", "mdi:history", this._t("acc_events"), ev, { meta: esc(d.events.length) });
    return h;
  }

  // ---------- Popup ----------
  _popup() {
    const d = this._s.popup && this._data ? this._data.devices.find((x) => x.ieee === this._s.popup) : null;
    if (!d) return "";
    const yes = (v) => esc(this._t(v ? "yes" : "no"));
    let info = this._line(this._t("lbl_ieee"), `<span class="mono">${esc(d.ieee)}</span>`);
    if (d.manufacturer) info += this._line(this._t("lbl_manufacturer"), esc(d.manufacturer));
    if (d.model) info += this._line(this._t("lbl_model"), esc(d.model));
    if (d.area) info += this._line(this._t("lbl_area"), esc(d.area));
    if (d.sw_version) info += this._line(this._t("lbl_firmware"), esc(d.sw_version));
    const status = d.online === null ? this._t("status_unknown") : d.online ? this._t("status_online") : `${this._t("status_offline")}${d.offline_since ? ` (${this._ago(d.offline_since)})` : ""}`;
    info += this._line(this._t("lbl_status"), esc(status));
    if (d.battery != null) info += this._line(this._t("lbl_battery"), esc(`${d.battery} % (${this._t(`battery_${d.battery_state}`)})`));
    if (d.lqi != null) info += this._line(this._t("lbl_lqi"), esc(Math.round(d.lqi)));
    if (d.rssi != null) info += this._line(this._t("lbl_rssi"), esc(`${Math.round(d.rssi)} dBm`));
    if (d.last_seen) info += this._line(this._t("lbl_last_seen"), esc(this._date(d.last_seen)));
    if (d.device_type) info += this._line(this._t("lbl_type"), esc(d.device_type));
    if (d.power_source) info += this._line(this._t("lbl_power"), esc(d.power_source));
    if (d.quirk) info += this._line(this._t("lbl_quirk"), `<span class="mono">${esc(d.quirk)}</span>`);
    info += this._line(this._t("lbl_entities"), esc(d.entity_count));
    let h = this._acc("p:info", "mdi:information-outline", this._t("pop_info"), info, { open: true });

    if (this._can("device_rename")) {
      const val = this._s.rename[d.ieee] !== undefined ? this._s.rename[d.ieee] : d.name;
      h += this._acc(
        "p:rename", "mdi:pencil", this._t("pop_rename"),
        `<div class="inline"><input class="field" data-fk="rename" data-change="rename" maxlength="80" value="${esc(val)}" placeholder="${esc(this._t("rename_ph"))}">${this._btn("primary", "rename", this._t("btn_save"), this._s.busy[`rename:${d.ieee}`] ? "disabled" : "")}</div><div class="hint">${esc(this._t("rename_hint"))}</div>`,
        { meta: this._expBadge() },
      );
    }

    if (d.update) {
      const u = d.update;
      let fw = this._line(this._t("fw_installed"), esc(u.installed || "–")) + this._line(this._t("fw_latest"), esc(u.latest || "–"));
      if (u.in_progress) fw += `<div class="note" style="--c:var(--zm-banner)">${esc(this._t("fw_in_progress", { pct: u.percentage != null ? Math.round(u.percentage) : "…" }))}</div>`;
      if (u.available && !u.in_progress && this._can("firmware_update"))
        fw += `<div class="btns">${this._btn("primary", "install", this._t("btn_install"), this._s.busy[`install:${d.ieee}`] ? "disabled" : "")}</div>`;
      h += this._acc("p:fw", "mdi:update", this._t("pop_firmware"), fw, { cls: u.available ? "update" : "", meta: u.available ? esc(`↑ ${u.latest || ""}`) : "" });
    }

    if (this._admin()) {
      const det = this._s.details[d.ieee];
      let diag;
      if (!det) diag = `<div class="hint">${esc(this._t("diag_loading"))}</div>`;
      else if (det.error) diag = `<div class="hint">${esc(this._t("diag_error"))}</div>`;
      else if (!det.entities.length) diag = `<div class="hint">${esc(this._t("diag_none"))}</div>`;
      else diag = det.entities.map((e) => `<div class="settings-line"><span class="k mono">${esc(e.entity_id)}</span><span class="v">${esc(e.disabled ? this._t("diag_disabled") : e.state ?? "–")}</span></div>`).join("");
      h += this._acc("p:diag", "mdi:stethoscope", this._t("pop_diag"), diag);
    }

    if (this._can("device_remove")) {
      const armed = this._s.confirm === `remove:${d.ieee}`;
      const body = d.coordinator
        ? `<div class="hint">${esc(this._t("remove_coord"))}</div>`
        : `<div class="hint">${esc(this._t("remove_hint"))}</div><div class="btns">${this._btn(`danger ${armed ? "primary" : ""}`, "remove", this._t(armed ? "btn_remove_confirm" : "btn_remove"), this._s.busy[`remove:${d.ieee}`] ? "disabled" : "")}</div>`;
      h += this._acc("p:remove", "mdi:delete-outline", this._t("pop_remove"), body, { cls: "danger", meta: this._expBadge() });
    }

    return `<div class="popup-backdrop" data-act="backdrop"><div class="popup" role="dialog" aria-modal="true">
      <div class="popup-head"><ha-icon icon="${d.coordinator ? "mdi:router-wireless" : "mdi:zigbee"}" style="color:${this._devColor(d)}"></ha-icon>
      <div class="grow"><div class="popup-title">${esc(d.name)}</div><div class="popup-sub">${esc([d.manufacturer, d.model].filter(Boolean).join(" "))}</div></div>
      <button class="btn icon" data-act="close" title="${esc(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="popup-body">${h}</div></div></div>`;
  }

  // ---------- Rendern ----------
  _html() {
    const c = this._cfg;
    const zoom = Math.max(50, Math.min(200, Number(c.zoom) || 100)) / 100;
    const title = c.show_title !== false && c.title ? `<div class="title">${esc(c.title)}</div>` : "";
    let body = this._banners();
    if (this._data) {
      const tabs = this._tabs();
      const tab = this._activeTab();
      body += this._tabBar(tabs, tab);
      if (tab === "bridge") body += this._bridge();
      else if (tab === "groups") body += this._groups();
      else body += `${this._chips()}${this._filterBar(tab)}${this._list(tab)}`;
    }
    const toast = this._s.toast ? `<div class="toast ${this._s.toast.err ? "err" : ""}" role="status">${esc(this._s.toast.msg)}</div>` : "";
    return `<style>${CSS}</style><ha-card>${title}<div class="wrap" style="zoom:${zoom}">${body}</div></ha-card>${this._popup()}${toast}`;
  }

  _render() {
    const html = this._html();
    if (html === this._lastHtml) return;
    const root = this.shadowRoot;
    const ae = root.activeElement;
    const fk = ae && ae.dataset ? ae.dataset.fk : null;
    let sel = null;
    if (fk && typeof ae.selectionStart === "number") sel = [ae.selectionStart, ae.selectionEnd];
    const pb = root.querySelector(".popup-body");
    const pscroll = pb ? pb.scrollTop : 0;
    root.innerHTML = html;
    this._lastHtml = html;
    if (fk) {
      const n = root.querySelector(`[data-fk="${fk}"]`);
      if (n) {
        n.focus();
        if (sel) {
          try {
            n.setSelectionRange(sel[0], sel[1]);
          } catch (_e) {
            /* Feldtyp ohne Auswahl */
          }
        }
      }
    }
    if (pscroll) {
      const nb = root.querySelector(".popup-body");
      if (nb) nb.scrollTop = pscroll;
    }
    this._syncTimers();
  }

  _syncTimers() {
    const cds = this.shadowRoot.querySelectorAll("[data-cd]");
    if (!cds.length) {
      clearInterval(this._timers.cd);
      this._timers.cd = null;
      return;
    }
    if (this._timers.cd) return;
    this._timers.cd = setInterval(() => {
      const nodes = this.shadowRoot.querySelectorAll("[data-cd]");
      if (!nodes.length) return this._syncTimers();
      let done = false;
      nodes.forEach((n) => {
        const left = Math.round(Number(n.dataset.cd) - this._now());
        if (left <= 0) done = true;
        else n.textContent = String(left);
      });
      if (done) {
        clearInterval(this._timers.cd);
        this._timers.cd = null;
        if (this._data) this._data.permit_until = null;
        this._render();
      }
    }, 1000);
  }

  // ---------- Bedienung ----------
  async _call(action, extra = {}, topic) {
    const tp = topic || action;
    this._s.busy[tp] = true;
    this._render();
    const req = { type: `${DOMAIN}/action`, action, topic: tp, ...extra };
    if (this._cfg.entry_id) req.entry_id = this._cfg.entry_id;
    try {
      await this._hass.callWS(req);
    } catch (e) {
      delete this._s.busy[tp];
      this._toast(this._errText(e && (e.code || e.message)), true);
      this._render();
    }
  }

  async _loadDetails(ieee) {
    if (!this._admin() || this._s.details[ieee]) return;
    try {
      const req = { type: `${DOMAIN}/details`, device: ieee };
      if (this._cfg.entry_id) req.entry_id = this._cfg.entry_id;
      this._s.details[ieee] = await this._hass.callWS(req);
    } catch (_e) {
      this._s.details[ieee] = { error: true, entities: [] };
    }
    this._render();
  }

  _arm(key) {
    this._s.confirm = key;
    clearTimeout(this._timers.confirm);
    this._timers.confirm = setTimeout(() => {
      this._s.confirm = null;
      this._render();
    }, 5000);
  }

  _onClick(e) {
    const el = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!el) return;
    const act = el.dataset.act;
    const s = this._s;
    if (act === "backdrop") {
      if (e.target !== el) return;
      s.popup = null;
    } else if (act === "close") s.popup = null;
    else if (act === "tab") {
      s.tab = el.dataset.tab;
      s.filter = "all";
      s.limit = null;
    } else if (act === "chip") s.filter = s.filter === el.dataset.filter ? "all" : el.dataset.filter;
    else if (act === "open") {
      s.popup = el.dataset.dev;
      s.confirm = null;
      if (s.open["p:diag"]) this._loadDetails(s.popup);
    } else if (act === "more") s.limit = (s.limit || Number(this._cfg.max_rows) || 0) + (Number(this._cfg.max_rows) || 30);
    else if (act === "rename") {
      const ieee = s.popup;
      const dev = this._data.devices.find((x) => x.ieee === ieee);
      const val = s.rename[ieee] !== undefined ? s.rename[ieee] : dev ? dev.name : "";
      this._call("rename", { device: ieee, value: val }, `rename:${ieee}`);
      delete s.rename[ieee];
    } else if (act === "remove") {
      const key = `remove:${s.popup}`;
      if (s.confirm !== key) this._arm(key);
      else {
        s.confirm = null;
        this._call("remove", { device: s.popup }, key);
        s.popup = null;
      }
    } else if (act === "install") this._call("install_update", { device: s.popup }, `install:${s.popup}`);
    else if (act === "permit") this._call("permit_join", { duration: s.permitDur }, "permit_join");
    else if (act === "permit_stop") this._call("permit_join", { duration: 0 }, "permit_join");
    else if (act === "app_check") this._call("check_app_update", {}, "check_app_update");
    else if (act === "refresh") this._call("refresh", {}, "refresh");
    else if (act === "check_updates") this._call("check_updates", {}, "check_updates");
    this._render();
  }

  _onInput(e) {
    const t = e.target;
    if (t.dataset.change === "search") {
      this._s.search = t.value;
      this._s.limit = null;
      this._render();
    } else if (t.dataset.change === "rename") this._s.rename[this._s.popup] = t.value;
  }

  _onChange(e) {
    const t = e.target;
    const kind = t.dataset ? t.dataset.change : null;
    if (kind === "sort") {
      this._s.sort = t.value;
      this._render();
    } else if (kind === "permit_dur") this._s.permitDur = Number(t.value) || 60;
    else if (kind === "exp") this._call("exp_set_feature", { value: t.dataset.key, flag: t.checked }, `exp:${t.dataset.key}`);
    else if (kind === "nc_master") this._call("nc_set_master", { flag: t.checked }, "nc_master");
    else if (kind === "nc_type") this._call("nc_set_type", { value: t.dataset.key, flag: t.checked }, `nc:${t.dataset.key}`);
  }

  _onToggle(e) {
    const d = e.target;
    if (!d || !d.dataset || !d.dataset.k) return;
    this._s.open[d.dataset.k] = d.open;
    if (d.dataset.k === "p:diag" && d.open && this._s.popup) this._loadDetails(this._s.popup);
  }
}

// ---------- Karten-Editor ----------
const EDITOR_LABELS = {
  title: "Titel",
  show_title: "Titel anzeigen",
  entry_id: "Eintrag (entry_id)",
  show_devices: "Kategorie ‚Geräte‘ anzeigen",
  show_battery: "Kategorie ‚Batterie‘ anzeigen",
  show_updates: "Kategorie ‚Updates‘ anzeigen",
  show_groups: "Kategorie ‚Gruppen‘ anzeigen",
  show_bridge: "Kategorie ‚Einstellungen‘ anzeigen",
  default_tab: "Starttab",
  max_rows: "Zeilen pro Seite (0 = alle)",
  zoom: "Zoom (%)",
  show_stats: "Statistik-Chips anzeigen",
  show_search: "Suchfeld anzeigen",
  show_filter_bar: "Filter- und Sortierleiste anzeigen",
  default_sort: "Standard-Sortierung",
  show_col_battery: "Spalte Batterie",
  show_col_signal: "Spalte Signal",
  show_col_firmware: "Spalte Firmware",
  show_col_area: "Bereich in der Zweitzeile",
  read_only: "Nur lesen (keine Bedienelemente zum Ändern)",
  show_experimental: "Experimentelle Funktionen anzeigen",
};
const EDITOR_HELPERS = {
  entry_id: "Nur nötig, wenn mehrere ZHA-Manager-Einträge existieren.",
  show_experimental: "Zeigt ungeprüfte Funktionen nur, wenn sie auch in den Optionen der Integration eingeschaltet sind.",
  read_only: "Blendet alle Bedienelemente zum Ändern aus.",
};
const EDITOR_COLOR_LABELS = {
  tab_active: "Aktiver Tab", success: "Grün (online, gut)", warning: "Orange (Warnung)", error: "Rot (offline, Fehler)",
  info: "Blau (Update)", row_icon: "Zeilensymbole (überschreibt alle Kategorien)", live_banner: "Live-Banner",
};

class ZhaManagerCardEditor extends HTMLElement {
  constructor() {
    super();
    this._cfg = {};
    this._hass = null;
    this._info = null;
    this._built = false;
  }

  setConfig(config) {
    this._cfg = { ...config };
    this._update();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._loadInfo();
    this._update();
  }

  async _loadInfo() {
    try {
      this._info = await this._hass.callWS({ type: `${DOMAIN}/info` });
    } catch (_e) {
      this._info = { failed: true };
    }
    this._update();
  }

  _lang() {
    return (this._hass && this._hass.language) || "en";
  }

  _visibleTabs() {
    return TAB_ORDER.filter((k) => (k === "groups" ? !!this._cfg.show_experimental : true));
  }

  _schema() {
    const tabOptions = this._visibleTabs().map((k) => ({ value: k, label: tr(this._lang(), TAB_META[k].label) }));
    const sortOptions = ["name", "status", "battery", "model"].map((k) => ({ value: k, label: tr(this._lang(), `sort_${k}`) }));
    const multi = this._info && this._info.entries && this._info.entries.length > 1;
    const bool = (name) => ({ name, selector: { boolean: {} } });
    const cats = [bool("show_devices"), bool("show_battery"), bool("show_updates")];
    if (this._cfg.show_experimental) cats.push(bool("show_groups"));
    cats.push(bool("show_bridge"), { name: "default_tab", selector: { select: { options: tabOptions, mode: "dropdown" } } });
    const schema = [{ name: "title", selector: { text: {} } }, bool("show_title")];
    if (multi) schema.push({ name: "entry_id", selector: { select: { options: this._info.entries.map((e) => ({ value: e.entry_id, label: e.title })), mode: "dropdown" } } });
    schema.push(
      { type: "expandable", name: "", title: "Kategorien", expanded: true, flatten: true, schema: cats },
      {
        type: "expandable", name: "", title: "Darstellung", flatten: true,
        schema: [
          { name: "max_rows", selector: { number: { min: 0, max: 500, mode: "box" } } },
          { name: "zoom", selector: { number: { min: 50, max: 200, mode: "box" } } },
          bool("show_stats"), bool("show_search"), bool("show_filter_bar"),
          { name: "default_sort", selector: { select: { options: sortOptions, mode: "dropdown" } } },
          { type: "expandable", name: "", title: "Spalten", flatten: true, schema: [bool("show_col_battery"), bool("show_col_signal"), bool("show_col_firmware"), bool("show_col_area")] },
        ],
      },
      { type: "expandable", name: "", title: "Bearbeiten", flatten: true, schema: [bool("read_only")] },
    );
    if (this._info && this._info.experimental_count > 0) schema.push({ type: "expandable", name: "", title: "Experimentell", flatten: true, schema: [bool("show_experimental")] });
    return schema;
  }

  _build() {
    this.innerHTML = `<style>
      .zm-ed .info { margin: 0 0 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--divider-color); font-size: 14px; }
      .zm-ed .info.warn { border-color: var(--warning-color, #ff9800); }
      .zm-ed .info.err { border-color: var(--error-color, #db4437); }
      .zm-ed details { margin-top: 12px; border: 1px solid var(--divider-color); border-radius: 8px; }
      .zm-ed summary { padding: 10px 12px; cursor: pointer; font-weight: 500; }
      .zm-ed .colors { padding: 4px 12px 12px; }
      .zm-ed .crow { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
      .zm-ed .crow label { flex: 1; font-size: 14px; }
      .zm-ed .crow input[type=text] { width: 150px; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .zm-ed .crow input[type=color] { width: 36px; height: 30px; padding: 0; border: 0; background: none; }
      .zm-ed button { padding: 6px 12px; border-radius: 6px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; }
    </style><div class="zm-ed"><div class="info" data-r="info"></div><ha-form></ha-form><details data-r="colors"><summary>Farben</summary><div class="colors"></div></details></div>`;
    this._form = this.querySelector("ha-form");
    this._form.computeLabel = (s) => EDITOR_LABELS[s.name] || s.name;
    this._form.computeHelper = (s) => EDITOR_HELPERS[s.name] || "";
    this._form.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._emit(ev.detail.value);
    });
    this._buildColors();
    this._built = true;
  }

  _colorKeys() {
    const keys = Object.keys(COLOR_CONFIG_KEYS).map((k) => ({ key: `color_${k}`, label: EDITOR_COLOR_LABELS[k] }));
    for (const tab of this._visibleTabs()) keys.push({ key: CATEGORY_ICON_COLOR_KEYS[tab], label: `Symbolfarbe: ${tr(this._lang(), TAB_META[tab].label)}` });
    return keys;
  }

  _buildColors() {
    const box = this.querySelector(".colors");
    box.innerHTML = `${this._colorKeys()
      .map((c) => `<div class="crow"><label>${esc(c.label)}</label><input type="color" data-ck="${c.key}"><input type="text" data-ck="${c.key}" placeholder="Theme-Standard"></div>`)
      .join("")}<button type="button" data-reset>Alle Farben zurücksetzen</button>`;
    box.addEventListener("change", (ev) => {
      const t = ev.target;
      if (!t.dataset || !t.dataset.ck) return;
      const val = sanitizeColor(t.value);
      const next = { ...this._cfg };
      if (val) next[t.dataset.ck] = val;
      else delete next[t.dataset.ck];
      this._emit(next, true);
    });
    box.querySelector("[data-reset]").addEventListener("click", () => {
      const next = { ...this._cfg };
      for (const c of this._colorKeys()) delete next[c.key];
      this._emit(next, true);
    });
  }

  _syncColors() {
    for (const inp of this.querySelectorAll(".colors input[data-ck]")) {
      if (this.contains(document.activeElement) && inp === document.activeElement) continue;
      const val = sanitizeColor(this._cfg[inp.dataset.ck]);
      if (inp.type === "text") inp.value = val;
      else inp.value = /^#[0-9a-fA-F]{6}$/.test(val) ? val : "#000000";
    }
  }

  _emit(value, keepAll) {
    const out = { type: this._cfg.type || `custom:${CARD_TAG}` };
    for (const [k, v] of Object.entries(value || {})) {
      if (k === "type") continue;
      if (keepAll || v !== DEFAULTS[k] || k in this._cfg) out[k] = v;
    }
    this._cfg = out;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: out }, bubbles: true, composed: true }));
    this._update();
  }

  _infoHtml() {
    const i = this._info;
    if (!i) return "…";
    if (i.failed) return `Karte ${esc(CARD_VERSION)} · Integration nicht erreichbar`;
    let cls = "";
    let txt = `Karte ${esc(CARD_VERSION)} · Integration ${esc(i.version)}`;
    if (i.version !== CARD_VERSION) {
      cls = "warn";
      txt += " – Versionen weichen ab (Browser-Cache leeren: Strg+F5)";
    }
    if (i.app && i.app.update_available) {
      cls = "warn";
      txt += ` – neue Version ${esc(i.app.latest_version)} verfügbar. Aktualisiere über HACS und starte Home Assistant neu.`;
    } else if (i.app && i.app.check_failed) {
      cls = cls || "err";
      txt += " – Prüfung nicht möglich";
    }
    this._infoCls = cls;
    return txt;
  }

  _update() {
    if (!this._built) this._build();
    const info = this.querySelector("[data-r=info]");
    this._infoCls = "";
    const html = this._infoHtml();
    if (info.innerHTML !== html) info.innerHTML = html;
    info.className = `info ${this._infoCls}`;
    this._form.hass = this._hass;
    this._form.data = { ...DEFAULTS, ...this._cfg };
    this._form.schema = this._schema();
    this._syncColors();
  }
}

customElements.define(CARD_TAG, ZhaManagerCard);
customElements.define(EDITOR_TAG, ZhaManagerCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TAG,
  name: "ZHA Manager",
  description: "Übersicht und Verwaltung der Zigbee-Geräte von ZHA",
  preview: false,
});
console.info(`%c ZHA-MANAGER-CARD %c ${CARD_VERSION} `, "color:#fff;background:#3b6642;font-weight:700", "color:#3b6642;background:#eef5ef");
