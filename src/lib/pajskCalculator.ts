export interface PAJSKBreakdown {
  penglibatan: number;
  kehadiran: number;
  pencapaian: number;
  total: number;
}

export interface StudentPAJSK {
  estimatedPAJSK: number;
  pajskGrade: string;
  pajskPoint: number;
  gradeLabel: string;
  breakdown: {
    sukan: PAJSKBreakdown;
    kelab: PAJSKBreakdown;
    uniform: PAJSKBreakdown;
    extraKurikulum: number;
  };
}

const GRADE_SCALE = [
  { grade: 'A', min: 80, max: 110, point: 4.0, label: 'Cemerlang' },
  { grade: 'B', min: 60, max: 79.9, point: 3.0, label: 'Kepujian' },
  { grade: 'C', min: 40, max: 59.9, point: 2.0, label: 'Baik' },
  { grade: 'D', min: 20, max: 39.9, point: 1.0, label: 'Kurang Memuaskan' },
  { grade: 'E', min: 0, max: 19.9, point: 0.0, label: 'Tidak Memuaskan' },
];

export function getGrade(score: number): { grade: string; point: number; label: string } {
  for (const g of GRADE_SCALE) {
    if (score >= g.min && score <= g.max) {
      return { grade: g.grade, point: g.point, label: g.label };
    }
  }
  if (score > 110) return { grade: 'A', point: 4.0, label: 'Cemerlang' };
  return { grade: 'E', point: 0.0, label: 'Tidak Memuaskan' };
}

export function calculatePenglibatan(jawatan: string | null | undefined, ahli: string | null | undefined): number {
  const j = (jawatan || '').toLowerCase();
  const a = (ahli || '').toLowerCase();

  if (j.includes('pengerusi') || j.includes('ketua')) return 50;
  if (j.includes('setiausaha') || j.includes('bendahari')) return 45;
  if (j.includes('ajk') || j.includes('jawatankuasa')) return 40;
  if (j.includes('ketua rumah')) return 35;
  if (j.includes('naib pengerusi') || j.includes('timbalan')) return 30;

  if (a.includes('aktif')) return 30;
  if (a.includes('biasa')) return 20;

  return 10;
}

export function calculateKehadiran(kehadiran: string | null | undefined): number {
  if (!kehadiran) return 3;
  const k = parseInt(kehadiran, 10);
  if (isNaN(k)) return 3;

  const mapping: Record<number, number> = {
    12: 40, 11: 37, 10: 33, 9: 30,
    8: 27, 7: 23, 6: 20, 5: 17,
    4: 13, 3: 10, 2: 7, 1: 3, 0: 3
  };

  return mapping[k] ?? 3;
}

export function calculatePencapaian(pencapaian: string | null | undefined): number {
  if (!pencapaian) return 0;
  const p = pencapaian.toLowerCase();

  if (p.includes('johan') && !p.includes('naib')) return 20;
  if (p.includes('naib johan')) return 15;
  if (p.includes('ketiga')) return 12;
  if (p.includes('keempat') || p.includes('kelima')) return 8;
  if (p.includes('umum') || p.includes('syarat')) return 5;
  if (p.includes('sertai') || p.includes('hadir') || p.includes('peserta')) return 3;

  return 0;
}

export function calculateExtraKurikulum(khidmatSumbangan: string | null | undefined): number {
  if (!khidmatSumbangan) return 0;
  const k = khidmatSumbangan.toLowerCase();

  if (k.includes('10')) return 10;
  if (k.includes('8')) return 8;
  if (k.includes('6')) return 6;
  if (k.includes('4')) return 4;
  if (k.includes('2')) return 2;

  return 0;
}

export function calculateActivityScore(penglibatanObj: any): PAJSKBreakdown {
  if (!penglibatanObj || (!penglibatanObj.unit_code && !penglibatanObj.name_in_record)) {
    return { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 };
  }

  const penglibatan = calculatePenglibatan(penglibatanObj.jawatan, penglibatanObj.ahli);
  const kehadiran = calculateKehadiran(penglibatanObj.kehadiran);
  const pencapaian = calculatePencapaian(penglibatanObj.pencapaian);

  return {
    penglibatan,
    kehadiran,
    pencapaian,
    total: penglibatan + kehadiran + pencapaian
  };
}

export function calculateStudentPAJSK(rawPenglibatan: any): StudentPAJSK {
  const sukan = calculateActivityScore(rawPenglibatan?.sukan_dan_permainan);
  const kelab = calculateActivityScore(rawPenglibatan?.kelab_dan_persatuan);
  const uniform = calculateActivityScore(rawPenglibatan?.badan_beruniform);

  const scores = [sukan.total, kelab.total, uniform.total].filter(s => s > 0).sort((a, b) => b - a);
  
  let baseScore = 0;
  if (scores.length >= 2) {
    baseScore = (scores[0] + scores[1]) / 2;
  } else if (scores.length === 1) {
    baseScore = scores[0];
  }

  const extraKurikulum = calculateExtraKurikulum(
    rawPenglibatan?.sukan_dan_permainan?.khidmat_sumbangan ||
    rawPenglibatan?.kelab_dan_persatuan?.khidmat_sumbangan ||
    rawPenglibatan?.badan_beruniform?.khidmat_sumbangan
  );

  const estimatedPAJSK = Math.round(baseScore + extraKurikulum);
  const gradeInfo = getGrade(estimatedPAJSK);

  return {
    estimatedPAJSK,
    pajskGrade: gradeInfo.grade,
    pajskPoint: gradeInfo.point,
    gradeLabel: gradeInfo.label,
    breakdown: {
      sukan,
      kelab,
      uniform,
      extraKurikulum
    }
  };
}
