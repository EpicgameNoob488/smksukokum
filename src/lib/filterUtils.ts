import { Student } from '../data/studentData';

export interface FilterSelections {
  uniformUnitCode: string;
  clubCode: string;
  sportCode: string;
  scoreRange: string;
  attendanceRange: string;
}

export interface FilterOption {
  code: string;
  name: string;
}

export interface AvailableFilterOptions {
  uniforms: FilterOption[];
  clubs: FilterOption[];
  sports: FilterOption[];
  scores: string[];
  attendances: string[];
}

/**
 * Helper to check if a unit code is empty/placeholder
 */
export function isEmptyUnitCode(code: string | undefined): boolean {
  if (!code) return true;
  const normalized = code.trim().toLowerCase();
  return ['tiada', '-', 'pindah', ''].includes(normalized);
}

/**
 * Checks if a student matches the current filter selections (using codes)
 */
export function matchesFilterCriteria(
  student: Student,
  selections: FilterSelections
): boolean {
  // Check uniform filter (by code)
  if (selections.uniformUnitCode !== '' && student.uniformUnitCode !== selections.uniformUnitCode) {
    return false;
  }

  // Check club filter (by code)
  if (selections.clubCode !== '' && student.clubCode !== selections.clubCode) {
    return false;
  }

  // Check sport filter (by code)
  if (selections.sportCode !== '' && student.sportCode !== selections.sportCode) {
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
 * @param students - All students to consider
 * @param currentSelections - Current filter selections
 * @param excludeType - Optional: exclude a specific filter type to enable cascading
 */
export function getAvailableFilterOptions(
  students: Student[],
  currentSelections: FilterSelections,
  excludeType?: 'uniform' | 'club' | 'sport'
): AvailableFilterOptions {
  // Build filter criteria excluding the current dropdown type for cascading
  const selectionsToApply: FilterSelections = {
    uniformUnitCode: excludeType === 'uniform' ? '' : currentSelections.uniformUnitCode,
    clubCode: excludeType === 'club' ? '' : currentSelections.clubCode,
    sportCode: excludeType === 'sport' ? '' : currentSelections.sportCode,
    scoreRange: currentSelections.scoreRange,
    attendanceRange: currentSelections.attendanceRange,
  };

  // Filter students by all EXCEPT the excluded type
  const filteredStudents = students.filter(student =>
    matchesFilterCriteria(student, selectionsToApply)
  );

  // Extract unique values from filtered students (using codes, filtering empty)
  const uniformsMap = new Map<string, string>();
  filteredStudents.forEach(s => {
    if (!isEmptyUnitCode(s.uniformUnitCode) && s.uniformUnit && s.uniformUnit !== 'Tiada') {
      uniformsMap.set(s.uniformUnitCode, s.uniformUnit);
    }
  });

  const clubsMap = new Map<string, string>();
  filteredStudents.forEach(s => {
    if (!isEmptyUnitCode(s.clubCode) && s.club && s.club !== 'Tiada') {
      clubsMap.set(s.clubCode, s.club);
    }
  });

  const sportsMap = new Map<string, string>();
  filteredStudents.forEach(s => {
    if (!isEmptyUnitCode(s.sportCode) && s.sport && s.sport !== 'Tiada') {
      sportsMap.set(s.sportCode, s.sport);
    }
  });

  const uniforms: FilterOption[] = [
    { code: '', name: 'All Units' },
    ...Array.from(uniformsMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  const clubs: FilterOption[] = [
    { code: '', name: 'All Clubs' },
    ...Array.from(clubsMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  const sports: FilterOption[] = [
    { code: '', name: 'All Sports' },
    ...Array.from(sportsMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

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
  const uniformsMap = new Map<string, string>();
  students.forEach(s => {
    if (!isEmptyUnitCode(s.uniformUnitCode) && s.uniformUnit && s.uniformUnit !== 'Tiada') {
      uniformsMap.set(s.uniformUnitCode, s.uniformUnit);
    }
  });

  const clubsMap = new Map<string, string>();
  students.forEach(s => {
    if (!isEmptyUnitCode(s.clubCode) && s.club && s.club !== 'Tiada') {
      clubsMap.set(s.clubCode, s.club);
    }
  });

  const sportsMap = new Map<string, string>();
  students.forEach(s => {
    if (!isEmptyUnitCode(s.sportCode) && s.sport && s.sport !== 'Tiada') {
      sportsMap.set(s.sportCode, s.sport);
    }
  });

  const uniforms: FilterOption[] = [
    { code: '', name: 'All Units' },
    ...Array.from(uniformsMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  const clubs: FilterOption[] = [
    { code: '', name: 'All Clubs' },
    ...Array.from(clubsMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  const sports: FilterOption[] = [
    { code: '', name: 'All Sports' },
    ...Array.from(sportsMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

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