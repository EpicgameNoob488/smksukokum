import { describe, it, expect } from 'vitest';
import { getAdvisorUnitsForCurrentUser, UnitAdvisorData } from '../lib/unitAdvisorContext';
import { UnitAdvisorAssignment } from '../lib/dataService';

describe('getAdvisorUnitsForCurrentUser', () => {
  const assignments: UnitAdvisorAssignment[] = [
    { userId: 'user-1', unitCode: 'pengakap', tahun: 2025 },
    { userId: 'user-1', unitCode: 'bola', tahun: 2025 },
    { userId: 'user-2', unitCode: 'bm', tahun: 2025 },
  ];

  it('returns advisor units for the current user', () => {
    const result = getAdvisorUnitsForCurrentUser('user-1', assignments, 2025);
    expect(result).toEqual({
      isUnitAdvisor: true,
      advisorUnits: ['pengakap', 'bola'],
    });
  });

  it('returns empty when user is not an advisor', () => {
    const result = getAdvisorUnitsForCurrentUser('user-3', assignments, 2025);
    expect(result).toEqual({
      isUnitAdvisor: false,
      advisorUnits: [],
    });
  });

  it('returns empty when assignments array is empty', () => {
    const result = getAdvisorUnitsForCurrentUser('user-1', [], 2025);
    expect(result).toEqual({
      isUnitAdvisor: false,
      advisorUnits: [],
    });
  });

  it('filters by tahun correctly', () => {
    const assignmentsWithDifferentYear: UnitAdvisorAssignment[] = [
      { userId: 'user-1', unitCode: 'pengakap', tahun: 2024 },
    ];
    const result = getAdvisorUnitsForCurrentUser('user-1', assignmentsWithDifferentYear, 2025);
    expect(result).toEqual({
      isUnitAdvisor: false,
      advisorUnits: [],
    });
  });
});
