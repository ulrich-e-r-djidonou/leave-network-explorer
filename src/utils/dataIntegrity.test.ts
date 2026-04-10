import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('data integrity', () => {
  it('data/countries.json and public/data/countries.json are identical', () => {
    const root = resolve(__dirname, '../../');
    const data1 = readFileSync(resolve(root, 'data/countries.json'), 'utf8');
    const data2 = readFileSync(resolve(root, 'public/data/countries.json'), 'utf8');
    expect(data1).toBe(data2);
  });

  it('countries.json has valid structure (metadata + countries array)', () => {
    const root = resolve(__dirname, '../../');
    const raw = readFileSync(resolve(root, 'data/countries.json'), 'utf8');
    const data = JSON.parse(raw);
    expect(data).toHaveProperty('metadata');
    expect(data).toHaveProperty('countries');
    expect(Array.isArray(data.countries)).toBe(true);
    expect(data.countries.length).toBeGreaterThan(0);
  });

  it('every country has required fields (iso2, iso3, maternity, paternity, parental)', () => {
    const root = resolve(__dirname, '../../');
    const data = JSON.parse(readFileSync(resolve(root, 'data/countries.json'), 'utf8'));
    for (const c of data.countries) {
      expect(c).toHaveProperty('iso2');
      expect(c).toHaveProperty('iso3');
      expect(c).toHaveProperty('maternity');
      expect(c).toHaveProperty('paternity');
      expect(c).toHaveProperty('parental');
    }
  });

  it('all duration values are numbers or null (no strings)', () => {
    const root = resolve(__dirname, '../../');
    const data = JSON.parse(readFileSync(resolve(root, 'data/countries.json'), 'utf8'));
    const leaveTypes = ['maternity', 'paternity', 'parental'];
    const durationFields = ['total', 'paid', 'wellPaid'];
    for (const c of data.countries) {
      for (const lt of leaveTypes) {
        for (const df of durationFields) {
          const val = c[lt]?.durationMonths?.[df];
          expect(
            val === null || typeof val === 'number',
            `${c.iso2}.${lt}.durationMonths.${df} should be number or null, got ${typeof val} (${val})`
          ).toBe(true);
        }
      }
    }
  });
});
