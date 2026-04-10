# Journal des corrections de donnees — Leave Network Explorer

Source : Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.)
International Review of Leave Policies and Research 2025.

Derniere mise a jour : 2026-04-10

---

## Regles de conversion

| Conversion | Formule |
|-----------|---------|
| Semaines vers mois | semaines / 4.3 |
| Jours calendaires vers mois | jours / 30.1 |
| Jours ouvrables vers mois | jours * (7/5) / 30.1 |
| Precision | 2 decimales max |

Source de la regle : notes sous Tables 1-3 du LPRN ("4.3 weeks = 1 month", "7 calendar days = 1 week").

---

## Phase 1 : Correction systematique des conversions (2026-04-10)

### Probleme identifie

Les donnees originales utilisaient 1 mois = 4 semaines au lieu de 4.3 semaines.
Toutes les valeurs inferieures a 1 mois etaient aussi affichees en semaines, masquant la precision.

### Changement de code

**`src/utils/calculations.ts`** — `formatDuration()` : tout est desormais affiche en mois (plus de semaines), avec jusqu'a 2 decimales.

### 88 corrections de valeurs dans countries.json

#### Paternite (Table 2 — source en semaines, converti en mois)

| Pays | ISO2 | Ancien | Nouveau | Calcul |
|------|------|--------|---------|--------|
| Suede | SE | 0.30 | 0.33 | 10 jours / 30.1 |
| Bresil | BR | 0.12 | 0.17 | 5 jours / 30.1 |
| Bulgarie | BG | 2.50 | 0.49 | 15 jours / 30.1 (excluait incorrectement 2 mois de conge supplementaire) |
| Afrique du Sud | ZA | 0.30 | 0.33 | 10 jours / 30.1 |
| Slovaquie | SK | 6.50 | 6.51 | 28 sem / 4.3 |
| Uruguay | UY | 0.60 | 0.44 | 1.9 sem / 4.3 |
| Espagne | ES | 3.70 | 3.72 | 16 sem / 4.3 |

##### Pays "2 semaines" (0.50 -> 0.47) — 17 pays

Australie, Bosnie-Herzegovine, Chili, Colombie, Croatie, Chypre, Danemark, Grece, Irlande, Italie, Malte, Nouvelle-Zelande, Norvege, Pologne, Suisse, Royaume-Uni, Vietnam

##### Pays "4 semaines" (0.90 -> 0.93) — 4 pays

Belgique, France, Japon, Coree du Sud

##### Pays "1 semaine" (0.20 -> 0.23) — 7 pays

Mexique, Turquie, Vietnam, Chine, Inde, Philippines, Argentine

##### Pays "3 semaines" (0.70 -> 0.70) — pas de changement

##### Autres corrections mineures de paternite

| Pays | ISO2 | Ancien | Nouveau | Calcul |
|------|------|--------|---------|--------|
| Estonie | EE | 0.70 | 0.70 | 3 sem / 4.3 = 0.698 arrondi a 0.70 |
| Islande | IS | 1.40 | 1.40 | 6 sem / 4.3 = 1.395 arrondi a 1.40 |
| Luxembourg | LU | 2.30 | 2.33 | 10 sem / 4.3 |
| Lettonie | LV | 0.50 | 0.47 | 2 sem / 4.3 |

#### Maternite — corrections mineures

| Pays | ISO2 | Champ | Ancien | Nouveau | Calcul |
|------|------|-------|--------|---------|--------|
| Suede | SE | total | 0.50 | 0.47 | 2 sem / 4.3 |

#### Parental — corrections mineures

| Pays | ISO2 | Champ | Ancien | Nouveau | Calcul |
|------|------|-------|--------|---------|--------|
| Afrique du Sud | ZA | total | 0.30 | 0.33 | 10 jours / 30.1 |

---

## Phase 2 : Audit maternite et parental (2026-04-10)

Audit systematique des Tables 1 (maternite) et 3 (parental) contre le document source.

### Conventions identifiees

1. **Maternite** : le JSON stocke le total (prenatal + postnatal). Table 1 ne montre que le postnatal. C'est un choix de design, pas une erreur.
2. **Parental** : le JSON stocke par parent (pas par couple). Pour les droits individuels, c'est correct. Pour les droits familiaux, la valeur totale du couple est utilisee.

### Corrections appliquees

| # | Pays | ISO2 | Champ | Ancien | Nouveau | Source / justification |
|---|------|------|-------|--------|---------|----------------------|
| 1 | Coree du Sud | KR | maternity total/paid/wellPaid | 2.10 | 2.99 | 90 jours calendaires (p.8153 du LPRN). 90/30.1 = 2.99 |
| 2 | Argentine | AR | maternity total/paid/wellPaid | 2.10 | 2.99 | 90 jours calendaires (p.3431 du LPRN). 90/30.1 = 2.99 |
| 3 | Irlande | IE | parental total | 6.00 | 8.14 | 26 sem (Parental) + 9 sem (Parent's Leave) = 35 sem. 35/4.3 = 8.14 |
| 4 | Irlande | IE | parental paid | 0.00 | 2.09 | Parent's Leave: 9 sem a 289 EUR/sem (p.7636). 9/4.3 = 2.09 |
| 5 | Irlande | IE | parental paymentType | unpaid | mixed | Combine Parental (unpaid) et Parent's Leave (paid) |
| 6 | Pays-Bas | NL | parental wellPaid | 0.00 | 2.09 | 9 sem a 70% des revenus (p.9684). 70% > 66% = well-paid. 9/4.3 = 2.09 |
| 7 | Pays-Bas | NL | parental paid | 2.10 | 2.09 | Correction mineure d'arrondi (9/4.3 = 2.093) |
| 8 | France | FR | parental paid | 36.00 | 6.00 | Table 3 LPRN base sur 1er enfant. PreParE 1er enfant = 6 mois/parent (12 mois couple). 2e enfant+ = 24 mois/parent (36 mois couple). Voir note detaillee ci-dessous |

#### Note detaillee : France parental paid

La Table 3 du LPRN specifie "the first child entitlements" comme base de comparaison.
Pour la France, la duree du versement PreParE varie selon le rang de naissance :

| Rang | Par parent | Total couple | Notes |
|------|-----------|-------------|-------|
| 1er enfant | 6 mois | 12 mois | Base de reference Table 3 |
| 2e enfant+ | 24 mois | 36 mois | Partage obligatoire : un parent max 24 mois |

Le JSON stocke 6 mois (par parent, 1er enfant) pour etre coherent avec la base
de comparaison internationale de la Table 3 du LPRN.

Le montant du PreParE est un forfait (456 EUR/mois en 2025), donc wellPaid = 0.

### Corrections ecartees (apres verification)

| Pays | ISO2 | Champ | Suggestion audit | Decision | Raison |
|------|------|-------|-----------------|----------|--------|
| Danemark | DK | parental wellPaid | 0 -> 6.5 | Conserve 0 | Plafond DKK 4,865/sem = taux effectif souvent < 66% pour revenus moyens/hauts |

### Anomalies investiguees et corrigees (Phase 2b)

| # | Pays | ISO2 | Champ | Ancien | Nouveau | Source / justification |
|---|------|------|-------|--------|---------|----------------------|
| 9 | Estonie | EE | parental paid/wellPaid | 15.6 | 15.8 | 475 jours a 100%. Table LPRN = 15.8 (475/30 = 15.83). Ancien calcul utilisait 475/30.4 = 15.6 |
| 10 | Slovaquie | SK | parental wellPaid | 0 | 6.5 | 28 sem a 75% (prestation maternite pour peres pendant conge parental). Table LPRN = 6.5*. 75% > 66% = well-paid |
| 11 | Slovaquie | SK | parental paymentType | flat-rate | mixed | Combine flat-rate (482 EUR/mois) et prestation maternite a 75% |
| 12 | Lettonie | LV | parental wellPaid | 1.9 | 0 | Deux options : 43.75% (19 mois) ou 60% (13 mois). Les deux < 66%. Table LPRN = 0 |
| 13 | Lituanie | LT | parental wellPaid | 12 | 18 | Option A : 77.34% du net pendant 18 mois (couple). 77.34% > 66%. Table LPRN = 18* |

---

## Phase 3 : Ajout des donnees qualitatives pension/retraite (2026-04-10)

### Nouveau champ : `pensionRights`

Ajout d'un champ qualitatif pour chaque pays indiquant si les cotisations retraite sont maintenues pendant le conge parental.

```json
{
  "pensionRights": {
    "continuesDuringLeave": true | false | null,
    "details_en": "...",
    "details_fr": "..."
  }
}
```

### Resultats

| Statut | Nombre | Pays (exemples) |
|--------|--------|-----------------|
| Oui (true) | 36 | Norvege, Suede, France, Allemagne, Italie, Japon... |
| Non (false) | 1 | Nouvelle-Zelande |
| Inconnu (null) | 15 | Canada, USA, Royaume-Uni, Autriche, Belgique... |

Source : notes pays individuelles du LPRN 2025, recherche par mots-cles "pension", "retirement", "contribution".

---

## Resume des commits

| Date | Commit | Description |
|------|--------|-------------|
| 2026-04-10 | f247856 | Conversions 4.3 sem/mois, affichage mois, droits retraite 52 pays |
| 2026-04-10 | 3b625f5 | Cotisations retraite dans le tableau Compare |
| 2026-04-10 | 585a305 | Indicateur carte pension (categoriel) |
| 2026-04-10 | ce53a64 | Corrections audit maternite/parental (KR, AR, IE, NL) |
| 2026-04-10 | 9cae756 | France parental paid : 36 -> 6 (base 1er enfant, Table 3 LPRN) |
| 2026-04-10 | 050ada1 | Corrections anomalies Phase 2b : EE, SK, LV, LT |
| 2026-04-10 | 61fb421 | Variations de conge selon rang de naissance : HR, CY, RS, GR, BA, FR |
