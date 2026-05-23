import { findSimilarNames } from './nameMatching';

export interface ExcelTeacherRow {
  teacherName: string;
  unitName: string;
}

export interface MatchedTeacher {
  teacherName: string;
  matchedName: string;
  userId: string;
  unitCode: string;
  unitName: string;
  similarity: number;
}

export interface UnmatchedRow {
  teacherName: string;
  unitName: string;
  reason: 'teacher_not_found' | 'unit_not_found';
}

export interface MatchResult {
  matched: MatchedTeacher[];
  unmatched: UnmatchedRow[];
}

export function matchExcelTeachers(
  rows: ExcelTeacherRow[],
  registeredTeachers: Array<{ name: string; userId: string }>,
  availableUnits: Array<{ unit_code: string; nama_rasmi: string }>
): MatchResult {
  const matched: MatchedTeacher[] = [];
  const unmatched: UnmatchedRow[] = [];

  const teacherLookup = registeredTeachers.map(t => ({ name: t.name, source: 'registered' }));

  for (const row of rows) {
    if (!row.teacherName || !row.unitName) continue;

    const matches = findSimilarNames(row.teacherName, teacherLookup, 80, 1);
    const teacherMatch = matches[0];

    if (!teacherMatch) {
      unmatched.push({ teacherName: row.teacherName, unitName: row.unitName, reason: 'teacher_not_found' });
      continue;
    }

    const unitMatch = availableUnits.find(
      u => u.nama_rasmi.toLowerCase() === row.unitName.toLowerCase()
    );

    if (!unitMatch) {
      unmatched.push({ teacherName: row.teacherName, unitName: row.unitName, reason: 'unit_not_found' });
      continue;
    }

    const registeredTeacher = registeredTeachers.find(t => t.name === teacherMatch.name);

    matched.push({
      teacherName: row.teacherName,
      matchedName: teacherMatch.name,
      userId: registeredTeacher?.userId || '',
      unitCode: unitMatch.unit_code,
      unitName: unitMatch.nama_rasmi,
      similarity: teacherMatch.similarity,
    });
  }

  return { matched, unmatched };
}
