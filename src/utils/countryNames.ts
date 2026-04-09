/** French translations for country names (ISO2 → French name) */
const COUNTRY_NAMES_FR: Record<string, string> = {
  AR: 'Argentine',
  AU: 'Australie',
  AT: 'Autriche',
  BE: 'Belgique',
  BA: 'Bosnie-Herz\u00e9govine',
  BR: 'Br\u00e9sil',
  BG: 'Bulgarie',
  CA: 'Canada',
  CL: 'Chili',
  CN: 'Chine',
  CO: 'Colombie',
  HR: 'Croatie',
  CZ: 'R\u00e9publique tch\u00e8que',
  DK: 'Danemark',
  EE: 'Estonie',
  FI: 'Finlande',
  FR: 'France',
  DE: 'Allemagne',
  GR: 'Gr\u00e8ce',
  HU: 'Hongrie',
  IS: '\u00ceslande',
  IE: 'Irlande',
  IL: 'Isra\u00ebl',
  IT: 'Italie',
  JP: 'Japon',
  KR: 'Cor\u00e9e du Sud',
  LV: 'Lettonie',
  LT: 'Lituanie',
  LU: 'Luxembourg',
  MT: 'Malte',
  MX: 'Mexique',
  NL: 'Pays-Bas',
  NZ: 'Nouvelle-Z\u00e9lande',
  NO: 'Norv\u00e8ge',
  PL: 'Pologne',
  PT: 'Portugal',
  RO: 'Roumanie',
  RU: 'F\u00e9d\u00e9ration de Russie',
  SK: 'R\u00e9publique slovaque',
  SI: 'Slov\u00e9nie',
  ZA: 'Afrique du Sud',
  ES: 'Espagne',
  SE: 'Su\u00e8de',
  CH: 'Suisse',
  TR: 'T\u00fcrkiye',
  GB: 'Royaume-Uni',
  US: '\u00c9tats-Unis',
  UY: 'Uruguay',
  CY: 'Chypre',
  RS: 'Serbie',
  UA: 'Ukraine',
  VN: 'Vi\u00eat Nam',
  XK: 'Kosovo',
};

/**
 * Returns the country display name in the given language.
 * Falls back to the original English name if no FR translation is found.
 */
export function getCountryName(
  name: string,
  iso2: string,
  lang: 'fr' | 'en'
): string {
  if (lang === 'en') return name;
  return COUNTRY_NAMES_FR[iso2?.toUpperCase()] ?? name;
}
