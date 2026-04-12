import { Student } from '../data/studentData';

export interface FilterSelections {
  uniformUnit: string;
  club: string;
  sport: string;
  scoreRange: string;
  attendanceRange: string;
}

export interface AvailableFilterOptions {
  uniforms: string[];
  clubs: string[];
  sports: string[];
  scores: string[];
  attendances: string[];
}

/**
 * Checks if a student matches the current filter selections
 */
export function matchesFilterCriteria(
  student: Student,
  selections: FilterSelections
): boolean {
  // Check uniform filter
  if (selections.uniformUnit !== 'All Units' && student.uniformUnit !== selections.uniformUnit) {
    return false;
  }

  // Check club filter
  if (selections.club !== 'All Clubs' && student.club !== selections.club) {
    return false;
  }

  // Check sport filter
  if (selections.sport !== 'All Sports' && student.sport !== selections.sport) {
    return false;
  }

  // Check score range
  if (selections.scoreRange !== 'All Scores') {
    const score = student.estimatedPAJSK;
    if (selections.scoreRange === '80+') {
      if (score < 80) return false;
    } else if (selections.scoreRange === '60-80') {
      if (score < 60 || score >= 80) return false;
    } else if (selections.scoreRange === '<60') {
      if (score >= 60) return false;
    }
  }

  // Check attendance range
  if (selections.attendanceRange !== 'All Attendance') {
    const attendance = student.attendance;
    if (selections.attendanceRange === '95%+') {
      if (attendance < 95) return false;
    } else if (selections.attendanceRange === '75%+') {
      if (attendance < 75) return false;
    } else if (selections.attendanceRange === '<75%') {
      if (attendance >= 75) return false;
    }
  }

  return true;
}

/**
 * Calculates available filter options based on current selections and student data
 */
export function getAvailableFilterOptions(
  students: Student[],
  currentSelections: FilterSelections
): AvailableFilterOptions {
  // Start with all students, then filter by active selections
  const filteredStudents = students.filter(student =>
    matchesFilterCriteria(student, currentSelections)
  );

  // Extract unique values from filtered students
  const uniforms = ['All Units', ...Array.from(
    new Set(filteredStudents.map(s => s.uniformUnit).filter(v => v && v !== 'Tiada'))
  ).sort()];

  const clubs = ['All Clubs', ...Array.from(
    new Set(filteredStudents.map(s => s.club).filter(v => v && v !== 'Tiada'))
  ).sort()];

  const sports = ['All Sports', ...Array.from(
    new Set(filteredStudents.map(s => s.sport).filter(v => v && v !== 'Tiada'))
  ).sort()];

  // Calculate available score ranges - check if students exist in each range
  const scores: string[] = ['All Scores'];
  if (students.some(s => s.estimatedPAJSK >= 80)) scores.push('80+');
  if (students.some(s => s.estimatedPAJSK >= 60 && s.estimatedPAJSK < 80)) scores.push('60-80');
  if (students.some(s => s.estimatedPAJSK < 60)) scores.push('<60');

  // Calculate available attendance ranges - check if students exist in each range
  const attendances: string[] = ['All Attendance'];
  if (students.some(s => s.attendance >= 95)) attendances.push('95%+');
  if (students.some(s => s.attendance >= 75 && s.attendance < 95)) attendances.push('75%+');
  if (students.some(s => s.attendance < 75)) attendances.push('<75%');

  return {
    uniforms,
    clubs,
    sports,
    scores,
    attendances
  };
}

/**
 * Returns ALL filter options from students (ignoring current selections)
 * Used for dropdown options to show all available values
 */
export function getAllFilterOptions(students: Student[]): AvailableFilterOptions {
  const uniforms = ['All Units', ...Array.from(
    new Set(students.map(s => s.uniformUnit).filter(v => v && v !== 'Tiada'))
  ).sort()];

  const clubs = ['All Clubs', ...Array.from(
    new Set(students.map(s => s.club).filter(v => v && v !== 'Tiada'))
  ).sort()];

  const sports = ['All Sports', ...Array.from(
    new Set(students.map(s => s.sport).filter(v => v && v !== 'Tiada'))
  ).sort()];

  const scores: string[] = ['All Scores'];
  if (students.some(s => s.estimatedPAJSK >= 80)) scores.push('80+');
  if (students.some(s => s.estimatedPAJSK >= 60 && s.estimatedPAJSK < 80)) scores.push('60-80');
  if (students.some(s => s.estimatedPAJSK < 60)) scores.push('<60');

  const attendances: string[] = ['All Attendance'];
  if (students.some(s => s.attendance >= 95)) attendances.push('95%+');
  if (students.some(s => s.attendance >= 75 && s.attendance < 95)) attendances.push('75%+');
  if (students.some(s => s.attendance < 75)) attendances.push('<75%');

  return {
    uniforms,
    clubs,
    sports,
    scores,
    attendances
  };
}