import { supabase, isOfflineMode } from './supabase';
import { importedData } from '../data/importedData';

export interface ManagementTeamMember {
  id: number;
  teacher_name: string;
  role: string;
  tahun: number;
}

export interface FormClass {
  id: number;
  nama_kelas: string;
  teacher_name: string | null;
  tahun: number;
}

export interface KokurikulumUnit {
  id: number;
  unit_code: string;
  kategori: string;
  nama_rasmi: string;
  nama_singkat: string | null;
  chief_teacher: string | null;
  advisors: string[] | null;
  tahun: number;
}

export interface StudentRecord {
  id: number;
  nama: string;
  kelas: string;
  student_number: number | null;
  tahun: number;
  sukan_unit: string | null;
  sukan_jawatan: string | null;
  sukan_ahli: string | null;
  sukan_kehadiran: number | null;
  sukan_pencapaian: string | null;
  kelab_unit: string | null;
  kelab_jawatan: string | null;
  kelab_ahli: string | null;
  kelab_kehadiran: number | null;
  kelab_pencapaian: string | null;
  uniform_unit: string | null;
  uniform_jawatan: string | null;
  uniform_ahli: string | null;
  uniform_kehadiran: number | null;
  uniform_pencapaian: string | null;
  sukan_jenis_skor_penglibatan: string | null;
  kelab_jenis_skor_penglibatan: string | null;
  uniform_jenis_skor_penglibatan: string | null;
}

export interface SchoolData {
  managementTeam: ManagementTeamMember[];
  formClasses: FormClass[];
  kokurikulumUnits: KokurikulumUnit[];
  students: StudentRecord[];
  unitAdvisors: UnitAdvisorRow[];
  metadata: {
    sekolah: string;
    unit: string;
    tahun: number;
  };
}

export interface UnitAdvisorRow {
  id?: string;
  user_id: string;
  unit_code: string;
  tahun: number;
  created_at?: string;
}

export interface UnitAdvisorAssignment {
  userId: string;
  unitCode: string;
  tahun: number;
}

export function mapUnitAdvisorRow(row: UnitAdvisorRow): UnitAdvisorAssignment {
  return {
    userId: row.user_id,
    unitCode: row.unit_code,
    tahun: row.tahun,
  };
}

export async function fetchSchoolData(): Promise<SchoolData> {
  if (isOfflineMode) {
    return getOfflineData();
  }

  try {
    const [managementRes, formClassesRes, unitsRes, studentsRes, unitAdvisorsRes] = await Promise.all([
      supabase.from('management_team').select('*').order('id'),
      supabase.from('form_classes').select('*').order('nama_kelas'),
      supabase.from('kokurikulum_units').select('*').order('unit_code'),
      supabase.from('students').select('*').order('kelas, student_number'),
      supabase.from('unit_advisors').select('*').order('user_id'),
    ]);

    // Log individual query results for debugging
    const errors = [
      { table: 'management_team', error: managementRes.error },
      { table: 'form_classes', error: formClassesRes.error },
      { table: 'kokurikulum_units', error: unitsRes.error },
      { table: 'students', error: studentsRes.error },
      { table: 'unit_advisors', error: unitAdvisorsRes.error },
    ].filter(e => e.error);

     if (errors.length > 0) {
       // Supabase query errors handled by throwing individual exceptions below
     }

    if (managementRes.error) throw managementRes.error;
    if (formClassesRes.error) throw formClassesRes.error;
    if (unitsRes.error) throw unitsRes.error;
    if (studentsRes.error) throw studentsRes.error;
    // unit_advisors is optional in some environments; if the table is missing,
    // keep loading the core school data instead of falling back to an empty state.
    if (unitAdvisorsRes.error && (unitAdvisorsRes.error as any).code !== 'PGRST205') {
      throw unitAdvisorsRes.error;
    }

    return {
      managementTeam: managementRes.data || [],
      formClasses: formClassesRes.data || [],
      kokurikulumUnits: unitsRes.data || [],
      students: studentsRes.data || [],
      unitAdvisors: unitAdvisorsRes.data || [],
      metadata: {
        sekolah: 'SM KONVEN ST. URSULA',
        unit: 'KOKURIKULUM',
        tahun: 2025,
      },
    };
  } catch (error) {
     // Error fetching school data from Supabase handled by returning offline data
    return getOfflineData();
  }
}

function getOfflineData(): SchoolData {
  return {
    managementTeam: [],
    formClasses: [],
    kokurikulumUnits: [],
    students: [],
    unitAdvisors: [],
    metadata: {
      sekolah: importedData.metadata.sekolah,
      unit: importedData.metadata.unit,
      tahun: importedData.metadata.tahun,
    },
  };
}

export function transformToPenglibatan(student: StudentRecord) {
  const result: any = {};

  if (student.sukan_unit) {
    result.sukan_dan_permainan = {
      unit_code: student.sukan_unit,
      jawatan: student.sukan_jawatan,
      ahli: student.sukan_ahli,
      kehadiran: student.sukan_kehadiran?.toString() || null,
      pencapaian: student.sukan_pencapaian,
      jenisSkorPenglibatan: student.sukan_jenis_skor_penglibatan || undefined,
    };
  }

  if (student.kelab_unit) {
    result.kelab_dan_persatuan = {
      unit_code: student.kelab_unit,
      jawatan: student.kelab_jawatan,
      ahli: student.kelab_ahli,
      kehadiran: student.kelab_kehadiran?.toString() || null,
      pencapaian: student.kelab_pencapaian,
      jenisSkorPenglibatan: student.kelab_jenis_skor_penglibatan || undefined,
    };
  }

  if (student.uniform_unit) {
    result.badan_beruniform = {
      unit_code: student.uniform_unit,
      jawatan: student.uniform_jawatan,
      ahli: student.uniform_ahli,
      kehadiran: student.uniform_kehadiran?.toString() || null,
      pencapaian: student.uniform_pencapaian,
      jenisSkorPenglibatan: student.uniform_jenis_skor_penglibatan || undefined,
    };
  }

  return result;
}

export async function saveUnitAdvisors(
  userId: string,
  unitCodes: string[],
  tahun: number
): Promise<void> {
  if (isOfflineMode) return;

  const { error: deleteError } = await supabase
    .from('unit_advisors')
    .delete()
    .eq('user_id', userId)
    .eq('tahun', tahun);

  if (deleteError) throw deleteError;

  if (unitCodes.length === 0) return;

  const rows = unitCodes.map(code => ({
    user_id: userId,
    unit_code: code,
    tahun,
  }));

  const { error: insertError } = await supabase
    .from('unit_advisors')
    .insert(rows);

  if (insertError) throw insertError;
}

export async function bulkSaveUnitAdvisors(
  assignments: Array<{ userId: string; unitCode: string; tahun: number }>
): Promise<void> {
  if (isOfflineMode) return;
  if (assignments.length === 0) return;

  const { error } = await supabase
    .from('unit_advisors')
    .upsert(assignments.map(a => ({
      user_id: a.userId,
      unit_code: a.unitCode,
      tahun: a.tahun,
    })), { onConflict: 'user_id,unit_code,tahun' });

  if (error) throw error;
}

export async function fetchTeacherUserIds(): Promise<Array<{ name: string; userId: string }>> {
  if (isOfflineMode) return [];

  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, surname, given_name')
    .not('surname', 'is', null);

  if (error) return [];

  return data
    .filter(r => r.surname || r.given_name)
    .map(r => ({
      name: `${r.given_name || ''} ${r.surname || ''}`.trim(),
      userId: r.user_id,
    }));
}
