# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier. Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Non publié] - 2026-08-13

### Résumé
Ajout de la suite de tests unitaires pour le moteur conversationnel, configuration des métadonnées et bannières Open Graph pour les réseaux sociaux, mise en place d'un moniteur de publication LPRN automatisé et révision complète de la documentation.

### Ajouté
- Suite de tests unitaires Vitest `src/utils/chatEngine.test.ts` (28 tests validés avec succès) couvrant la détection d'intentions multilingues, les requêtes pays, les comparaisons et les superlatifs.
- Image de prévisualisation Open Graph `public/og-image.jpg` et balises méta `og:image` / `twitter:image` dans `index.html` pour les partages LinkedIn et réseaux sociaux.
- Workflow GitHub Actions programmé `.github/workflows/check-lprn-updates.yml` vérifiant deux fois par mois la sortie de nouvelles éditions sur le site officiel du Leave Policy Research Network.
- Refonte complète de `README.md` avec badges de statut GitHub Actions, présentation des fonctionnalités, guide d'installation et citation scientifique.
- Script de test `npm test` dans `package.json`.
- Découpage dynamique des paquets JavaScript (*manualChunks* dans `vite.config.ts` et `React.lazy`/`Suspense` dans `src/App.tsx`), réduisant la taille du bundle initial de 1 158 kB à seulement 44 kB.
- Configuration Lighthouse CI (`.lighthouserc.json`) et workflow GitHub Actions (`.github/workflows/lighthouse.yml`) pour les audits automatisés d'accessibilité et de performance.
- Script d'ingestion et de validation automatique `scripts/ingest_lprn_edition.py` pour traiter, valider et comparer les futures éditions annuelles de la revue LPRN.
- Spécification produit `PRODUCT.md` et système de design `DESIGN.md` selon les standards Impeccable.

### Modifié
- `src/index.css` : configuration complète des variables de thème `@theme`, variantes dark mode, styles Leaflet et barres de défilement fines.
- `src/components/Layout/Header.tsx` : navigation avec effet de verre (glassmorphism), indicateur de page active, sélecteur de langue et bascule de thème clair/sombre.
- `src/components/Country/CountryDetail.tsx` : refonte complète en mode clair et sombre avec cartes de score tabulaires, badges de congé et section infranationales.
- `src/components/Country/LeaveTimeline.tsx` : barres de progression temporelles adaptatives avec contraste élevé.
- `src/components/Country/CountryList.tsx` : liste filtrable avec défilement fluide, recherche avec bouton d'effacement et badges régionaux.
- `src/components/Map/WorldMap.tsx` & `src/components/Map/SubnationalMap.tsx` : infobulles typographiées, légendes flottantes en verre acrylique et infobulle permanente pour le Québec (RQAP).
- `src/components/Map/StatsBar.tsx` & `src/components/Map/IndicatorSelector.tsx` : cartes statistiques avec chiffres en police monospace et pilules de sélection actives.
- `src/components/Filters/RankingsView.tsx` : graphique en barres réactif Recharts avec infobulles stylisées et tableau paginé.
- `src/components/Compare/CompareView.tsx` : comparateur multi-pays jusqu'à 10 entités avec graphique radar, graphiques en barres individuels par type de congé et export PNG.
- `src/components/Analytics/AnalyticsView.tsx` : nuage de points interactif (Scatter Plot) avec filtrage par région, analyse des écarts de garde ECEC et baromètre des réformes.
- `src/components/ChatBot/ChatBot.tsx` : interface du chatbot avec bulles asymétriques, mode sombre et suggestions en pilules cliquables.
- `src/pages/SubnationalPage.tsx` : bloc vedette du RQAP québécois avec tableau comparatif détaillé à 3 colonnes et cartes d'entités fédérales.
- `src/pages/DataTablePage.tsx` : tableau complet triable avec colonnes figées (sticky) et export CSV encodé UTF-8 avec BOM.
- `src/pages/CustomScorePage.tsx` : curseurs pondérés interactifs et classement dynamique avec médailles.
- `src/pages/ReformsPage.tsx`, `AboutPage.tsx`, `ContactPage.tsx`, `MethodologyPage.tsx`, `CountryPage.tsx` : révision des contrastes, alignements et formules mathématiques.

### Corrigé
- Prise en charge 100 % cohérente du mode sombre sur tous les conteneurs, formulaires, graphiques et fenêtres modales.
- Typographie tabulaire sur toutes les métriques numériques pour éliminer les décalages visuels.
