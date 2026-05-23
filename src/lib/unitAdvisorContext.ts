import { UnitAdvisorAssignment } from './dataService';
import { getAdvisorUnitsForTeacher } from './unitAdvisorUtils';

export interface UnitAdvisorData {
  isUnitAdvisor: boolean;
  advisorUnits: string[];
}

export function getAdvisorUnitsForCurrentUser(
  userId: string | undefined,
  assignments: UnitAdvisorAssignment[],
  tahun: number
): UnitAdvisorData {
  if (!userId) {
    return { isUnitAdvisor: false, advisorUnits: [] };
  }

  const units = getAdvisorUnitsForTeacher(assignments, userId, tahun);
  return {
    isUnitAdvisor: units.length > 0,
    advisorUnits: units,
  };
}
