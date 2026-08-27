import { describe, expect, it } from 'vitest';
import { parseCsv, splitCsvLine } from './csv';

describe('parseCsv', () => {
  it('parses quoted lead rows', () => {
    const rows = parseCsv('name,email,city,branch\n"Ananya, Iyer",a@test.com,Chennai,CHN\n');
    expect(splitCsvLine('"Ananya, Iyer",a@test.com')).toEqual(['Ananya, Iyer', 'a@test.com']);
    expect(rows[0]).toMatchObject({ name: 'Ananya, Iyer', city: 'Chennai', branch: 'CHN' });
  });
});
