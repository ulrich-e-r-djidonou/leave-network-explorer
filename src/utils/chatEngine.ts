import type { Country } from '../types';
import {
  formatDuration,
  getTotalLeaveMonths,
  getGenerosityScore,
  getGenderEqualityScore,
} from './calculations';

type Lang = 'fr' | 'en';

// ---------------------------------------------------------------------------
// Country name aliases for fuzzy matching (lowercase)
// ---------------------------------------------------------------------------
const COUNTRY_ALIASES: Record<string, string[]> = {
  'Argentina': ['argentina', 'argentine'],
  'Australia': ['australia', 'australie'],
  'Austria': ['austria', 'autriche'],
  'Belgium': ['belgium', 'belgique'],
  'Bosnia and Herzegovina': ['bosnia', 'bosnie', 'herzegovine', 'herzegovina'],
  'Brazil': ['brazil', 'bresil', 'brésil'],
  'Bulgaria': ['bulgaria', 'bulgarie'],
  'Canada': ['canada'],
  'Chile': ['chile', 'chili'],
  'China': ['china', 'chine'],
  'Colombia': ['colombia', 'colombie'],
  'Croatia': ['croatia', 'croatie'],
  'Cyprus': ['cyprus', 'chypre'],
  'Czech Republic': ['czech', 'tcheque', 'tchèque', 'czechia', 'tchéquie'],
  'Denmark': ['denmark', 'danemark'],
  'Estonia': ['estonia', 'estonie'],
  'Finland': ['finland', 'finlande'],
  'France': ['france'],
  'Germany': ['germany', 'allemagne'],
  'Greece': ['greece', 'grece', 'grèce'],
  'Hungary': ['hungary', 'hongrie'],
  'Iceland': ['iceland', 'islande'],
  'Ireland': ['ireland', 'irlande'],
  'Israel': ['israel', 'israël'],
  'Italy': ['italy', 'italie'],
  'Japan': ['japan', 'japon'],
  'Korea': ['korea', 'coree', 'corée', 'south korea', 'corée du sud'],
  'Kosovo': ['kosovo'],
  'Latvia': ['latvia', 'lettonie'],
  'Lithuania': ['lithuania', 'lituanie'],
  'Luxembourg': ['luxembourg'],
  'Malta': ['malta', 'malte'],
  'Mexico': ['mexico', 'mexique'],
  'Netherlands': ['netherlands', 'pays-bas', 'pays bas', 'holland', 'hollande'],
  'New Zealand': ['new zealand', 'nouvelle-zelande', 'nouvelle-zélande', 'nouvelle zelande'],
  'Norway': ['norway', 'norvege', 'norvège'],
  'Poland': ['poland', 'pologne'],
  'Portugal': ['portugal'],
  'Romania': ['romania', 'roumanie'],
  'Russia': ['russia', 'russie'],
  'Serbia': ['serbia', 'serbie'],
  'Slovak Republic': ['slovakia', 'slovaquie', 'slovak'],
  'Slovenia': ['slovenia', 'slovenie', 'slovénie'],
  'South Africa': ['south africa', 'afrique du sud'],
  'Spain': ['spain', 'espagne'],
  'Sweden': ['sweden', 'suede', 'suède'],
  'Switzerland': ['switzerland', 'suisse'],
  'Turkiye': ['turkiye', 'turkey', 'turquie'],
  'United Kingdom': ['uk', 'united kingdom', 'royaume-uni', 'royaume uni', 'britain', 'grande-bretagne'],
  'United States': ['usa', 'us', 'united states', 'etats-unis', 'états-unis', 'etats unis'],
  'Uruguay': ['uruguay'],
  'Vietnam': ['vietnam', 'viet nam'],
};

// ---------------------------------------------------------------------------
// Intent detection helpers
// ---------------------------------------------------------------------------

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function findCountryByText(
  query: string,
  countries: Country[],
): Country | undefined {
  const q = normalise(query);

  // 1. Direct match on country name (exact or contained)
  for (const c of countries) {
    if (normalise(c.name) === q) return c;
  }

  // 2. Alias table
  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (aliases.some((a) => q.includes(normalise(a)))) {
      const found = countries.find(
        (c) => normalise(c.name) === normalise(canonical),
      );
      if (found) return found;
    }
  }

  // 3. Partial match on country name (substring)
  for (const c of countries) {
    const nName = normalise(c.name);
    if (nName.includes(q) || q.includes(nName)) return c;
  }

  return undefined;
}

function extractCountryNames(
  tokens: string[],
  countries: Country[],
): Country[] {
  const results: Country[] = [];
  const joined = tokens.join(' ');

  // Try progressively larger n-grams (up to 4 tokens)
  for (let n = 4; n >= 1; n--) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n).join(' ');
      const c = findCountryByText(gram, countries);
      if (c && !results.some((r) => r.name === c.name)) {
        results.push(c);
      }
    }
  }

  // Also try the whole string minus comparison keywords
  const cleaned = joined
    .replace(/\b(compare|comparer|vs|versus|et|and|with|avec)\b/g, ' ')
    .trim();
  const parts = cleaned.split(/\s{2,}/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length > 1) {
      const c = findCountryByText(trimmed, countries);
      if (c && !results.some((r) => r.name === c.name)) {
        results.push(c);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Response formatters
// ---------------------------------------------------------------------------

function fmtVal(v: number | null, lang: Lang): string {
  return formatDuration(v, lang);
}

function fmtRate(rate: number | null): string {
  if (rate === null || rate === undefined) return 'N/A';
  return `${rate}%`;
}

function countrySummary(c: Country, lang: Lang): string {
  const title =
    lang === 'fr' ? `-- ${c.name} --` : `-- ${c.name} --`;

  const matLabel = lang === 'fr' ? 'Maternit\u00e9' : 'Maternity';
  const patLabel = lang === 'fr' ? 'Paternit\u00e9' : 'Paternity';
  const parLabel = lang === 'fr' ? 'Parental' : 'Parental';
  const totalLabel = lang === 'fr' ? 'Total cong\u00e9s pay\u00e9s' : 'Total paid leave';
  const genLabel = lang === 'fr' ? 'Score de g\u00e9n\u00e9rosit\u00e9' : 'Generosity score';
  const eqLabel = lang === 'fr' ? '\u00c9galit\u00e9 des genres' : 'Gender equality';
  const durationLbl = lang === 'fr' ? 'Dur\u00e9e totale' : 'Total duration';
  const paidLbl = lang === 'fr' ? 'Dont pay\u00e9' : 'Paid';
  const wellPaidLbl = lang === 'fr' ? 'Bien pay\u00e9' : 'Well-paid';
  const rateLbl = lang === 'fr' ? 'Taux' : 'Rate';
  const noLeaveLbl = lang === 'fr' ? 'Non disponible' : 'Not available';

  const lines: string[] = [title, ''];

  const formatLeave = (
    label: string,
    policy: Country['maternity'] | Country['paternity'] | Country['parental'],
  ) => {
    if (!policy?.exists) {
      lines.push(`${label}: ${noLeaveLbl}`);
      return;
    }
    lines.push(`${label}:`);
    lines.push(`  ${durationLbl}: ${fmtVal(policy.durationMonths?.total, lang)}`);
    lines.push(`  ${paidLbl}: ${fmtVal(policy.durationMonths?.paid, lang)}`);
    lines.push(`  ${wellPaidLbl}: ${fmtVal(policy.durationMonths?.wellPaid, lang)}`);
    lines.push(`  ${rateLbl}: ${fmtRate(policy.paymentRate)}`);
  };

  formatLeave(matLabel, c.maternity);
  lines.push('');
  formatLeave(patLabel, c.paternity);
  lines.push('');
  formatLeave(parLabel, c.parental);
  lines.push('');

  const totalMonths = getTotalLeaveMonths(c);
  lines.push(`${totalLabel}: ${fmtVal(totalMonths, lang)}`);
  lines.push(`${genLabel}: ${fmtVal(getGenerosityScore(c), lang)} (ETP)`);
  const geq = getGenderEqualityScore(c);
  lines.push(`${eqLabel}: ${geq !== null ? `${geq}/100` : 'N/A'}`);

  return lines.join('\n');
}

function comparisonResponse(
  a: Country,
  b: Country,
  lang: Lang,
): string {
  const header =
    lang === 'fr'
      ? `Comparaison : ${a.name} vs ${b.name}`
      : `Comparison: ${a.name} vs ${b.name}`;

  const rows: Array<{ label: string; valA: string; valB: string }> = [];

  const lbl = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  rows.push({
    label: lbl('Maternit\u00e9 (total)', 'Maternity (total)'),
    valA: fmtVal(a.maternity?.durationMonths?.total, lang),
    valB: fmtVal(b.maternity?.durationMonths?.total, lang),
  });
  rows.push({
    label: lbl('Maternit\u00e9 (taux)', 'Maternity (rate)'),
    valA: fmtRate(a.maternity?.paymentRate),
    valB: fmtRate(b.maternity?.paymentRate),
  });
  rows.push({
    label: lbl('Paternit\u00e9 (total)', 'Paternity (total)'),
    valA: fmtVal(a.paternity?.durationMonths?.total, lang),
    valB: fmtVal(b.paternity?.durationMonths?.total, lang),
  });
  rows.push({
    label: lbl('Parental (total)', 'Parental (total)'),
    valA: fmtVal(a.parental?.durationMonths?.total, lang),
    valB: fmtVal(b.parental?.durationMonths?.total, lang),
  });
  rows.push({
    label: lbl('Total cong\u00e9s pay\u00e9s', 'Total paid leave'),
    valA: fmtVal(getTotalLeaveMonths(a), lang),
    valB: fmtVal(getTotalLeaveMonths(b), lang),
  });
  rows.push({
    label: lbl('G\u00e9n\u00e9rosit\u00e9', 'Generosity'),
    valA: `${fmtVal(getGenerosityScore(a), lang)} ETP`,
    valB: `${fmtVal(getGenerosityScore(b), lang)} ETP`,
  });
  rows.push({
    label: lbl('\u00c9galit\u00e9 genres', 'Gender equality'),
    valA: (() => { const s = getGenderEqualityScore(a); return s !== null ? `${s}/100` : 'N/A'; })(),
    valB: (() => { const s = getGenderEqualityScore(b); return s !== null ? `${s}/100` : 'N/A'; })(),
  });

  const colA = a.name.length > 12 ? a.name.substring(0, 12) : a.name;
  const colB = b.name.length > 12 ? b.name.substring(0, 12) : b.name;

  const lines: string[] = [header, ''];
  const pad = (s: string, len: number) => s.padEnd(len);

  lines.push(
    `${pad('', 22)} ${pad(colA, 14)} ${pad(colB, 14)}`,
  );
  lines.push('-'.repeat(50));
  for (const r of rows) {
    lines.push(
      `${pad(r.label, 22)} ${pad(r.valA, 14)} ${pad(r.valB, 14)}`,
    );
  }

  return lines.join('\n');
}

function rankingResponse(
  countries: Country[],
  leaveType: 'maternity' | 'paternity' | 'parental' | 'total' | 'generosity' | 'gender',
  direction: 'top' | 'bottom',
  lang: Lang,
): string {
  const getValue = (c: Country): number => {
    switch (leaveType) {
      case 'maternity':
        return c.maternity?.durationMonths?.total ?? 0;
      case 'paternity':
        return c.paternity?.durationMonths?.total ?? 0;
      case 'parental':
        return c.parental?.durationMonths?.total ?? 0;
      case 'total':
        return getTotalLeaveMonths(c);
      case 'generosity':
        return getGenerosityScore(c);
      case 'gender':
        return getGenderEqualityScore(c) ?? 0;
    }
  };

  const sorted = [...countries].sort((a, b) =>
    direction === 'top'
      ? getValue(b) - getValue(a)
      : getValue(a) - getValue(b),
  );

  const top5 = sorted.slice(0, 5);

  const typeLabels: Record<string, Record<Lang, string>> = {
    maternity: { fr: 'cong\u00e9 maternit\u00e9 (total)', en: 'maternity leave (total)' },
    paternity: { fr: 'cong\u00e9 paternit\u00e9 (total)', en: 'paternity leave (total)' },
    parental: { fr: 'cong\u00e9 parental (total)', en: 'parental leave (total)' },
    total: { fr: 'total cong\u00e9s pay\u00e9s', en: 'total paid leave' },
    generosity: { fr: 'score de g\u00e9n\u00e9rosit\u00e9', en: 'generosity score' },
    gender: { fr: '\u00e9galit\u00e9 des genres', en: 'gender equality score' },
  };

  const dirLabel =
    direction === 'top'
      ? lang === 'fr'
        ? 'Top 5'
        : 'Top 5'
      : lang === 'fr'
        ? 'Les 5 derniers'
        : 'Bottom 5';

  const header = `${dirLabel} — ${typeLabels[leaveType][lang]}`;
  const lines: string[] = [header, ''];

  top5.forEach((c, i) => {
    const val =
      leaveType === 'generosity' || leaveType === 'gender'
        ? `${getValue(c)}/100`
        : fmtVal(getValue(c), lang);
    lines.push(`${i + 1}. ${c.name} — ${val}`);
  });

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Quebec / RQAP handler
// ---------------------------------------------------------------------------

function quebecResponse(countries: Country[], lang: Lang): string {
  const canada = countries.find((c) => normalise(c.name) === 'canada');
  if (!canada) {
    return lang === 'fr'
      ? 'Donn\u00e9es pour le Canada non trouv\u00e9es.'
      : 'Canada data not found.';
  }

  const quebec = canada.subnational?.find(
    (s) => normalise(s.name) === 'quebec',
  );

  const lines: string[] = [];

  if (lang === 'fr') {
    lines.push('-- Qu\u00e9bec (RQAP) vs Canada (f\u00e9d\u00e9ral / AE) --');
    lines.push('');
    lines.push('Le RQAP (R\u00e9gime qu\u00e9b\u00e9cois d\u2019assurance parentale) offre des');
    lines.push('prestations plus g\u00e9n\u00e9reuses que le r\u00e9gime f\u00e9d\u00e9ral d\u2019AE.');
    lines.push('');
    lines.push('Canada (f\u00e9d\u00e9ral) :');
    lines.push(`  Maternit\u00e9 : ${fmtVal(canada.maternity?.durationMonths?.total, lang)} \u00e0 ${fmtRate(canada.maternity?.paymentRate)}`);
    lines.push(`  Paternit\u00e9 : ${fmtVal(canada.paternity?.durationMonths?.total, lang)} \u00e0 ${fmtRate(canada.paternity?.paymentRate)}`);
    lines.push(`  Parental : ${fmtVal(canada.parental?.durationMonths?.total, lang)} \u00e0 ${fmtRate(canada.parental?.paymentRate)}`);
  } else {
    lines.push('-- Quebec (QPIP) vs Canada (federal / EI) --');
    lines.push('');
    lines.push('The QPIP (Quebec Parental Insurance Plan) provides more');
    lines.push('generous benefits than the federal EI regime.');
    lines.push('');
    lines.push('Canada (federal):');
    lines.push(`  Maternity: ${fmtVal(canada.maternity?.durationMonths?.total, lang)} at ${fmtRate(canada.maternity?.paymentRate)}`);
    lines.push(`  Paternity: ${fmtVal(canada.paternity?.durationMonths?.total, lang)} at ${fmtRate(canada.paternity?.paymentRate)}`);
    lines.push(`  Parental: ${fmtVal(canada.parental?.durationMonths?.total, lang)} at ${fmtRate(canada.parental?.paymentRate)}`);
  }

  if (quebec) {
    lines.push('');
    if (lang === 'fr') {
      lines.push('Qu\u00e9bec (RQAP) \u2014 diff\u00e9rences :');
    } else {
      lines.push('Quebec (QPIP) — differences:');
    }
    if (quebec.maternity?.durationMonths?.total !== undefined) {
      lines.push(`  ${lang === 'fr' ? 'Maternit\u00e9' : 'Maternity'} : ${fmtVal(quebec.maternity.durationMonths.total, lang)} ${quebec.maternity.paymentRate ? `\u00e0 ${fmtRate(quebec.maternity.paymentRate)}` : ''}`);
    }
    if (quebec.paternity?.durationMonths?.total !== undefined) {
      lines.push(`  ${lang === 'fr' ? 'Paternit\u00e9' : 'Paternity'} : ${fmtVal(quebec.paternity.durationMonths.total, lang)} ${quebec.paternity.paymentRate ? `\u00e0 ${fmtRate(quebec.paternity.paymentRate)}` : ''}`);
    }
    if (quebec.parental?.durationMonths?.total !== undefined) {
      lines.push(`  ${lang === 'fr' ? 'Parental' : 'Parental'} : ${fmtVal(quebec.parental.durationMonths.total, lang)} ${quebec.parental.paymentRate ? `\u00e0 ${fmtRate(quebec.parental.paymentRate)}` : ''}`);
    }
    if (quebec.notes) {
      lines.push('');
      lines.push(`Note: ${quebec.notes}`);
    }
    if (quebec.details) {
      lines.push('');
      lines.push(`${lang === 'fr' ? 'D\u00e9tails' : 'Details'} : ${quebec.details}`);
    }
  } else {
    lines.push('');
    lines.push(
      lang === 'fr'
        ? '(Donn\u00e9es infranationales d\u00e9taill\u00e9es non disponibles pour le Qu\u00e9bec dans le jeu de donn\u00e9es.)'
        : '(Detailed subnational data not available for Quebec in the dataset.)',
    );
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Generosity methodology explainer
// ---------------------------------------------------------------------------

function generosityExplainer(lang: Lang): string {
  if (lang === 'fr') {
    return [
      '-- Score de g\u00e9n\u00e9rosit\u00e9 (0-100) --',
      '',
      'Le score est calcul\u00e9 \u00e0 partir de 4 composantes :',
      '',
      '1. Dur\u00e9e totale des cong\u00e9s pay\u00e9s (max 40 pts)',
      '   = total des mois pay\u00e9s (maternit\u00e9 + paternit\u00e9 + parental) \u00d7 2,5',
      '',
      '2. Dur\u00e9e bien pay\u00e9e (max 30 pts)',
      '   = total des mois bien pay\u00e9s \u00d7 2',
      '   \u00ab Bien pay\u00e9 \u00bb = au moins 2/3 du salaire',
      '',
      '3. Flexibilit\u00e9 (max 20 pts)',
      '   = 10 pts si temps partiel possible',
      '   + 10 pts si prise en blocs possible',
      '',
      '4. Droit universel \u00e0 la garde (ECEC) (max 10 pts)',
      '   = 10 pts si le pays offre un droit universel',
    ].join('\n');
  }
  return [
    '-- Generosity score (0-100) --',
    '',
    'The score is computed from 4 components:',
    '',
    '1. Total paid leave duration (max 40 pts)',
    '   = total paid months (maternity + paternity + parental) x 2.5',
    '',
    '2. Well-paid duration (max 30 pts)',
    '   = total well-paid months x 2',
    '   "Well-paid" = at least 2/3 of earnings',
    '',
    '3. Flexibility (max 20 pts)',
    '   = 10 pts if part-time leave available',
    '   + 10 pts if block leave available',
    '',
    '4. Universal ECEC entitlement (max 10 pts)',
    '   = 10 pts if the country provides a universal right',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Gender equality methodology explainer
// ---------------------------------------------------------------------------

function genderEqualityExplainer(lang: Lang): string {
  if (lang === 'fr') {
    return [
      '-- Score \u00e9galit\u00e9 des genres (0\u2013100) --',
      '',
      'Le score mesure dans quelle mesure les politiques encouragent',
      'le partage \u00e9gal des cong\u00e9s entre parents :',
      '',
      '1. Cong\u00e9 de paternit\u00e9 pay\u00e9 (max 30 pts)',
      '   = mois pay\u00e9s \u00d7 10 (plafond 30 pts)',
      '',
      '2. Quota p\u00e8re dans le cong\u00e9 parental (max 40 pts)',
      '   = mois r\u00e9serv\u00e9s au p\u00e8re \u00d7 8',
      '',
      '3. Droit individuel (20 pts)',
      '   = 20 pts si le cong\u00e9 parental est individuel ou mixte',
      '',
      '4. Non-transf\u00e9rabilit\u00e9 (10 pts)',
      '   = 10 pts si le cong\u00e9 parental n\u2019est pas transf\u00e9rable',
    ].join('\n');
  }
  return [
    '-- Gender equality score (0-100) --',
    '',
    'The score measures how much policies encourage',
    'equal sharing of leave between parents:',
    '',
    '1. Paid paternity leave (max 30 pts)',
    '   = paid months x 10 (capped at 30 pts)',
    '',
    '2. Father quota in parental leave (max 40 pts)',
    '   = months reserved for father x 8',
    '',
    '3. Individual entitlement (20 pts)',
    '   = 20 pts if parental leave is individual or mixed',
    '',
    '4. Non-transferability (10 pts)',
    '   = 10 pts if parental leave is non-transferable',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Help message
// ---------------------------------------------------------------------------

function helpMessage(lang: Lang): string {
  if (lang === 'fr') {
    return [
      'Je peux vous aider avec les sujets suivants :',
      '',
      '- Informations sur un pays (ex : \u00ab France \u00bb, \u00ab Canada \u00bb, \u00ab Su\u00e8de \u00bb)',
      '- Qu\u00e9bec / RQAP (ex : \u00ab Qu\u00e9bec \u00bb, \u00ab RQAP \u00bb)',
      '- Comparer deux pays (ex : \u00ab Comparer France et Canada \u00bb)',
      '- Classements (ex : \u00ab Meilleur cong\u00e9 maternit\u00e9 \u00bb, \u00ab Plus long cong\u00e9 parental \u00bb)',
      '- Score de g\u00e9n\u00e9rosit\u00e9 (ex: "generosite", "score")',
      '- \u00c9galit\u00e9 des genres (ex: "egalite", "gender equality")',
      '',
      'Essayez avec le nom d\u2019un pays pour commencer.',
    ].join('\n');
  }
  return [
    'I can help you with the following:',
    '',
    '- Country information (e.g., "France", "Canada", "Sweden")',
    '- Quebec / QPIP (e.g., "Quebec", "QPIP")',
    '- Compare two countries (e.g., "Compare France and Canada")',
    '- Rankings (e.g., "Best maternity leave", "Longest parental leave")',
    '- Generosity score (e.g., "generosity", "score")',
    '- Gender equality (e.g., "equality", "gender")',
    '',
    'Try a country name to get started.',
  ].join('\n');
}

function greetingMessage(lang: Lang): string {
  if (lang === 'fr') {
    return [
      'Bonjour ! Je suis l\u2019assistant robot du Leave Network Explorer.',
      '',
      'Posez-moi une question sur les cong\u00e9s parentaux dans le monde.',
      'Par exemple :',
      '- \u00ab France \u00bb',
      '- \u00ab Comparer Canada et Su\u00e8de \u00bb',
      '- \u00ab Meilleur cong\u00e9 paternit\u00e9 \u00bb',
      '- "G\u00e9n\u00e9rosit\u00e9"',
    ].join('\n');
  }
  return [
    'Hello! I am the Leave Network Explorer assistant.',
    '',
    'Ask me about parental leave policies around the world.',
    'For example:',
    '- "France"',
    '- "Compare Canada and Sweden"',
    '- "Best paternity leave"',
    '- "Generosity"',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Detect ranking leave type from query
// ---------------------------------------------------------------------------

function detectLeaveType(
  q: string,
): 'maternity' | 'paternity' | 'parental' | 'total' | 'generosity' | 'gender' {
  if (/maternit[ey]|maternity/.test(q)) return 'maternity';
  if (/paternit[ey]|paternity/.test(q)) return 'paternity';
  if (/parental/.test(q)) return 'parental';
  if (/generosit[ey]|generosity/.test(q)) return 'generosity';
  if (/egalit[ey]|equality|gender|genre/.test(q)) return 'gender';
  return 'total';
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function processQuestion(
  question: string,
  countries: Country[],
  lang: Lang,
): string {
  if (!question || question.trim().length === 0) {
    return helpMessage(lang);
  }

  const q = normalise(question);
  const tokens = q.split(/\s+/);

  try {
    // --- Greetings ---
    const greetingWords = ['bonjour', 'hello', 'salut', 'hi', 'hey', 'allo', 'coucou', 'bonsoir'];
    if (tokens.length <= 3 && tokens.some((t) => greetingWords.includes(t))) {
      return greetingMessage(lang);
    }

    // --- Quebec / RQAP ---
    const quebecKeywords = ['quebec', 'québec', 'rqap', 'qpip'];
    if (quebecKeywords.some((kw) => q.includes(normalise(kw)))) {
      return quebecResponse(countries, lang);
    }

    // --- Generosity methodology ---
    const generosityKeywords = ['generosite', 'generosity', 'indice', 'score generosite', 'generosity score'];
    if (generosityKeywords.some((kw) => q.includes(normalise(kw)))) {
      return generosityExplainer(lang);
    }

    // --- Gender equality methodology ---
    const genderKeywords = ['egalite', 'equality', 'gender equality', 'egalite des genres', 'gender score'];
    if (genderKeywords.some((kw) => q.includes(normalise(kw))) && !q.includes('compar') && !q.includes('vs')) {
      return genderEqualityExplainer(lang);
    }

    // --- Comparison ---
    const compareKeywords = ['compare', 'comparer', 'comparaison', 'comparison', 'vs', 'versus'];
    if (compareKeywords.some((kw) => q.includes(kw))) {
      const found = extractCountryNames(tokens, countries);
      if (found.length >= 2) {
        return comparisonResponse(found[0], found[1], lang);
      }
      if (found.length === 1) {
        return lang === 'fr'
          ? `J\u2019ai trouv\u00e9 ${found[0].name}, mais il me faut un deuxi\u00e8me pays pour comparer. Exemple : \u00ab Comparer ${found[0].name} et France \u00bb`
          : `I found ${found[0].name}, but I need a second country to compare. Example: "Compare ${found[0].name} and France"`;
      }
      return lang === 'fr'
        ? 'Pr\u00e9cisez deux pays \u00e0 comparer. Exemple : \u00ab Comparer France et Canada \u00bb'
        : 'Please specify two countries to compare. Example: "Compare France and Canada"';
    }

    // --- Rankings ---
    const topKeywords = ['meilleur', 'best', 'longest', 'plus long', 'top', 'premier', 'classement', 'ranking'];
    const bottomKeywords = ['pire', 'worst', 'shortest', 'plus court', 'dernier', 'bottom'];
    const isTop = topKeywords.some((kw) => q.includes(normalise(kw)));
    const isBottom = bottomKeywords.some((kw) => q.includes(normalise(kw)));

    if (isTop || isBottom) {
      const direction = isTop ? 'top' : 'bottom';
      const leaveType = detectLeaveType(q);
      return rankingResponse(countries, leaveType, direction, lang);
    }

    // --- Country lookup (try last, as it is the broadest match) ---
    const country = findCountryByText(q, countries);
    if (country) {
      return countrySummary(country, lang);
    }

    // Try individual tokens for country names (2-word, then single)
    for (let n = 3; n >= 1; n--) {
      for (let i = 0; i <= tokens.length - n; i++) {
        const gram = tokens.slice(i, i + n).join(' ');
        const c = findCountryByText(gram, countries);
        if (c) {
          return countrySummary(c, lang);
        }
      }
    }

    // --- Fallback: help ---
    return helpMessage(lang);
  } catch {
    return lang === 'fr'
      ? 'D\u00e9sol\u00e9, une erreur est survenue. Essayez une autre question.'
      : 'Sorry, an error occurred. Please try another question.';
  }
}
