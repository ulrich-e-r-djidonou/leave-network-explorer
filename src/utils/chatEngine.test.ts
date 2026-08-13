import { describe, it, expect } from 'vitest';
import { processQuestion } from './chatEngine';
import type { Country } from '../types';

const mockCountries: Country[] = [
  {
    name: 'France',
    iso2: 'FR',
    iso3: 'FRA',
    region: 'Europe',
    federal: false,
    subnationalVariations: [],
    maternity: {
      exists: true,
      durationMonths: { total: 3.7, paid: 3.7, wellPaid: 3.7 },
      paymentRate: 100,
      paymentType: 'earnings-related',
      ceiling: false,
      obligatory: true,
      transferable: false,
      flexPartTime: false,
      flexBlocks: false,
    },
    paternity: {
      exists: true,
      durationMonths: { total: 1.15, paid: 1.15, wellPaid: 1.15 },
      paymentRate: 100,
      paymentType: 'earnings-related',
      ceiling: false,
      obligatory: false,
      flexPartTime: false,
      flexBlocks: false,
    },
    parental: {
      exists: true,
      durationMonths: { total: 36, paid: 36, wellPaid: 0 },
      paymentRate: 15,
      paymentType: 'flat-rate',
      entitlementType: 'family',
      motherQuotaMonths: 0,
      fatherQuotaMonths: 0,
      sharedPortionMonths: 36,
      transferable: true,
      ceiling: false,
      obligatory: false,
      flexPartTime: true,
      flexBlocks: true,
    },
    childcareLeave: { exists: false, durationMonths: null, paid: false },
    otherMeasures: {
      sickChildLeave: { exists: true, daysPerYear: 3, paid: false },
      breastfeeding: { exists: true },
      flexibleWork: { rightToRequest: true },
      domesticViolenceLeave: { exists: false },
      bereavementLeave: { exists: true },
    },
    ecec: {
      universalEntitlement: true,
      entitlementAgeMonths: 36,
      gapAfterLeaveMonths: 0,
    },
    recentChanges: [],
  },
  {
    name: 'Canada',
    iso2: 'CA',
    iso3: 'CAN',
    region: 'North America',
    federal: true,
    subnationalVariations: ['Quebec RQAP plan'],
    maternity: {
      exists: true,
      durationMonths: { total: 3.45, paid: 3.45, wellPaid: 0 },
      paymentRate: 55,
      paymentType: 'earnings-related',
      ceiling: true,
      obligatory: false,
      transferable: false,
      flexPartTime: false,
      flexBlocks: false,
    },
    paternity: {
      exists: false,
      durationMonths: { total: 0, paid: 0, wellPaid: 0 },
      paymentRate: null,
      paymentType: null,
      ceiling: false,
      obligatory: false,
      flexPartTime: false,
      flexBlocks: false,
    },
    parental: {
      exists: true,
      durationMonths: { total: 8.08, paid: 8.08, wellPaid: 0 },
      paymentRate: 55,
      paymentType: 'earnings-related',
      entitlementType: 'family',
      motherQuotaMonths: null,
      fatherQuotaMonths: 1.15,
      sharedPortionMonths: 6.93,
      transferable: true,
      ceiling: true,
      obligatory: false,
      flexPartTime: false,
      flexBlocks: false,
    },
    childcareLeave: { exists: false, durationMonths: null, paid: false },
    otherMeasures: {
      sickChildLeave: { exists: false, daysPerYear: null, paid: false },
      breastfeeding: { exists: false },
      flexibleWork: { rightToRequest: true },
      domesticViolenceLeave: { exists: true },
      bereavementLeave: { exists: true },
    },
    ecec: {
      universalEntitlement: false,
      entitlementAgeMonths: null,
      gapAfterLeaveMonths: null,
    },
    recentChanges: [],
  },
  {
    name: 'Sweden',
    iso2: 'SE',
    iso3: 'SWE',
    region: 'Europe',
    federal: false,
    subnationalVariations: [],
    maternity: {
      exists: true,
      durationMonths: { total: 3.22, paid: 3.22, wellPaid: 3.22 },
      paymentRate: 77.6,
      paymentType: 'earnings-related',
      ceiling: true,
      obligatory: false,
      transferable: false,
      flexPartTime: true,
      flexBlocks: true,
    },
    paternity: {
      exists: true,
      durationMonths: { total: 0.46, paid: 0.46, wellPaid: 0.46 },
      paymentRate: 77.6,
      paymentType: 'earnings-related',
      ceiling: true,
      obligatory: false,
      flexPartTime: true,
      flexBlocks: true,
    },
    parental: {
      exists: true,
      durationMonths: { total: 16.1, paid: 16.1, wellPaid: 12.88 },
      paymentRate: 77.6,
      paymentType: 'earnings-related',
      entitlementType: 'individual',
      motherQuotaMonths: 2.99,
      fatherQuotaMonths: 2.99,
      sharedPortionMonths: 10.12,
      transferable: true,
      ceiling: true,
      obligatory: false,
      flexPartTime: true,
      flexBlocks: true,
    },
    childcareLeave: { exists: false, durationMonths: null, paid: false },
    otherMeasures: {
      sickChildLeave: { exists: true, daysPerYear: 120, paid: true },
      breastfeeding: { exists: true },
      flexibleWork: { rightToRequest: true },
      domesticViolenceLeave: { exists: false },
      bereavementLeave: { exists: true },
    },
    ecec: {
      universalEntitlement: true,
      entitlementAgeMonths: 12,
      gapAfterLeaveMonths: 0,
    },
    recentChanges: [],
  },
];

describe('chatEngine processQuestion', () => {
  it('handles country queries in French and English', () => {
    const resFr = processQuestion('France', mockCountries, 'fr');
    expect(resFr).toContain('France');
    expect(resFr).toContain('Maternité');

    const resEn = processQuestion('Sweden', mockCountries, 'en');
    expect(resEn).toContain('Sweden');
    expect(resEn).toContain('Maternity');
  });

  it('handles comparison queries between two countries', () => {
    const res = processQuestion('Comparer Canada et Suède', mockCountries, 'fr');
    expect(res).toContain('Canada');
    expect(res).toContain('Sweden');

    const resEn = processQuestion('Compare France and Canada', mockCountries, 'en');
    expect(resEn).toContain('France');
    expect(resEn).toContain('Canada');
  });

  it('handles superlatives and ranking intents', () => {
    const resMat = processQuestion('Meilleur congé maternité', mockCountries, 'fr');
    expect(resMat).toContain('maternité');

    const resPat = processQuestion('Best paternity leave', mockCountries, 'en');
    expect(resPat).toContain('paternity');
  });

  it('handles Quebec / RQAP inquiries', () => {
    const resFr = processQuestion('Quebec RQAP', mockCountries, 'fr');
    expect(resFr.toLowerCase()).toContain('rqap');

    const resEn = processQuestion('Tell me about QPIP in Quebec', mockCountries, 'en');
    expect(resEn.toLowerCase()).toContain('qpip');
  });

  it('handles Generosity score queries', () => {
    const res = processQuestion('Score de générosité', mockCountries, 'fr');
    expect(res.toLowerCase()).toContain('générosité');
  });

  it('provides a graceful fallback for unknown queries', () => {
    const res = processQuestion('Quelle est la recette des crêpes ?', mockCountries, 'fr');
    expect(res).toBeDefined();
    expect(res.length).toBeGreaterThan(20);
  });
});
