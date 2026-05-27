export interface TeacherAssignmentData {
  managementRoles?: string[];
  classes?: string[];
  unitAdvisorUnits?: string[];
  kokurikulum?: {
    head?: Array<unknown>;
    advisor?: Array<unknown>;
  };
}

export function hasTeacherAssignment(data: TeacherAssignmentData | null | undefined): boolean {
  if (!data) return false;

  const hasManagementRole = (data.managementRoles || []).some((role) => Boolean(role?.trim()));
  const hasFormClass = (data.classes || []).some((className) => Boolean(className?.trim()));
  const hasUnitAdvisorAssignment = (data.unitAdvisorUnits || []).some((unit) => Boolean(unit?.trim()));
  const hasKokurikulumRole = (data.kokurikulum?.head || []).length > 0 || (data.kokurikulum?.advisor || []).length > 0;

  return hasManagementRole || hasFormClass || hasUnitAdvisorAssignment || hasKokurikulumRole;
}
