import { Student } from '../data/studentData';
import { tokens } from './designTokens';

export function calculateKPIs(students: Student[]) {
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

  let sukanPenglibatanTotal = 0;
  let kelabPenglibatanTotal = 0;
  let uniformPenglibatanTotal = 0;

  students.forEach(s => {
    const p = s.rawPenglibatan;
    const bd = s.pajskBreakdown;

    if (p?.sukan_dan_permainan && (p.sukan_dan_permainan.unit_code !== '' || p.sukan_dan_permainan.name_in_record)) {
      sukanCount++;
      if (bd?.sukan) {
        if (bd.sukan.penglibatan >= 40) sukanLeader++;
        if (bd.sukan.penglibatan >= 20) sukanActive++;
        if (bd.sukan.pencapaian >= 12) sukanElite++;
        sukanPenglibatanTotal += bd.sukan.penglibatan;
      }
    }
    if (p?.kelab_dan_persatuan && (p.kelab_dan_persatuan.unit_code !== '' || p.kelab_dan_persatuan.name_in_record)) {
      kelabCount++;
      if (bd?.kelab) {
        if (bd.kelab.penglibatan >= 40) kelabLeader++;
        if (bd.kelab.penglibatan >= 20) kelabActive++;
        if (bd.kelab.pencapaian >= 12) kelabElite++;
        kelabPenglibatanTotal += bd.kelab.penglibatan;
      }
    }
    if (p?.badan_beruniform && (p.badan_beruniform.unit_code !== '' || p.badan_beruniform.name_in_record)) {
      uniformCount++;
      if (bd?.uniform) {
        if (bd.uniform.penglibatan >= 40) uniformLeader++;
        if (bd.uniform.penglibatan >= 20) uniformActive++;
        if (bd.uniform.pencapaian >= 12) uniformElite++;
        uniformPenglibatanTotal += bd.uniform.penglibatan;
      }
    }
  });

  const total = students.length || 1;

  const sukanActivePct = sukanCount > 0 ? Math.round((sukanActive / sukanCount) * 100) : 0;
  const kelabActivePct = kelabCount > 0 ? Math.round((kelabActive / kelabCount) * 100) : 0;
  const uniformActivePct = uniformCount > 0 ? Math.round((uniformActive / uniformCount) * 100) : 0;

  const triPillarData = [
    { subject: 'Sukan', 'Active %': sukanActivePct },
    { subject: 'Kelab', 'Active %': kelabActivePct },
    { subject: 'Uniform', 'Active %': uniformActivePct }
  ];

  const triPillarProjectedData = [
    { subject: 'Sukan', 'Active %': sukanActivePct, projected: Math.min(100, Math.round(sukanActivePct * 1.1)) },
    { subject: 'Kelab', 'Active %': kelabActivePct, projected: Math.min(100, Math.round(kelabActivePct * 1.15)) },
    { subject: 'Uniform', 'Active %': uniformActivePct, projected: Math.min(100, Math.round(uniformActivePct * 1.05)) }
  ];

  const leadershipDensityData = [
    { name: 'Sukan', 'AJK/Pengerusi': sukanLeader, 'Ahli Biasa': sukanCount - sukanLeader },
    { name: 'Kelab', 'AJK/Pengerusi': kelabLeader, 'Ahli Biasa': kelabCount - kelabLeader },
    { name: 'Uniform', 'AJK/Pengerusi': uniformLeader, 'Ahli Biasa': uniformCount - uniformLeader }
  ];

  const passiveEngagementData = [
    { name: 'Sukan', 'Penyokong': sukanCount - sukanActive, 'Peserta': sukanActive },
    { name: 'Kelab', 'Penyokong': kelabCount - kelabActive, 'Peserta': kelabActive },
    { name: 'Uniform', 'Penyokong': uniformCount - uniformActive, 'Peserta': uniformActive }
  ];

const eliteConversionData = [
  { name: 'Sukan', value: sukanElite },
  { name: 'Kelab', value: kelabElite },
  { name: 'Uniform', value: uniformElite }
];

  const participationMix = [
    { name: 'Sukan', value: Math.round((sukanCount / total) * 100) || 0, fill: tokens.colors.primaryRed },
    { name: 'Kelab', value: Math.round((kelabCount / total) * 100) || 0, fill: tokens.colors.accentYellow },
    { name: 'Uniform', value: Math.round((uniformCount / total) * 100) || 0, fill: tokens.colors.accentNavy },
    { name: 'Leadership', value: Math.round(((sukanLeader + kelabLeader + uniformLeader) / (total * 3)) * 100) || 0, fill: tokens.colors.trendGreenText },
    { name: 'Elite', value: Math.round(((sukanElite + kelabElite + uniformElite) / (total * 3)) * 100) || 0, fill: tokens.colors.chartEliteRed }
  ];

  const engagementByCategory = [
    { name: 'Sukan', 'Activity Rate': sukanCount },
    { name: 'Kelab', 'Activity Rate': kelabCount },
    { name: 'Uniform', 'Activity Rate': uniformCount }
  ];

  const avgPenglibatanByPillar = [
    { name: 'Sukan', 'Avg Penglibatan': sukanCount > 0 ? Math.round(sukanPenglibatanTotal / sukanCount) : 0 },
    { name: 'Kelab', 'Avg Penglibatan': kelabCount > 0 ? Math.round(kelabPenglibatanTotal / kelabCount) : 0 },
    { name: 'Uniform', 'Avg Penglibatan': uniformCount > 0 ? Math.round(uniformPenglibatanTotal / uniformCount) : 0 }
  ];

  return {
    triPillarData,
    triPillarProjectedData,
    leadershipDensityData,
    passiveEngagementData,
    eliteConversionData,
    participationMix,
    engagementByCategory,
    avgPenglibatanByPillar
  };
}
