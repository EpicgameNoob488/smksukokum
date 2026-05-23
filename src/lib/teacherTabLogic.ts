export interface TeacherTabConfig {
  tabs: string[];
  defaultTab: string | null;
}

interface ComputeTeacherTabsOptions {
  isFormTeacher: boolean;
  isUnitAdvisor: boolean;
  advisorUnits: string[];
  formClassName: string | null;
  isAdmin?: boolean;
}

export function computeTeacherTabs({
  isFormTeacher,
  isUnitAdvisor,
  advisorUnits,
  formClassName,
  isAdmin = false,
}: ComputeTeacherTabsOptions): TeacherTabConfig {
  const tabs: string[] = [];

  if (isFormTeacher || (isAdmin && isUnitAdvisor)) {
    tabs.push('My Class');
  }

  if (isUnitAdvisor && advisorUnits.length > 0) {
    tabs.push('My Units');
  }

  const defaultTab = tabs.length > 0 ? (isFormTeacher ? 'My Class' : 'My Units') : null;

  return { tabs, defaultTab };
}
