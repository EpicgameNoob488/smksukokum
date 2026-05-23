import { Student } from '../data/studentData';

export function filterStudentsByUnit(students: Student[], unitCode: string): Student[] {
  if (!unitCode) return [];

  return students.filter((student) => {
    const codes = [
      student.uniformUnitCode,
      student.clubCode,
      student.sportCode,
      student.rawPenglibatan?.badan_beruniform?.unit_code,
      student.rawPenglibatan?.kelab_dan_persatuan?.unit_code,
      student.rawPenglibatan?.sukan_dan_permainan?.unit_code,
    ].filter(Boolean);

    return codes.includes(unitCode);
  });
}

export interface UnitAdvisorAssignment {
  userId: string;
  unitCode: string;
  tahun: number;
}

export function getAdvisorUnitsForTeacher(
  assignments: UnitAdvisorAssignment[],
  userId: string,
  tahun: number
): string[] {
  return assignments
    .filter((a) => a.userId === userId && a.tahun === tahun)
    .map((a) => a.unitCode);
}

export function isTeacherUnitAdvisor(
  assignments: UnitAdvisorAssignment[],
  userId: string,
  tahun: number
): boolean {
  return getAdvisorUnitsForTeacher(assignments, userId, tahun).length > 0;
}
