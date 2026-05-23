import { describe, it, expect } from 'vitest';
import { computeTeacherTabs, TeacherTabConfig } from '../lib/teacherTabLogic';

describe('computeTeacherTabs', () => {
  it('returns both tabs for form teacher with unit assignments', () => {
    const result = computeTeacherTabs({
      isFormTeacher: true,
      isUnitAdvisor: true,
      advisorUnits: ['pengakap', 'bola'],
      formClassName: '2 Dandelion',
    });

    expect(result.tabs).toEqual(['My Class', 'My Units']);
    expect(result.defaultTab).toBe('My Class');
  });

  it('returns only My Class for form teacher without units', () => {
    const result = computeTeacherTabs({
      isFormTeacher: true,
      isUnitAdvisor: false,
      advisorUnits: [],
      formClassName: '1 Mawar',
    });

    expect(result.tabs).toEqual(['My Class']);
    expect(result.defaultTab).toBe('My Class');
  });

  it('returns only My Units for unit advisor without form class', () => {
    const result = computeTeacherTabs({
      isFormTeacher: false,
      isUnitAdvisor: true,
      advisorUnits: ['pengakap'],
      formClassName: null,
    });

    expect(result.tabs).toEqual(['My Units']);
    expect(result.defaultTab).toBe('My Units');
  });

  it('returns empty tabs for admin with no assignments', () => {
    const result = computeTeacherTabs({
      isFormTeacher: false,
      isUnitAdvisor: false,
      advisorUnits: [],
      formClassName: null,
    });

    expect(result.tabs).toEqual([]);
    expect(result.defaultTab).toBe(null);
  });

  it('returns both tabs for admin with unit assignments', () => {
    const result = computeTeacherTabs({
      isFormTeacher: false,
      isUnitAdvisor: true,
      advisorUnits: ['bm'],
      formClassName: null,
      isAdmin: true,
    });

    expect(result.tabs).toEqual(['My Class', 'My Units']);
    expect(result.defaultTab).toBe('My Units');
  });
});
