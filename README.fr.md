[🇩🇪 Deutsch](README.md) · [🇬🇧 English](README.en.md) · [🇳🇱 Nederlands](README.nl.md) · 🇫🇷 Français · [🇪🇸 Español](README.es.md)

# ZHA Manager

Gère les appareils Zigbee de ZHA dans Home Assistant – une intégration avec sa propre carte Lovelace. Même structure que Matter Manager et Zigbee2MQTT Manager.

Fonctions expérimentales : [EXPERIMENTELL.md](EXPERIMENTELL.md) (en allemand)

## État de cette version

**La version 0.0.1 est la première version et n’a pas encore été testée avec du vrai matériel Zigbee ni une vraie installation ZHA.** Elle a été testée avec Home Assistant 2026.2.3 et une entrée ZHA simulée (25 tests automatiques), et la carte avec des données de test dans un environnement de navigateur simulé. Voir « Limitations connues » et [EXPERIMENTELL.md](EXPERIMENTELL.md) (en allemand).

## Fonctionnalités

Fonctions de base (lecture seule, toujours visibles) :

- **Appareils :** liste de tous les appareils ZHA avec état (en ligne/hors ligne), fabricant, modèle, pièce, firmware et batterie ; recherche, filtre, tri ; fenêtre de détails avec sections en accordéon.
- **Batterie :** aperçu des appareils sur batterie avec deux seuils réglables (« faible » et « critique »).
- **Mises à jour :** affiche les mises à jour de firmware disponibles (issues des entités `update` de ZHA).
- **Paramètres (engrenage) :** version de l’application avec avis de mise à jour, état de la connexion, options, journal des événements depuis le démarrage.
- **Capteurs et événements** pour les automatisations (voir ci-dessous).

Fonctions expérimentales (non testées, **masquées** par défaut, voir « Fonctions expérimentales ») : renommer un appareil, supprimer un appareil, autoriser l’appairage (permit join), lancer une mise à jour de firmware / revérifier les mises à jour, détails de la passerelle (LQI, RSSI, dernière activité, type d’appareil, source d’alimentation), vue des groupes, connexion au Notification Center.

## Prérequis

- Home Assistant 2025.6 ou plus récent (Python 3.13).
- L’intégration **ZHA** est configurée. Sans ZHA, la configuration est interrompue.
- Pour l’enregistrement automatique de la carte : Lovelace en mode stockage (par défaut). En mode YAML, ajoute la ressource à la main.

## Installation

1. **HACS :** HACS → Intégrations → ⋮ → Dépôts personnalisés → ajoute `https://github.com/meine-smarte-welt/zha_manager` comme type « Intégration » → télécharge « ZHA Manager » → redémarre Home Assistant.
2. **Manuelle :** copie le dossier `custom_components/zha_manager` dans ton `config/custom_components/` et redémarre Home Assistant.

## Configuration

1. Paramètres → Appareils et services → Ajouter une intégration → **ZHA Manager**.
2. S’il existe plusieurs entrées ZHA, choisis celle voulue. Modifiable plus tard via « Reconfigurer ».
3. La carte est enregistrée automatiquement comme ressource Lovelace au démarrage. Recharge ensuite le navigateur (Ctrl+F5).

## La carte

Ajouter une carte → « ZHA Manager », ou en YAML (voir aussi `examples/card.yaml`) :

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

Catégories (chacune activable/désactivable avec `show_<catégorie>`) : `devices`, `battery`, `updates`, `groups` (seulement avec la fonction expérimentale « Vue des groupes »), `bridge` (engrenage). Autres clés : `title`, `show_title`, `default_tab`, `max_rows`, `zoom`, `show_stats`, `show_search`, `show_filter_bar`, `default_sort`, `show_col_battery`, `show_col_signal`, `show_col_firmware`, `show_col_area`, `read_only`, `show_experimental`, `color_*`. Tout est aussi disponible dans l’éditeur graphique.

`read_only: true` masque tous les éléments de commande qui modifient quelque chose. Les actions d’écriture sont de toute façon réservées aux administrateurs.

## Couleurs

Vide = valeur par défaut du thème. Autorisés : hex, `rgb()`, `hsl()` et `var(--…)` ; les valeurs invalides sont ignorées.

| Clé | Signification |
|---|---|
| `color_tab_active` | Onglet actif |
| `color_success` | En ligne, bon signal, batterie pleine |
| `color_warning` | Batterie faible, signal moyen, mise à jour de l’application |
| `color_error` | Hors ligne, batterie critique, signal faible, erreur |
| `color_info` | Mise à jour de firmware disponible |
| `color_row_icon` | Icônes de ligne (remplace tous les `color_icon_*`) |
| `color_live_banner` | Bandeau des tâches en cours |
| `color_icon_<catégorie>` | Couleur d’icône par catégorie |

## Services

| Service | Effet |
|---|---|
| `zha_manager.refresh` | Relire les données. |
| `zha_manager.check_firmware_updates` | Revérifier les mises à jour de firmware (**expérimental** ; renvoie une erreur tant que la fonction est désactivée). |

Les deux services ont le champ facultatif `entry_id`.

## Événements

Les événements sont envoyés sur le bus d’événements de Home Assistant (désactivables dans les options). Au démarrage et après le chargement de ZHA, seul l’état initial est lu – pas de déluge d’événements.

| Événement | Quand |
|---|---|
| `zha_manager_device_offline` | Appareil plus joignable (après le délai réglé). |
| `zha_manager_device_online` | Appareil de nouveau joignable. |
| `zha_manager_battery_low` | Batterie sous un seuil ; `state` vaut `low` ou `critical`. |
| `zha_manager_update_available` | Nouvelle mise à jour de firmware pour un appareil. |
| `zha_manager_device_joined` | Nouvel appareil dans ZHA. |
| `zha_manager_device_left` | Appareil retiré de ZHA. |

Exemples d’automatisations : `examples/automations.yaml`.

## Capteurs

Cinq capteurs de synthèse (détails en attribut) : appareils, hors ligne, batterie faible, batterie critique, mises à jour de firmware.

## Affichage de la version et avis de mise à jour

- La version apparaît à trois endroits : carte → engrenage → « Version de l’application », en haut de l’éditeur de carte et dans la fenêtre des options.
- L’intégration interroge GitHub au démarrage puis toutes les 12 heures pour connaître la dernière version. Une nouvelle version est mise en évidence en orange (« ↑ » sur l’engrenage).
- Mets à jour via HACS, redémarre Home Assistant, puis recharge le navigateur (Ctrl+F5).
- Si GitHub est injoignable, il est indiqué « Vérification impossible » ; la carte continue de fonctionner. Tant qu’il n’existe aucune version publiée, l’affichage reste vide (« – »).

## Paramètres

Paramètres → Appareils et services → ZHA Manager → Configurer :

| Option | Par défaut | Signification |
|---|---|---|
| Seuil « batterie faible » | 20 % | À partir d’ici la batterie est faible (orange). |
| Seuil « batterie critique » | 10 % | Doit être inférieur ou égal à « faible » (rouge). |
| Délai avant « hors ligne » | 0 s | 0 = immédiatement dès que l’appareil est signalé injoignable. |
| Envoyer les événements | oui | Active/désactive les événements ci-dessus. |
| Afficher les fonctions expérimentales | non | Interrupteur principal, voir la section suivante. |

## Fonctions expérimentales

- Tout ce qui n’est pas confirmé sur du vrai matériel est **expérimental** : masqué par défaut et silencieux côté backend (aucune action, événement ni notification).
- Activer : Options → « Afficher les fonctions expérimentales » → choisis les fonctions une par une à la deuxième étape (chacune est désactivée par défaut). Dans la carte aussi : éditeur → « Expérimental » → `show_experimental`.
- La liste de ces fonctions et ce qu’il faut tester figure dans [EXPERIMENTELL.md](EXPERIMENTELL.md) (en allemand).

### Notification Center

La connexion au Notification Center (interface schéma 1 : batterie critique, appareil hors ligne, batterie faible, mise à jour disponible, appareil ajouté, appareil retiré) est **expérimentale** et n’a pas été testée avec un vrai Notification Center. Elle n’envoie que si l’interrupteur principal **et** son propre interrupteur « Notification Center » sont activés (par défaut : désactivé).

## Sécurité

- Les actions d’écriture (renommer, supprimer, appairer, installer des mises à jour) sont réservées aux administrateurs et ne fonctionnent qu’avec la fonction expérimentale activée.
- Les actions risquées demandent deux clics dans la carte (pas de boîtes de dialogue du navigateur).
- Les saisies sont vérifiées côté backend (longueur, type, appareils connus). Le coordinateur ne peut pas être supprimé.
- Tous les textes de la carte sont échappés ; les couleurs passent par une liste autorisée.
- Le téléchargement de diagnostic ne contient ni noms, ni adresses, ni identifiants, ni données d’accès. Les liens de version ne s’affichent que s’ils commencent par `https://github.com/`.

## Limitations connues

- **Non testé sur du vrai matériel.** Ni les fonctions de base ni les fonctions expérimentales n’ont été essayées avec une vraie clé Zigbee, de vrais appareils ou la vraie interface de Home Assistant.
- L’état en ligne provient de l’état des entités d’appareil dans Home Assistant (« indisponible »). Des données plus précises de la passerelle n’existent qu’avec la fonction expérimentale « Détails de la passerelle ».
- « Détails de la passerelle » et « Vue des groupes » utilisent l’interface interne de ZHA. Elle n’est pas garantie stable ; si ZHA change, ces fonctions peuvent cesser de marcher alors que le reste continue.
- Les seuils de couleur pour LQI/RSSI sont des valeurs indicatives, pas des valeurs de fabricant.
- Les traductions (nl, fr, es) sont automatiques et n’ont pas été vérifiées par des locuteurs natifs. Les corrections sont les bienvenues.
- Il n’y a pas encore de captures d’écran ni de version publiée sur GitHub.

## Dépannage

- **La carte n’apparaît pas :** recharge le navigateur (Ctrl+F5). En mode YAML, ajoute toi-même la ressource `/zha_manager_files/zha-manager-card.js?v=0.0.1` (type « module »).
- **« ZHA non configuré » lors de la configuration :** configure d’abord l’intégration ZHA.
- **Tous les appareils sans état :** ZHA n’est pas chargé ; l’état est alors inconnu, pas « hors ligne ».
- **Signaler un bug :** joins le téléchargement de diagnostic (anonymisé) de l’intégration et ouvre un ticket sur GitHub.

## Historique des versions

- **0.0.1** (2026-11-08): Première version. Liste des appareils, batterie, vue des mises à jour, paramètres, capteurs, événements, cinq langues ; fonctions expérimentales masquées.

## Intégrité des fichiers

Chaque fichier `.py`, `.js` et `.yaml` porte sur sa première ligne un hash SHA-256 du contenu à partir de la ligne 2. Vérifier : `tail -n +2 fichier.py | sha256sum`. Les images sont exclues.

Le tableau des hashes des fichiers JSON se trouve dans le [README.md](README.md#datei-integrität) allemand.

## Licence

MIT, voir [LICENSE](LICENSE).
