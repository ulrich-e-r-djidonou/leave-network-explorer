import { describe, it, expect } from 'vitest';
import { getGenerosityScore, getGenderEqualityScore, formatDuration, getTotalLeaveMonths } from './calculations';
import { getCountryName } from './countryNames';
import { getGII, giiToScore } from './giiData';
import type { Country } from '../types';

// Minimal country fixture
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeCountry(overrides: Record<string, any> = {}): Country {
  return {
    name: 'Test Country',
    iso2: 'FR',
    iso3: 'FRA',
    region: 'Europe',
    maternity: {
      exists: true,
      durationMonths: { total: 4, paid: 3.7, wellPaid: 3.7 },
      paymentRate: 100,
      flexPartTime: false,
      flexBlocks: false,
    },
    paternity: {
      exists: true,
      durationMonths: { total: 0.8, paid: 0.8, wellPaid: 0.8 },
      paymentRate: 100,
      flexPartTime: false,
      flexBlocks: false,
    },
    parental: {
      exists: true,
      durationMonths: { total: 36, paid: 36, wellPaid: 0 },
      paymentRate: 6,
      entitlementType: 'family',
      fatherQuotaMonths: 0,
      transferable: true,
      flexPartTime: false,
      flexBlocks: false,
    },
    ecec: { universalEntitlement: true },
    otherMeasures: {
      sickChildLeave: { exists: false },
      flexibleWork: { rightToRequest: false },
    },
    recentChanges: [],
    federal: false,
    subnationalVariations: [],
    ...overrides,
  } as unknown as Country;
}

describe('getGenerosityScore (ETP)', () => {
  it('returns 0 for a country with no leave', () => {
    const c = makeCountry({
      maternity: { exists: false, durationMonths: { total: 0, paid: 0, wellPaid: 0 }, paymentRate: 0, flexPartTime: false, flexBlocks: false },
      paternity: { exists: false, durationMonths: { total: 0, paid: 0, wellPaid: 0 }, paymentRate: 0, flexPartTime: false, flexBlocks: false },
      parental: { exists: false, durationMonths: { total: 0, paid: 0, wellPaid: 0 }, paymentRate: 0, entitlementType: null, fatherQuotaMonths: 0, transferable: false, flexPartTime: false, flexBlocks: false },
    });
    expect(getGenerosityScore(c)).toBe(0);
  });

  it('calculates FTE correctly: months × rate/100', () => {
    const c = makeCountry({
      maternity: { exists: true, durationMonths: { total: 6, paid: 6, wellPaid: 6 }, paymentRate: 80, flexPartTime: false, flexBlocks: false },
      paternity: { exists: true, durationMonths: { total: 2, paid: 2, wellPaid: 2 }, paymentRate: 100, flexPartTime: false, flexBlocks: false },
      parental: { exists: false, durationMonths: { total: 0, paid: 0, wellPaid: 0 }, paymentRate: 0, entitlementType: null, fatherQuotaMonths: 0, transferable: false, flexPartTime: false, flexBlocks: false },
    });
    // 6 × 0.80 + 2 × 1.00 = 4.8 + 2.0 = 6.8
    expect(getGenerosityScore(c)).toBe(6.8);
  });

  it('sums all three leave types', () => {
    const c = makeCountry(); // FR fixture: mat 3.7@100% + pat 0.8@100% + par 36@6%
    // 3.7 × 1.0 + 0.8 × 1.0 + 36 × 0.06 = 3.7 + 0.8 + 2.16 = 6.66 → rounded 6.7
    expect(getGenerosityScore(c)).toBe(6.7);
  });
});

describe('getGenderEqualityScore (GII)', () => {
  it('returns (1 - GII) × 100 for known countries', () => {
    const c = makeCountry({ iso2: 'DK' }); // Denmark GII = 0.003
    expect(getGenderEqualityScore(c)).toBe(100); // (1 - 0.003) × 100 = 99.7 → 100
  });

  it('returns null for unknown ISO (e.g. Kosovo)', () => {
    const c = makeCountry({ iso2: 'XX' });
    expect(getGenderEqualityScore(c)).toBeNull();
  });
});

describe('giiData', () => {
  it('getGII returns correct value for France', () => {
    expect(getGII('FR')).toBe(0.034);
  });

  it('getGII returns null for unknown ISO', () => {
    expect(getGII('XX')).toBeNull();
  });

  it('getGII handles case insensitivity', () => {
    expect(getGII('fr')).toBe(0.034);
  });

  it('giiToScore converts correctly', () => {
    expect(giiToScore(0)).toBe(100);
    expect(giiToScore(1)).toBe(0);
    expect(giiToScore(0.5)).toBe(50);
    expect(giiToScore(null)).toBeNull();
  });
});

describe('getCountryName', () => {
  it('returns French name for FR lang', () => {
    expect(getCountryName('Germany', 'DE', 'fr')).toBe('Allemagne');
    expect(getCountryName('Japan', 'JP', 'fr')).toBe('Japon');
    expect(getCountryName('South Korea', 'KR', 'fr')).toBe('Corée du Sud');
  });

  it('returns original name for EN lang', () => {
    expect(getCountryName('Germany', 'DE', 'en')).toBe('Germany');
  });

  it('falls back to original name for unknown ISO', () => {
    expect(getCountryName('Atlantis', 'XX', 'fr')).toBe('Atlantis');
  });

  it('handles case insensitivity for iso2', () => {
    expect(getCountryName('France', 'fr', 'fr')).toBe('France');
  });
});

describe('formatDuration', () => {
  it('formats months in French', () => {
    expect(formatDuration(3.5, 'fr')).toBe('3.5 mois');
    expect(formatDuration(12, 'fr')).toBe('12 mois');
  });

  it('formats months in English', () => {
    expect(formatDuration(3.5, 'en')).toBe('3.5 months');
    expect(formatDuration(12, 'en')).toBe('12 months');
  });

  it('formats small values as weeks', () => {
    expect(formatDuration(0.5, 'fr')).toBe('2 sem.');
    expect(formatDuration(0.5, 'en')).toBe('2 wk.');
  });

  it('handles null and zero', () => {
    expect(formatDuration(null)).toBe('N/A');
    expect(formatDuration(0)).toBe('0');
  });
});

describe('getTotalLeaveMonths', () => {
  it('sums paid months across all types', () => {
    const c = makeCountry();
    // mat 3.7 + pat 0.8 + par 36 = 40.5
    expect(getTotalLeaveMonths(c)).toBe(40.5);
  });
});
