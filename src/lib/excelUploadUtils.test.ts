import { describe, it, expect } from 'vitest';
import { matchExcelTeachers, ExcelTeacherRow, MatchedTeacher, UnmatchedRow } from '../lib/excelUploadUtils';
import { findSimilarNames } from '../lib/nameMatching';

describe('findSimilarNames (existing utility)', () => {
  const teachers = [
    { name: 'Ahmad bin Ali', source: 'registered' },
    { name: 'Siti Aminah', source: 'registered' },
    { name: 'Muhammad bin Abu', source: 'registered' },
  ];

  it('finds exact match', () => {
    const results = findSimilarNames('Ahmad bin Ali', teachers);
    expect(results).toHaveLength(1);
    expect(results[0].similarity).toBe(100);
  });

  it('finds fuzzy match', () => {
    const results = findSimilarNames('Ahmad Ali', teachers);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('Ahmad bin Ali');
  });

  it('returns empty for no match', () => {
    const results = findSimilarNames('Completely Different Name', teachers);
    expect(results).toHaveLength(0);
  });
});

describe('matchExcelTeachers', () => {
  const registeredTeachers = [
    { name: 'Ahmad bin Ali', userId: 'user-1' },
    { name: 'Siti Aminah', userId: 'user-2' },
    { name: 'Muhammad bin Abu', userId: 'user-3' },
  ];

  const availableUnits = [
    { unit_code: 'pengakap', nama_rasmi: 'Pengakap' },
    { unit_code: 'bola', nama_rasmi: 'Bola Sepak' },
    { unit_code: 'bm', nama_rasmi: 'Bahasa Melayu' },
  ];

  it('matches exact teacher names with units', () => {
    const rows: ExcelTeacherRow[] = [
      { teacherName: 'Ahmad bin Ali', unitName: 'Pengakap' },
      { teacherName: 'Siti Aminah', unitName: 'Bola Sepak' },
    ];

    const result = matchExcelTeachers(rows, registeredTeachers, availableUnits);
    expect(result.matched).toHaveLength(2);
    expect(result.unmatched).toHaveLength(0);
    expect(result.matched[0].teacherName).toBe('Ahmad bin Ali');
    expect(result.matched[0].unitCode).toBe('pengakap');
  });

  it('fuzzy matches teacher names', () => {
    const rows: ExcelTeacherRow[] = [
      { teacherName: 'Ahmad Ali', unitName: 'Pengakap' },
    ];

    const result = matchExcelTeachers(rows, registeredTeachers, availableUnits);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].matchedName).toBe('Ahmad bin Ali');
  });

  it('marks unmatched teachers when name not found', () => {
    const rows: ExcelTeacherRow[] = [
      { teacherName: 'Unknown Teacher', unitName: 'Pengakap' },
    ];

    const result = matchExcelTeachers(rows, registeredTeachers, availableUnits);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(1);
    expect(result.unmatched[0].teacherName).toBe('Unknown Teacher');
  });

  it('marks unmatched when unit not found', () => {
    const rows: ExcelTeacherRow[] = [
      { teacherName: 'Ahmad bin Ali', unitName: 'Nonexistent Unit' },
    ];

    const result = matchExcelTeachers(rows, registeredTeachers, availableUnits);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(1);
  });

  it('handles empty input', () => {
    const result = matchExcelTeachers([], registeredTeachers, availableUnits);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(0);
  });
});
