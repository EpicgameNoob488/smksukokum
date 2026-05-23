import { describe, it, expect } from 'vitest';
import { getRestrictedFields, RestrictedFieldConfig } from '../lib/restrictedEditUtils';

describe('getRestrictedFields', () => {
  it('enables all fields when not in restricted mode', () => {
    const result = getRestrictedFields({ restricted: false, unitPillar: null });
    expect(result.personalDetails).toBe(true);
    expect(result.classAssignment).toBe(true);
    expect(result.uniformUnit).toBe(true);
    expect(result.clubUnit).toBe(true);
    expect(result.sportUnit).toBe(true);
    expect(result.uniformFields).toBe(true);
    expect(result.clubFields).toBe(true);
    expect(result.sportFields).toBe(true);
  });

  it('disables personal details and class in restricted mode', () => {
    const result = getRestrictedFields({ restricted: true, unitPillar: 'Badan Beruniform' });
    expect(result.personalDetails).toBe(false);
    expect(result.classAssignment).toBe(false);
  });

  it('enables only uniform fields for Badan Beruniform advisor', () => {
    const result = getRestrictedFields({ restricted: true, unitPillar: 'Badan Beruniform' });
    expect(result.uniformUnit).toBe(true);
    expect(result.uniformFields).toBe(true);
    expect(result.clubUnit).toBe(false);
    expect(result.clubFields).toBe(false);
    expect(result.sportUnit).toBe(false);
    expect(result.sportFields).toBe(false);
  });

  it('enables only club fields for Kelab & Persatuan advisor', () => {
    const result = getRestrictedFields({ restricted: true, unitPillar: 'Kelab & Persatuan' });
    expect(result.clubUnit).toBe(true);
    expect(result.clubFields).toBe(true);
    expect(result.uniformUnit).toBe(false);
    expect(result.sportUnit).toBe(false);
  });

  it('enables only sport fields for Sukan dan Permainan advisor', () => {
    const result = getRestrictedFields({ restricted: true, unitPillar: 'Sukan dan Permainan' });
    expect(result.sportUnit).toBe(true);
    expect(result.sportFields).toBe(true);
    expect(result.uniformUnit).toBe(false);
    expect(result.clubUnit).toBe(false);
  });
});
