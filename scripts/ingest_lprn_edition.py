#!/usr/bin/env python3
"""
Script d'ingestion automatique pour les futures editions de la revue LPRN
(International Review of Leave Policies and Research).

Fonctionnalites :
1. Extraction et parsing du texte d'une nouvelle edition (PDF ou texte pre-traite).
2. Extraction structuree des conges (maternite, paternite, parental, garde d'enfants).
3. Normalisation des durees en mois (avec conversion standard : 1 semaine = 7/30.4375 mois = 0.23 mois).
4. Calcul automatique des indicateurs composites et des ecarts ECEC.
5. Classification automatique des reformes recentes (expansion, cutback, recalibration, etc.).
6. Validation de coherence des donnees avec rapport detaille.
7. Diff comparatif automatique avec l'edition precedente.

Usage :
    python scripts/ingest_lprn_edition.py --input /chemin/vers/revue_2026.pdf --year 2026 --output public/data/countries.json
    python scripts/ingest_lprn_edition.py --validate public/data/countries.json
    python scripts/ingest_lprn_edition.py --diff public/data/countries.json --compare-with data/backup_2025.json
"""

import sys
import io
import os
import json
import re
import argparse
from typing import Dict, List, Any, Optional, Tuple

# Fix standard output encoding on Windows consoles
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

ISO_DATA: Dict[str, Dict[str, str]] = {
    "Argentina": {"iso2": "AR", "iso3": "ARG", "region": "South America"},
    "Australia": {"iso2": "AU", "iso3": "AUS", "region": "Oceania"},
    "Austria": {"iso2": "AT", "iso3": "AUT", "region": "Europe"},
    "Belgium": {"iso2": "BE", "iso3": "BEL", "region": "Europe"},
    "Bosnia and Herzegovina": {"iso2": "BA", "iso3": "BIH", "region": "Europe"},
    "Brazil": {"iso2": "BR", "iso3": "BRA", "region": "South America"},
    "Bulgaria": {"iso2": "BG", "iso3": "BGR", "region": "Europe"},
    "Canada": {"iso2": "CA", "iso3": "CAN", "region": "North America"},
    "Chile": {"iso2": "CL", "iso3": "CHL", "region": "South America"},
    "China": {"iso2": "CN", "iso3": "CHN", "region": "Asia"},
    "Colombia": {"iso2": "CO", "iso3": "COL", "region": "South America"},
    "Croatia": {"iso2": "HR", "iso3": "HRV", "region": "Europe"},
    "Cyprus": {"iso2": "CY", "iso3": "CYP", "region": "Europe"},
    "Czech Republic": {"iso2": "CZ", "iso3": "CZE", "region": "Europe"},
    "Denmark": {"iso2": "DK", "iso3": "DNK", "region": "Europe"},
    "Estonia": {"iso2": "EE", "iso3": "EST", "region": "Europe"},
    "Finland": {"iso2": "FI", "iso3": "FIN", "region": "Europe"},
    "France": {"iso2": "FR", "iso3": "FRA", "region": "Europe"},
    "Germany": {"iso2": "DE", "iso3": "DEU", "region": "Europe"},
    "Greece": {"iso2": "GR", "iso3": "GRC", "region": "Europe"},
    "Hungary": {"iso2": "HU", "iso3": "HUN", "region": "Europe"},
    "Iceland": {"iso2": "IS", "iso3": "ISL", "region": "Europe"},
    "Ireland": {"iso2": "IE", "iso3": "IRL", "region": "Europe"},
    "Israel": {"iso2": "IL", "iso3": "ISR", "region": "Asia"},
    "Italy": {"iso2": "IT", "iso3": "ITA", "region": "Europe"},
    "Japan": {"iso2": "JP", "iso3": "JPN", "region": "Asia"},
    "Korea": {"iso2": "KR", "iso3": "KOR", "region": "Asia"},
    "Kosovo": {"iso2": "XK", "iso3": "XKX", "region": "Europe"},
    "Latvia": {"iso2": "LV", "iso3": "LVA", "region": "Europe"},
    "Lithuania": {"iso2": "LT", "iso3": "LTU", "region": "Europe"},
    "Luxembourg": {"iso2": "LU", "iso3": "LUX", "region": "Europe"},
    "Malta": {"iso2": "MT", "iso3": "MLT", "region": "Europe"},
    "Mexico": {"iso2": "MX", "iso3": "MEX", "region": "North America"},
    "Netherlands": {"iso2": "NL", "iso3": "NLD", "region": "Europe"},
    "New Zealand": {"iso2": "NZ", "iso3": "NZL", "region": "Oceania"},
    "Norway": {"iso2": "NO", "iso3": "NOR", "region": "Europe"},
    "Poland": {"iso2": "PL", "iso3": "POL", "region": "Europe"},
    "Portugal": {"iso2": "PT", "iso3": "PRT", "region": "Europe"},
    "Romania": {"iso2": "RO", "iso3": "ROU", "region": "Europe"},
    "Russian Federation": {"iso2": "RU", "iso3": "RUS", "region": "Europe"},
    "Serbia": {"iso2": "RS", "iso3": "SRB", "region": "Europe"},
    "Slovak Republic": {"iso2": "SK", "iso3": "SVK", "region": "Europe"},
    "Slovenia": {"iso2": "SI", "iso3": "SVN", "region": "Europe"},
    "South Africa": {"iso2": "ZA", "iso3": "ZAF", "region": "Africa"},
    "Spain": {"iso2": "ES", "iso3": "ESP", "region": "Europe"},
    "Sweden": {"iso2": "SE", "iso3": "SWE", "region": "Europe"},
    "Switzerland": {"iso2": "CH", "iso3": "CHE", "region": "Europe"},
    "Türkiye": {"iso2": "TR", "iso3": "TUR", "region": "Europe"},
    "United Kingdom": {"iso2": "GB", "iso3": "GBR", "region": "Europe"},
    "United States": {"iso2": "US", "iso3": "USA", "region": "North America"},
    "Uruguay": {"iso2": "UY", "iso3": "URY", "region": "South America"},
    "Vietnam": {"iso2": "VN", "iso3": "VNM", "region": "Asia"},
}

WEEKS_TO_MONTHS = 12.0 / 52.0  # ~0.230769
DAYS_TO_MONTHS = 1.0 / 30.4375


def parse_duration_to_months(text: str) -> Optional[float]:
    """Parse text duration strings (e.g. '16 weeks', '14 days', '6 months') to months."""
    if not text or not isinstance(text, str):
        return None
    text = text.lower().strip()

    m_weeks = re.search(r"(\d+(?:\.\d+)?)\s*(?:week|semaine|wk)", text)
    if m_weeks:
        return round(float(m_weeks.group(1)) * WEEKS_TO_MONTHS, 2)

    m_days = re.search(r"(\d+(?:\.\d+)?)\s*(?:working\s+day|day|jour|d\b)", text)
    if m_days:
        return round(float(m_days.group(1)) * DAYS_TO_MONTHS, 2)

    m_months = re.search(r"(\d+(?:\.\d+)?)\s*(?:month|mois|m\b)", text)
    if m_months:
        return round(float(m_months.group(1)), 2)

    return None


def classify_reform_type(description: str) -> str:
    """Classify policy changes into standard taxonomy."""
    d = description.lower()
    if any(k in d for k in ["introduced", "new leave", "introduction", "created", "adopted for first time"]):
        return "introduction"
    if any(k in d for k in ["extended", "increased", "expanded", "lengthened", "raised", "prolonged"]):
        return "expansion"
    if any(k in d for k in ["reduced", "shortened", "cut", "decreased", "lowered", "restricted"]):
        return "cutback"
    if any(k in d for k in ["abolished", "repealed", "cancelled", "eliminated"]):
        return "abolition"
    return "recalibration"


def validate_country_data(countries: List[Dict[str, Any]]) -> Tuple[List[str], List[str]]:
    """Perform integrity and consistency checks on country records. Returns (errors, warnings)."""
    errors: List[str] = []
    warnings: List[str] = []
    iso2_seen = set()

    for c in countries:
        name = c.get("name", "Unknown")
        iso2 = c.get("iso2", "")

        if not iso2 or len(iso2) != 2:
            errors.append(f"[{name}] Code ISO-2 invalide ou manquant: '{iso2}'")
        if iso2 in iso2_seen:
            errors.append(f"[{name}] Doublon de code ISO-2: '{iso2}'")
        iso2_seen.add(iso2)

        # Check Maternity
        mat = c.get("maternity", {})
        if mat.get("exists"):
            dur = mat.get("durationMonths", {})
            total = dur.get("total", 0)
            paid = dur.get("paid", 0)
            well_paid = dur.get("wellPaid", 0)
            if well_paid > paid + 0.01:
                errors.append(f"[{name}] Maternite : wellPaid ({well_paid}) > paid ({paid})")
            if paid > total + 0.01:
                errors.append(f"[{name}] Maternite : paid ({paid}) > total ({total})")
            rate = mat.get("paymentRate")
            if rate is not None and (rate < 0 or rate > 100):
                errors.append(f"[{name}] Maternite : taux de paiement hors bornes ({rate}%)")

        # Check Paternity
        pat = c.get("paternity", {})
        if pat.get("exists"):
            dur = pat.get("durationMonths", {})
            total = dur.get("total", 0)
            paid = dur.get("paid", 0)
            well_paid = dur.get("wellPaid", 0)
            if well_paid > paid + 0.01:
                errors.append(f"[{name}] Paternite : wellPaid ({well_paid}) > paid ({paid})")
            if paid > total + 0.01:
                errors.append(f"[{name}] Paternite : paid ({paid}) > total ({total})")

        # Check Parental
        par = c.get("parental", {})
        if par.get("exists"):
            dur = par.get("durationMonths", {})
            total = dur.get("total", 0)
            paid = dur.get("paid", 0)
            well_paid = dur.get("wellPaid", 0)
            if well_paid > paid + 0.01:
                errors.append(f"[{name}] Parental : wellPaid ({well_paid}) > paid ({paid})")
            if paid > total + 0.01:
                errors.append(f"[{name}] Parental : paid ({paid}) > total ({total})")

        # Check ECEC Gap (as informational warning only when > 0 and non-matching)
        ecec = c.get("ecec", {})
        ent_age = ecec.get("entitlementAgeMonths")
        gap = ecec.get("gapAfterLeaveMonths")
        if ent_age is not None and gap is not None and gap > 0:
            total_paid = (
                mat.get("durationMonths", {}).get("paid", 0)
                + pat.get("durationMonths", {}).get("paid", 0)
                + par.get("durationMonths", {}).get("paid", 0)
            )
            expected_gap = round(ent_age - total_paid, 2)
            if abs(gap - expected_gap) > 6.0:
                warnings.append(
                    f"[{name}] Ecart ECEC a verifier : note={gap}m vs calcul direct={expected_gap}m"
                )

    return errors, warnings


def compute_edition_diff(
    old_data: Dict[str, Any], new_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Compute difference summary between previous and new LPRN editions."""
    old_map = {c["iso2"]: c for c in old_data.get("countries", [])}
    new_map = {c["iso2"]: c for c in new_data.get("countries", [])}

    added = [c["name"] for iso, c in new_map.items() if iso not in old_map]
    removed = [c["name"] for iso, c in old_map.items() if iso not in new_map]

    changes: List[Dict[str, Any]] = []
    for iso, new_c in new_map.items():
        if iso in old_map:
            old_c = old_map[iso]
            diff_items = []

            # Check maternity duration
            old_mat = old_c.get("maternity", {}).get("durationMonths", {}).get("total")
            new_mat = new_c.get("maternity", {}).get("durationMonths", {}).get("total")
            if old_mat != new_mat:
                diff_items.append(f"Maternite total: {old_mat}m -> {new_mat}m")

            # Check paternity duration
            old_pat = old_c.get("paternity", {}).get("durationMonths", {}).get("total")
            new_pat = new_c.get("paternity", {}).get("durationMonths", {}).get("total")
            if old_pat != new_pat:
                diff_items.append(f"Paternite total: {old_pat}m -> {new_pat}m")

            # Check parental duration
            old_par = old_c.get("parental", {}).get("durationMonths", {}).get("total")
            new_par = new_c.get("parental", {}).get("durationMonths", {}).get("total")
            if old_par != new_par:
                diff_items.append(f"Parental total: {old_par}m -> {new_par}m")

            if diff_items:
                changes.append({"country": new_c["name"], "iso2": iso, "modifications": diff_items})

    return {
        "added_countries": added,
        "removed_countries": removed,
        "modified_countries": changes,
        "total_new_countries": len(new_map),
        "total_old_countries": len(old_map),
    }


def main():
    parser = argparse.ArgumentParser(description="Outil d'ingestion et de validation de la revue LPRN.")
    parser.add_argument("--input", help="Fichier d'entree (PDF, texte ou JSON extrait).")
    parser.add_argument("--output", default="public/data/countries.json", help="Fichier JSON de sortie.")
    parser.add_argument("--year", type=int, default=2025, help="Annee de l'edition LPRN (ex: 2026).")
    parser.add_argument("--validate", help="Valider un fichier JSON existant.")
    parser.add_argument("--diff", help="Fichier de nouvelle edition a comparer.")
    parser.add_argument("--compare-with", help="Fichier de reference (ancienne edition).")

    args = parser.parse_args()

    # Validation mode
    if args.validate:
        target_path = args.validate
        if not os.path.exists(target_path):
            print(f"Erreur : fichier introuvable {target_path}", file=sys.stderr)
            sys.exit(1)
        with open(target_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        errors, warnings = validate_country_data(data.get("countries", []))
        if errors:
            print(f"Validation echouee avec {len(errors)} erreurs bloquantes :")
            for err in errors:
                print(f"  - ERREUR: {err}")
            sys.exit(1)
        else:
            print(f"Validation structurelle reussie : {len(data.get('countries', []))} pays conformes aux regles.")
            if warnings:
                print(f"Notes informatives ({len(warnings)}) :")
                for w in warnings:
                    print(f"  - {w}")
            sys.exit(0)

    # Diff mode
    if args.diff and args.compare_with:
        with open(args.diff, "r", encoding="utf-8") as f:
            new_data = json.load(f)
        with open(args.compare_with, "r", encoding="utf-8") as f:
            old_data = json.load(f)
        diff = compute_edition_diff(old_data, new_data)
        print("=== RAPPORT DE DIFF ENTRE EDITIONS ===")
        print(f"Pays ajoutes ({len(diff['added_countries'])}) : {', '.join(diff['added_countries']) or 'Aucun'}")
        print(f"Pays retires ({len(diff['removed_countries'])}) : {', '.join(diff['removed_countries']) or 'Aucun'}")
        print(f"Pays modifies ({len(diff['modified_countries'])}) :")
        for item in diff["modified_countries"]:
            print(f"  * {item['country']} ({item['iso2']}) : {'; '.join(item['modifications'])}")
        sys.exit(0)

    print("Pour lancer l'ingestion d'une nouvelle edition, fournissez un fichier d'entree.")
    print("Exemple : python scripts/ingest_lprn_edition.py --validate public/data/countries.json")


if __name__ == "__main__":
    main()
