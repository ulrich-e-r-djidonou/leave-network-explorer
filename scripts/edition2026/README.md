# Édition 2026 des données : méthode, sources et contrôle

Ce dossier construit `data/countries-2026.json` (copie identique dans `public/data/`) et en contrôle les chiffres. L'édition est publiée avec le statut `provisional` dans `public/data/years.json` : le site l'affiche avec un bandeau d'avertissement et garde 2025 comme édition par défaut jusqu'à la revue d'Ulrich.

Travail réalisé le 4 octobre 2026 par Claude (Opus 5.5, Claude Code) à la demande d'Ulrich Djidonou, sur la branche `donnees-2026`.

## Sources

| Source | Rôle | Vérification |
|---|---|---|
| Excel LPRN 2023-2026 (`Dobrotic_et_al_LPRNdata_2023_2026.xlsx`), publié sur la page [cross-country comparisons 2026](https://leavenetwork.org/annual-review-reports/cross-country-comparisons-2026) | Durées, taux et indicateurs des congés de maternité, de paternité et parental, années 2025 et 2026 sur la même grille | SHA-256 dans `sources.json`, identique au fichier en ligne téléchargé le 4 octobre 2026 |
| Tableaux comparatifs 1 à 4 et 6 du rapport 2026, extraits par Codex (dépôt `leave-network-md-agy`, commit `70385a6`) | ECEC (tableau 4), changements récents (tableau 6), contrôle indépendant des durées (tableaux 1 à 3) | SHA-256 de chaque CSV dans `sources.json` |
| Notes de pays du rapport 2026 (même extraction) | Fiche du Costa Rica ; justification des écarts déclarés | Citées dans `ecarts_declares_2026.json` et `decisions_2026.json` |
| `data/countries-2025.json` | Base de toutes les fiches existantes | Aucune modification |

Les fichiers sources restent hors du dépôt public. Les scripts les lisent par chemin relatif (`../../leave-network-md-agy/...`) et s'arrêtent si une empreinte diffère.

Citation de l'Excel : Dobrotić, I., Arnalds, A. Á., Kaufman, G., Koslowski, A., Moss, P., and Valentova, M. (2026) *22nd International Review of Leave Policies and Related Research 2026: comparative tables 2023-2026*. DOI : osf.io/qut8e.

Les tableaux comparatifs publiés séparément sur la même page (PDF 1 à 5 et annexe technique, datés du 12 septembre 2026) ont été comparés au rapport complet du 10 septembre : mêmes nombres sur toutes les pages de données. Ils n'apportent rien de plus et ne sont pas utilisés.

## Pourquoi l'Excel LPRN

Les conventions de l'édition 2025 varient selon les pays : maternité avec ou sans part prénatale, congé parental compté par couple ou par parent. Le tableau 1 du rapport ne donne que le postnatal et le tableau 3 compte par couple, si bien qu'aucune formule unique ne relie les fiches 2025 aux tableaux 2026. L'Excel donne les valeurs 2025 et 2026 sur la même grille. On peut donc savoir, champ par champ, si la politique a changé, puis appliquer à la valeur 2026 la relation qui reliait la fiche 2025 à l'Excel 2025.

L'Excel et les tableaux du rapport sont deux sources indépendantes du LPRN. Elles concordent sur 247 des 257 cellules comparables (maternité 92 sur 97, paternité 90 sur 90, parental 65 sur 70) ; les 10 désaccords sont déclarés (contrôle C2, comptes dans `CONTROLE_2026.md`).

## Règles de construction (`construire_2026.py`)

1. **Source inchangée** (cellules Excel 2025 = 2026) : la valeur 2025 est reprise, même si elle s'écarte du LPRN. Corriger seulement 2026 ferait croire à une réforme dans le filtre d'année. Ces écarts hérités sont déclarés au contrôle avec la valeur proposée pour les deux éditions.
2. **Source modifiée** : on cherche la relation qui reliait la fiche 2025 à l'Excel 2025 (identité, ou moitié pour le congé parental compté par parent) et on l'applique à l'Excel 2026. Pour la paternité, la convention semaines / 4,3 est uniforme (90 cellules sur 90 concordantes entre l'Excel et le tableau 2) : elle s'applique même quand la fiche 2025 s'en écartait.
3. **Taux** : une indexation de montant forfaitaire ne change pas les champs. Le caractère « bien payé » (66 % ou plus, définition du LPRN) se lit sur le seul taux légal ; un taux en plage (« 40-100 ») n'est pas interprété.
4. **ECEC** (tableau 4) : une valeur 2025 que le tableau 2026 explique est reprise. Sont acceptés l'âge de la colonne (c) et l'écart (c)-(a) ou (c)-(b), l'édition 2025 ayant employé les deux. Sinon la valeur du tableau 2026 s'applique : âge de la colonne (c) en mois, « .. » pour aucun droit universel, écart (c)-(a). Pour une plage d'écart, on retient l'écart le plus long, qui correspond au congé le plus court, celui du secteur privé (Argentine : 48 − 8 = 40). « 4,7 years » (Chypre) se lit avec une virgule décimale, soit 56 mois, ce que confirme le contrôle arithmétique (c) = (a) + ((c)-(a)).
5. **Changements récents** : remplacés par les entrées du tableau 6, découpées selon ses symboles (✓ introduction, x suppression, ↑ expansion, ↓ réduction, o recalibrage). Le texte est celui du tableau, avec les césures de fin de ligne recollées (« same- sex » devient « same-sex »). Les entrées du Québec sont préfixées « Quebec: » dans la fiche du Canada.
6. **Correction déclarée de l'Excel** (ANO-X001) : quatre séries portent deux lignes « 2025 » et aucune « 2026 » (Québec maternité, Slovaquie maternité et paternité, Japon paternité). La seconde est lue comme 2026.
7. **Costa Rica** : fiche construite à partir de l'Excel 2026 et de la note de pays (détail dans `decisions_2026.json`). Aucune valeur d'indice d'inégalité de genre n'est saisie : le site affiche « N/A », faute de chiffre vérifié.
8. Les champs absents de l'Excel et des tableaux (autres mesures, financement, notes, entités infranationales hors Québec, Argentine et Grèce secteur public) sont repris de 2025, ce que dit le bandeau provisoire.

## Résultat

| Statut | Valeurs |
|---|---|
| `inchange` (source inchangée, ou valeur ECEC 2025 expliquée par le tableau 4) | 1 726 |
| `mis_a_jour` (source modifiée) | 13 |
| `tableau_2026` (ECEC non expliqué par 2025, ou nouvelle fiche) | 37 |
| `nouveau` (fiche Costa Rica) | 1 |

Les 13 mises à jour concernent l'Australie (paiement parental de 22 à 24 semaines, quotas de 2 à 3 semaines), l'Espagne (maternité et paternité de 16 à 19 semaines) et l'Uruguay (paternité de 2,4 à 2,9 semaines). Chacune correspond à un changement du même congé au tableau 6 (contrôle C6). Les 72 changements récents viennent du tableau 6.

Le détail valeur par valeur est dans `provenance_2026.csv` (entité, champ, statut, valeurs 2025 et 2026, règle, cellules Excel, ligne). `A_REVOIR_2026.md` liste les valeurs qui resteraient sans règle applicable ; il n'y en a aucune.

## Contrôle (`controle_2026.py`)

Le contrôle n'importe rien du script de construction. Il confronte le fichier publié aux tableaux du rapport, une source que la construction n'emploie pas pour les durées.

| Contrôle | Objet |
|---|---|
| C0 | Empreintes des sources |
| C1 | Structure : copies identiques, index des éditions, 53 pays, schéma de 2025, bien payé ≤ payé ≤ total |
| C2 | Excel 2026 contre tableaux 1 à 3 du rapport |
| C3 | Fiches 2026 contre tableaux 1 à 3 : égalité pour la paternité, couple ou moitié pour le parental, minorant postnatal pour la maternité |
| C4 | Provenance : tout écart à 2025 est tracé et chaque valeur tracée se retrouve dans le fichier ; tableau 6 repris fidèlement |
| C5 | Auto-test : neuf altérations volontaires doivent chacune faire échouer le contrôle visé |
| C6 | Une durée ne change que si le tableau 6 signale un changement du même congé |
| C7 | ECEC : chaque valeur s'explique par le tableau 4 (lecture indépendante) |

Tout écart de C2 ou C3 doit figurer dans `ecarts_declares_2026.json`, avec sa catégorie, sa justification sourcée et le constat figé, valeurs comprises. Une valeur qui change, ou une déclaration devenue sans objet, fait échouer le contrôle. Résultat au 4 octobre 2026 : zéro erreur, neuf altérations détectées sur neuf, construction reproductible à l'octet. Rapport : `CONTROLE_2026.md`.

## Écarts hérités de 2025 : décisions attendues

Le contrôle déclare 40 écarts entre les fiches et les tableaux du rapport, tous antérieurs à 2026 (l'Excel 2025 et l'Excel 2026 y sont identiques) :

- 27 erreurs probables de l'édition 2025 (`herite_2025`), par exemple la maternité chinoise (98 jours, soit 3,26 mois, contre 2,3), la paternité suédoise (10 jours ouvrables, soit 0,47 mois, contre 0,33), le congé parental norvégien (13,5 contre 14,2) ou le caractère bien payé du congé parental allemand (Elterngeld à 65 %, sous le seuil de 66 % : 0 contre 14, correction à fort effet sur les classements) ;
- 9 conventions de 2025 à confirmer (`convention_2025`), dont le FMLA américain compté comme congé parental et la paternité brésilienne en jours civils ;
- 4 écarts d'arrondi (`arrondi_2025`).

Chaque déclaration porte la valeur proposée pour les deux éditions. Rien n'est appliqué sans l'accord d'Ulrich, puisque la correction toucherait aussi l'édition 2025 publiée. La liste complète, triée par catégorie, figure à la fin de `CONTROLE_2026.md`.

## Commandes

Depuis la racine du dépôt, avec Python et `openpyxl` :

```powershell
python scripts/edition2026/construire_2026.py
python scripts/edition2026/controle_2026.py
npx vitest run
```

Le contrôle sort avec le code 1 à la moindre erreur.

## Bascule vers 2026 (étape 3, après revue)

Après la revue, et une fois les décisions sur les écarts hérités appliquées : passer `status` à `final` et `default` à 2026 dans `data/years.json` et `public/data/years.json`, puis retirer `provisionalNote_fr` et `provisionalNote_en` des métadonnées dans `decisions_2026.json`. Le contrôle C1 refuse qu'une édition provisoire soit l'édition par défaut.
