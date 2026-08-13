---
name: Leave Network Explorer Design System
description: Système de design analytique et comparatif haute précision pour l'exploration des politiques de congés parentaux (LPRN 2025).
colors:
  primary: "#0d9488"
  primary-hover: "#0f766e"
  primary-light: "#ccfbf1"
  secondary: "#4f46e5"
  secondary-light: "#e0e7ff"
  maternity: "#f43f5e"
  maternity-bg: "#fff1f2"
  paternity: "#0284c7"
  paternity-bg: "#f0f9ff"
  parental: "#d97706"
  parental-bg: "#fffbeb"
  neutral-bg: "#f8fafc"
  neutral-dark-bg: "#0f172a"
  surface-light: "#ffffff"
  surface-dark: "#1e293b"
  surface-card-dark: "#1e293b"
  border-light: "#e2e8f0"
  border-dark: "#334155"
  text-primary: "#0f172a"
  text-primary-dark: "#f8fafc"
  text-secondary: "#64748b"
  text-secondary-dark: "#94a3b8"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.775rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  data:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: Leave Network Explorer

## Overview

**Creative North Star: "The Comparative Policy Atelier"**

Leave Network Explorer est un atelier visuel d'analyse socio-économique comparée. L'interface allie la clarté rigoureuse d'une publication de recherche économique (LPRN, OCDE, PNUD) à la fluidité et l'élégance d'un produit numérique contemporain. Chaque élément d'interface, graphique ou indicateur privilégie la clarté cognitive, l'absence de surcharge décorative et une fidélité optimale en mode clair comme en mode sombre.

**Key Characteristics:**
- Clarté sémantique absolue : chaque type de congé possède son code couleur fonctionnel invariable (Maternité = Rose/Framboise `#f43f5e`, Paternité = Bleu azur `#0284c7`, Parental = Ambre chaud `#d97706`).
- Hiérarchie typographique sculptée : titres expressifs et nets en `Plus Jakarta Sans`, corps de texte hautement lisible en `Inter`, métriques et chiffres tabulaires en `JetBrains Mono`.
- Surfaces équilibrées : fonds feutrés en ardoise (`#f8fafc` en clair, `#0f172a` en sombre) avec conteneurs surélevés et bordures discrètes (`#e2e8f0` / `#334155`).
- Mode sombre de premier ordre : aucun contraste criard, palette de gris ardoise naturelle, badges adaptés avec opacités soignées.

## Colors

La palette combine une couleur d'accent analytique (Teal `#0d9488`) pour la navigation et les contrôles clés, une couleur institutionnelle (Indigo `#4f46e5`) pour les distinctions infranationales (Québec RQAP), et des teintes sémantiques strictes pour chaque politique de congé.

### Primary
- **Analytical Teal** (`#0d9488` / hover `#0f766e`) : Couleur principale d'accentuation, états actifs des filtres, indicateurs sélectionnés et boutons primaires.

### Secondary
- **Subnational Indigo** (`#4f46e5` / `#6366f1`) : Identifie les variations infranationales, le spotlight Québec RQAP et les comparaisons institutionnelles.

### Policy Semantic Colors
- **Maternity Rose** (`#f43f5e` / bg `#fff1f2` / dark bg `rgba(244,63,94,0.15)`) : Congés de maternité.
- **Paternity Sky** (`#0284c7` / bg `#f0f9ff` / dark bg `rgba(2,132,199,0.15)`) : Congés de paternité.
- **Parental Amber** (`#d97706` / bg `#fffbeb` / dark bg `rgba(217,119,6,0.15)`) : Congés parentaux.

### Neutral
- **Slate 900** (`#0f172a`) : Fond principal sombre et texte principal clair.
- **Slate 800** (`#1e293b`) : Cartes et surfaces sombres, barre de navigation.
- **Slate 100 / 50** (`#f1f5f9` / `#f8fafc`) : Fonds clairs et zones d'encadrement.
- **Slate 400 / 500** (`#94a3b8` / `#64748b`) : Texte secondaire, légendes et bordures atténuées.

### Named Rules
**The Triple Role Rule.** Les trois couleurs sémantiques (Rose pour la maternité, Bleu pour la paternité, Ambre pour le parental) ne sont jamais utilisées pour d'autres catégories afin de préserver les réflexes visuels de l'utilisateur.

## Typography

**Display & Heading Font:** `Plus Jakarta Sans` (sans-serif géométrique et moderne)
**Body Font:** `Inter` (neutralité et lisibilité maximale à toutes échelles)
**Data / Numeric Font:** `JetBrains Mono` ou `DM Mono` (alignement parfait des chiffres tabulaires)

### Hierarchy
- **Display** (700, `clamp(1.75rem, 3.5vw, 2.5rem)`, 1.15) : Titres des pages principales et chiffres clés majeurs.
- **Headline** (600, `1.35rem`, 1.25) : Titres de sections et d'onglets majeurs.
- **Title** (600, `1.05rem`, 1.35) : Titres de cartes, modals et modules de données.
- **Body** (400, `0.925rem`, 1.55) : Textes descriptifs, explications méthodologiques, notes pays.
- **Label / Micro** (500, `0.775rem`, 1.3) : Badges, en-têtes de colonnes, tooltips et légendes.
- **Data / Metrics** (500/600, `0.875rem`, monospace) : Durées (mois/semaines), taux de remplacement et scores.

### Named Rules
**The Tabular Data Rule.** Tout chiffre dans un tableau, classement ou comparateur doit employer `tabular-nums font-mono` pour assurer un alignement vertical parfait.

## Layout

- Conteneur central fluide plafonné à `max-w-7xl` (1280px) avec espacement latéral généreux (`px-4 sm:px-6`).
- Grille responsive fluide : 1 colonne sur mobile, 2 colonnes sur tablette (`md:`), 3 à 4 colonnes sur écran large (`lg:` / `xl:`).
- Pas de débordement horizontal intempestif (`overflow-x-hidden` sur le body, `overflow-x-auto` sur les conteneurs de tableaux larges).
- Séparation spatiale nette entre les contrôles de filtrage, les graphiques interactifs et les tableaux de détail.

## Elevation & Depth

Le système emploie une stratification tonale douce combinée à des bordures d'un pixel subtiles (`border border-slate-200 dark:border-slate-700/80`). Les ombres sont diffuses et légères (`box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06)` en mode clair), jamais de fausses ombres portées noires opaques.

### Shadow Vocabulary
- **Card Rest** (`0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`) : Élévation par défaut des conteneurs.
- **Card Hover** (`0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)`) : Élévation dynamique au survol des cartes interactives.
- **Modal / Floating Tooltip** (`0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)`) : Popups, menu déroulant et infobulles cartographiques.

## Shapes

- Rayons de courbure harmonieux : `12px` (`rounded-xl`) pour les cartes et conteneurs standards, `16px` (`rounded-2xl`) pour les modals et les blocs de mise en valeur (Spotlight Québec).
- `6px` à `8px` (`rounded-lg`) pour les champs de formulaire, boutons et sélecteurs.
- `9999px` (`rounded-full`) réservé aux badges, filtres de type pilule (pills) et compteurs.

## Components

### Buttons & Filter Pills
- **Primary Action** : Fond `bg-teal-600 hover:bg-teal-700`, texte blanc, transition de 150ms avec micro-translation subtile au clic.
- **Filter Pills** : Fond blanc (`dark:bg-slate-800`), bordure douce, texte ardoise, passant en `bg-teal-600 text-white border-teal-600` lorsqu'activé.

### Data Cards & Country Modals
- Fond `bg-white dark:bg-slate-800`, bordure `border-slate-200 dark:border-slate-700`, titre en `text-slate-900 dark:text-slate-100`.
- Sous-sections de congés avec pastille de couleur sémantique et badge d'état.

### Navigation Header
- Fond `bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md`, bordure inférieure subtile `border-slate-800`, liens avec état actif net (`bg-teal-600 text-white font-medium`).
- Toggles FR/EN et Thème Dark/Light intégrés avec raccourcis accessibles.

### ChatBot Assistant
- Bulle flottante avec icône de message et halo discret, panneau flottant responsive avec header slate, zone de messages bullée (utilisateur = teal, robot = slate) et puce de suggestions rapides.

## Do's and Don'ts

### Do:
- **Do** utiliser systématiquement les classes de mode sombre (`dark:bg-slate-800`, `dark:text-slate-100`, `dark:border-slate-700`) sur chaque conteneur et composant.
- **Do** afficher systématiquement les unités (`mois`, `sem.`, `%`, `/100`) auprès des valeurs numériques.
- **Do** formater les données monétaires et de durée avec la fonction i18n selon la langue active.
- **Do** préserver une cible de toucher d'au moins 44px sur mobile pour les éléments interactifs.

### Don't:
- **Don't** utiliser des fonds blancs non thématisés qui éblouissent en mode sombre.
- **Don't** utiliser des bordures épaisses ou des dégradés saturés criards.
- **Don't** mélanger les couleurs de congé (la maternité est toujours Rose, la paternité toujours Bleu, le parental toujours Ambre).
- **Don't** utiliser des emojis à la place d'icônes vectorielles standardisées (Lucide Icons).
