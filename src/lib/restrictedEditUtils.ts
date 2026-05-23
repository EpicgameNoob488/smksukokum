export interface RestrictedFieldConfig {
  restricted: boolean;
  unitPillar: string | null;
}

export interface FieldPermissions {
  personalDetails: boolean;
  classAssignment: boolean;
  uniformUnit: boolean;
  clubUnit: boolean;
  sportUnit: boolean;
  uniformFields: boolean;
  clubFields: boolean;
  sportFields: boolean;
}

export function getRestrictedFields({ restricted, unitPillar }: RestrictedFieldConfig): FieldPermissions {
  if (!restricted) {
    return {
      personalDetails: true,
      classAssignment: true,
      uniformUnit: true,
      clubUnit: true,
      sportUnit: true,
      uniformFields: true,
      clubFields: true,
      sportFields: true,
    };
  }

  const isUniform = unitPillar === 'Badan Beruniform';
  const isClub = unitPillar === 'Kelab & Persatuan';
  const isSport = unitPillar === 'Sukan dan Permainan';

  return {
    personalDetails: false,
    classAssignment: false,
    uniformUnit: isUniform,
    clubUnit: isClub,
    sportUnit: isSport,
    uniformFields: isUniform,
    clubFields: isClub,
    sportFields: isSport,
  };
}
