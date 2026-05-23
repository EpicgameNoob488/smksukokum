import { describe, it, expect } from 'vitest';
import { filterStudentsForUnitAdvisor } from '../lib/studentFilterUtils';
import { Student } from '../data/studentData';

describe('filterStudentsForUnitAdvisor', () => {
  const makeStudent = (name: string, unitCode: string | null): Student => ({
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
    pajskBreakdown: {
      sukan: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
      kelab: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
      uniform: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
      extraKurikulum: 0,
    },
  });

  const students: Student[] = [
    makeStudent('Ali', 'pengakap'),
    makeStudent('Abu', 'pengakap'),
    makeStudent('Siti', 'bm'),
    makeStudent('Ahmad', 'bola'),
    makeStudent('Mei', null),
  ];

  it('returns only students in the specified unit', () => {
    const result = filterStudentsForUnitAdvisor(students, 'pengakap');
    expect(result).toHaveLength(2);
    expect(result.map(s => s.name)).toEqual(['Ali', 'Abu']);
  });

  it('returns all students when unitCode is empty', () => {
    const result = filterStudentsForUnitAdvisor(students, '');
    expect(result).toHaveLength(5);
  });

  it('returns empty array when no students match', () => {
    const result = filterStudentsForUnitAdvisor(students, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});
