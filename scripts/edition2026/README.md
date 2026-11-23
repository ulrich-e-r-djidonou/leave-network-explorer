# Édition 2026 : construction et contrôle des données

Ce dossier construit `data/countries-2026.json` (copie identique dans `public/data/`) et en contrôle les chiffres.

## Sources

- Dobrotić, I., Arnalds, A. Á., Kaufman, G., Koslowski, A., Moss, P., and Valentova, M. (2026) *22nd International Review of Leave Policies and Related Research 2026: comparative tables 2023-2026*. DOI : osf.io/qut8e. Fichier `Dobrotic_et_al_LPRNdata_2023_2026.xlsx`, publié sur la page [cross-country comparisons 2026](https://leavenetwork.org/annual-review-reports/cross-country-comparisons-2026).
- Tableaux comparatifs du rapport complet *22nd International Review of Leave Policies and Related Research 2026*.

Les fichiers sources ne sont pas dans le dépôt. Les scripts vérifient leur empreinte SHA-256 (`sources.json`) avant tout traitement.

## Fichiers de travail

Les décisions, la provenance des valeurs et les rapports de construction et de contrôle sont tenus hors du dépôt, dans le dossier indiqué par `sources.json` (`dossier_travail`). Sans ce dossier, les scripts s'arrêtent.

## Commandes

Depuis la racine du dépôt, avec Python et `openpyxl` :

```powershell
python scripts/edition2026/construire_2026.py
python scripts/edition2026/controle_2026.py
npx vitest run
```

Le contrôle sort avec le code 1 à la moindre erreur.
