"""Controle des chiffres de l'edition 2026.

Le controle n'importe rien du script de construction. Il confronte le fichier publie a une source
que la construction n'utilise pas pour les durees, les tableaux 1 a 3 du rapport PDF (extraction
Codex), et verifie que tout ecart a l'edition 2025 est trace.

  C0  empreintes des sources
  C1  structure : copies identiques, index des editions, 53 pays, schema de 2025, bornes
  C2  Excel LPRN 2026 contre tableaux PDF 1 a 3 (deux sources independantes)
  C3  fiches 2026 contre tableaux PDF 1 a 3
  C4  provenance : tout ecart a 2025 est trace avec sa valeur ; tableau 6 repris fidelement
  C5  auto-test : des alterations volontaires doivent faire echouer le controle vise
  C6  toute duree mise a jour correspond a un changement du meme conge au tableau 6
  C7  ECEC : chaque valeur s'explique par le tableau 4 de 2026 (age (c) ; ecart (c)-(a) ou (c)-(b))

Tout ecart de C2 ou C3 doit figurer dans ecarts_declares_2026.json avec sa justification ;
une declaration devenue sans objet est aussi une erreur. Sortie : CONTROLE_2026.md, code 1 si
une erreur subsiste.

Usage : python scripts/edition2026/controle_2026.py
"""
import copy
import csv
import json
import re
import sys

import lprn_sources as S

S.console_utf8()

DECL = json.loads((S.TRAVAIL / "ecarts_declares_2026.json").read_text(encoding="utf-8"))
T_SEM = 0.265   # fiche en mois arrondie parfois a une decimale (0.05 mois = 0.215 sem.) + tableau 2 a une decimale (0.05)
T_MOIS = 0.1    # fiche a une ou deux decimales (0.05) + tableaux 1 et 3 a une decimale (0.05)

INFRA_PDF = {"CA-QC": ("CA", "Quebec"), "AR-PUB": ("AR", "public"), "GR-PUB": ("GR", "public"),
             "CR-PUB": ("CR", "public"), "MT-PUB": ("MT", "public")}


def charger():
    return {
        "j25": json.loads((S.RACINE / "data/countries-2025.json").read_text(encoding="utf-8")),
        "j26_txt": (S.RACINE / "data/countries-2026.json").read_text(encoding="utf-8"),
        "pub26_txt": (S.RACINE / "public/data/countries-2026.json").read_text(encoding="utf-8"),
        "years": json.loads((S.RACINE / "public/data/years.json").read_text(encoding="utf-8")),
        "years_data": (S.RACINE / "data/years.json").read_text(encoding="utf-8"),
        "years_pub": (S.RACINE / "public/data/years.json").read_text(encoding="utf-8"),
        "xl": S.charger_excel(),
        "t1": S.charger_tableau("T1_maternite.csv"),
        "t2": S.charger_tableau("T2_paternite.csv"),
        "t3": S.charger_tableau("T3_parental.csv"),
        "t4": S.charger_tableau("T4_ecec.csv"),
        "t6": S.charger_tableau("T6_changements.csv"),
        "prov": list(csv.DictReader(open(S.TRAVAIL / "provenance_2026.csv", encoding="utf-8-sig"))),
    }


# ---------------------------------------------------------------------------

def c1_structure(d):
    err = []
    if d["j26_txt"] != d["pub26_txt"]:
        err.append("data/countries-2026.json et public/data/countries-2026.json different")
    if d["years_data"] != d["years_pub"]:
        err.append("data/years.json et public/data/years.json different")
    j26 = json.loads(d["j26_txt"])
    ed = {e["year"]: e for e in d["years"]["years"]}
    if 2026 not in ed or ed[2026]["file"] != "countries-2026.json":
        err.append("years.json ne declare pas countries-2026.json")
    elif ed[2026]["status"] == "provisional" and d["years"]["default"] == 2026:
        err.append("une edition provisoire ne peut pas etre l'edition par defaut")
    m = j26["metadata"]
    if m.get("year") != 2026 or m.get("totalCountries") != len(j26["countries"]) or len(j26["countries"]) != 53:
        err.append(f"metadonnees ou nombre de pays incorrects : {m.get('year')}, {m.get('totalCountries')}, {len(j26['countries'])}")
    isos = [c["iso2"] for c in j26["countries"]]
    if len(set(isos)) != len(isos):
        err.append("iso2 en double")
    if "CR" not in isos:
        err.append("Costa Rica absent")
    c25 = {c["iso2"]: c for c in d["j25"]["countries"]}

    def cles(o, prefixe=""):
        out = set()
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "subnational":
                    continue
                out.add(prefixe + k)
                if isinstance(v, dict):
                    out |= cles(v, prefixe + k + ".")
        return out

    modele = cles(c25["CO"])
    for c in j26["countries"]:
        ref = cles(c25[c["iso2"]]) if c["iso2"] in c25 else modele
        if cles(c) != ref:
            err.append(f"{c['iso2']} : schema different de 2025 ({sorted(cles(c) ^ ref)[:6]})")
        for conge in ("maternity", "paternity", "parental"):
            dm = c[conge]["durationMonths"]
            for k in ("total", "paid", "wellPaid"):
                v = dm[k]
                if not (v is None or (isinstance(v, (int, float)) and not isinstance(v, bool) and v >= 0)):
                    err.append(f"{c['iso2']}.{conge}.{k} invalide : {v!r}")
            if all(isinstance(dm[k], (int, float)) for k in ("total", "paid", "wellPaid")):
                if dm["paid"] > dm["total"] + 0.005 or dm["wellPaid"] > dm["paid"] + 0.005:
                    err.append(f"{c['iso2']}.{conge} : bien paye <= paye <= total non respecte {dm}")
    return err


# ---------------------------------------------------------------------------

def nombre(s):
    return S.nombre_imprime(s)


def ligne_nationale(table, iso):
    lignes = [r for r in table if r["iso2"] == iso]
    for var in ("", "private"):
        for r in lignes:
            if r["variante"] == var:
                return r
    return None


def ligne_pdf(table, cle):
    for r in table:
        if (r["iso2"], r["variante"]) == cle:
            return r
    return None


def ecarts(declares, trouves, nom):
    """Compare les ecarts trouves aux declarations : non declares et declarations sans objet."""
    decl = {e["cle"]: e for e in declares}
    err = [f"{nom} non declare : {k} ({v})" for k, v in sorted(trouves.items()) if k not in decl]
    # La declaration fige le constat (valeurs comprises) : une valeur qui change redevient un ecart
    err += [f"{nom} constat modifie : {k} (declare : {decl[k].get('constat')!r} ; observe : {v!r})"
            for k, v in sorted(trouves.items()) if k in decl and decl[k].get("constat") != v]
    err += [f"{nom} declare sans objet : {k}" for k in sorted(decl) if k not in trouves]
    return err


def c2_sources(d):
    """Excel 2026 contre tableaux 1 (postnatal), 2 et 3 du PDF."""
    trouves = {}
    sans_equivalent = d.setdefault("sans_equivalent_excel", [])
    sans_equivalent.clear()
    plans = [("maternity", d["t1"], [("total", 4, 1 / S.SEMAINES_PAR_MOIS, T_MOIS), ("paid", 11, 1 / S.SEMAINES_PAR_MOIS, T_MOIS)]),
             ("paternity", d["t2"], [("total", 4, 1, T_SEM), ("paid", 10, 1, T_SEM)]),
             ("parental", d["t3"], [("total", 4, 1, T_MOIS), ("paid", 10, 1, T_MOIS)])]
    stats = d.setdefault("c2_stats", {})
    stats.clear()
    for conge, table, colonnes in plans:
        stats[conge] = [0, 0]
        for r in table:
            if not r["iso2"]:
                continue
            cle = (r["iso2"], r["variante"])
            e = d["xl"][conge].get((cle, 2026))
            if e is None and cle[1] == "private":
                e = d["xl"][conge].get(((cle[0], ""), 2026))  # ligne unique de l'Excel = secteur prive
            if e is None and cle[1] == "public":
                sans_equivalent.append(f"{conge} {cle[0]} public")
                continue
            if e is None:
                trouves[f"{conge}|{cle[0]}|{cle[1]}|ligne"] = "ligne absente de l'Excel 2026"
                continue
            for col, idx, fac, tol in colonnes:
                p = nombre(r[col])
                x = S.nombre(e["valeurs"][idx])
                if p is None or x is None:
                    continue
                stats[conge][0] += 1
                if abs(x * fac - p) > tol:
                    trouves[f"{conge}|{cle[0]}|{cle[1]}|{col}"] = f"pdf={r[col]} excel={round(x * fac, 2)}"
                else:
                    stats[conge][1] += 1
    return ecarts(DECL["excel_vs_pdf"], trouves, "C2 ecart Excel/PDF"), trouves


def c3_fiches(d, j26):
    """Fiches 2026 contre tableaux PDF : egalite pour la paternite (semaines / 4.3), egalite au couple
    ou a la moitie pour le conge parental, minorant postnatal pour la maternite."""
    trouves = {}
    pays = {c["iso2"]: c for c in j26["countries"]}
    entites = [(iso, c, ligne_nationale) for iso, c in pays.items()]
    for c in j26["countries"]:
        for sub in c.get("subnational") or []:
            if sub.get("code") in INFRA_PDF:
                entites.append((sub["code"], sub, None))

    def pdf(table, nom, regle):
        return regle(table, nom) if regle else ligne_pdf(table, INFRA_PDF[nom])

    for nom, fiche, regle in entites:
        # Paternite
        r = pdf(d["t2"], nom, regle)
        pat = (fiche.get("paternity") or {}).get("durationMonths")
        if r and pat:
            for col, k in (("total", "total"), ("paid", "paid"), ("well_paid", "wellPaid")):
                p, v = nombre(r[col]), pat.get(k)
                if r[col].strip() == ".." and v not in (0, None):
                    trouves[f"paternity|{nom}|{k}"] = f"pdf=.. fiche={v}"
                elif p is not None and isinstance(v, (int, float)) and abs(v * S.SEMAINES_PAR_MOIS - p) > T_SEM:
                    trouves[f"paternity|{nom}|{k}"] = f"pdf={r[col]} sem. fiche={v} mois ({round(v * S.SEMAINES_PAR_MOIS, 2)} sem.)"
        # Conge parental
        r = pdf(d["t3"], nom, regle)
        par = (fiche.get("parental") or {}).get("durationMonths")
        if r and par:
            for col, k in (("total", "total"), ("paid", "paid"), ("well_paid", "wellPaid")):
                p, v = nombre(r[col]), par.get(k)
                if r[col].strip() == ".." and v not in (0, None):
                    trouves[f"parental|{nom}|{k}"] = f"pdf=.. fiche={v}"
                elif p is not None and isinstance(v, (int, float)) and min(abs(v - p), abs(v - p / 2)) > T_MOIS:
                    trouves[f"parental|{nom}|{k}"] = f"pdf={r[col]} (couple) fiche={v}"
        # Maternite : la fiche compte le prenatal, le tableau 1 seulement le postnatal
        r = pdf(d["t1"], nom, regle)
        mat = (fiche.get("maternity") or {}).get("durationMonths")
        if r and mat:
            for col, k in (("total", "total"), ("paid", "paid"), ("well_paid", "wellPaid")):
                p, v = nombre(r[col]), mat.get(k)
                if p is not None and isinstance(v, (int, float)) and v < p - T_MOIS:
                    trouves[f"maternity|{nom}|{k}"] = f"fiche={v} < postnatal pdf={r[col]}"
                if p == 0 and isinstance(v, (int, float)) and v > 0:
                    trouves[f"maternity|{nom}|{k}"] = f"pdf=0 fiche={v}"
    return ecarts(DECL["fiche_vs_pdf"], trouves, "C3 ecart fiche/PDF"), trouves


# ---------------------------------------------------------------------------

def aplatir(o, prefixe=""):
    out = {}
    for k, v in o.items():
        if k in ("subnational", "recentChanges"):
            continue
        if isinstance(v, dict):
            out.update(aplatir(v, prefixe + k + "."))
        else:
            out[prefixe + k] = v
    return out


def valeur_csv(s):
    try:
        return json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return s


def c4_provenance(d, j26):
    err = []
    prov = {(p["entite"], p["champ"]): p for p in d["prov"]}
    c25 = {c["iso2"]: c for c in d["j25"]["countries"]}

    def entites(pays):
        yield pays["iso2"], pays
        for sub in pays.get("subnational") or []:
            yield sub.get("code") or sub.get("name"), sub

    for c in j26["countries"]:
        if c["iso2"] not in c25:
            if ("CR", "(fiche)") not in prov:
                err.append("fiche Costa Rica sans provenance")
            continue
        anciens = dict(entites(c25[c["iso2"]]))
        for nom, ent in entites(c):
            a, b = aplatir(anciens.get(nom, {})), aplatir(ent)
            for champ in sorted(set(a) | set(b)):
                if a.get(champ, KeyError) == b.get(champ, KeyError):
                    continue
                p = prov.get((nom, champ))
                if p is None:
                    err.append(f"C4 {nom}.{champ} modifie sans provenance : {a.get(champ)!r} -> {b.get(champ)!r}")
                elif valeur_csv(p["valeur_2026"]) != b.get(champ):
                    err.append(f"C4 {nom}.{champ} : provenance {p['valeur_2026']!r} differente de la fiche {b.get(champ)!r}")
                elif p["statut"] in ("inchange",):
                    err.append(f"C4 {nom}.{champ} modifie mais trace « inchange »")
    # Chaque valeur tracee doit se retrouver telle quelle dans le fichier publie
    publies = {}
    for c in j26["countries"]:
        for nom, ent in entites(c):
            publies[nom] = aplatir(ent)
    for (nom, champ), p in prov.items():
        if champ == "(fiche)":
            continue
        if nom not in publies or champ not in publies[nom]:
            err.append(f"C4 provenance sans champ publie : {nom}.{champ}")
        elif valeur_csv(p["valeur_2026"]) != publies[nom][champ]:
            err.append(f"C4 {nom}.{champ} : fichier publie {publies[nom][champ]!r}, provenance {p['valeur_2026']!r}")
    # Tableau 6 : chaque changement publie vient d'une cellule et chaque symbole a son changement
    symboles = re.compile(r"(?:^|\s)[✓x↑↓oO](?=\s)")
    attendus, publies = {}, {}
    for r in d["t6"]:
        if not r["iso2"]:
            continue
        for col in ("maternity", "paternity", "parental", "other_leave"):
            attendus[r["iso2"]] = attendus.get(r["iso2"], 0) + len(symboles.findall(" " + r[col]))
    textes = {}
    for r in d["t6"]:
        if r["iso2"]:
            textes.setdefault(r["iso2"], " ".join(" ".join(r[c].split()) for c in ("maternity", "paternity", "parental", "other_leave")))
            if r["variante"]:
                textes[r["iso2"]] += " " + " ".join(" ".join(r[c].split()) for c in ("maternity", "paternity", "parental", "other_leave"))
    for c in j26["countries"]:
        publies[c["iso2"]] = len(c["recentChanges"])
        source = re.sub(r"(\w)- (\w)", r"\1-\2", textes.get(c["iso2"], ""))
        for ch in c["recentChanges"]:
            desc = ch["description"].removeprefix("Quebec: ")
            if desc not in source:
                err.append(f"C4 {c['iso2']} changement absent du tableau 6 : {desc[:60]!r}")
    for iso in set(attendus) | set(publies):
        if attendus.get(iso, 0) != publies.get(iso, 0):
            err.append(f"C4 {iso} : {publies.get(iso, 0)} changements publies pour {attendus.get(iso, 0)} symboles au tableau 6")
    return err


# ---------------------------------------------------------------------------

COLONNE_T6 = {"maternity": "maternity", "paternity": "paternity", "parental": "parental"}


def c6_tableau6(d):
    """Une duree ne change d'une edition a l'autre que si le tableau 6 signale un changement du meme
    conge pour ce pays. Renvoie aussi, pour information, les changements du tableau 6 sans effet sur les durees."""
    err, info = [], []
    t6 = {r["iso2"]: r for r in d["t6"] if r["iso2"] and not r["variante"]}
    maj = {}
    for p in d["prov"]:
        conge = p["champ"].split(".")[0]
        if p["statut"] == "mis_a_jour" and conge in COLONNE_T6 and ("durationMonths" in p["champ"] or "Quota" in p["champ"]):
            if p["valeur_2025"] != p["valeur_2026"] and str(p["valeur_2025"]) != str(p["valeur_2026"]):
                maj.setdefault((p["entite"], conge), []).append(p["champ"])
    for (entite, conge), champs in sorted(maj.items()):
        r = t6.get(entite)
        if r is None or not r[COLONNE_T6[conge]].strip():
            err.append(f"C6 {entite} : {', '.join(champs)} change sans changement du conge {conge} au tableau 6")
    for iso, r in sorted(t6.items()):
        for conge, col in COLONNE_T6.items():
            if r[col].strip() and (iso, conge) not in maj:
                info.append(f"{iso} {conge} : {' '.join(r[col].split())}")
    return err, info


def c7_ecec(d, j26):
    """Lecture independante du tableau 4 : age de la colonne (c) en mois, ecarts en mois ou plages."""
    err = []
    t4 = {r["iso2"]: r for r in d["t4"] if r["iso2"] and not r["variante"]}

    def valeurs(cellule):
        c = cellule.replace("□", "").replace("!", "").strip()
        if c in ("..", "No ECEC entitlement"):
            return [None]
        if c.lower() == "no gap":
            return [0]
        m = re.match(r"^(\d+(?:[.,]\d+)?)\s*(year|month)", c)
        if m:
            n = float(m.group(1).replace(",", "."))
            return [n * 12 if m.group(2) == "year" else n]
        if re.match(r"(?i)birth", c):
            return [0]
        if c.lower().startswith("end of par. leave"):
            return valeurs(t4_ligne["end_leave_a"])
        parts = [x.strip() for x in re.split(r"[–-]", c)]
        out = []
        for x in parts:
            if x.lower() == "no gap":
                out.append(0)
            elif re.fullmatch(r"\d+(?:\.\d+)?", x):
                out.append(float(x))
            else:
                return []
        return out

    for c in j26["countries"]:
        t4_ligne = t4.get(c["iso2"])
        if t4_ligne is None:
            continue
        e = c["ecec"]
        univ = t4_ligne["ecec_c"].strip() != ".."
        if e["universalEntitlement"] != univ:
            err.append(f"C7 {c['iso2']} universalEntitlement={e['universalEntitlement']} ; tableau 4 : {t4_ligne['ecec_c']!r}")
        ages = valeurs(t4_ligne["ecec_c"])
        a = e["entitlementAgeMonths"]
        if not any((x is None and a is None) or (x is not None and a is not None and abs(a - x) <= 1) for x in ages):
            err.append(f"C7 {c['iso2']} entitlementAgeMonths={a} ; tableau 4 : {t4_ligne['ecec_c']!r}")
        ecarts_ = valeurs(t4_ligne["gap_c_a"]) + valeurs(t4_ligne["gap_c_b"])
        g = e["gapAfterLeaveMonths"]
        if not any((x is None and g is None) or (x is not None and g is not None and abs(g - x) <= 1) for x in ecarts_):
            err.append(f"C7 {c['iso2']} gapAfterLeaveMonths={g} ; tableau 4 : {t4_ligne['gap_c_a']!r} / {t4_ligne['gap_c_b']!r}")
    return err


def tout(d):
    j26 = json.loads(d["j26_txt"])
    e1 = c1_structure(d)
    e2, t2 = c2_sources(d)
    e3, t3 = c3_fiches(d, j26)
    e4 = c4_provenance(d, j26)
    e6, info6 = c6_tableau6(d)
    d["info_t6"] = info6
    e7 = c7_ecec(d, j26)
    return {"C1": e1, "C2": e2, "C3": e3, "C4": e4, "C6": e6, "C7": e7}, (t2, t3)


def muter(d, cible, fn):
    m = copy.deepcopy(d)
    if cible == "j26":
        j = json.loads(m["j26_txt"])
        fn(j)
        m["j26_txt"] = m["pub26_txt"] = json.dumps(j, ensure_ascii=False, indent=2) + "\n"
    else:
        fn(m)
    return m


def pays(j, iso):
    return next(c for c in j["countries"] if c["iso2"] == iso)


def alterer_excel(m):
    cle = (("DK", ""), 2026)
    e = m["xl"]["paternity"][cle]
    v = list(e["valeurs"])
    v[4] = v[4] + 1
    e["valeurs"] = tuple(v)


MUTATIONS = [
    ("paternite espagnole ramenee a 2025", "j26", lambda j: pays(j, "ES")["paternity"]["durationMonths"].__setitem__("total", 3.72), ("C3", "C4")),
    ("Costa Rica retire", "j26", lambda j: j["countries"].remove(pays(j, "CR")), ("C1",)),
    ("champ repris de 2025 modifie", "j26", lambda j: pays(j, "FR")["otherMeasures"]["breastfeeding"].__setitem__("exists", False), ("C4",)),
    ("conge parental suedois altere", "j26", lambda j: pays(j, "SE")["parental"]["durationMonths"].__setitem__("total", 20), ("C3", "C4")),
    ("changement du tableau 6 invente", "j26", lambda j: pays(j, "AT")["recentChanges"].append({"type": "expansion", "leaveType": "parental", "description": "invented change"}), ("C4",)),
    ("cellule Excel alteree", "d", alterer_excel, ("C2",)),
    ("bien paye superieur au paye", "j26", lambda j: pays(j, "DE")["maternity"]["durationMonths"].__setitem__("wellPaid", 99), ("C1",)),
    ("age ECEC maltais remis a 3 mois", "j26", lambda j: pays(j, "MT")["ecec"].__setitem__("entitlementAgeMonths", 3), ("C7", "C4")),
    ("changement australien retire du tableau 6", "d", lambda m: next(r for r in m["t6"] if r["iso2"] == "AU").__setitem__("parental", ""), ("C6",)),
]


def main():
    lignes = ["# Controle des chiffres, edition 2026", "", "Genere par `controle_2026.py`.", ""]
    emp = S.verifier_empreintes()
    lignes += ["## C0 Empreintes des sources", "", "Conformes." if not emp else "\n".join(f"- {e}" for e in emp), ""]
    if emp:
        (S.TRAVAIL / "CONTROLE_2026.md").write_text("\n".join(lignes) + "\n", encoding="utf-8", newline="\n")
        print("\n".join(emp))
        sys.exit(1)
    d = charger()
    resultats, (t2, t3) = tout(d)
    total = 0
    noms = {"C1": "Structure", "C2": "Excel LPRN 2026 contre tableaux PDF", "C3": "Fiches 2026 contre tableaux PDF",
            "C4": "Provenance et tableau 6", "C6": "Durees mises a jour et changements du tableau 6",
            "C7": "ECEC contre tableau 4"}
    for k, errs in resultats.items():
        total += len(errs)
        lignes += [f"## {k} {noms[k]}", "", f"{len(errs)} erreur(s)."]
        if k == "C2":
            st = d["c2_stats"]
            lignes += ["Cellules comparables concordantes : " + ", ".join(f"{k} {v[1]}/{v[0]}" for k, v in st.items())
                       + f" ; total {sum(v[1] for v in st.values())}/{sum(v[0] for v in st.values())}.",
                       f"Ecarts declares et justifies : {len(t2)} (voir `ecarts_declares_2026.json`).",
                       f"Lignes du PDF sans equivalent dans l'Excel (secteur public non distingue) : {', '.join(d['sans_equivalent_excel']) or 'aucune'}."]
        if k == "C3":
            lignes += [f"Ecarts declares et justifies : {len(t3)} (voir `ecarts_declares_2026.json`)."]
        lignes += [""] + [f"- {e}" for e in errs] + [""]
        if k == "C6":
            lignes += ["Changements du tableau 6 sans effet sur les durees (pour information ; les tableaux comparent le cas "
                       "standard du premier enfant, et la date de reference est avril 2026) :", ""]
            lignes += [f"- {i}" for i in d["info_t6"]] + [""]
    lignes += ["## C5 Auto-test par alterations", "", "| Alteration | Controle attendu en echec | Resultat |", "|---|---|---|"]
    rates = 0
    for libelle, cible, fn, attendus in MUTATIONS:
        res, _ = tout(muter(d, cible, fn))
        # Detectee si l'alteration ajoute au moins une erreur au controle vise, par rapport a l'etat de base
        echecs = [k for k in attendus if set(res[k]) - set(resultats[k])]
        ok = len(echecs) == len(attendus)
        rates += not ok
        lignes.append(f"| {libelle} | {', '.join(attendus)} | {'detectee' if ok else 'NON DETECTEE'} |")
    lignes += ["", f"{len(MUTATIONS) - rates} alterations detectees sur {len(MUTATIONS)}.", ""]
    total += rates
    lignes += ["## Bilan", "", f"{total} erreur(s) au total." if total else "Aucune erreur.", ""]
    lignes += ["## Ecarts declares", "", "Liste tiree de `ecarts_declares_2026.json`. La colonne Proposition donne la valeur a retenir "
               "dans les deux editions si la correction est validee.", ""]
    for section, titre in (("excel_vs_pdf", "Excel LPRN 2026 contre tableaux du rapport"), ("fiche_vs_pdf", "Fiches 2026 contre tableaux du rapport")):
        decl = DECL[section]
        cats = {}
        for e in decl:
            cats[e["categorie"]] = cats.get(e["categorie"], 0) + 1
        lignes += [f"### {titre} ({len(decl)})", "", "Par categorie : " + ", ".join(f"{k} {v}" for k, v in sorted(cats.items())) + ".", "",
                   "| Cle | Categorie | Proposition | Justification |", "|---|---|---|---|"]
        for e in sorted(decl, key=lambda e: (e["categorie"], e["cle"])):
            prop = e.get("proposition")
            lignes.append(f"| {e['cle']} | {e['categorie']} | {'' if prop is None else prop} | {e['justification']} |")
        lignes.append("")
    (S.TRAVAIL / "CONTROLE_2026.md").write_text("\n".join(lignes) + "\n", encoding="utf-8", newline="\n")
    for k, errs in resultats.items():
        print(f"{k} : {len(errs)} erreur(s)")
        for e in errs[:40]:
            print("   ", e)
    print(f"C5 : {len(MUTATIONS) - rates}/{len(MUTATIONS)} alterations detectees")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
