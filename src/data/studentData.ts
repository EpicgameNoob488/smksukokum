import { calculateStudentPAJSK } from '../lib/pajskCalculator';
import { StudentRecord, KokurikulumUnit, FormClass } from '../lib/dataService';

export interface Student {
  id: string;
  name: string;
  classId: string;
  tahun?: number;
  studentNumber: number | null;
  estimatedPAJSK: number;
  pajskGrade: string;
  pajskPoint: number;
  pajskGradeLabel: string;
  attendance: number;
  uniformUnit: string;
  uniformUnitCode: string;
  club: string;
  clubCode: string;
  sport: string;
  sportCode: string;
  rawPenglibatan?: any;
  pajskBreakdown: {
    sukan: { penglibatan: number; kehadiran: number; pencapaian: number; total: number };
    kelab: { penglibatan: number; kehadiran: number; pencapaian: number; total: number };
    uniform: { penglibatan: number; kehadiran: number; pencapaian: number; total: number };
    extraKurikulum: number;
  };
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
}

const parseKehadiran = (k: string | null | undefined): number => {
  if (!k) return 0;
  if (k.toLowerCase().includes('lebih')) return 12;
  const num = parseInt(k, 10);
  return isNaN(num) ? 0 : num;
};

export function transformStudents(
  records: StudentRecord[],
  units: KokurikulumUnit[],
  formClasses: FormClass[]
): Student[] {
  const unitMap = new Map(units.map(u => [u.unit_code, u]));

  return records.map((s) => {
    const classObj = formClasses.find(c => c.nama_kelas.toLowerCase() === s.kelas.toLowerCase());
    const classId = classObj ? String(classObj.id) : s.kelas;

    const getUnitName = (unitCode: string | null) => {
      if (!unitCode) return 'Tiada';
      const unit = unitMap.get(unitCode);
      return unit ? unit.nama_rasmi : 'Tiada';
    };

    const getUnitCode = (unitCode: string | null): string => {
      if (!unitCode) return '';
      const unit = unitMap.get(unitCode);
      return unit ? unit.unit_code : '';
    };

    const sportCode = getUnitCode(s.sukan_unit);
    const clubCode = getUnitCode(s.kelab_unit);
    const uniformUnitCode = getUnitCode(s.uniform_unit);

    const sport = getUnitName(s.sukan_unit);
    const club = getUnitName(s.kelab_unit);
    const uniformUnit = getUnitName(s.uniform_unit);

    const attSport = s.sukan_kehadiran || 0;
    const attClub = s.kelab_kehadiran || 0;
    const attUniform = s.uniform_kehadiran || 0;
    const totalAtt = attSport + attClub + attUniform;
    const attendancePercentage = Math.min(100, Math.round((totalAtt / 36) * 100));

    const penglibatan = {
      sukan_dan_permainan: s.sukan_unit ? {
        unit_code: s.sukan_unit,
        jawatan: s.sukan_jawatan,
        ahli: s.sukan_ahli,
        kehadiran: s.sukan_kehadiran?.toString() || null,
        pencapaian: s.sukan_pencapaian,
        jenisSkorPenglibatan: s.sukan_jenis_skor_penglibatan || '',
      } : null,
      kelab_dan_persatuan: s.kelab_unit ? {
        unit_code: s.kelab_unit,
        jawatan: s.kelab_jawatan,
        ahli: s.kelab_ahli,
        kehadiran: s.kelab_kehadiran?.toString() || null,
        pencapaian: s.kelab_pencapaian,
        jenisSkorPenglibatan: s.kelab_jenis_skor_penglibatan || '',
      } : null,
      badan_beruniform: s.uniform_unit ? {
        unit_code: s.uniform_unit,
        jawatan: s.uniform_jawatan,
        ahli: s.uniform_ahli,
        kehadiran: s.uniform_kehadiran?.toString() || null,
        pencapaian: s.uniform_pencapaian,
        jenisSkorPenglibatan: s.uniform_jenis_skor_penglibatan || '',
      } : null,
    };

    const pajskResult = calculateStudentPAJSK(penglibatan);

    return {
      id: String(s.id),
      name: s.nama,
      classId: classId,
      studentNumber: s.student_number,
      estimatedPAJSK: pajskResult.estimatedPAJSK,
      pajskGrade: pajskResult.pajskGrade,
      pajskPoint: pajskResult.pajskPoint,
      pajskGradeLabel: pajskResult.gradeLabel,
      attendance: attendancePercentage,
      uniformUnit: uniformUnit,
      uniformUnitCode: uniformUnitCode,
      club: club,
      clubCode: clubCode,
      sport: sport,
      sportCode: sportCode,
      rawPenglibatan: penglibatan,
      pajskBreakdown: pajskResult.breakdown,
    };
  });
}

export function transformClasses(formClasses: FormClass[]): ClassInfo[] {
  return formClasses.map((fc, index) => ({
    id: String(fc.id),
    name: fc.nama_kelas,
    teacher: fc.teacher_name || '',
  }));
}
