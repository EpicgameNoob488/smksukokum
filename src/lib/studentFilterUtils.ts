import { Student } from '../data/studentData';
import { filterStudentsByUnit } from './unitAdvisorUtils';

export function filterStudentsForUnitAdvisor(students: Student[], unitCode: string): Student[] {
  if (!unitCode) return students;
  return filterStudentsByUnit(students, unitCode);
}
