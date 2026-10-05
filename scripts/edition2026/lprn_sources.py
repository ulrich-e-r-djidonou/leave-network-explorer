"""Lecture des sources de l'edition 2026 : Excel LPRN 2023-2026 et tableaux PDF extraits par Codex.

Toutes les valeurs restent celles des sources. Les seules interventions sont declarees ici
(CORRECTIONS_EXCEL) et listees dans le rapport de construction.
"""
import csv
import hashlib
import io
import json
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
ICI = Path(__file__).resolve().parent
SOURCES = json.loads((ICI / "sources.json").read_text(encoding="utf-8"))

SEMAINES_PAR_MOIS = 4.3  # regle du LPRN, notes des tableaux 1 a 3 ; deja appliquee en 2025 (CORRECTIONS_LOG.md)


def console_utf8():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")


def sha256(chemin):
    return hashlib.sha256(Path(chemin).read_bytes()).hexdigest()


def verifier_empreintes():
    """Renvoie la liste des ecarts d'empreinte ; vide si toutes les sources sont conformes."""
    ecarts = []
    xl = SOURCES["excel_lprn"]
    p = RACINE / xl["chemin"]
    if not p.exists():
        ecarts.append(f"absent : {p}")
    elif sha256(p) != xl["sha256"]:
        ecarts.append(f"empreinte differente : {p}")
    dossier = RACINE / SOURCES["tableaux_pdf_codex"]["dossier"]
    for nom, attendu in SOURCES["tableaux_pdf_codex"]["fichiers"].items():
        p = dossier / nom
        if not p.exists():
            ecarts.append(f"absent : {p}")
        elif sha256(p) != attendu:
            ecarts.append(f"empreinte differente : {p}")
    return ecarts


# ---------------------------------------------------------------------------
# Correspondance des libelles vers (iso2, variante)

NOMS = {
    "argentina": "AR", "australia": "AU", "austria": "AT", "belgium": "BE",
    "bosnia and herzegovina": "BA", "brazil": "BR", "bulgaria": "BG", "canada": "CA",
    "chile": "CL", "china": "CN", "colombia": "CO", "costa rica": "CR", "croatia": "HR",
    "cyprus": "CY", "czech republic": "CZ", "denmark": "DK", "estonia": "EE",
    "finland": "FI", "france": "FR", "germany": "DE", "greece": "GR", "hungary": "HU",
    "iceland": "IS", "ireland": "IE", "israel": "IL", "italy": "IT", "japan": "JP",
    "korea": "KR", "kosovo": "XK", "latvia": "LV", "lithuania": "LT", "luxembourg": "LU",
    "malta": "MT", "mexico": "MX", "netherlands": "NL", "new zealand": "NZ",
    "norway": "NO", "poland": "PL", "portugal": "PT", "romania": "RO",
    "russian federation": "RU", "serbia": "RS", "slovak republic": "SK", "slovenia": "SI",
    "south africa": "ZA", "spain": "ES", "sweden": "SE", "switzerland": "CH",
    "türkiye": "TR", "united kingdom": "GB", "united states": "US", "uruguay": "UY",
    "vietnam": "VN",
}


def cle_libelle(libelle):
    """'Argentina (private)' -> ('AR', 'private') ; 'Canada Quebec' -> ('CA', 'Quebec')."""
    lab = libelle.strip()
    if lab.lower().replace(":", "").replace("é", "e") == "canada quebec":
        return ("CA", "Quebec")
    var = ""
    m = re.match(r"^(.*?)\s*\((private|public)\)$", lab)
    if m:
        lab, var = m.group(1), m.group(2)
    iso = NOMS.get(lab.lower())
    return (iso, var) if iso else None


# ---------------------------------------------------------------------------
# Excel LPRN

FEUILLES = {"maternity": "MaternityLeave", "paternity": "PaternityLeave", "parental": "ParentalLeave"}

# ANO-X001 : quatre series portent deux lignes « 2025 » et aucune « 2026 ». La seconde ligne
# suit la premiere dans l'ordre 2023, 2024, 2025 de toutes les autres series : c'est l'annee 2026.
CORRECTIONS_EXCEL = []


def charger_excel():
    import openpyxl

    wb = openpyxl.load_workbook(RACINE / SOURCES["excel_lprn"]["chemin"], read_only=True, data_only=True)
    donnees = {}
    for conge, feuille in FEUILLES.items():
        lignes = list(wb[feuille].iter_rows(values_only=True))
        table, vus = {}, {}
        for n, r in enumerate(lignes[1:], start=2):
            if not r[0] or not isinstance(r[1], int):
                continue  # lignes de notes en bas de feuille
            cle = cle_libelle(r[0])
            if cle is None:
                raise SystemExit(f"Libelle Excel inconnu : {feuille} ligne {n} {r[0]!r}")
            annee = r[1]
            if annee in vus.setdefault(cle, set()):
                if annee == 2025 and 2026 not in vus[cle]:
                    CORRECTIONS_EXCEL.append(
                        {"anomalie": "ANO-X001", "feuille": feuille, "ligne": n, "libelle": r[0],
                         "regle": "seconde ligne 2025 lue comme 2026"})
                    annee = 2026
                else:
                    raise SystemExit(f"Annee en double non resolue : {feuille} ligne {n} {r[0]!r} {annee}")
            vus[cle].add(annee)
            table[(cle, annee)] = {"ligne": n, "libelle": r[0].strip(), "valeurs": r}
        donnees[conge] = table
    return donnees


def ligne_excel(xl, conge, cle, annee):
    """Ligne Excel d'une entite ; une variante absente retombe sur la ligne sans variante
    (ex. Uruguay, fusionne en une seule ligne a partir de 2025)."""
    t = xl[conge]
    if (cle, annee) in t:
        return t[(cle, annee)]
    if cle[1] and ((cle[0], ""), annee) in t:
        return t[((cle[0], ""), annee)]
    return None


def nombre(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    return None


# ---------------------------------------------------------------------------
# Tableaux PDF (extraction Codex)

def charger_tableau(nom):
    chemin = RACINE / SOURCES["tableaux_pdf_codex"]["dossier"] / nom
    with open(chemin, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def nombre_imprime(s):
    """Chaine imprimee -> nombre si la cellule est un nombre seul (exposants et * de plafond retires)."""
    s = re.sub(r"<sup>.*?</sup>", "", s or "").strip().rstrip("*").strip()
    return float(s) if re.fullmatch(r"\d+(?:\.\d+)?", s) else None
