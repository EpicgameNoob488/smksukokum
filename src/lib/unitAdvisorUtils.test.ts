import { describe, it, expect } from 'vitest';
import { filterStudentsByUnit, getAdvisorUnitsForTeacher, isTeacherUnitAdvisor, UnitAdvisorAssignment } from '../lib/unitAdvisorUtils';

describe('filterStudentsByUnit', () => {
  const makeStudent = (name: string, unitCode: string | null) => ({
    id: name,
    name,
    classId: '1A',
    tahun: 2025,
    studentNumber: 1,
    estimatedPAJSK: 50,
    pajskGrade: 'B',
    pajskPoint: 50,
    pajskGradeLabel: 'Baik',
    attendance: 80,
    uniformUnit: unitCode === 'pengakap' ? 'Pengakap' : '',
    uniformUnitCode: unitCode === 'pengakap' ? 'pengakap' : '',
    club: unitCode === 'bm' ? 'Bahasa Melayu' : '',
    clubCode: unitCode === 'bm' ? 'bm' : '',
    sport: unitCode === 'bola' ? 'Bola Sepak' : '',
    sportCode: unitCode === 'bola' ? 'bola' : '',
    rawPenglibatan: unitCode
      ? unitCode === 'pengakap'
        ? { badan_beruniform: { unit_code: 'pengakap' } }
        : unitCode === 'bm'
          ? { kelab_dan_persatuan: { unit_code: 'bm' } }
          : { sukan_dan_permainan: { unit_code: 'bola' } }
      : {},
    pajskBreakdown: { sukan: 0, kelab: 0, uniform: 0, extraKurikulum: 0 },
  });

  const students = [
    makeStudent('Ali', 'pengakap'),
    makeStudent('Abu', 'pengakap'),
    makeStudent('Siti', 'bm'),
    makeStudent('Ahmad', 'bola'),
    makeStudent('Mei', null),
  ];

  it('returns only students in the specified unit', () => {
    const result = filterStudentsByUnit(students, 'pengakap');
    expect(result).toHaveLength(2);
    expect(result.map(s => s.name)).toEqual(['Ali', 'Abu']);
  });

  it('returns empty array when no students match the unit', () => {
    const result = filterStudentsByUnit(students, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('returns empty array when unitCode is empty string', () => {
    const result = filterStudentsByUnit(students, '');
    expect(result).toHaveLength(0);
  });
});

describe('getAdvisorUnitsForTeacher', () => {
  const assignments: UnitAdvisorAssignment[] = [
    { userId: 'user-1', unitCode: 'pengakap', tahun: 2025 },
    { userId: 'user-1', unitCode: 'bola', tahun: 2025 },
    { userId: 'user-2', unitCode: 'bm', tahun: 2025 },
    { userId: 'user-1', unitCode: 'pengakap', tahun: 2024 },
  ];

  it('returns all units for a teacher in the specified year', () => {
    const result = getAdvisorUnitsForTeacher(assignments, 'user-1', 2025);
    expect(result).toEqual(['pengakap', 'bola']);
  });

  it('returns empty array when teacher has no units in specified year', () => {
    const result = getAdvisorUnitsForTeacher(assignments, 'user-3', 2025);
    expect(result).toHaveLength(0);
  });

  it('filters by year correctly', () => {
    const result = getAdvisorUnitsForTeacher(assignments, 'user-1', 2024);
    expect(result).toEqual(['pengakap']);
  });
});

describe('isTeacherUnitAdvisor', () => {
  const assignments: UnitAdvisorAssignment[] = [
    { userId: 'user-1', unitCode: 'pengakap', tahun: 2025 },
  ];

  it('returns true when teacher has unit assignments', () => {
    expect(isTeacherUnitAdvisor(assignments, 'user-1', 2025)).toBe(true);
  });

  it('returns false when teacher has no unit assignments', () => {
    expect(isTeacherUnitAdvisor(assignments, 'user-2', 2025)).toBe(false);
  });
});
