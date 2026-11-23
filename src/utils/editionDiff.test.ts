import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { CountryData } from '../types';
import { diffEditions, formatFieldValue, sameValue } from './editionDiff';

const root = resolve(__dirname, '../../');
const load = (file: string): CountryData => JSON.parse(readFileSync(resolve(root, 'public/data', file), 'utf8'));

describe('diffEditions (2026 contre 2025)', () => {
  const diff = diffEditions(load('countries-2026.json'), load('countries-2025.json'));
  const changesOf = (iso2: string) => diff.changed.find((c) => c.country.iso2 === iso2)?.changes ?? [];

  it('signale le Costa Rica comme nouveau pays et aucun pays retiré', () => {
    expect(diff.added.map((c) => c.iso2)).toEqual(['CR']);
    expect(diff.removed).toEqual([]);
  });

  it('retrouve les durées modifiées (Espagne, Uruguay, Australie)', () => {
    const es = changesOf('ES').map((c) => c.field.path);
    expect(es).toEqual(expect.arrayContaining([
      'maternity.durationMonths.total', 'paternity.durationMonths.wellPaid',
    ]));
    const mat = changesOf('ES').find((c) => c.field.path === 'maternity.durationMonths.total');
    expect(mat?.before).toBe(3.7);
    expect(mat?.after).toBe(4.42);
    expect(changesOf('UY').map((c) => c.field.path)).toContain('paternity.durationMonths.paid');
    expect(changesOf('AU').map((c) => c.field.path)).toEqual(expect.arrayContaining([
      'parental.durationMonths.paid', 'parental.motherQuotaMonths', 'parental.fatherQuotaMonths',
    ]));
  });

  it('ignore les pays sans différence sur les champs suivis', () => {
    expect(changesOf('FR')).toEqual([]);
  });

  it('compte autant de valeurs que de lignes', () => {
    expect(diff.valueCount).toBe(diff.changed.reduce((n, c) => n + c.changes.length, 0));
    expect(diff.valueCount).toBeGreaterThan(0);
  });
});

describe('outils de comparaison', () => {
  it('tolère les écarts d’arrondi', () => {
    expect(sameValue(4.42, 4.421)).toBe(true);
    expect(sameValue(4.42, 4.5)).toBe(false);
    expect(sameValue(null, 0)).toBe(false);
  });

  it('formate selon la nature du champ', () => {
    expect(formatFieldValue(true, 'bool', 'fr')).toBe('Oui');
    expect(formatFieldValue(60, 'ageMonths', 'en')).toBe('60 months');
    expect(formatFieldValue(null, 'months', 'fr')).toBe('N/A');
  });
});
