import { describe, expect, it } from 'vitest';
import { hasTeacherAssignment } from './teacherAssignmentUtils';

describe('hasTeacherAssignment', () => {
  it('returns false when no assignment fields are populated', () => {
    expect(hasTeacherAssignment({
      managementRoles: [],
      classes: [],
      unitAdvisorUnits: [],
      kokurikulum: { head: [], advisor: [] },
    })).toBe(false);
  });

  it('returns true when any assignment is present', () => {
    expect(hasTeacherAssignment({ managementRoles: ['Pengetua'] })).toBe(true);
    expect(hasTeacherAssignment({ classes: ['5 Amanah'] })).toBe(true);
    expect(hasTeacherAssignment({ unitAdvisorUnits: ['UB01'] })).toBe(true);
    expect(hasTeacherAssignment({ kokurikulum: { head: [{ name: 'Pengakap' }], advisor: [] } })).toBe(true);
  });
});
