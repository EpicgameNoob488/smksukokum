import type { Session } from '@supabase/supabase-js';

export interface ManagementTeamMember {
  name: string;
  role: string;
}

export interface CoCurricularUnit {
  name: string;
  category: string;
  chief: string;
  advisors: string[];
}

export interface FormClass {
  id: string;
  name: string;
  teacher: string;
}

export interface Student {
  id: string;
  name: string;
  surname: string;
  givenName: string;
  classId: string;
  uniformUnit: string;
  club: string;
  sport: string;
  estimatedPAJSK: number;
  pajskGrade: string;
  pajskPoint: number;
  pajskGradeLabel: string;
  pajskBreakdown: {
    sukan: { penglibatan: number; kehadiran: number; pencapaian: number; total: number };
    kelab: { penglibatan: number; kehadiran: number; pencapaian: number; total: number };
    uniform: { penglibatan: number; kehadiran: number; pencapaian: number; total: number };
    extraKurikulum: number;
  };
  attendance: number;
  rawPenglibatan: {
    badan_beruniform: { kehadiran: string; jawatan: string; peringkat: string; pencapaian: string };
    kelab_dan_persatuan: { kehadiran: string; jawatan: string; peringkat: string; pencapaian: string };
    sukan_dan_permainan: { kehadiran: string; jawatan: string; peringkat: string; pencapaian: string };
  };
}

export interface EditModalState {
  isOpen: boolean;
  type: 'management' | 'formTeacher' | 'unit' | 'student' | 'fullTeacher' | null;
  index: number;
  data: any;
  originalName?: string;
}

export interface DashboardProps {
  session: Session | null;
  onLogout: () => void;
  onLoginRequired: () => void;
  isOfflineBypass: boolean;
  onNavigateSettings?: () => void;
  userRole?: 'admin' | 'teacher' | null;
  formClassId?: string | null;
}