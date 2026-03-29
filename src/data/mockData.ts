import { Student } from './studentData';
import { ManagementTeamMember, KokurikulumUnit, FormClass } from '../lib/dataService';

export const kpiData: any[] = [];

const isLeader = (jawatan: string | null | undefined) => {
  if (!jawatan) return false;
  const j = jawatan.toLowerCase();
  return j.includes('pengerusi') || j.includes('kapten') || j.includes('ketua') || j.includes('setiausaha') || j.includes('bendahari') || j.includes('ajk') || j.includes('jawatankuasa');
};

const isActive = (ahli: string | null | undefined) => {
  if (!ahli) return false;
  return ahli.toLowerCase().includes('aktif');
};

const isElite = (pencapaian: string | null | undefined) => {
  if (!pencapaian) return false;
  const p = pencapaian.toLowerCase();
  return p.includes('johan') || p.includes('ketiga') || p.includes('keempat') || p.includes('kelima');
};

export function calculateStats(students: Student[]) {
  let sukanCount = 0;
  let kelabCount = 0;
  let uniformCount = 0;
  let sukanLeader = 0;
  let kelabLeader = 0;
  let uniformLeader = 0;
  let sukanActive = 0;
  let kelabActive = 0;
  let uniformActive = 0;
  let sukanElite = 0;
  let kelabElite = 0;
  let uniformElite = 0;

  students.forEach(s => {
    const p = s.rawPenglibatan;
    if (p?.sukan_dan_permainan) {
      sukanCount++;
      if (isLeader(p.sukan_dan_permainan.jawatan)) sukanLeader++;
      if (isActive(p.sukan_dan_permainan.ahli)) sukanActive++;
      if (isElite(p.sukan_dan_permainan.pencapaian)) sukanElite++;
    }
    if (p?.kelab_dan_persatuan) {
      kelabCount++;
      if (isLeader(p.kelab_dan_persatuan.jawatan)) kelabLeader++;
      if (isActive(p.kelab_dan_persatuan.ahli)) kelabActive++;
      if (isElite(p.kelab_dan_persatuan.pencapaian)) kelabElite++;
    }
    if (p?.badan_beruniform) {
      uniformCount++;
      if (isLeader(p.badan_beruniform.jawatan)) uniformLeader++;
      if (isActive(p.badan_beruniform.ahli)) uniformActive++;
      if (isElite(p.badan_beruniform.pencapaian)) uniformElite++;
    }
  });

  return {
    triPillarData: [
      { subject: 'Sukan', A: sukanCount },
      { subject: 'Kelab', A: kelabCount },
      { subject: 'Uniform', A: uniformCount }
    ],
    triPillarProjectedData: [
      { subject: 'Sukan', A: sukanCount, projected: Math.round(sukanCount * 1.1) },
      { subject: 'Kelab', A: kelabCount, projected: Math.round(kelabCount * 1.15) },
      { subject: 'Uniform', A: uniformCount, projected: Math.round(uniformCount * 1.05) }
    ],
    leadershipDensityData: [
      { name: 'Sukan', 'AJK/Pengerusi': sukanLeader, 'Ahli Biasa': sukanCount - sukanLeader },
      { name: 'Kelab', 'AJK/Pengerusi': kelabLeader, 'Ahli Biasa': kelabCount - kelabLeader },
      { name: 'Uniform', 'AJK/Pengerusi': uniformLeader, 'Ahli Biasa': uniformCount - uniformLeader }
    ],
    passiveEngagementData: [
      { name: 'Sukan', 'Penyokong': -(sukanCount - sukanActive), 'Peserta': sukanActive },
      { name: 'Kelab', 'Penyokong': -(kelabCount - kelabActive), 'Peserta': kelabActive },
      { name: 'Uniform', 'Penyokong': -(uniformCount - uniformActive), 'Peserta': uniformActive }
    ],
    eliteConversionData: [
      { name: 'Sukan', value: sukanElite },
      { name: 'Kelab', value: kelabElite },
      { name: 'Uniform', value: uniformElite }
    ],
    participationMix: [
      { name: 'Sukan', value: Math.round((sukanCount / students.length) * 100) || 0, fill: '#F04444' },
      { name: 'Kelab', value: Math.round((kelabCount / students.length) * 100) || 0, fill: '#FFB547' },
      { name: 'Uniform', value: Math.round((uniformCount / students.length) * 100) || 0, fill: '#2B3674' },
      { name: 'Leadership', value: Math.round(((sukanLeader + kelabLeader + uniformLeader) / (students.length * 3)) * 100) || 0, fill: '#059669' },
      { name: 'Elite', value: Math.round(((sukanElite + kelabElite + uniformElite) / (students.length * 3)) * 100) || 0, fill: '#EE5D50' }
    ],
    engagementByCategory: [
      { name: 'Sukan', 'Activity Rate': sukanCount },
      { name: 'Kelab', 'Activity Rate': kelabCount },
      { name: 'Uniform', 'Activity Rate': uniformCount }
    ],
  };
}

export function transformManagementTeam(team: ManagementTeamMember[]) {
  return team.map(t => ({
    role: t.role,
    name: t.teacher_name,
  }));
}

export function transformCoCurricularUnits(units: KokurikulumUnit[]) {
  return units.map(unit => ({
    category: unit.kategori,
    code: unit.unit_code,
    name: unit.nama_rasmi,
    shortName: unit.nama_singkat || '',
    chief: unit.chief_teacher || '',
    advisors: unit.advisors || [],
  }));
}
