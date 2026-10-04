import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../../');
const read = (rel: string) => readFileSync(resolve(root, rel), 'utf8');
const index = JSON.parse(read('public/data/years.json'));
const editions: { year: number; file: string; status: string }[] = index.years;

describe('edition index', () => {
  it('data/ and public/data/ hold identical copies of every data file', () => {
    const published = readdirSync(resolve(root, 'public/data')).filter((f) => f.endsWith('.json'));
    expect(published.sort()).toEqual(readdirSync(resolve(root, 'data')).filter((f) => f.endsWith('.json')).sort());
    for (const f of published) {
      expect(read(`data/${f}`), f).toBe(read(`public/data/${f}`));
    }
  });

  it('years.json lists existing files, unique years and a known default', () => {
    expect(editions.length).toBeGreaterThan(0);
    expect(new Set(editions.map((e) => e.year)).size).toBe(editions.length);
    expect(editions.map((e) => e.year)).toContain(index.default);
    for (const e of editions) {
      expect(['final', 'provisional']).toContain(e.status);
      expect(() => read(`public/data/${e.file}`), e.file).not.toThrow();
    }
  });
});

describe.each(editions)('data integrity, edition $year', ({ year, file, status }) => {
  const data = JSON.parse(read(`public/data/${file}`));

  it('has valid structure (metadata + countries array)', () => {
    expect(data).toHaveProperty('metadata');
    expect(data.metadata.year).toBe(year);
    expect(Array.isArray(data.countries)).toBe(true);
    expect(data.countries.length).toBe(data.metadata.totalCountries);
  });

  it('a provisional edition carries its warning in both languages', () => {
    if (status !== 'provisional') return;
    expect(data.metadata.provisionalNote_fr?.length).toBeGreaterThan(0);
    expect(data.metadata.provisionalNote_en?.length).toBeGreaterThan(0);
  });

  it('every country has required fields and a unique iso2', () => {
    const seen = new Set<string>();
    for (const c of data.countries) {
      for (const k of ['iso2', 'iso3', 'maternity', 'paternity', 'parental', 'ecec', 'recentChanges']) {
        expect(c, `${c.iso2}.${k}`).toHaveProperty(k);
      }
      expect(seen.has(c.iso2), `duplicate ${c.iso2}`).toBe(false);
      seen.add(c.iso2);
    }
  });

  it('all duration values are numbers or null (no strings)', () => {
    for (const c of data.countries) {
      for (const lt of ['maternity', 'paternity', 'parental']) {
        for (const df of ['total', 'paid', 'wellPaid']) {
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
