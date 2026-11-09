[🇩🇪 Deutsch](README.md) · [🇬🇧 English](README.en.md) · [🇳🇱 Nederlands](README.nl.md) · [🇫🇷 Français](README.fr.md) · 🇪🇸 Español

# ZHA Manager

Gestiona los dispositivos Zigbee de ZHA en Home Assistant: una integración con su propia tarjeta Lovelace. Misma estructura que Matter Manager y Zigbee2MQTT Manager.

Funciones experimentales: [EXPERIMENTELL.md](EXPERIMENTELL.md) (en alemán)

## Estado de esta versión

**La versión 0.0.1 es la primera versión y todavía no se ha probado con hardware Zigbee real ni con una instalación real de ZHA.** Se probó con Home Assistant 2026.2.3 y una entrada ZHA simulada (25 pruebas automáticas), y la tarjeta con datos de prueba en un entorno de navegador simulado. Consulta «Limitaciones conocidas» y [EXPERIMENTELL.md](EXPERIMENTELL.md) (en alemán).

## Funciones

Funciones básicas (solo lectura, siempre visibles):

- **Dispositivos:** lista de todos los dispositivos ZHA con estado (en línea/sin conexión), fabricante, modelo, área, firmware y batería; búsqueda, filtro, orden; ventana de detalles con secciones de acordeón.
- **Batería:** resumen de los dispositivos con batería con dos umbrales ajustables («baja» y «crítica»).
- **Actualizaciones:** muestra las actualizaciones de firmware disponibles (de las entidades `update` de ZHA).
- **Ajustes (engranaje):** versión de la aplicación con aviso de actualización, estado de la conexión, opciones, registro de eventos desde el inicio.
- **Sensores y eventos** para automatizaciones (ver abajo).

Funciones experimentales (sin probar, **ocultas** por defecto, ver «Funciones experimentales»): renombrar dispositivo, eliminar dispositivo, permitir emparejamiento (permit join), iniciar actualización de firmware / volver a comprobar actualizaciones, detalles de la pasarela (LQI, RSSI, última vez visto, tipo de dispositivo, fuente de alimentación), vista de grupos, conexión con el Notification Center.

## Requisitos

- Home Assistant 2025.6 o superior (Python 3.13).
- La integración **ZHA** está configurada. Sin ZHA, la configuración se cancela.
- Para el registro automático de la tarjeta: Lovelace en modo almacenamiento (por defecto). En modo YAML, añade el recurso a mano.

## Instalación

1. **HACS:** HACS → Integraciones → ⋮ → Repositorios personalizados → añade `https://github.com/meine-smarte-welt/zha_manager` como tipo «Integración» → descarga «ZHA Manager» → reinicia Home Assistant.
2. **Manual:** copia la carpeta `custom_components/zha_manager` en tu `config/custom_components/` y reinicia Home Assistant.

## Configuración

1. Ajustes → Dispositivos y servicios → Añadir integración → **ZHA Manager**.
2. Si existen varias entradas ZHA, elige la que quieras. Se puede cambiar después con «Reconfigurar».
3. La tarjeta se registra automáticamente como recurso de Lovelace al iniciar. Después recarga el navegador (Ctrl+F5).

## La tarjeta

Añadir tarjeta → «ZHA Manager», o en YAML (ver también `examples/card.yaml`):

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

Categorías (cada una se activa/desactiva con `show_<categoría>`): `devices`, `battery`, `updates`, `groups` (solo con la función experimental «Vista de grupos»), `bridge` (engranaje). Otras claves: `title`, `show_title`, `default_tab`, `max_rows`, `zoom`, `show_stats`, `show_search`, `show_filter_bar`, `default_sort`, `show_col_battery`, `show_col_signal`, `show_col_firmware`, `show_col_area`, `read_only`, `show_experimental`, `color_*`. Todo está también en el editor gráfico.

`read_only: true` oculta todos los controles que modifican algo. Las acciones de escritura son solo para administradores de todos modos.

## Colores

Vacío = valor del tema. Permitidos: hex, `rgb()`, `hsl()` y `var(--…)`; los valores no válidos se descartan.

| Clave | Significado |
|---|---|
| `color_tab_active` | Pestaña activa |
| `color_success` | En línea, buena señal, batería llena |
| `color_warning` | Batería baja, señal media, actualización de la aplicación |
| `color_error` | Sin conexión, batería crítica, señal débil, error |
| `color_info` | Actualización de firmware disponible |
| `color_row_icon` | Iconos de fila (sustituye a todos los `color_icon_*`) |
| `color_live_banner` | Banner de tareas en curso |
| `color_icon_<categoría>` | Color de icono por categoría |

## Servicios

| Servicio | Efecto |
|---|---|
| `zha_manager.refresh` | Volver a leer los datos. |
| `zha_manager.check_firmware_updates` | Volver a comprobar las actualizaciones de firmware (**experimental**; devuelve un error mientras la función esté desactivada). |

Ambos servicios tienen el campo opcional `entry_id`.

## Eventos

Los eventos se envían al bus de eventos de Home Assistant (se pueden desactivar en las opciones). Al iniciar y tras cargar ZHA solo se lee el estado inicial: no hay avalancha de eventos.

| Evento | Cuándo |
|---|---|
| `zha_manager_device_offline` | El dispositivo ya no es alcanzable (tras el retardo configurado). |
| `zha_manager_device_online` | El dispositivo vuelve a ser alcanzable. |
| `zha_manager_battery_low` | Batería por debajo de un umbral; `state` es `low` o `critical`. |
| `zha_manager_update_available` | Nueva actualización de firmware para un dispositivo. |
| `zha_manager_device_joined` | Nuevo dispositivo en ZHA. |
| `zha_manager_device_left` | Dispositivo eliminado de ZHA. |

Ejemplos de automatizaciones: `examples/automations.yaml`.

## Sensores

Cinco sensores de resumen (detalles como atributo): dispositivos, sin conexión, batería baja, batería crítica, actualizaciones de firmware.

## Visualización de la versión y aviso de actualización

- La versión aparece en tres lugares: tarjeta → engranaje → «Versión de la aplicación», arriba en el editor de la tarjeta y en el diálogo de opciones.
- La integración consulta a GitHub la última versión al iniciar y luego cada 12 horas. Una versión nueva se resalta en naranja («↑» en el engranaje).
- Actualiza con HACS, reinicia Home Assistant y recarga después el navegador (Ctrl+F5).
- Si GitHub no está accesible, aparece «Comprobación no posible»; la tarjeta sigue funcionando. Mientras no exista ninguna versión publicada, la indicación queda vacía («–»).

## Ajustes

Ajustes → Dispositivos y servicios → ZHA Manager → Configurar:

| Opción | Por defecto | Significado |
|---|---|---|
| Umbral «batería baja» | 20 % | Desde aquí la batería se considera baja (naranja). |
| Umbral «batería crítica» | 10 % | Debe ser menor o igual que «baja» (rojo). |
| Retardo hasta «sin conexión» | 0 s | 0 = de inmediato en cuanto se informa de que el dispositivo no es alcanzable. |
| Enviar eventos | sí | Activa/desactiva los eventos anteriores. |
| Mostrar funciones experimentales | no | Interruptor principal, ver la sección siguiente. |

## Funciones experimentales

- Todo lo que no esté confirmado en hardware real se considera **experimental**: oculto por defecto y silencioso en el backend (sin acciones, eventos ni avisos).
- Activar: Opciones → «Mostrar funciones experimentales» → en el segundo paso elige funciones individuales (cada una desactivada por defecto). En la tarjeta también: editor → «Experimental» → `show_experimental`.
- Qué funciones son y qué hay que probar figura en [EXPERIMENTELL.md](EXPERIMENTELL.md) (en alemán).

### Notification Center

La conexión con el Notification Center (interfaz esquema 1: batería crítica, dispositivo sin conexión, batería baja, actualización disponible, dispositivo añadido, dispositivo eliminado) es **experimental** y no se ha probado con un Notification Center real. Solo envía si el interruptor principal **y** su propio interruptor «Notification Center» están activados (por defecto: desactivado).

## Seguridad

- Las acciones de escritura (renombrar, eliminar, emparejar, instalar actualizaciones) son solo para administradores y solo funcionan con la función experimental activada.
- Las acciones arriesgadas requieren dos clics en la tarjeta (sin diálogos del navegador).
- Las entradas se validan en el backend (longitud, tipo, dispositivos conocidos). El coordinador no se puede eliminar.
- Todos los textos de la tarjeta se escapan; los colores pasan por una lista permitida.
- La descarga de diagnóstico no contiene nombres, direcciones, ID ni credenciales. Los enlaces de versión solo se muestran si empiezan por `https://github.com/`.

## Limitaciones conocidas

- **No probado en hardware real.** Ni las funciones básicas ni las experimentales se han probado con un stick Zigbee real, dispositivos reales o la interfaz real de Home Assistant.
- El estado en línea procede del estado de las entidades del dispositivo en Home Assistant («no disponible»). Datos más precisos de la pasarela solo existen con la función experimental «Detalles de la pasarela».
- «Detalles de la pasarela» y «Vista de grupos» usan la interfaz interna de ZHA. No está garantizada su estabilidad; si ZHA cambia, estas funciones pueden dejar de funcionar mientras el resto sigue.
- Los límites de color para LQI/RSSI son valores orientativos, no valores del fabricante.
- Las traducciones (nl, fr, es) son automáticas y no las han revisado hablantes nativos. Se agradecen las correcciones.
- Todavía no hay capturas de pantalla ni versión publicada en GitHub.

## Solución de problemas

- **La tarjeta no aparece:** recarga el navegador (Ctrl+F5). En modo YAML añade tú mismo el recurso `/zha_manager_files/zha-manager-card.js?v=0.0.1` (tipo «module»).
- **«ZHA no configurado» al configurar:** configura primero la integración ZHA.
- **Todos los dispositivos sin estado:** ZHA no está cargado; entonces el estado es desconocido, no «sin conexión».
- **Informar de un error:** adjunta la descarga de diagnóstico (anonimizada) de la integración y abre una incidencia en GitHub.

## Historial de versiones

- **0.0.1** (2026-11-08): Primera versión. Lista de dispositivos, batería, vista de actualizaciones, ajustes, sensores, eventos, cinco idiomas; funciones experimentales ocultas.

## Integridad de los archivos

Cada archivo `.py`, `.js` y `.yaml` lleva en la primera línea un hash SHA-256 del contenido a partir de la línea 2. Comprobar: `tail -n +2 archivo.py | sha256sum`. Las imágenes quedan excluidas.

La tabla de hashes de los archivos JSON está en el [README.md](README.md#datei-integrität) alemán.

## Licencia

MIT, ver [LICENSE](LICENSE).
