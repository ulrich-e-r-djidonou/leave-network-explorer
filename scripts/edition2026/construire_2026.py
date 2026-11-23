"""Construit data/countries-2026.json a partir de l'edition 2025 et des sources 2026.

Principe : l'edition 2025 sert de base, car ses conventions varient selon les pays (maternite
avec ou sans part prenatale, conge parental par couple ou par parent). Pour chaque champ couvert
par l'Excel LPRN, on compare les cellules sources 2025 et 2026 :
  - cellules identiques : valeur 2025 reprise (« inchange ») ;
  - cellules modifiees : on cherche la relation qui reliait la valeur 2025 a l'Excel 2025
    (identite ou moitie), puis on l'applique a l'Excel 2026 (« mis_a_jour ») ;
  - aucune relation trouvee : proposition par ecart et inscription a la liste de revue (« revue »).
Les decisions manuelles de decisions_2026.json priment et sont tracees (« decision »).
ECEC : tableau 4 du rapport 2026. Changements recents : tableau 6. Costa Rica : fiche construite
avec les relations dominantes de 2025 et la note de pays.

Usage : python scripts/edition2026/construire_2026.py
"""
import copy
import csv
import json
import re
import sys
from collections import Counter

import lprn_sources as S

S.console_utf8()

TOL_MOIS = 0.06   # arrondi a une decimale de certaines valeurs 2025 (ex. 3.7 pour 16/4.3)
TOL_TAUX = 0.5
TOL_ARRONDI = 0.05 + 1e-9  # ecart maximal d'un arrondi a une decimale


def sem(v):
    n = S.nombre(v)
    return None if n is None else n / S.SEMAINES_PAR_MOIS


def mois(v):
    return S.nombre(v)


def classe_taux(r, i_legal, i_moyen):
    """Classe du taux de remplacement :
    ("pct", v)        pourcentage (taux moyen s'il est donne, sinon taux legal <= 100) ;
    ("forfait", None) montant (nombre > 100 ou montant en euros imprime) : jamais « bien paye » ;
    ("autre", texte)  plage ou formule ('75-82', 'FR to 100', 'varies'...) : non interpretee ;
    (None, None)      vide, '..', 'n/d' ou 'see PL'."""
    moyen = S.nombre(r[i_moyen])
    if moyen is not None:
        return ("pct", moyen)
    legal = r[i_legal]
    n = S.nombre(legal)
    if n is not None:
        return ("pct", n) if n <= 100 else ("forfait", None)
    if not isinstance(legal, str) or legal.strip() in ("..", "n/d", "see PL", ""):
        return (None, None)
    if re.fullmatch(r"€[\d.,]+( per week)?|€[\d.,]+ to €[\d.,]+", legal.strip()):
        return ("forfait", None)
    return ("autre", legal.strip())


def classe_legale(r, i_legal):
    """Classe du seul taux legal, pour le caractere bien paye. Une plage ('40-100') ou une formule
    reste non interpretee : la part bien payee de la duree n'en decoule pas."""
    legal = r[i_legal]
    n = S.nombre(legal)
    if n is not None:
        return ("pct", n) if n <= 100 else ("forfait", None)
    if not isinstance(legal, str) or legal.strip() in ("..", "n/d", "see PL", ""):
        return (None, None)
    if re.fullmatch(r"€[\d.,]+( per week)?|€[\d.,]+ to €[\d.,]+", legal.strip()):
        return ("forfait", None)
    return ("autre", legal.strip())


def taux(r, i_legal, i_moyen):
    genre, v = classe_taux(r, i_legal, i_moyen)
    return v if genre == "pct" else None


def bien_paye(duree, classe):
    """Definition du LPRN : paiement lie aux revenus a 66 % ou plus de la remuneration anterieure."""
    genre, v = classe
    if duree is None:
        return None
    if duree == 0:
        return 0.0
    if genre == "forfait":
        return 0.0
    if genre != "pct":
        return None
    return duree if v >= 66 else 0.0


def signature_bien_paye(i_duree, i_legal, i_moyen):
    """La duree payee et la classe du taux decident seules du caractere bien paye : l'indexation
    d'un montant forfaitaire ne change pas le champ."""
    def f(r):
        genre, v = classe_legale(r, i_legal)
        return (r[i_duree], genre, (v >= 66) if genre == "pct" else v)
    return f


def signature_taux(i_legal, i_moyen):
    return lambda r: classe_taux(r, i_legal, i_moyen)


def egal(i, valeurs):
    """Indicateur code 0/1/2 dans l'Excel ; toute autre cellule ('..', 'n/d', 'see PL', vide) est non informative."""
    return lambda r: (r[i] in valeurs) if isinstance(r[i], (int, float)) and not isinstance(r[i], bool) else None


# Specification des champs : (conge, chemin, indices des cellules sources, candidats, type[, signature[, mode]])
# signature : resume des cellules qui decide si la source a change (defaut : cellules brutes).
# mode « uniforme » : convention unique verifiee (paternite en semaines / 4.3, 90 cellules sur 90
# concordantes entre l'Excel et le tableau 2 du PDF). Si la source change, la valeur 2026 suit cette
# convention meme quand la valeur 2025 s'en ecartait ; si la source ne change pas, la valeur 2025 est
# reprise pour ne pas simuler une reforme, et l'ecart herite est declare au controle.
CHAMPS = [
    ("maternity", "exists", [2], {"statutaire=1": egal(2, (1,)), "statutaire=1|2": egal(2, (1, 2))}, "bool"),
    ("maternity", "durationMonths.total", [3, 10], {"ML total/4.3": lambda r: sem(r[3]), "ML paye total/4.3": lambda r: sem(r[10])}, "mois"),
    ("maternity", "durationMonths.paid", [10], {"ML paye total/4.3": lambda r: sem(r[10])}, "mois"),
    ("maternity", "durationMonths.wellPaid", [10, 12, 13], {"paye si taux>=66": lambda r: bien_paye(sem(r[10]), classe_legale(r, 12))}, "mois", signature_bien_paye(10, 12, 13)),
    ("maternity", "paymentRate", [12, 13], {"taux": lambda r: taux(r, 12, 13)}, "taux", signature_taux(12, 13)),
    ("maternity", "ceiling", [14], {"plafond 1|2": egal(14, (1, 2)), "plafond 1|2|3": egal(14, (1, 2, 3))}, "bool"),
    ("maternity", "obligatory", [5], {"obligatoire=1": egal(5, (1,))}, "bool"),
    ("maternity", "transferable", [20], {"transferable 1|2": egal(20, (1, 2)), "transferable=1": egal(20, (1,))}, "bool"),
    ("maternity", "flexPartTime", [39], {"temps partiel=1": egal(39, (1,))}, "bool"),
    ("maternity", "flexBlocks", [37], {"blocs=1": egal(37, (1,))}, "bool"),
    ("maternity", "additionalForMultiple", [28], {"naissances multiples=1": egal(28, (1,))}, "bool"),
    ("paternity", "exists", [2], {"statutaire=1": egal(2, (1,))}, "bool"),
    ("paternity", "durationMonths.total", [4], {"PtL total/4.3": lambda r: sem(r[4])}, "mois", None, "uniforme"),
    ("paternity", "durationMonths.paid", [10], {"PtL paye total/4.3": lambda r: sem(r[10])}, "mois", None, "uniforme"),
    ("paternity", "durationMonths.wellPaid", [10, 12, 13], {"paye si taux>=66": lambda r: bien_paye(sem(r[10]), classe_legale(r, 12))}, "mois", signature_bien_paye(10, 12, 13), "uniforme"),
    ("paternity", "paymentRate", [12, 13], {"taux": lambda r: taux(r, 12, 13)}, "taux", signature_taux(12, 13)),
    ("paternity", "ceiling", [14], {"plafond 1|2": egal(14, (1, 2)), "plafond 1|2|3": egal(14, (1, 2, 3))}, "bool"),
    ("paternity", "obligatory", [5], {"obligatoire=1": egal(5, (1,))}, "bool"),
    ("paternity", "transferable", [20], {"transferable=1": egal(20, (1,))}, "bool"),
    ("paternity", "flexBlocks", [29], {"blocs=1": egal(29, (1,))}, "bool"),
    ("paternity", "flexPartTime", [31], {"temps partiel=1": egal(31, (1,))}, "bool"),
    ("parental", "exists", [2], {"statutaire=1": egal(2, (1,))}, "bool"),
    ("parental", "durationMonths.total", [4], {"PL couple": lambda r: mois(r[4])}, "mois_couple"),
    ("parental", "durationMonths.paid", [10], {"PL paye couple": lambda r: mois(r[10])}, "mois_couple"),
    ("parental", "durationMonths.wellPaid", [10, 13, 14], {"paye si taux>=66": lambda r: bien_paye(mois(r[10]), classe_legale(r, 13))}, "mois_couple", signature_bien_paye(10, 13, 14)),
    ("parental", "paymentRate", [13, 14], {"taux": lambda r: taux(r, 13, 14)}, "taux", signature_taux(13, 14)),
    ("parental", "ceiling", [15], {"plafond 1|2": egal(15, (1, 2)), "plafond 1|2|3": egal(15, (1, 2, 3))}, "bool"),
    ("parental", "flexBlocks", [46], {"blocs=1": egal(46, (1,))}, "bool"),
    ("parental", "flexPartTime", [48], {"temps partiel=1": egal(48, (1,))}, "bool"),
    ("parental", "motherQuotaMonths", [26, 27], {"quota mere/4.3": lambda r: sem(r[27]) if r[26] == 1 else None}, "mois"),
    ("parental", "fatherQuotaMonths", [28, 29], {"quota pere/4.3": lambda r: sem(r[29]) if r[28] == 1 else None}, "mois"),
]

# Entites infranationales presentes dans l'Excel
INFRA = {"CA-QC": ("CA", "Quebec"), "AR-PUB": ("AR", "public"), "GR-PUB": ("GR", "public")}


def lire(obj, chemin):
    for k in chemin.split("."):
        if not isinstance(obj, dict) or k not in obj:
            return KeyError
        obj = obj[k]
    return obj


def ecrire(obj, chemin, valeur):
    ks = chemin.split(".")
    for k in ks[:-1]:
        obj = obj.setdefault(k, {})
    obj[ks[-1]] = valeur


def concorde(j, c, genre):
    if j is None or c is None:
        return j is None and c is None
    if genre == "bool":
        return j == c
    if genre == "taux":
        return isinstance(j, (int, float)) and abs(j - c) <= TOL_TAUX
    return isinstance(j, (int, float)) and abs(j - c) <= TOL_MOIS


def arrondi(v, genre):
    if v is None or genre == "bool":
        return v
    v = round(v, 2)
    return int(v) if v == int(v) else v


def relations(cands, genre):
    """Candidats et, pour le conge parental, leurs moities (convention « par parent » de 2025)."""
    rel = [(nom, f, 1.0) for nom, f in cands.items()]
    if genre == "mois_couple":
        rel += [(nom + " / 2", f, 0.5) for nom, f in cands.items()]
    return rel


def appliquer(f, facteur, r):
    v = f(r)
    if v is None or isinstance(v, bool):
        return v
    return v * facteur


def entree_excel(xl, conge, cle, annee, national):
    if national:
        # La fiche nationale suit le secteur prive quand l'Excel distingue les secteurs (AR, GR, CR...)
        return S.ligne_excel(xl, conge, (cle[0], ""), annee) or S.ligne_excel(xl, conge, (cle[0], "private"), annee)
    return S.ligne_excel(xl, conge, cle, annee)


def deriver_champs(base25, xl, cle, national, decisions, prov, revue, nom_entite):
    out = copy.deepcopy(base25)
    for spec in CHAMPS:
        conge, chemin, idx, cands, genre = spec[:5]
        signature = spec[5] if len(spec) > 5 and spec[5] else (lambda r, idx=idx: [r[i] for i in idx])
        mode = spec[6] if len(spec) > 6 else "relationnel"
        champ = f"{conge}.{chemin}"
        j25 = lire(base25, champ)
        if j25 is KeyError:
            continue  # champ absent de la fiche 2025 (fiches infranationales partielles)
        r25 = entree_excel(xl, conge, cle, 2025, national)
        r26 = entree_excel(xl, conge, cle, 2026, national)
        g = "mois" if genre == "mois_couple" else genre
        ligne = {"entite": nom_entite, "champ": champ, "valeur_2025": j25, "excel_2025": None, "excel_2026": None,
                 "ligne_excel_2026": r26["ligne"] if r26 else None, "regle": "", "statut": "", "note": ""}
        dec = decisions.get((nom_entite, champ))
        if r25 is None or r26 is None:
            valeur, ligne["statut"], ligne["regle"] = j25, "repris", "aucune ligne Excel 2025 et 2026"
        else:
            v25 = [r25["valeurs"][i] for i in idx]
            v26 = [r26["valeurs"][i] for i in idx]
            ligne["excel_2025"], ligne["excel_2026"] = v25, v26
            rels = relations(cands, genre)
            c25s = [appliquer(f, fac, r25["valeurs"]) for _, f, fac in rels]
            c26s = [appliquer(f, fac, r26["valeurs"]) for _, f, fac in rels]
            change = signature(r25["valeurs"]) != signature(r26["valeurs"])
            uniforme = arrondi(c26s[0], g) if mode == "uniforme" and change else None
            if mode == "uniforme" and not change:
                valeur, ligne["statut"], ligne["regle"] = j25, "inchange", "source 2025 = 2026"
                v = arrondi(c26s[0], g)
                if v is not None and isinstance(j25, (int, float)) and abs(j25 - v) > 0.005:
                    ligne["note"] = f"hors convention ({rels[0][0]} = {v}) : ecart herite de 2025, declare au controle"
            elif uniforme is not None:
                valeur = uniforme
                ligne["regle"] = f"convention uniforme : {rels[0][0]}"
                ecart = abs(j25 - valeur) if isinstance(j25, (int, float)) and not isinstance(j25, bool) else None
                if ecart is not None and ecart <= 0.005:
                    ligne["statut"] = "inchange"
                elif change:
                    ligne["statut"] = "mis_a_jour"
                elif ecart is not None and ecart <= TOL_ARRONDI:
                    ligne["statut"] = "arrondi"
                    ligne["note"] = "source 2025 = 2026 ; valeur 2025 arrondie ou approchee (ecart <= 0.05 mois)"
                else:
                    ligne["statut"] = "corrige"
                    ligne["note"] = "source 2025 = 2026 mais valeur 2025 hors convention : erreur probable de l'edition 2025"
            elif not change:
                valeur, ligne["statut"], ligne["regle"] = j25, "inchange", "source 2025 = 2026"
            elif all(c is None for c in c25s + c26s):
                valeur, ligne["statut"], ligne["regle"] = j25, "inchange", "source non interpretable les deux annees"
            else:
                trouvees = [(rels[k][0], c26s[k]) for k in range(len(rels)) if concorde(j25, c25s[k], g)]
                propositions = {arrondi(c, g) for _, c in trouvees}
                if trouvees and len(propositions) == 1 and (None not in propositions or j25 is None):
                    valeur = propositions.pop()
                    ligne["statut"], ligne["regle"] = "mis_a_jour", trouvees[0][0]
                else:
                    c25, c26 = c25s[0], c26s[0]
                    if g != "bool" and isinstance(j25, (int, float)) and c25 is not None and c26 is not None:
                        valeur = max(0.0, arrondi(j25 + (c26 - c25), g))
                        ligne["regle"] = f"ecart {rels[0][0]} applique a la valeur 2025"
                    else:
                        valeur = j25
                        ligne["regle"] = "valeur 2025 conservee"
                    ligne["statut"] = "revue"
                    ligne["note"] = ("relation ambigue" if len(propositions) > 1 else
                                     "aucune relation 2025 entre la fiche et l'Excel" if not trouvees else
                                     "source 2026 non numerique")
                    revue.append(ligne)
        if dec is not None:
            ligne["note"] = (ligne["note"] + " ; " if ligne["note"] else "") + f"proposition calculee : {valeur!r}"
            valeur, ligne["statut"], ligne["regle"] = dec["valeur"], "decision", dec["justification"]
        ligne["valeur_2026"] = valeur
        ecrire(out, champ, valeur)
        prov.append(ligne)
    return out


# ---------------------------------------------------------------------------
# ECEC : tableau 4 du rapport 2026

def nombre_ou_plage(s):
    """'13.5' -> [13.5] ; '8–8.3' -> [8, 8.3] ; '25.3–no gap' -> [25.3, 0] ; sinon None."""
    s = (s or "").strip().strip("!")
    morceaux = re.split(r"[–-]", s) if re.search(r"\d", s) else [s]
    vals = []
    for m in morceaux:
        m = m.strip().strip("!").strip()
        if m.lower() == "no gap":
            vals.append(0.0)
        elif re.fullmatch(r"\d+(?:\.\d+)?", m):
            vals.append(float(m))
        else:
            return None
    return vals or None


def age_ecec(c, fin_conge):
    s = c.replace("□", "").strip()
    if s in ("..", ""):
        return None, "aucun droit universel (..)"
    if re.match(r"(?i)birth", s):
        return 0, "droit des la naissance"
    if s.lower().startswith("end of par. leave"):
        n = S.nombre_imprime(fin_conge)
        return (n, "fin du conge parental, colonne (a)") if n is not None else (KeyError, "fin de conge non numerique")
    m = re.match(r"^(\d+(?:[.,]\d+)?)\s*(years?|months?)\b", s)
    if not m:
        return KeyError, f"age non interpretable : {c!r}"
    n = float(m.group(1).replace(",", "."))  # « 4,7 years » (Chypre) : virgule decimale
    return (round(n * 12) if m.group(2).startswith("year") else round(n)), "age imprime"


def ecart_ecec(s):
    s = (s or "").strip()
    if s in ("No ECEC entitlement", ".."):
        return None, "aucun droit universel"
    if s.strip("!").lower() == "no gap":
        return 0, "pas d'ecart (le ! signale un droit theorique faute de places)" if "!" in s else "pas d'ecart"
    vals = nombre_ou_plage(s)
    if vals is None:
        return KeyError, f"ecart non interpretable : {s!r}"
    if len(vals) == 1:
        return vals[0], "ecart imprime (c)-(a)"
    # Plage : l'ecart le plus long correspond au conge le plus court, celui du secteur prive
    # que suit la fiche nationale (Argentine : 48 - 8 = 40).
    return max(vals), f"plage {s!r} : ecart le plus long (conge le plus court)"


def coherence_ecec(age, r):
    """Controle arithmetique : (c) = (a) + ((c)-(a)) quand les trois valeurs sont des nombres seuls."""
    a = nombre_ou_plage(r["end_leave_a"])
    g = nombre_ou_plage(r["gap_c_a"])
    if age in (None, KeyError) or not a or not g or len(a) != 1 or len(g) != 1 or g == [0.0]:
        return None
    return abs(age - (a[0] + g[0])) <= 1


def entier_si_possible(v):
    if isinstance(v, float) and v == int(v):
        return int(v)
    return v


def deriver_ecec(pays, t4, prov, revue, decisions, nouvelle_fiche=False):
    """Tableau 4 du rapport 2026. Meme principe que pour les durees : une valeur 2025 que le tableau
    2026 explique (age de la colonne (c) ; ecart (c)-(a) ou (c)-(b), l'edition 2025 ayant employe les
    deux) est reprise ; sinon la valeur du tableau 2026 s'applique et le cas est signale."""
    lignes = {r["iso2"]: r for r in t4 if r["iso2"] and not r["variante"]}
    r = lignes.get(pays["iso2"])
    if r is None:
        return
    e25 = copy.deepcopy(pays["ecec"])
    univ = r["ecec_c"].strip() != ".."
    age, note_age = age_ecec(r["ecec_c"], r["end_leave_a"])
    coh = coherence_ecec(age, r)
    if coh is False:
        note_age += " ; INCOHERENT avec (a) + (c)-(a)"
        age = KeyError
    elif coh:
        note_age += " ; coherent avec (a) + (c)-(a)"
    gap_a, note_gap = ecart_ecec(r["gap_c_a"])
    gap_b, _ = ecart_ecec(r["gap_c_b"])

    def proche(x, y):
        if x is None or y is None:
            return x is None and y is None
        if isinstance(x, bool) or isinstance(y, bool):
            return x == y
        return abs(x - y) <= 1

    champs = (("universalEntitlement", univ, [univ], "colonne (c) differente de .."),
              ("entitlementAgeMonths", age, [age], note_age),
              ("gapAfterLeaveMonths", gap_a, [gap_a, gap_b], note_gap))
    for champ, val, explications, note in champs:
        nom = f"ecec.{champ}"
        v25 = e25.get(champ)
        ligne = {"entite": pays["iso2"], "champ": nom, "valeur_2025": None if nouvelle_fiche else v25, "excel_2025": None,
                 "excel_2026": [r["ecec_c"], r["gap_c_a"], r["gap_c_b"]], "ligne_excel_2026": f"T4 PDF {r['pdf_page']}",
                 "regle": "", "statut": "", "note": ""}
        val = entier_si_possible(val)
        if val is KeyError:
            val, ligne["statut"], ligne["regle"] = v25, "revue", f"valeur 2025 conservee ; {note}"
            revue.append(ligne)
        elif not nouvelle_fiche and any(e is not KeyError and proche(v25, entier_si_possible(e)) for e in explications):
            val, ligne["statut"] = v25, "inchange"
            ligne["regle"] = "valeur 2025 expliquee par le tableau 4 de 2026" + (" ((c)-(b))" if champ == "gapAfterLeaveMonths" and not proche(v25, entier_si_possible(gap_a)) else "")
        else:
            ligne["statut"], ligne["regle"] = "tableau_2026", f"tableau 4 : {note}"
            if not nouvelle_fiche:
                ligne["note"] = f"valeur 2025 ({v25!r}) non expliquee par le tableau 4 de 2026"
        dec = decisions.get((pays["iso2"], nom))
        if dec is not None:
            ligne["note"] = (ligne["note"] + " ; " if ligne["note"] else "") + f"proposition calculee : {val!r}"
            val, ligne["statut"], ligne["regle"] = dec["valeur"], "decision", dec["justification"]
        ligne["valeur_2026"] = val
        pays["ecec"][champ] = val
        prov.append(ligne)


# ---------------------------------------------------------------------------
# Changements recents : tableau 6

TYPES = {"✓": "introduction", "x": "abolition", "↑": "expansion", "↓": "cutback", "o": "recalibration", "O": "recalibration"}
COLONNES_T6 = [("maternity", "maternity"), ("paternity", "paternity"), ("parental", "parental"), ("other_leave", "other")]


def recoller(texte):
    """Cesure de fin de ligne recollee par Codex avec une espace : 'same- sex' -> 'same-sex'."""
    return re.sub(r"(\w)- (?!(?:and|or|to)\b)([a-z])", r"\1-\2", texte)


def items_t6(cellule):
    morceaux = re.split(r"(?:^|\s)([✓x↑↓oO])(?=\s)", " " + cellule.strip())
    items = []
    for i in range(1, len(morceaux) - 1, 2):
        texte = recoller(" ".join(morceaux[i + 1].split()))
        if texte:
            items.append((TYPES[morceaux[i]], texte))
    reste = morceaux[0].strip()
    return items, reste


def changements(t6):
    par_pays, anomalies = {}, []
    for r in t6:
        if not r["iso2"]:
            continue
        prefixe = "Quebec: " if r["variante"] == "Quebec" else ""
        for col, conge in COLONNES_T6:
            items, reste = items_t6(r[col])
            if reste:
                anomalies.append(f"{r['iso2']} {col} : texte sans symbole {reste!r}")
            for typ, texte in items:
                par_pays.setdefault(r["iso2"], []).append(
                    {"type": typ, "leaveType": conge, "description": prefixe + texte})
    return par_pays, anomalies


# ---------------------------------------------------------------------------

def relation_dominante(prov):
    """Relation la plus frequente par champ parmi les mises a jour et les concordances 2025."""
    return Counter((p["champ"], p["regle"]) for p in prov if p["statut"] == "mis_a_jour")


def main():
    ecarts = S.verifier_empreintes()
    if ecarts:
        raise SystemExit("Sources non conformes :\n  " + "\n  ".join(ecarts))
    base = json.loads((S.RACINE / "data/countries-2025.json").read_text(encoding="utf-8"))
    dec_json = json.loads((S.ICI / "decisions_2026.json").read_text(encoding="utf-8"))
    decisions = {(d["entite"], d["champ"]): d for d in dec_json["valeurs"]}
    xl = S.charger_excel()
    t4 = S.charger_tableau("T4_ecec.csv")
    t6 = S.charger_tableau("T6_changements.csv")
    prov, revue = [], []
    chg, anomalies_t6 = changements(t6)

    pays26 = []
    for c in base["countries"]:
        n = deriver_champs(c, xl, (c["iso2"], ""), True, decisions, prov, revue, c["iso2"])
        for i, sub in enumerate(n.get("subnational") or []):
            code = sub.get("code")
            if code in INFRA:
                n["subnational"][i] = deriver_champs(sub, xl, INFRA[code], False, decisions, prov, revue, code)
        deriver_ecec(n, t4, prov, revue, decisions)
        n["recentChanges"] = chg.get(c["iso2"], [])
        pays26.append(n)

    cr = copy.deepcopy(dec_json["costa_rica"]["fiche"])
    deriver_ecec(cr, t4, prov, revue, decisions, nouvelle_fiche=True)
    cr["recentChanges"] = chg.get("CR", [])
    prov.append({"entite": "CR", "champ": "(fiche)", "valeur_2025": None, "valeur_2026": "nouvelle fiche",
                 "excel_2025": None, "excel_2026": None, "ligne_excel_2026": None, "statut": "nouveau",
                 "regle": dec_json["costa_rica"]["justification"], "note": ""})
    pays26.append(cr)
    pays26.sort(key=lambda p: p["name"])

    meta = dict(dec_json["metadata"])
    meta["totalCountries"] = len(pays26)
    sortie = {"metadata": meta, "countries": pays26}
    texte = json.dumps(sortie, ensure_ascii=False, indent=2) + "\n"
    for chemin in ("data/countries-2026.json", "public/data/countries-2026.json"):
        (S.RACINE / chemin).write_text(texte, encoding="utf-8", newline="\n")

    cols = ["entite", "champ", "statut", "valeur_2025", "valeur_2026", "regle", "excel_2025", "excel_2026", "ligne_excel_2026", "note"]
    with open(S.ICI / "provenance_2026.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, lineterminator="\n")
        w.writeheader()
        for p in prov:
            w.writerow({k: json.dumps(p[k], ensure_ascii=False) if isinstance(p[k], (list, dict, bool)) or p[k] is None else p[k] for k in cols})

    non_resolus = [p for p in prov if p["statut"] == "revue"]
    stats = Counter(p["statut"] for p in prov)
    with open(S.ICI / "A_REVOIR_2026.md", "w", encoding="utf-8", newline="\n") as f:
        f.write("# Valeurs 2026 a revoir\n\nFichier genere par `construire_2026.py`. Chaque ligne garde une valeur provisoire "
                "(ecart applique ou valeur 2025) tant qu'une decision n'est pas inscrite dans `decisions_2026.json`.\n\n")
        f.write("Bilan des statuts : " + ", ".join(f"{k} {v}" for k, v in sorted(stats.items())) + ".\n\n")
        f.write(f"Corrections declarees de l'Excel : {len(S.CORRECTIONS_EXCEL)} (ANO-X001, annee 2026 saisie 2025).\n\n")
        for a in S.CORRECTIONS_EXCEL:
            f.write(f"- {a['feuille']} ligne {a['ligne']} ({a['libelle']}) : {a['regle']}\n")
        f.write(f"\nTexte du tableau 6 sans symbole de type : {len(anomalies_t6)}\n\n")
        for a in anomalies_t6:
            f.write(f"- {a}\n")
        f.write(f"\n## {len(non_resolus)} valeurs en revue\n\n| Entite | Champ | 2025 | 2026 provisoire | Excel 2025 | Excel 2026 | Motif |\n|---|---|---|---|---|---|---|\n")
        for p in non_resolus:
            f.write(f"| {p['entite']} | {p['champ']} | {p['valeur_2025']} | {p['valeur_2026']} | {p['excel_2025']} | {p['excel_2026']} | {p['note']} ; {p['regle']} |\n")
    print(f"{len(pays26)} pays ecrits ; statuts : {dict(stats)} ; corrections Excel : {len(S.CORRECTIONS_EXCEL)} ; "
          f"texte T6 sans symbole : {len(anomalies_t6)}")


if __name__ == "__main__":
    main()
