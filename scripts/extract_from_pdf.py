#!/usr/bin/env python3
"""
Script de re-extraction des donnees du PDF Leave Network.

Usage:
    python scripts/extract_from_pdf.py <chemin_vers_pdf> [--output public/data/countries.json]

Ce script:
1. Extrait le texte du PDF avec pdftotext
2. Identifie les sections pays (alphabetiques)
3. Genere un fichier JSON structure compatible avec l'app

Note: L'extraction automatique est approximative. Une verification manuelle
est recommandee pour les donnees numeriques critiques (durees, taux).

Prerequis:
    - pdftotext (poppler-utils) installe
    - Python 3.8+
"""

import subprocess
import json
import re
import sys
import os
from pathlib import Path


# 52 pays couverts par la revue 2025
COUNTRIES = [
    "Argentina", "Australia", "Austria", "Belgium",
    "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Canada",
    "Chile", "China", "Colombia", "Croatia", "Cyprus",
    "Czech Republic", "Denmark", "Estonia", "Finland", "France",
    "Germany", "Greece", "Hungary", "Iceland", "Ireland",
    "Israel", "Italy", "Japan", "Korea", "Kosovo",
    "Latvia", "Lithuania", "Luxembourg", "Malta", "Mexico",
    "Netherlands", "New Zealand", "Norway", "Poland", "Portugal",
    "Romania", "Russian Federation", "Serbia", "Slovak Republic",
    "Slovenia", "South Africa", "Spain", "Sweden", "Switzerland",
    "Türkiye", "United Kingdom", "United States", "Uruguay", "Vietnam",
]

ISO2_MAP = {
    "Argentina": "AR", "Australia": "AU", "Austria": "AT", "Belgium": "BE",
    "Bosnia and Herzegovina": "BA", "Brazil": "BR", "Bulgaria": "BG",
    "Canada": "CA", "Chile": "CL", "China": "CN", "Colombia": "CO",
    "Croatia": "HR", "Cyprus": "CY", "Czech Republic": "CZ",
    "Denmark": "DK", "Estonia": "EE", "Finland": "FI", "France": "FR",
    "Germany": "DE", "Greece": "GR", "Hungary": "HU", "Iceland": "IS",
    "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Japan": "JP",
    "Korea": "KR", "Kosovo": "XK", "Latvia": "LV", "Lithuania": "LT",
    "Luxembourg": "LU", "Malta": "MT", "Mexico": "MX",
    "Netherlands": "NL", "New Zealand": "NZ", "Norway": "NO",
    "Poland": "PL", "Portugal": "PT", "Romania": "RO",
    "Russian Federation": "RU", "Serbia": "RS", "Slovak Republic": "SK",
    "Slovenia": "SI", "South Africa": "ZA", "Spain": "ES",
    "Sweden": "SE", "Switzerland": "CH", "Türkiye": "TR",
    "United Kingdom": "GB", "United States": "US", "Uruguay": "UY",
    "Vietnam": "VN",
}

REGION_MAP = {
    "AR": "South America", "AU": "Oceania", "AT": "Europe", "BE": "Europe",
    "BA": "Europe", "BR": "South America", "BG": "Europe", "CA": "North America",
    "CL": "South America", "CN": "Asia", "CO": "South America", "HR": "Europe",
    "CY": "Europe", "CZ": "Europe", "DK": "Europe", "EE": "Europe",
    "FI": "Europe", "FR": "Europe", "DE": "Europe", "GR": "Europe",
    "HU": "Europe", "IS": "Europe", "IE": "Europe", "IL": "Asia",
    "IT": "Europe", "JP": "Asia", "KR": "Asia", "XK": "Europe",
    "LV": "Europe", "LT": "Europe", "LU": "Europe", "MT": "Europe",
    "MX": "North America", "NL": "Europe", "NZ": "Oceania", "NO": "Europe",
    "PL": "Europe", "PT": "Europe", "RO": "Europe", "RU": "Europe",
    "RS": "Europe", "SK": "Europe", "SI": "Europe", "ZA": "Africa",
    "ES": "Europe", "SE": "Europe", "CH": "Europe", "TR": "Europe",
    "GB": "Europe", "US": "North America", "UY": "South America", "VN": "Asia",
}


def extract_text(pdf_path: str) -> str:
    """Extract text from PDF using pdftotext."""
    result = subprocess.run(
        ["pdftotext", pdf_path, "-"],
        capture_output=True, text=True, encoding="utf-8"
    )
    if result.returncode != 0:
        print(f"Erreur pdftotext: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return result.stdout


def split_country_notes(text: str) -> dict[str, str]:
    """Split the text into per-country sections."""
    sections = {}
    lines = text.split("\n")

    # Find "4.Country Notes" section
    start_idx = 0
    for i, line in enumerate(lines):
        if "Country Notes" in line and "April" in line:
            start_idx = i
            break

    # Split by country name headers
    current_country = None
    current_lines = []

    for line in lines[start_idx:]:
        # Check if this line starts a new country section
        for country in COUNTRIES:
            if line.strip().startswith(country) and len(line.strip()) < len(country) + 5:
                if current_country:
                    sections[current_country] = "\n".join(current_lines)
                current_country = country
                current_lines = []
                break
        if current_country:
            current_lines.append(line)

    if current_country:
        sections[current_country] = "\n".join(current_lines)

    return sections


def create_skeleton(name: str) -> dict:
    """Create a skeleton country record with default values."""
    iso2 = ISO2_MAP.get(name, "XX")
    return {
        "name": name,
        "iso2": iso2,
        "iso3": "",  # To be filled
        "region": REGION_MAP.get(iso2, ""),
        "federal": False,
        "subnationalVariations": [],
        "maternity": {
            "exists": False,
            "durationMonths": {"total": 0, "paid": 0, "wellPaid": 0},
            "paymentRate": None,
            "paymentType": None,
            "ceiling": False,
            "obligatory": False,
            "transferable": False,
            "flexPartTime": False,
            "flexBlocks": False,
            "fundingSource": None,
        },
        "paternity": {
            "exists": False,
            "durationMonths": {"total": 0, "paid": 0, "wellPaid": 0},
            "paymentRate": None,
            "paymentType": None,
            "ceiling": False,
            "obligatory": False,
            "transferable": False,
            "flexPartTime": False,
            "flexBlocks": False,
            "fundingSource": None,
        },
        "parental": {
            "exists": False,
            "durationMonths": {"total": 0, "paid": 0, "wellPaid": 0},
            "entitlementType": None,
            "motherQuotaMonths": None,
            "fatherQuotaMonths": None,
            "sharedPortionMonths": None,
            "paymentRate": None,
            "paymentType": None,
            "ceiling": False,
            "obligatory": False,
            "transferable": False,
            "flexPartTime": False,
            "flexBlocks": False,
            "fundingSource": None,
        },
        "childcareLeave": {
            "exists": False,
            "durationMonths": None,
            "paid": False,
            "details": None,
        },
        "otherMeasures": {
            "sickChildLeave": {"exists": False, "daysPerYear": None, "paid": False},
            "breastfeeding": {"exists": False},
            "flexibleWork": {"rightToRequest": False},
            "domesticViolenceLeave": {"exists": False},
            "bereavementLeave": {"exists": False},
        },
        "ecec": {
            "universalEntitlement": False,
            "entitlementAgeMonths": None,
            "gapAfterLeaveMonths": None,
        },
        "recentChanges": [],
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_from_pdf.py <pdf_path> [--output <json_path>]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_path = "public/data/countries.json"
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        output_path = sys.argv[idx + 1]

    print(f"Extraction du PDF: {pdf_path}")
    text = extract_text(pdf_path)
    print(f"Texte extrait: {len(text)} caracteres")

    sections = split_country_notes(text)
    print(f"Sections pays identifiees: {len(sections)}")

    # Create skeleton records
    countries = []
    for name in COUNTRIES:
        record = create_skeleton(name)
        if name in sections:
            print(f"  {name}: {len(sections[name])} caracteres")
        else:
            print(f"  {name}: SECTION NON TROUVEE")
        countries.append(record)

    # Save skeleton (to be enriched manually or with Claude)
    data = {
        "metadata": {
            "year": 2025,
            "asOf": "April 2025",
            "source": "International Review of Leave Policies and Research 2025",
            "editors": "Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M.",
            "totalCountries": len(countries),
        },
        "countries": countries,
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nJSON squelette sauvegarde: {output_path}")
    print("ATTENTION: Les donnees numeriques doivent etre remplies manuellement")
    print("ou avec Claude Code (voir CLAUDE.md pour les commandes).")
    print(f"\nPour enrichir automatiquement avec Claude:")
    print(f'  claude "Enrichis {output_path} avec les donnees du PDF {pdf_path}"')


if __name__ == "__main__":
    main()
