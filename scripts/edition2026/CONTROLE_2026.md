# Controle des chiffres, edition 2026

Genere par `controle_2026.py`.

## C0 Empreintes des sources

Conformes.

## C1 Structure

0 erreur(s).


## C2 Excel LPRN 2026 contre tableaux PDF

0 erreur(s).
Cellules comparables concordantes : maternity 92/97, paternity 90/90, parental 65/70 ; total 247/257.
Ecarts declares et justifies : 10 (voir `ecarts_declares_2026.json`).
Lignes du PDF sans equivalent dans l'Excel (secteur public non distingue) : paternity MT public, paternity TR public.


## C3 Fiches 2026 contre tableaux PDF

0 erreur(s).
Ecarts declares et justifies : 40 (voir `ecarts_declares_2026.json`).


## C4 Provenance et tableau 6

0 erreur(s).


## C6 Durees mises a jour et changements du tableau 6

0 erreur(s).


Changements du tableau 6 sans effet sur les durees (pour information ; les tableaux comparent le cas standard du premier enfant, et la date de reference est avril 2026) :

- BG maternity : o the maternity leave benefit is suspended if the parent receiving it works under a second employment contract
- BG paternity : o the paternity leave benefit is suspended if the parent receiving it works under a second employment contract
- BG parental : o the parental leave benefit is suspended if the parent receiving it works under a second employment contract
- CL maternity : ↑ increase in the minimum daily subsidy floor (link to the minimum wage rise)
- CY maternity : ↑ increase in maternity leave benefit, which depends on the number of dependents in the family
- CY parental : ↑ increase in the number of weeks of paid parental leave, depending on the number of children
- CZ parental : ↑ multiple births: parental benefit doubled, replacing the previous 1.5 multiplier
- DE maternity : ↑ extension of maternity protection to miscarriages
- DE parental : ↓ further reduction of the income limit (eligibility criterion) ↓ restriction of simultaneous receipt of benefits for full- time leave for both parents
- DK parental : o hospitalised newborn extension (paid parental leave can be extended up to 12 months) ↑ benefit ceiling increase
- EE maternity : ↑ upper ceiling on maternity leave benefit introduced
- EE paternity : ↑ upper ceiling
- EE parental : ↑ upper ceiling ↑ full parental benefit if a parent is working
- FR parental : ✓ introduction of an additional paid parental leave of one to two months for each parent (“additional birth leave”; effective in June 2026)
- GB paternity : o ‘day one’ right for employees to leave (but not payment)
- GB parental : o ‘day one’ right for employees to leave (but not payment)
- GR maternity : ↑ expansion of post-natal portion for foster mothers
- GR parental : o benefit level due to minimum wage increase o tax-exempt and non- seizable
- HR maternity : ↑ additional pension insurance period
- HU maternity : ↑ personal income tax is not paid on leave benefit
- HU parental : ↑ personal income tax is not paid on leave benefit
- IS parental : ↑ extension of leave in case of multiple births
- IT paternity : ✓ mandatory leave for an intentional parent in a same- sex couple
- IT parental : ✓ mandatory leave for an intentional parent in a same- sex couple O the extension in the age limit
- KR maternity : ↑ benefit height
- KR paternity : ↑ benefit height o prolongation of the taking- up period
- LV parental : ↑ benefit payment period extended for parents with preterm children O additional eligibility criteria ↑ increase in childcare allowance
- RO parental : ↓ 10% health care contribution needs to be paid on parental benefits
- SI parental : ↑ 15 days of leave for foster parents of a child 8-15
- SK maternity : ↑ benefit level
- SK paternity : ↑ benefit level
- SK parental : ↑ benefit level
- US parental : ↑ availability at the state level
- VN maternity : ↑ leave length for the 2nd child (1 week) ✓ maternity allowance for voluntary social insurance contributors
- VN paternity : ↑ leave length for the 2nd child (1 week)
- XK maternity : ↑ benefit height

## C7 ECEC contre tableau 4

0 erreur(s).


## C5 Auto-test par alterations

| Alteration | Controle attendu en echec | Resultat |
|---|---|---|
| paternite espagnole ramenee a 2025 | C3, C4 | detectee |
| Costa Rica retire | C1 | detectee |
| champ repris de 2025 modifie | C4 | detectee |
| conge parental suedois altere | C3, C4 | detectee |
| changement du tableau 6 invente | C4 | detectee |
| cellule Excel alteree | C2 | detectee |
| bien paye superieur au paye | C1 | detectee |
| age ECEC maltais remis a 3 mois | C7, C4 | detectee |
| changement australien retire du tableau 6 | C6 | detectee |

9 alterations detectees sur 9.

## Bilan

Aucune erreur.

## Ecarts declares

Liste tiree de `ecarts_declares_2026.json`. La colonne Proposition donne la valeur a retenir dans les deux editions si la correction est validee.

### Excel LPRN 2026 contre tableaux du rapport (10)

Par categorie : desaccord_sources 10.

| Cle | Categorie | Proposition | Justification |
|---|---|---|---|
| maternity|AR|private|paid | desaccord_sources |  | Tableau 1 : 2,7 mois postnatals payes ; Excel : 8,6 semaines postnatales payees (2,0 mois). Sans effet : la fiche reprend 2025 (12,9 semaines payees, prenatal compris, 2,99 mois), Excel identique en 2025 et 2026. |
| maternity|IT||paid | desaccord_sources |  | Meme desaccord que la duree totale (5 mois contre 20 semaines). Sans effet sur la fiche. |
| maternity|IT||total | desaccord_sources |  | Tableau 1 : 5 mois postnatals ; Excel : 20 semaines postnatales (4,65 mois). La note italienne permet de prendre les 5 mois apres la naissance. Sans effet : maternite reprise de 2025, Excel identique. |
| maternity|UY||paid | desaccord_sources |  | Meme desaccord que la duree totale. Sans effet sur la fiche. |
| maternity|UY||total | desaccord_sources |  | Tableau 1 : 3 mois ; Excel : 14 semaines postnatales (3,26 mois). Sans effet : maternite reprise de 2025, Excel identique. |
| parental|DE||total | desaccord_sources |  | Tableau 3 : 72 mois par couple. Sa note 2 compte double deux droits individuels utilisables tard ; la note allemande permet de prendre jusqu'a 24 mois entre 3 et 8 ans. Excel, colonne « par couple » : 36. Sans effet : la fiche suit la convention par parent de 2025 (36). |
| parental|GR|public|total | desaccord_sources |  | Tableau 3 : 60 mois par couple pour le secteur public ; Excel : 120. Sans effet : conge parental de GR-PUB repris de 2025, Excel identique. |
| parental|IE||total | desaccord_sources |  | Tableau 3 imprime 16 ; Excel 16,28 (70 semaines / 4,3). Ecart d'arrondi a l'entier du tableau. Sans effet sur la fiche. |
| parental|IL||total | desaccord_sources |  | Tableau 3 : 12 mois par couple ; Excel : 24. Sans effet : la fiche israelienne (12) concorde avec le tableau 3. |
| parental|SE||paid | desaccord_sources |  | Tableau 3 : 16 mois payes ; Excel : 18. La note suedoise donne 480 jours de conge parental (16 mois de 30 jours, deduction). Sans effet : la fiche suedoise (16) concorde avec le tableau 3. |

### Fiches 2026 contre tableaux du rapport (40)

Par categorie : arrondi_2025 4, convention_2025 9, herite_2025 27.

| Cle | Categorie | Proposition | Justification |
|---|---|---|---|
| parental|IE|total | arrondi_2025 |  | Fiche par parent : 35 semaines = 8,14 mois (CORRECTIONS_LOG.md). Tableau 3 : 16 par couple, arrondi a l'entier (Excel 16,28 = 70 semaines). |
| parental|SI|paid | arrondi_2025 | 10.66 | Meme ecart que la duree totale. |
| parental|SI|total | arrondi_2025 | 10.66 | Excel : 10,66 mois ; tableau 3 : 10,7. Fiche : 10,5. |
| parental|SI|wellPaid | arrondi_2025 | 10.66 | Meme ecart que la duree totale (Excel : taux de 100 %, plafonne). |
| maternity|AR-PUB|total | convention_2025 |  | Secteur public argentin : meme convention que la fiche nationale (duree payee seulement ; tableau 1 : 8,3 mois postnatals au total). |
| maternity|AR|total | convention_2025 |  | Fiche : duree payee (Excel : 12,9 semaines payees prenatal compris, 2,99 mois). Tableau 1 : 8 mois postnatals ; Excel : 38,7 semaines au total, soit un conge non paye en plus de la duree payee. Meme convention pour AR-PUB et TR. |
| maternity|TR|total | convention_2025 |  | Fiche : 16 semaines payees (Excel), 3,7 mois. Tableau 1 : 9 mois postnatals ; Excel : 41,8 semaines au total, dont une part non payee. Convention identique a l'Argentine. |
| parental|AT|wellPaid | convention_2025 |  | Note autrichienne : allocation liee au revenu a 80 % pendant 365 jours pour un seul parent. La fiche compte cette duree pour un parent (12) ; le tableau 3 compte le couple (14,2*). |
| parental|ES|total | convention_2025 |  | Fiche par parent : 36 mois + 8 semaines = 37,9. Tableau 3 : 39,7, libelle « 36 months + 8 weeks » ; 39,7 = 36 + 2 x 8 / 4,3 (deduction : 36 mois comptes une fois, 8 semaines par parent). |
| parental|US|total | convention_2025 |  | Note americaine : le FMLA donne jusqu'a 12 semaines de conge non paye, droit individuel ; la fiche les compte comme conge parental (2,8). Tableau 3 : aucun conge parental statutaire (..). Convention a confirmer par Ulrich. |
| paternity|BR|paid | convention_2025 | 0.23 | Meme ecart que la duree totale. |
| paternity|BR|total | convention_2025 | 0.23 | Fiche : 5 jours comptes comme jours civils (5 / 30,1 = 0,17, CORRECTIONS_LOG.md). Excel et tableau 2 : 1 semaine. Convention a arbitrer. |
| paternity|BR|wellPaid | convention_2025 | 0.23 | Meme ecart que la duree totale. |
| maternity|CN|paid | herite_2025 | 3.26 | Excel : 14 semaines payees ; note : 98 jours de conge paye. |
| maternity|CN|total | herite_2025 | 3.26 | Note chinoise : 98 jours civils, 15 avant et 83 apres la naissance ; Excel : 14 semaines, soit 3,26 mois. Tableau 1 : 2,8 mois postnatals, deja superieur a la fiche (2,3). Les allongements provinciaux restent dans les entites infranationales. |
| maternity|CN|wellPaid | herite_2025 | 3.26 | Excel : taux legal de 100 % ; bien paye au sens du LPRN (66 % ou plus). |
| maternity|DK|wellPaid | herite_2025 | 3.3 | Excel : taux legal de 100 %, plafonne. Tableau 1 : 2,3* bien payes (le LPRN retient le taux legal, plafond compris). Fiche : 0. Proposition : egale a la duree payee de la fiche (3,3). |
| maternity|LV|wellPaid | herite_2025 | 3.7 | Excel : taux legal de 80 %. Tableau 1 : 1,9 bien payes (postnatal). Fiche : 0. Proposition : egale a la duree payee de la fiche (3,7). |
| maternity|MT|paid | herite_2025 | 4.2 | Note maltaise : 14 semaines a plein salaire puis 4 semaines au forfait ; tableau 1 : 4,2 payes. La fiche donne 3,7 payes pour 4,2 au total. |
| parental|CA-QC|wellPaid | herite_2025 | 5.8 | Tableau 3, Quebec : 5,8* bien payes. Note canadienne et fiche 2025 : regime particulier a 75 %, 25 semaines selon la fiche (25 / 4,3 = 5,8). La valeur 5,3 de la fiche ne se retrouve dans aucune source consultee. |
| parental|CZ|wellPaid | herite_2025 | 6.5 | Note tcheque : montant mensuel et duree au choix, jusqu'a 70 % de la base journaliere. Excel : 6,5 mois payes a 70 % ; tableau 3 : 6,5* bien payes. Fiche : 0. |
| parental|DE|wellPaid | herite_2025 | 0 | Note allemande et Excel : Elterngeld a 65 % en regle generale (67 % a 100 % pour les bas revenus). Tableau 3 : 0 mois bien payes (seuil de 66 %). Fiche : 14. Correction a fort effet sur les classements : a valider. |
| parental|DK|wellPaid | herite_2025 | 6.5 | Excel : taux legal de 100 %, plafonne ; tableau 3 : 6,5* bien payes. Fiche : 0. |
| parental|HR|wellPaid | herite_2025 | 8 | Excel : 8 mois payes, taux legal de 100 %, plafonne ; tableau 3 : 8* bien payes. Fiche : 6. |
| parental|IT|wellPaid | herite_2025 | 2 | Tableau 3 : 2 mois bien payes par couple. La fiche suit le couple pour le total (10) et le paye (9), tous deux egaux au tableau 3. Fiche : 1,4. |
| parental|MT|total | herite_2025 | 4 | Tableau 3, secteur prive (suivi par les fiches nationales) : 8 mois par couple, dont 4 payes, droit individuel ; secteur public : 12. La fiche compte le paye par parent (2) mais un total de 12, valeur du secteur public. Proposition par parent : 4 (deduction). |
| parental|NO|paid | herite_2025 | 13.5 | Meme ecart que la duree totale. |
| parental|NO|total | herite_2025 | 13.5 | Excel 2025 et 2026 et tableau 3 : 13,5 mois par couple. Note norvegienne : 61 semaines et 1 jour a 80 %, dont 3 semaines avant la naissance reservees a la mere. Fiche : 14,2, soit 61 semaines ; le LPRN retire les 3 semaines prenatales (deduction : 58 / 4,3 = 13,5). |
| parental|NO|wellPaid | herite_2025 | 13.5 | Meme ecart que la duree totale (tableau 3 : 13,5*). |
| parental|NZ|paid | herite_2025 | 6 | Note neo-zelandaise : 26 semaines de conge du parent principal avec « Parental leave payments » plafonnes. Excel : 6 mois payes ; tableau 3 : 6. Fiche : 0. Le tableau 3 ne les compte pas comme bien payes : la fiche garde 0 bien paye. |
| parental|PT|wellPaid | herite_2025 | 2.5 | Tableau 3 : 5 mois bien payes par couple, pour 12 au total. La fiche compte par parent (6). Proposition par parent : 2,5 (deduction). L'Excel ne renseigne pas le Portugal pour 2025 et 2026. |
| parental|SE|total | herite_2025 | 18 | Excel et tableau 3 : 18 mois par couple. La fiche donne 16, la duree payee. |
| parental|UY|wellPaid | herite_2025 | 2.7 | Tableau 3 : 2,7 mois bien payes par couple pour 3 mois payes. Fiche : 3, egal au paye. |
| parental|ZA|wellPaid | herite_2025 | 0.33 | Excel : taux de 66 % ; tableau 3 : 0,3 bien paye. Fiche : 0 pour une duree payee de 0,33. |
| paternity|DK|wellPaid | herite_2025 | 0.47 | Excel : taux legal de 100 %, plafonne ; tableau 2 : 2* bien payees. Fiche : 0. |
| paternity|LV|wellPaid | herite_2025 | 0.47 | Excel : taux legal de 80 % ; tableau 2 : 2 bien payees. Fiche : 0. |
| paternity|NL|wellPaid | herite_2025 | 1.4 | Note neerlandaise : 1 semaine de conge de naissance, puis jusqu'a 5 semaines de conge complementaire paye a 70 %. Tableau 2 : 6* bien payees. La fiche ne compte que la premiere semaine (0,23). |
| paternity|SE|paid | herite_2025 | 0.47 | Meme ecart que la duree totale. |
| paternity|SE|total | herite_2025 | 0.47 | Note suedoise : 10 jours. Excel et tableau 2 : 2 semaines, donc 10 jours ouvrables (deduction). La fiche les a comptes comme jours civils (10 / 30,1 = 0,33, CORRECTIONS_LOG.md). |
| paternity|SE|wellPaid | herite_2025 | 0.47 | Meme ecart que la duree totale (Excel : 77,6 % ; tableau 2 : 2*). |

