# Leave Network Explorer

[![Deploy to GitHub Pages](https://github.com/ulrich-e-r-djidonou/leave-network-explorer/actions/workflows/deploy.yml/badge.svg)](https://github.com/ulrich-e-r-djidonou/leave-network-explorer/actions/workflows/deploy.yml)
[![Lighthouse CI & Accessibility Audit](https://github.com/ulrich-e-r-djidonou/leave-network-explorer/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/ulrich-e-r-djidonou/leave-network-explorer/actions/workflows/lighthouse.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg)](https://vitejs.dev/)

Application web interactive de visualisation et d'analyse comparative des politiques de congés parentaux (maternité, paternité, parental, garde d'enfants) dans 52 pays et plus de 60 entités infranationales.

Base de données issue de l'*International Review of Leave Policies and Research 2025* publiée par le Leave Policy Research Network (LPRN).

**Site en ligne :** [https://djidonou.com/leave-network-explorer/](https://djidonou.com/leave-network-explorer/)

---

## Fonctionnalités principales

1. **Carte mondiale interactive (Choroplèthe Leaflet)**
   - Visualisation de 10 indicateurs clés (durées totales, durées bien payées, générosité ETP, égalité des genres, maintien des droits à la retraite).
   - Infobulles typographiées et légende dynamique en verre acrylique.

2. **Module infranational & Plein feu sur le Québec (RQAP)**
   - Cartographie des régimes provinciaux, d'États et cantonaux.
   - Tableau comparatif dédié mettant en lumière le Régime québécois d'assurance parentale face au programme fédéral canadien (Assurance-Emploi).

3. **Calculateur de score personnalisé**
   - Pondération sur mesure des dimensions (durée, niveau d'indemnisation, flexibilité, passerelle avec la petite enfance).
   - Classement dynamique en temps réel avec indicateurs de podium.

4. **Analyses multidimensionnelles**
   - Nuage de points interactif croisant l'indice de générosité (ETP) et l'indice d'inégalité de genre (GII du PNUD).
   - Analyse des écarts entre fin de congé parental et âge d'admissibilité aux services de garde (ECEC).
   - Baromètre des réformes 2024-2025 classées par nature (expansion, introduction, recalibrage, réduction).

5. **Comparateur multi-pays & Assistant conversationnel**
   - Comparaison simultanée jusqu'à 10 entités avec graphique radar et export d'images PNG.
   - Assistant intégré pour explorer les données et répondre aux requêtes en français et en anglais.

---

## Stack technique & Performance

- **Frontend :** React 19, TypeScript, TailwindCSS v4, React-Leaflet, Recharts, Lucide Icons.
- **Design System :** Système Impeccable (*The Comparative Policy Atelier*), typographies *Plus Jakarta Sans*, *Inter* et *JetBrains Mono*.
- **Performance :** Découpage dynamique des modules (*code splitting* avec *manualChunks* Vite et `React.lazy`), bundle initial allégé à 44 kB.
- **Accessibilité & Qualité :** Audits automatisés Lighthouse CI avec seuils stricts sur l'accessibilité (>= 90 %) et les bonnes pratiques web.

---

## Installation et développement local

```bash
# Cloner le dépôt
git clone https://github.com/ulrich-e-r-djidonou/leave-network-explorer.git
cd leave-network-explorer

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Exécuter la suite de tests unitaires (Vitest)
npm test

# Valider la compilation de production
npm run build
```

---

## Outils d'ingestion et maintenance

Le dossier `scripts/` inclut l'outil automatisé pour intégrer et valider les futures éditions de la revue LPRN :

```bash
# Valider l'intégrité de la base de données actuelle
python scripts/ingest_lprn_edition.py --validate public/data/countries.json

# Comparer deux éditions annuelles
python scripts/ingest_lprn_edition.py --diff public/data/countries.json --compare-with data/backup_2025.json
```

---

## Citation & Référence

Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.) (2025). *International Review of Leave Policies and Research 2025*. Leave Policy Research Network.

Conçu et développé par **Ulrich Djidonou**, économiste-chercheur.
