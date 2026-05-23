import { describe, it, expect } from 'vitest';
import { UnitAdvisorAssignment, mapUnitAdvisorRow } from '../lib/dataService';

describe('mapUnitAdvisorRow', () => {
  it('maps a raw DB row to UnitAdvisorAssignment', () => {
    const rawRow = {
      id: 'uuid-1',
      user_id: 'user-123',
      unit_code: 'pengakap',
      tahun: 2025,
      created_at: '2025-01-01T00:00:00Z',
    };

    const result = mapUnitAdvisorRow(rawRow);

    expect(result).toEqual({
      userId: 'user-123',
      unitCode: 'pengakap',
      tahun: 2025,
    });
  });

  it('handles missing optional fields', () => {
    const rawRow = {
      user_id: 'user-456',
      unit_code: 'bola',
      tahun: 2024,
    };

    const result = mapUnitAdvisorRow(rawRow);

    expect(result).toEqual({
      userId: 'user-456',
      unitCode: 'bola',
      tahun: 2024,
    });
  });
});
