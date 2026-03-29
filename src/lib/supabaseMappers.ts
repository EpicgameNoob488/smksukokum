import { Student } from '../data/studentData';
import { calculateStudentPAJSK } from './pajskCalculator';

export function mapUnit(row: any) {
  return {
    category: row.kategori,
    code: row.unit_code,
    name: row.nama_rasmi,
    shortName: row.nama_singkat || '',
    chief: row.chief_teacher || '',
    advisors: row.advisors || []
  };
}

export function mapManagement(row: any) {
  return {
    role: row.role,
    name: row.teacher_name
  };
}

export function mapClass(row: any) {
  const fullName = row.teacher_name || '';
  const nameParts = fullName.split(' ');
  
  return {
    id: row.id,
    name: row.nama_kelas,
    teacher: fullName,
    surname: nameParts[0] || '',
    givenName: nameParts.slice(1).join(' ') || ''
  };
}

export function mapStudent(row: any, units: any[], classes: any[]): Student {
  const getUnitName = (code: string | null) => {
    if (!code) return 'Tiada';
    const unit = units.find(u => u.code === code);
    return unit ? unit.name : 'Tiada';
  };

  const classObj = classes.find(c => c.name.toLowerCase() === row.kelas.toLowerCase());
  const classId = classObj ? classObj.id : row.kelas;

  const rawPenglibatan = {
    sukan_dan_permainan: {
      unit_code: row.sukan_unit || '',
      jawatan: row.sukan_jawatan || '',
      ahli: row.sukan_ahli || '',
      kehadiran: row.sukan_kehadiran != null ? String(row.sukan_kehadiran) : '0',
      pencapaian: row.sukan_pencapaian || ''
    },
    kelab_dan_persatuan: {
      unit_code: row.kelab_unit || '',
      jawatan: row.kelab_jawatan || '',
      ahli: row.kelab_ahli || '',
      kehadiran: row.kelab_kehadiran != null ? String(row.kelab_kehadiran) : '0',
      pencapaian: row.kelab_pencapaian || ''
    },
    badan_beruniform: {
      unit_code: row.uniform_unit || '',
      jawatan: row.uniform_jawatan || '',
      ahli: row.uniform_ahli || '',
      kehadiran: row.uniform_kehadiran != null ? String(row.uniform_kehadiran) : '0',
      pencapaian: row.uniform_pencapaian || ''
    }
  };

  const attSport = typeof row.sukan_kehadiran === 'number' ? row.sukan_kehadiran : 0;
  const attClub = typeof row.kelab_kehadiran === 'number' ? row.kelab_kehadiran : 0;
  const attUniform = typeof row.uniform_kehadiran === 'number' ? row.uniform_kehadiran : 0;
  
  const totalAtt = attSport + attClub + attUniform;
  const attendance = Math.min(100, Math.round((totalAtt / 36) * 100));

  const pajskResult = calculateStudentPAJSK(rawPenglibatan);

  return {
    id: String(row.id),
    name: row.nama,
    classId: classId,
    studentNumber: row.student_number,
    estimatedPAJSK: pajskResult.estimatedPAJSK,
    pajskGrade: pajskResult.pajskGrade,
    pajskPoint: pajskResult.pajskPoint,
    pajskGradeLabel: pajskResult.gradeLabel,
    attendance,
    uniformUnit: getUnitName(row.uniform_unit),
    club: getUnitName(row.kelab_unit),
    sport: getUnitName(row.sukan_unit),
    rawPenglibatan,
    pajskBreakdown: pajskResult.breakdown
  };
}
