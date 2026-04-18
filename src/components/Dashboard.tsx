import React, { useState } from 'react';
import { api } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, Cell, Legend
} from 'recharts';
import { 
  Search, Settings, LayoutDashboard, Users, UserCircle2, 
  Activity, GraduationCap, TrendingUp, AlertTriangle, Download, Filter, X, Edit2, Save, Plus, Trash2, ChevronDown, LogOut, CheckCircle
} from 'lucide-react';
import { supabase, isOfflineMode } from '../lib/supabase';
import { calculateKPIs } from '../lib/kpiCalculations';
import { mapUnit, mapManagement, mapClass, mapStudent } from '../lib/supabaseMappers';
import { useSchoolData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';
import { exportToCSV } from '../lib/csvExport';
import { getAvailableTeacherClasses, getAvailableTeacherRoles } from '../lib/filterUtils';
import EditTeacherModal from './EditTeacherModal';
import { DashboardSidebar } from './DashboardSidebar';
import StudentTable from './StudentTable';
import NotificationBell from './NotificationBell';

import { tokens, DT } from '../lib/designTokens';

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Teachers', icon: Users },
  { name: 'Students', icon: UserCircle2 },
];

import { Session } from '@supabase/supabase-js';

export default function Dashboard({ 
  session, 
  onLogout, 
  onLoginRequired,
  isOfflineBypass,
  onNavigateSettings,
  userRole,
  formClassId
}: { 
  session: Session | null;
  onLogout: () => void;
  onLoginRequired: () => void;
  isOfflineBypass: boolean;
  onNavigateSettings?: () => void;
  userRole?: 'admin' | 'teacher' | null;
  formClassId?: string | null;
}) {
  const { settings } = useSettings();
  const { data: schoolData, isLoading: dataLoading, error } = useSchoolData();
  const { pendingRolesRefreshTrigger } = useNotification();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [studentYear, setStudentYear] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025]);
  const [hasDataForYear, setHasDataForYear] = useState<boolean>(true);
  const [managementTeamData, setManagementTeamData] = useState<any[]>([]);
  const [coCurricularUnitsData, setCoCurricularUnitsData] = useState<any[]>([]);
  const [formTeachersData, setFormTeachersData] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [pendingRoleAssignments, setPendingRoleAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Process data from DataContext when available
  React.useEffect(() => {
    if (!isOfflineMode) {
      // In online mode, rely on DataContext
      if (!dataLoading) {
        if (schoolData) {
          // Extract available years from the data
          const years = new Set<number>();
          schoolData.managementTeam.forEach(m => years.add(m.tahun));
          schoolData.formClasses.forEach(c => years.add(c.tahun));
          schoolData.kokurikulumUnits.forEach(u => years.add(u.tahun));
          schoolData.students.forEach(s => years.add(s.tahun));
          
          const sortedYears = Array.from(years).filter(y => y >= 2025).sort((a, b) => b - a);
          setAvailableYears(sortedYears.length > 0 ? sortedYears : [new Date().getFullYear()]);
          
          // Filter data by selected year
          const filteredManagement = schoolData.managementTeam
            .filter(m => m.tahun === selectedYear)
            .map(mapManagement);
          let filteredUnits = schoolData.kokurikulumUnits
            .filter(u => u.tahun === selectedYear)
            .map(mapUnit);
          
          // Fallback: If no units for selected year, use most recent year's units
          if (filteredUnits.length === 0) {
            const allUnitYears = [...new Set(schoolData.kokurikulumUnits.map(u => u.tahun))].sort((a, b) => b - a);
            const mostRecentYear = allUnitYears[0];
            if (mostRecentYear) {
              filteredUnits = schoolData.kokurikulumUnits
                .filter(u => u.tahun === mostRecentYear)
                .map(mapUnit);
            }
          }
          
          const filteredClasses = schoolData.formClasses
            .filter(c => c.tahun === selectedYear)
            .map(mapClass);
          const filteredStudents = schoolData.students
            .map(row => mapStudent(row, filteredUnits, filteredClasses));
          
          setManagementTeamData(filteredManagement);
          setCoCurricularUnitsData(filteredUnits);
          setFormTeachersData(filteredClasses);
          setStudentsData(filteredStudents);
          setHasDataForYear(
            filteredManagement.length > 0 || 
            filteredUnits.length > 0 || 
            filteredClasses.length > 0 || 
            filteredStudents.length > 0
          );
        } else if (error) {
          // DataContext error handled by setting loading state to false
        } else {
          // DataContext loaded but schoolData is null - using empty state
        }
        setIsLoading(false);
      }
    } else {
      // In offline mode, use default data
      setIsLoading(false);
    }
  }, [schoolData, dataLoading, error, isOfflineMode, selectedYear, studentYear]);

  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';

  // Resolve formClassId to class name (works across years since names are stable)
  const formClassName = React.useMemo(() => {
    if (!formClassId) return null;
    const cls = (schoolData?.formClasses || []).find(c => String(c.id) === String(formClassId));
    return cls?.nama_kelas || null;
  }, [formClassId, schoolData?.formClasses]);

  // Fetch pending role assignments
  React.useEffect(() => {
    console.log('pendingRoleAssignments: isAdmin =', isAdmin, 'userRole =', userRole, 'trigger =', pendingRolesRefreshTrigger);
    if (isAdmin) {
      api.pendingRoleAssignments()
        .then(result => {
          console.log('pendingRoleAssignments: API result =', result);
          if (result.requests) {
            console.log('pendingRoleAssignments: Setting state with', result.requests.length, 'items');
            setPendingRoleAssignments(result.requests);
          }
        })
        .catch((err) => console.error('pendingRoleAssignments: Error =', err));
    }
  }, [isAdmin, userRole, pendingRolesRefreshTrigger]);
  const isFormTeacher = !!formClassId;
  
  // Helper to check if user can edit a specific student's class
  const canEditStudent = (studentClassId: string): boolean => {
    if (isAdmin) return true;
    if (isFormTeacher && String(studentClassId) === String(formClassId)) return true;
    // Fallback: match by class name for cross-year support
    if (isFormTeacher && formClassName) {
      const studentClass = (schoolData?.formClasses || []).find(c => String(c.id) === String(studentClassId));
      if (studentClass?.nama_kelas === formClassName) return true;
    }
    return false;
  };
  
  // Helper to check if user can add new student (only to their own class if form teacher)
  const canAddStudent = (): boolean => {
    if (isAdmin) return true;
    if (isFormTeacher) return true;
    return false;
  };
  
  const [selectedClass, setSelectedClass] = useState<{ id: string, name: string } | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: 'management' | 'formTeacher' | 'unit' | 'student' | 'fullTeacher' | null;
    index: number;
    data: any;
    originalName?: string;
  }>({ isOpen: false, type: null, index: -1, data: null });

  // Handle Escape key to return to login (Logout)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editModal.isOpen) {
        onLogout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLogout, editModal.isOpen]);

  // Reset selected class and filters when year changes
  React.useEffect(() => {
    setSelectedClass(null);
    setDashboardClassFilter('');
  }, [selectedYear]);

  const [classFilter, setClassFilter] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All Students');
  const [globalSearch, setGlobalSearch] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFormFilter, setStudentFormFilter] = useState('All Forms');
  const [ajktFilter, setAjktFilter] = useState('');
  const [dashboardFormFilter, setDashboardFormFilter] = useState('All Forms');
  const [dashboardClassFilter, setDashboardClassFilter] = useState('');
  const [dashboardPillarFilter, setDashboardPillarFilter] = useState('');
  const [teacherViewTab, setTeacherViewTab] = useState<'Directory' | 'Management' | 'Classes' | 'Kokurikulum' | 'Pending Roles'>('Directory');
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const TEACHERS_PER_PAGE = 9;
  
  // Filter mode: 'highlight' shows all pillars with selection highlighted, 'filter' hides non-selected
  const [filterMode, setFilterMode] = useState<'highlight' | 'filter'>('highlight');
  
  // Pillar name mapping for chart data matching
  const pillarNameMap: Record<string, string> = {
    'Kelab & Persatuan': 'Kelab',
    'Badan Beruniform': 'Uniform',
    'Sukan dan Permainan': 'Sukan'
  };
  
  // Get opacity for pillar based on selection (for highlight mode)
  const getPillarOpacity = (pillarName: string): number => {
    if (!dashboardPillarFilter || filterMode === 'filter') return 1;
    const mappedName = pillarNameMap[dashboardPillarFilter];
    return pillarName === mappedName ? 1 : 0.25;
  };
  
  // Check if any filters are active
  const hasActiveFilters = dashboardFormFilter !== 'All Forms' || dashboardClassFilter !== '' || dashboardPillarFilter !== '';
  
  // Clear all dashboard filters
  const clearAllFilters = () => {
    setDashboardFormFilter('All Forms');
    setDashboardClassFilter('');
    setDashboardPillarFilter('');
  };

  const allTeachers = React.useMemo(() => {
    const teacherMap = new Map<string, any>();

    const getTeacher = (name: string) => {
      if (!teacherMap.has(name)) {
        teacherMap.set(name, {
          name,
          email: '',
          managementRoles: [],
          classes: [],
          kokurikulum: { head: [], advisor: [] }
        });
      }
      return teacherMap.get(name);
    };

    managementTeamData.forEach(m => {
      getTeacher(m.name).managementRoles.push(m.role);
    });

    formTeachersData.forEach(c => {
      getTeacher(c.teacher).classes.push(c.name);
    });

    coCurricularUnitsData.forEach(u => {
      if (u.chief) getTeacher(u.chief).kokurikulum.head.push({ name: u.name, category: u.category });
      u.advisors.forEach((adv: string) => {
        getTeacher(adv).kokurikulum.advisor.push({ name: u.name, category: u.category });
      });
    });

    return Array.from(teacherMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [managementTeamData, formTeachersData, coCurricularUnitsData]);

  const filteredStudentsData = React.useMemo(() => {
    return studentsData.filter(s => {
      if (dashboardFormFilter !== 'All Forms') {
        const formNum = dashboardFormFilter.split(' ')[1];
        const classIdStr = String(s.classId);
        if (!classIdStr.startsWith(formNum)) return false;
      }
      if (dashboardClassFilter) {
        if (String(s.classId) !== String(formTeachersData.find(c => c.name === dashboardClassFilter)?.id)) return false;
      }
      // Pillar filter - check student's participation in the selected pillar
      if (dashboardPillarFilter) {
        const pillar = dashboardPillarFilter;
        const rawP = s.rawPenglibatan;
        if (pillar === 'Kelab & Persatuan') {
          if (!rawP?.kelab_dan_persatuan?.unit_code) return false;
        } else if (pillar === 'Badan Beruniform') {
          if (!rawP?.badan_beruniform?.unit_code) return false;
        } else if (pillar === 'Sukan dan Permainan') {
          if (!rawP?.sukan_dan_permainan?.unit_code) return false;
        }
      }
      return true;
    });
  }, [studentsData, dashboardFormFilter, dashboardClassFilter, dashboardPillarFilter, formTeachersData]);

  const derivedCharts = React.useMemo(() => calculateKPIs(filteredStudentsData), [filteredStudentsData]);
  
  // For highlight mode, we need charts based on all data but with styling applied
  // For filter mode, charts use filtered data directly
  const allStudentsCharts = React.useMemo(() => calculateKPIs(studentsData), [studentsData]);
  
  // Decide which chart data to use based on filter mode
  const chartData = filterMode === 'highlight' ? allStudentsCharts : derivedCharts;

  const kpis = [
    { 
      title: 'Total Students', 
      value: hasActiveFilters ? `${filteredStudentsData.length}/${studentsData.length}` : filteredStudentsData.length, 
      unit: hasActiveFilters ? 'filtered' : '', 
      trend: '0%', 
      color: tokens.colors.primaryRed, 
      isWarning: false,
      subtitle: hasActiveFilters ? `${studentsData.length - filteredStudentsData.length} excluded by filters` : undefined
    },
    { 
      title: 'Avg Estimated PAJSK', 
      value: filteredStudentsData.length > 0 ? (filteredStudentsData.reduce((acc, s) => acc + s.estimatedPAJSK, 0) / filteredStudentsData.length).toFixed(1) : '0.0', 
      unit: '/110', 
      trend: '0%', 
      color: tokens.colors.accentOrange, 
      isWarning: false,
      subtitle: hasActiveFilters && studentsData.length > 0 ? `All: ${(studentsData.reduce((acc, s) => acc + s.estimatedPAJSK, 0) / studentsData.length).toFixed(1)}` : undefined
    },
    { 
      title: 'Avg Kehadiran', 
      value: filteredStudentsData.length > 0 ? (filteredStudentsData.reduce((acc, s) => {
        const bd = s.pajskBreakdown;
        const total = (bd?.sukan?.kehadiran || 0) + (bd?.kelab?.kehadiran || 0) + (bd?.uniform?.kehadiran || 0);
        return acc + total;
      }, 0) / filteredStudentsData.length).toFixed(1) : '0.0', 
      unit: '/40', 
      trend: '0%', 
      color: tokens.colors.trendGreenText, 
      isWarning: false 
    },
    { title: 'Total Teachers', value: allTeachers.length, unit: '', trend: 'Stable', color: tokens.colors.textNavy, isWarning: false },
    { title: 'Management Roles', value: managementTeamData.length, unit: '', trend: 'Stable', color: tokens.colors.textMuted, isWarning: false },
  ];

  const filteredTeachers = React.useMemo(() => {
    let filtered = allTeachers;
    if (classFilter) {
      const query = classFilter.toLowerCase();
      filtered = filtered.filter(t => t.classes.some((c: string) => c.toLowerCase().includes(query)));
    }
    if (ajktFilter) {
      const filterLower = ajktFilter.toLowerCase();
      filtered = filtered.filter(t =>
        t.managementRoles.some((r: string) => r.toLowerCase() === filterLower) ||
        t.kokurikulum.head.some((u: any) =>
          u.category.toLowerCase() === filterLower || u.name.toLowerCase() === filterLower
        ) ||
        t.kokurikulum.advisor.some((u: any) =>
          u.category.toLowerCase() === filterLower || u.name.toLowerCase() === filterLower
        )
      );
    }
    if (teacherSearchQuery) {
      const query = teacherSearchQuery.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(query));
    }
    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.managementRoles.some((r: string) => r.toLowerCase().includes(query)) ||
        t.classes.some((c: string) => c.toLowerCase().includes(query)) ||
        t.kokurikulum.head.some((u: any) => u.name.toLowerCase().includes(query)) ||
        t.kokurikulum.advisor.some((u: any) => u.name.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [allTeachers, classFilter, ajktFilter, globalSearch, teacherSearchQuery]);

  const filteredManagement = React.useMemo(() => {
    let filtered = managementTeamData;
    if (teacherSearchQuery) {
      const query = teacherSearchQuery.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(query));
    }
    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query)
      );
    }
    if (classFilter || ajktFilter) {
      const matchingTeacherNames = new Set(filteredTeachers.map(t => t.name));
      filtered = filtered.filter(m => matchingTeacherNames.has(m.name));
    }
    return filtered;
  }, [managementTeamData, classFilter, ajktFilter, globalSearch, teacherSearchQuery, filteredTeachers]);

  const filteredFormTeachers = React.useMemo(() => {
    let filtered = formTeachersData;
    if (teacherSearchQuery) {
      const query = teacherSearchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.teacher.toLowerCase().includes(query)
      );
    }
    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.teacher.toLowerCase().includes(query)
      );
    }
    if (classFilter) {
      const query = classFilter.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.teacher.toLowerCase().includes(query)
      );
    }
    if (ajktFilter) {
      const matchingTeacherNames = new Set(filteredTeachers.map(t => t.name));
      filtered = filtered.filter(f => matchingTeacherNames.has(f.teacher));
    }
    return filtered;
  }, [formTeachersData, classFilter, ajktFilter, globalSearch, teacherSearchQuery, filteredTeachers]);

  const filteredUnits = React.useMemo(() => {
    let filtered = coCurricularUnitsData;
    if (teacherSearchQuery) {
      const query = teacherSearchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        (u.chief && u.chief.toLowerCase().includes(query)) ||
        u.advisors.some((a: string) => a.toLowerCase().includes(query))
      );
    }
    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        (u.chief && u.chief.toLowerCase().includes(query)) ||
        u.advisors.some((a: string) => a.toLowerCase().includes(query))
      );
    }
    if (teacherViewTab === 'Kokurikulum' && ajktFilter) {
      const filterLower = ajktFilter.trim().toLowerCase();
      filtered = filtered.filter(u => u.category.trim().toLowerCase() === filterLower);
    }
    if (classFilter || (ajktFilter && teacherViewTab !== 'Kokurikulum')) {
      const matchingTeacherNames = new Set(filteredTeachers.map(t => t.name));
      filtered = filtered.filter(u => 
        (u.chief && matchingTeacherNames.has(u.chief)) ||
        u.advisors.some((a: string) => matchingTeacherNames.has(a))
      );
    }
    return filtered;
  }, [coCurricularUnitsData, classFilter, ajktFilter, teacherViewTab, globalSearch, teacherSearchQuery, filteredTeachers]);

  const availableTeacherClasses = React.useMemo(() => {
    return getAvailableTeacherClasses(allTeachers, teacherViewTab, ajktFilter);
  }, [allTeachers, teacherViewTab, ajktFilter]);

  const availableTeacherRoles = React.useMemo(() => {
    return getAvailableTeacherRoles(allTeachers, teacherViewTab, classFilter);
  }, [allTeachers, teacherViewTab, classFilter]);

  const availableStudentClasses = React.useMemo(() => {
    const classes = (schoolData?.formClasses || [])
      .filter((c: any) => c.tahun === selectedYear)
      .map((c: any) => c.name)
      .filter(Boolean);
    return Array.from(new Set(classes)).sort((a, b) => a.localeCompare(b));
  }, [schoolData?.formClasses, selectedYear]);

  const selectedStudentClassId = React.useMemo(() => {
    if (!studentClassFilter || studentClassFilter === 'All Students') return '';
    return formTeachersData.find((c: any) => c.name === studentClassFilter)?.id || '';
  }, [formTeachersData, studentClassFilter]);

  const totalTeacherPages = Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE);

  const getVisiblePages = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const delta = 2;
    const result: (number | string)[] = [];
    
    for (let i = 1; i <= total; i++) {
      const isFirst = i === 1;
      const isLast = i === total;
      const isNearCurrent = i >= current - delta && i <= current + delta;
      
      if (isFirst || isLast || isNearCurrent) {
        result.push(i);
      } else if (result[result.length - 1] !== '...') {
        result.push('...');
      }
    }
    
    return result;
  };

  const paginatedTeachers = React.useMemo(() => {
    const start = (teacherPage - 1) * TEACHERS_PER_PAGE;
    return filteredTeachers.slice(start, start + TEACHERS_PER_PAGE);
  }, [filteredTeachers, teacherPage]);

  React.useEffect(() => {
    setTeacherPage(1);
  }, [classFilter, ajktFilter, teacherViewTab, globalSearch, teacherSearchQuery]);

  React.useEffect(() => {
    setClassFilter('');
    setAjktFilter('');
  }, [teacherViewTab]);

  React.useEffect(() => {
    if (!isAdmin && teacherViewTab === 'Pending Roles') {
      setTeacherViewTab('Directory');
    }
  }, [isAdmin, teacherViewTab]);

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ backgroundColor: tokens.colors.mainBg }}>
      <div className="flex w-full max-w-[1500px] mx-auto">
       {/* Sidebar */}
       <DashboardSidebar 
         activeTab={activeTab} 
         setActiveTab={setActiveTab} 
         settings={settings} 
         schoolData={schoolData} 
       />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto relative z-10 px-4 sm:px-6">
         
         {/* Floating Action Panel (Alert) */}
         {showAlert && (
           <div className="bg-red-50 border-b border-red-100 px-10 py-3 flex items-center justify-between animate-in slide-in-from-top">
             <div className="flex items-center gap-3">
               <AlertTriangle className="w-5 h-5 text-red-600" />
               <div>
                 <h3 className="text-sm font-bold text-red-900">KRS Administrative Red Flag</h3>
                 <p className="text-xs font-medium text-red-700 mt-0.5">Dozens of students missing Kehadiran and Pencapaian data. PAJSK closure imminent.</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <button className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                 Send Memo to Advisor
               </button>
               <button onClick={() => setShowAlert(false)} className="text-red-400 hover:text-red-600">
                 <X className="w-4 h-4" />
               </button>
             </div>
           </div>
         )}
         
         {/* PAJSK Disclaimer Banner */}
         <div className="bg-amber-50 border-b border-amber-100 px-10 py-2 flex items-center justify-center gap-2">
           <p className="text-xs font-medium text-amber-800">
             <span className="font-bold">Note:</span> PAJSK scores shown are <span className="italic">estimates</span> based on available data. Official PAJSK scores may differ from KPM's official calculation.
           </p>
         </div>

         {/* Global Header & Filters (The Control Deck) - per design_tokens.md */}
        <header className="px-8 py-5 flex flex-col gap-5 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: tokens.colors.textNavy }}>
              {activeTab === 'Dashboard' ? 'Activities Overview' : activeTab}
            </h2>
            
            <div className="flex items-center gap-5">
              {activeTab !== 'Students' && activeTab !== 'Teachers' && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <input 
                    type="text" 
                    placeholder="Search student instantly..." 
                    className="pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all w-64 font-medium border border-slate-200"
                    style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                {isAdmin && <NotificationBell />}
                <div className="flex items-center gap-3 ml-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-extrabold leading-none truncate max-w-[150px]" style={{ color: tokens.colors.textNavy }}>
                      {isAdmin ? (session?.user?.email || 'Admin') : (session?.user?.email || 'Teacher')}
                    </p>
                    <p className="text-[10px] font-bold mt-1 uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>
                      {isAdmin ? (isOfflineMode ? 'Offline Mode' : 'Admin') : 'Teacher'}
                    </p>
                  </div>
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={onNavigateSettings}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border cursor-pointer bg-white hover:bg-slate-50"
                        style={{ borderColor: tokens.colors.cardOuterBg, color: tokens.colors.textNavy }}
                        title="System Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={onLogout}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border cursor-pointer bg-white hover:bg-slate-50"
                        style={{ borderColor: tokens.colors.cardOuterBg, color: tokens.colors.primaryRed }}
                        title="Logout (Esc)"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={onLogout}
                      className="px-4 py-2 rounded-full flex items-center justify-center transition-all shadow-md text-white text-xs font-bold cursor-pointer hover:scale-105 active:scale-95"
                      style={{ 
                        backgroundColor: tokens.colors.primaryRed
                      }}
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters - per design_tokens.md + ui-ux-pro-max rules */}
          {activeTab === 'Dashboard' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative hidden md:block mr-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <input 
                    type="text" 
                    placeholder="Search metrics..." 
                    className="pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all w-44 font-medium border border-slate-200"
                    style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                  />
                </div>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer" 
                  style={{ color: tokens.colors.primaryRed }}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 mr-1" style={{ color: tokens.colors.textMuted }} />
                <select 
                  value={dashboardFormFilter}
                  onChange={(e) => setDashboardFormFilter(e.target.value)}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer min-w-[120px] max-w-[180px]" 
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option>All Forms</option>
                  <option>Form 1</option>
                  <option>Form 2</option>
                  <option>Form 3</option>
                  <option>Form 4</option>
                  <option>Form 5</option>
                </select>
                <select 
                  value={dashboardClassFilter}
                  onChange={(e) => setDashboardClassFilter(e.target.value)}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer min-w-[120px] max-w-[200px] truncate" 
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="">All Classes</option>
                  {formTeachersData.map((cls, idx) => (
                    <option key={idx} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
                <select 
                  value={dashboardPillarFilter}
                  onChange={(e) => setDashboardPillarFilter(e.target.value)}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer min-w-[140px] max-w-[220px]" 
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="">All Pillars</option>
                  <option>Kelab & Persatuan</option>
                  <option>Badan Beruniform</option>
                  <option>Sukan dan Permainan</option>
                </select>
                <button 
                  onClick={() => {
                    setDashboardFormFilter('All Forms');
                    setDashboardClassFilter('');
                    setDashboardPillarFilter('');
                  }}
                  className="px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer" 
                  style={{ color: tokens.colors.textNavy }}
                >
                  Reset
                </button>
              </div>
              
              {isAdmin && (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer" style={{ color: tokens.colors.textNavy }}>
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              )}
            </div>
          )}
        </header>

        {/* Dashboard Content */}
        {activeTab === 'Dashboard' && (
          <div className="px-10 pb-10 space-y-8 mt-6 animate-in fade-in duration-500">
            
            {/* Hero KPI Strip (The Pulse) - per design_tokens.md */}
            {!hasDataForYear ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-amber-800 font-bold">No data available for {selectedYear}</p>
                <p className="text-amber-600 text-sm">Please select a different year or add data for {selectedYear}</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden group cursor-pointer hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest w-2/3 leading-tight" style={{ color: tokens.colors.textMuted }}>{kpi.title}</h3>
                    {kpi.isWarning ? (
                      <AlertTriangle className="w-5 h-5 animate-pulse" style={{ color: tokens.colors.primaryRed }} />
                    ) : (
                      <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: kpi.color }}></div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-2xl font-extrabold" style={{ color: tokens.colors.textNavy }}>{kpi.value}</span>
                    <span className="text-xs font-bold" style={{ color: tokens.colors.textMuted }}>{kpi.unit}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"
                      style={{
                        backgroundColor: kpi.trend.startsWith('+') && !kpi.isWarning ? tokens.colors.trendGreenBg : tokens.colors.trendRedBg,
                        color: kpi.trend.startsWith('+') && !kpi.isWarning ? tokens.colors.trendGreenText : tokens.colors.trendRedText
                      }}>
                      {kpi.trend}
                    </span>
                  </div>
                  {kpi.subtitle && (
                    <p className="text-[10px] font-medium mt-1" style={{ color: tokens.colors.textMuted }}>{kpi.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
)}

{/* Main Analytical Canvas (Activities Overview) */}
{hasDataForYear && (
<>
{/* Filter Status Indicator & Mode Toggle */}
{hasActiveFilters && (
  <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold" style={{ color: tokens.colors.textMuted }}>Viewing:</span>
      {dashboardPillarFilter && (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tokens.colors.accentOrange }}>
          {dashboardPillarFilter}
        </span>
      )}
      {dashboardFormFilter !== 'All Forms' && (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tokens.colors.accentNavy }}>
          {dashboardFormFilter}
        </span>
      )}
      {dashboardClassFilter && (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tokens.colors.trendGreenText }}>
          {dashboardClassFilter}
        </span>
      )}
      <button onClick={clearAllFilters} className="text-xs font-bold hover:underline cursor-pointer" style={{ color: tokens.colors.primaryRed }}>
        Clear All
      </button>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: tokens.colors.textMuted }}>Mode:</span>
      <button 
        onClick={() => setFilterMode('highlight')} 
        className={cn(
          "px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer",
          filterMode === 'highlight' ? "text-white" : "bg-white border border-slate-200 hover:bg-slate-50"
        )}
        style={filterMode === 'highlight' ? { backgroundColor: tokens.colors.primaryRed } : { color: tokens.colors.textNavy }}
      >
        Highlight
      </button>
      <button 
        onClick={() => setFilterMode('filter')} 
        className={cn(
          "px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer",
          filterMode === 'filter' ? "text-white" : "bg-white border border-slate-200 hover:bg-slate-50"
        )}
        style={filterMode === 'filter' ? { backgroundColor: tokens.colors.primaryRed } : { color: tokens.colors.textNavy }}
      >
        Filter
      </button>
    </div>
  </div>
)}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

{/* Zone A: Tri-Pillar Balance - per design_tokens.md */}
<div className="rounded-2xl p-6 shadow-sm flex flex-col hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
  <div className="mb-4">
    <h3 className="text-lg font-extrabold" style={{ color: tokens.colors.textNavy }}>Tri-Pillar Balance</h3>
    <p className="text-xs font-bold mt-1" style={{ color: tokens.colors.textMuted }}>Distribution of student participation across the three main pillars.</p>
    {dashboardPillarFilter && filterMode === 'highlight' && (
      <p className="text-[10px] font-bold mt-1" style={{ color: tokens.colors.accentOrange }}>
        Highlighting: {dashboardPillarFilter}
      </p>
    )}
  </div>
  <div className="flex-1 rounded-2xl p-4 shadow-sm relative group" style={{ backgroundColor: tokens.colors.cardInnerBg, minHeight: '280px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData.triPillarData}>
        <PolarGrid stroke={tokens.colors.cardOuterBg} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={({ payload, x, y, textAnchor, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.value);
            return (
              <text 
                x={x} 
                y={y} 
                textAnchor={textAnchor} 
                fill={opacity === 1 ? tokens.colors.textNavy : tokens.colors.textMuted}
                fontSize={11} 
                fontWeight={opacity === 1 ? 800 : 600}
                style={{ opacity }}
              >
                {payload.value}
              </text>
            );
          }} 
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar 
          name="Active Participants %" 
          dataKey="Active %" 
          stroke={tokens.colors.primaryRed} 
          fill={tokens.colors.primaryRed} 
          fillOpacity={0.4}
          dot={({ cx, cy, payload, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.subject);
            return (
              <circle 
                cx={cx} 
                cy={cy} 
                r={opacity === 1 ? 4 : 2} 
                fill={opacity === 1 ? tokens.colors.primaryRed : tokens.colors.textMuted}
                style={{ opacity }}
              />
            );
          }}
        />
        <RechartsTooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }} 
          formatter={(value: number | undefined, name: string | undefined, props: any) => {
            const opacity = getPillarOpacity(props.payload.subject);
            const hint = opacity < 1 && dashboardPillarFilter ? ` (${dashboardPillarFilter} selected)` : '';
            return [`${value}%${hint}`, name];
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
                  {/* Action Tooltip Simulation - per ui-ux-pro-max: no scale transforms */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap cursor-pointer hover:bg-red-700 transition-colors">
                        Trigger Engagement Campaign
                      </button>
                    </div>
                </div>
              </div>

{/* Zone B: Leadership Pipeline */}
<div className="rounded-2xl p-6 shadow-sm flex flex-col hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
  <div className="mb-4">
    <h3 className="text-lg font-extrabold" style={{ color: tokens.colors.textNavy }}>Leadership Pipeline</h3>
    <p className="text-xs font-bold mt-1" style={{ color: tokens.colors.textMuted }}>Ratio of leadership roles to regular members.</p>
    {dashboardPillarFilter && filterMode === 'highlight' && (
      <p className="text-[10px] font-bold mt-1" style={{ color: tokens.colors.accentOrange }}>
        Highlighting: {dashboardPillarFilter}
      </p>
    )}
  </div>
  <div className="flex-1 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: tokens.colors.cardInnerBg, minHeight: '280px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={chartData.leadershipDensityData} stackOffset="expand" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={({ payload, x, y }: any) => {
            const opacity = getPillarOpacity(payload.value);
            return (
              <text 
                x={x} 
                y={y} 
                textAnchor="end" 
                fill={opacity === 1 ? tokens.colors.textNavy : tokens.colors.textMuted}
                fontSize={12} 
                fontWeight={opacity === 1 ? 800 : 600}
                style={{ opacity }}
              >
                {payload.value}
              </text>
            );
          }} 
          width={60} 
        />
        <RechartsTooltip cursor={{ fill: tokens.colors.cardOuterBg }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }}
          formatter={(value: number | undefined, name: string | undefined, props: any) => {
            const opacity = getPillarOpacity(props.payload.name);
            const hint = opacity < 1 && dashboardPillarFilter ? ` (${dashboardPillarFilter} selected)` : '';
            return [`${value}${hint}`, name];
          }}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{
            fontSize: '12px',
            fontWeight: 700,
            color: tokens.colors.textNavy,
            paddingTop: '10px'
          }}
        />
        <Bar 
          dataKey="AJK/Pengerusi" 
          stackId="a" 
          fill={tokens.colors.accentNavy} 
          radius={[4, 0, 0, 4]}
          shape={({ x, y, width, height, payload, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.name);
            return (
              <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill={tokens.colors.accentNavy}
                style={{ opacity }}
              />
            );
          }}
        />
        <Bar 
          dataKey="Ahli Biasa" 
          stackId="a" 
          fill={tokens.colors.textMuted} 
          radius={[0, 4, 4, 0]}
          shape={({ x, y, width, height, payload, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.name);
            return (
              <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill={tokens.colors.textMuted}
                style={{ opacity }}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Zone C: The "Passive" vs. "Active" Matrix - per design_tokens.md */}
<div className="rounded-2xl p-6 shadow-sm flex flex-col hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
  <div className="mb-4">
    <h3 className="text-lg font-extrabold" style={{ color: tokens.colors.textNavy }}>Passive vs. Active Matrix</h3>
    <p className="text-xs font-bold mt-1" style={{ color: tokens.colors.textMuted }}>Comparison of active participants vs passive members.</p>
    {dashboardPillarFilter && filterMode === 'highlight' && (
      <p className="text-[10px] font-bold mt-1" style={{ color: tokens.colors.accentOrange }}>
        Highlighting: {dashboardPillarFilter}
      </p>
    )}
  </div>
  <div className="flex-1 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: tokens.colors.cardInnerBg, minHeight: '280px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={chartData.passiveEngagementData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={tokens.colors.cardOuterBg} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={({ payload, x, y }: any) => {
            const opacity = getPillarOpacity(payload.value);
            return (
              <text 
                x={x} 
                y={y} 
                textAnchor="end" 
                fill={opacity === 1 ? tokens.colors.textNavy : tokens.colors.textMuted}
                fontSize={11} 
                fontWeight={opacity === 1 ? 800 : 600}
                style={{ opacity }}
              >
                {payload.value}
              </text>
            );
          }} 
          width={80} 
        />
        <RechartsTooltip
          cursor={{ fill: tokens.colors.cardOuterBg }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ fontWeight: 700, fontSize: '11px' }}
          formatter={(value: number | undefined, name: string | undefined, props: any) => {
            const color = props.name.includes('Penyokong') ? tokens.colors.primaryRed : tokens.colors.trendGreenText;
            const opacity = getPillarOpacity(props.payload.name);
            const hint = opacity < 1 && dashboardPillarFilter ? ` (${dashboardPillarFilter} selected)` : '';
            return [<span style={{ color }}>{Math.abs(value)}{hint}</span>, name];
          }}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{
            fontSize: '11px',
            fontWeight: 700,
            color: tokens.colors.textNavy,
            paddingTop: '10px'
          }}
        />
        <Bar 
          dataKey="Penyokong" 
          fill={tokens.colors.primaryRed} 
          name="Penyokong (Score 5)"
          shape={({ x, y, width, height, payload, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.name);
            return (
              <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill={tokens.colors.primaryRed}
                style={{ opacity }}
              />
            );
          }}
        />
        <Bar 
          dataKey="Peserta" 
          fill={tokens.colors.trendGreenText} 
          name="Peserta/AJK (Score 10+)" 
          radius={[0, 4, 4, 0]}
          shape={({ x, y, width, height, payload, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.name);
            return (
              <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill={tokens.colors.trendGreenText}
                rx={4}
                style={{ opacity }}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Zone D: Elite Conversion Funnel */}
<div className="rounded-2xl p-6 shadow-sm flex flex-col hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
  <div className="mb-4">
    <h3 className="text-lg font-extrabold" style={{ color: tokens.colors.textNavy }}>Elite Conversion Funnel</h3>
    <p className="text-xs font-bold mt-1" style={{ color: tokens.colors.textMuted }}>Number of students achieving elite status (Johan, Naib Johan, dll).</p>
    {dashboardPillarFilter && filterMode === 'highlight' && (
      <p className="text-[10px] font-bold mt-1" style={{ color: tokens.colors.accentOrange }}>
        Highlighting: {dashboardPillarFilter}
      </p>
    )}
  </div>
  <div className="flex-1 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: tokens.colors.cardInnerBg, minHeight: '280px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData.eliteConversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorFunnelHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={tokens.colors.accentYellow} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={tokens.colors.accentYellow} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.colors.cardOuterBg} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={({ payload, x, y }: any) => {
            const opacity = getPillarOpacity(payload.value);
            return (
              <text 
                x={x} 
                y={y + 10}
                textAnchor="middle" 
                fill={opacity === 1 ? tokens.colors.textNavy : tokens.colors.textMuted}
                fontSize={12} 
                fontWeight={opacity === 1 ? 800 : 600}
                style={{ opacity }}
              >
                {payload.value}
              </text>
            );
          }} 
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: tokens.colors.textMuted, fontSize: 10, fontWeight: 700 }} />
        <RechartsTooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }}
          formatter={(value: number | undefined, name: string | undefined, props: any) => {
            const opacity = getPillarOpacity(props.payload.name);
            const hint = opacity < 1 && dashboardPillarFilter ? ` (${dashboardPillarFilter} selected)` : '';
            return [`${value}${hint}`, name];
          }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={tokens.colors.accentYellow} 
          strokeWidth={4} 
          fillOpacity={1} 
          fill="url(#colorFunnelHighlight)"
          dot={({ cx, cy, payload, ...rest }: any) => {
            const opacity = getPillarOpacity(payload.name);
            return (
              <circle 
                cx={cx} 
                cy={cy} 
                r={opacity === 1 ? 6 : 3}
                fill={opacity === 1 ? tokens.colors.accentYellow : tokens.colors.textMuted}
                stroke={opacity === 1 ? tokens.colors.primaryRed : 'none'}
                strokeWidth={opacity === 1 ? 2 : 0}
                style={{ opacity }}
              />
            );
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

</div>
</>
)}

</div>
        )}

        {/* Teachers Content - per design_tokens.md + ui-ux-pro-max rules */}
        {activeTab === 'Teachers' && (
          <div className="px-8 pb-10 space-y-6 mt-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-extrabold" style={{ color: tokens.colors.textNavy }}>Teacher Directory</h2>
                <p className="text-sm font-medium mt-1" style={{ color: tokens.colors.textMuted }}>Manage and view teacher co-curricular assignments.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer" 
                  style={{ color: tokens.colors.primaryRed }}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="relative hidden md:block">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <select 
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      if (e.target.value === "") {
                        setAjktFilter("");
                      }
                    }}
                    className="pl-10 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all w-36 font-medium border border-slate-200 appearance-none bg-white cursor-pointer"
                    style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy }}
                  >
                    <option value="">All Classes</option>
                    {availableTeacherClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: tokens.colors.textMuted }} />
                </div>

                <div className="relative hidden md:block">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <select 
                    value={ajktFilter}
                    onChange={(e) => {
                      setAjktFilter(e.target.value);
                      if (e.target.value === "") {
                        setClassFilter("");
                      }
                    }}
                    className="pl-10 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all w-40 font-medium border border-slate-200 appearance-none bg-white cursor-pointer"
                    style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy }}
                  >
                    <option value="">All Roles</option>
                    {availableTeacherRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: tokens.colors.textMuted }} />
                </div>
                <button 
                  onClick={() => {
                    setTeacherSearchQuery('');
                    setClassFilter('');
                    setAjktFilter('');
                  }}
                  className="px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer" 
                  style={{ color: tokens.colors.textNavy }}
                >
                  Reset
                </button>
                {isAdmin && teacherViewTab !== 'Pending Roles' && (
                <button 
                  onClick={() => {
                    if (teacherViewTab === 'Management') {
                      setEditModal({ isOpen: true, type: 'management', index: -1, data: { name: '', role: 'Pengetua' } });
                    } else if (teacherViewTab === 'Kokurikulum') {
                      setEditModal({ isOpen: true, type: 'unit', index: -1, data: { name: '', category: 'Kelab & Persatuan', chief: '', advisors: [] } });
                    } else {
                      setEditModal({ 
                        isOpen: true, 
                        type: 'fullTeacher', 
                        index: -1, 
                        data: { 
                          name: '', 
                          email: '',
                          managementRoles: [], 
                          classes: [], 
                          kokurikulum: { head: [], advisor: [] } 
                        } 
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 text-white whitespace-nowrap cursor-pointer"
                  style={{ backgroundColor: tokens.colors.primaryRed }}
                >
                  <Plus className="w-4 h-4" />
                  {teacherViewTab === 'Management' ? 'New Role' : teacherViewTab === 'Kokurikulum' ? 'New Unit' : 'New Teacher'}
                </button>
                )}
              </div>
            </div>

            {/* Sub-navigation for Teachers Tab */}
            <div className="flex flex-wrap items-center gap-2 mb-6 pb-2">
              {(['Directory', 'Management', 'Classes', 'Kokurikulum', ...(isAdmin ? ['Pending Roles' as const] : [])] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTeacherViewTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap relative",
                    teacherViewTab === tab ? "text-white" : "bg-white hover:bg-slate-50 border border-slate-200"
                  )}
                  style={teacherViewTab === tab ? { backgroundColor: tokens.colors.textNavy } : { color: tokens.colors.textNavy }}
                >
                  {tab === 'Directory' ? 'All Teachers' : tab === 'Classes' ? 'Form Teachers' : tab === 'Pending Roles' ? 'Pending Roles' : tab}
                  {tab === 'Pending Roles' && pendingRoleAssignments.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                      {pendingRoleAssignments.length}
                    </span>
                  )}
                </button>
              ))}
              {teacherViewTab !== 'Pending Roles' && (
                <div className="relative w-full sm:w-64 sm:ml-auto min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <input 
                    type="text"
                    placeholder={`Search in ${teacherViewTab === 'Directory' ? 'Profiles' : teacherViewTab}...`}
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 transition-all w-full font-medium border border-slate-200"
                    style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy }}
                  />
                  {globalSearch && (
                    <button 
                      onClick={() => setGlobalSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {teacherViewTab === 'Directory' && (
              <div className="rounded-2xl p-6 shadow-sm mb-6 hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>
                      {globalSearch || classFilter || ajktFilter ? 'Search Results' : 'All Teachers'}
                    </h3>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white text-slate-600 shadow-sm">
                      {filteredTeachers.length} Teachers
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      const columns = [
                        { key: 'name' as keyof typeof filteredTeachers[0], label: 'Name' },
                        { key: 'email' as keyof typeof filteredTeachers[0], label: 'Email' },
                        { key: 'managementRoles' as keyof typeof filteredTeachers[0], label: 'Management Roles' },
                        { key: 'classes' as keyof typeof filteredTeachers[0], label: 'Classes' },
                      ];
                      exportToCSV(filteredTeachers, columns, `teachers-all-${Date.now()}.csv`);
                    }}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200 whitespace-nowrap cursor-pointer" style={{ color: tokens.colors.textNavy }}
                  >
                    <Download className="w-4 h-4 inline-block mr-1.5" />
                    Export Teachers
                  </button>
                </div>
                {filteredTeachers.length === 0 ? (
                  <p className="text-sm font-medium" style={{ color: tokens.colors.textMuted }}>No teachers found matching your search.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedTeachers.map((teacher, idx) => (
                        <div key={idx} className="rounded-2xl p-6 shadow-sm bg-white hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative">
                          <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: tokens.colors.cardOuterBg }}>
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ color: tokens.colors.primaryRed }}>
                              {getInitials(teacher.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-base leading-tight truncate" style={{ color: tokens.colors.textNavy }}>{teacher.name}</h4>
                              {teacher.email && (
                                <p className="text-xs font-medium mt-0.5" style={{ color: tokens.colors.textMuted }}>
                                  {teacher.email}
                                </p>
                              )}
                              {teacher.classes.length > 0 && (
                                <p className="text-xs font-bold mt-1" style={{ color: tokens.colors.accentOrange }}>
                                  Class: {teacher.classes.join(', ')}
                                </p>
                              )}
                            </div>
                            {isAdmin && (
                            <button 
                              onClick={() => setEditModal({ 
                                isOpen: true, 
                                type: 'fullTeacher', 
                                index: idx, 
                                originalName: teacher.name,
                                data: JSON.parse(JSON.stringify(teacher))
                              })}
                              className="p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                              style={{ color: tokens.colors.textNavy }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-3 flex-1">
                            {teacher.managementRoles.length > 0 && (
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: tokens.colors.textMuted }}>Management (AJKT)</p>
                                <ul className="space-y-0.5">
                                  {teacher.managementRoles.map((role: string, i: number) => (
                                    <li key={i} className="text-xs font-bold" style={{ color: tokens.colors.textNavy }}>• {role}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {(teacher.kokurikulum.head.length > 0 || teacher.kokurikulum.advisor.length > 0) && (
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: tokens.colors.textMuted }}>Kokurikulum</p>
                                <ul className="space-y-1.5">
                                  {teacher.kokurikulum.head.map((unit: any, i: number) => (
                                    <li key={`h-${i}`} className="text-xs flex flex-col">
                                      <span className="font-bold" style={{ color: tokens.colors.textNavy }}>{unit.name}</span>
                                      <span className="text-[10px] font-semibold" style={{ color: tokens.colors.accentNavy }}>Head ({unit.category})</span>
                                    </li>
                                  ))}
                                  {teacher.kokurikulum.advisor.map((unit: any, i: number) => (
                                    <li key={`a-${i}`} className="text-xs flex flex-col">
                                      <span className="font-bold" style={{ color: tokens.colors.textNavy }}>{unit.name}</span>
                                      <span className="text-[10px] font-medium" style={{ color: tokens.colors.textMuted }}>Advisor ({unit.category})</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalTeacherPages > 1 && (
                      <div className="mt-10 flex items-center justify-end gap-4">
                        <span className="text-xs font-bold" style={{ color: tokens.colors.textMuted }}>
                          Showing {(teacherPage - 1) * TEACHERS_PER_PAGE + 1} - {Math.min(teacherPage * TEACHERS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            disabled={teacherPage === 1}
                            onClick={() => setTeacherPage(p => Math.max(1, p - 1))}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold",
                              teacherPage === 1 ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <ChevronDown className="w-5 h-5 rotate-90" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {getVisiblePages(teacherPage, totalTeacherPages).map((p, idx) => {
                              if (p === '...') {
                                return (
                                  <span 
                                    key={`ellipsis-${idx}`} 
                                    className="w-10 h-10 flex items-center justify-center text-sm font-bold"
                                    style={{ color: tokens.colors.textMuted }}
                                  >
                                    ...
                                  </span>
                                );
                              }
                              
                              return (
                                <button
                                  key={p}
                                  onClick={() => setTeacherPage(p as number)}
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold text-sm",
                                    teacherPage === p 
                                      ? "text-white" 
                                      : "bg-white text-slate-600 hover:bg-slate-50"
                                  )}
                                  style={teacherPage === p ? { backgroundColor: tokens.colors.primaryRed } : {}}
                                >
                                  {p}
                                </button>
                              );
                            })}
                          </div>

                          <button 
                            disabled={teacherPage === totalTeacherPages}
                            onClick={() => setTeacherPage(p => Math.min(totalTeacherPages, p + 1))}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold",
                              teacherPage === totalTeacherPages ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <ChevronDown className="w-5 h-5 -rotate-90" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Senior Management Team */}
            {teacherViewTab === 'Management' && (
              <div className="rounded-2xl p-6 shadow-sm hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>Senior Management Team</h3>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white text-slate-600 shadow-sm">
                      {filteredManagement.length} Members
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      const columns = [
                        { key: 'name' as keyof typeof filteredManagement[0], label: 'Teacher Name' },
                        { key: 'role' as keyof typeof filteredManagement[0], label: 'Role' },
                      ];
                      exportToCSV(filteredManagement, columns, `teachers-management-${Date.now()}.csv`);
                    }}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200 whitespace-nowrap cursor-pointer" style={{ color: tokens.colors.textNavy }}
                  >
                    <Download className="w-4 h-4 inline-block mr-1.5" />
                    Export Management
                  </button>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredManagement.map((member, idx) => (
                  <div key={idx} className="rounded-2xl p-4 shadow-sm bg-white hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ color: tokens.colors.primaryRed }}>
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="font-extrabold text-sm truncate" style={{ color: tokens.colors.textNavy }}>{member.name}</h4>
                      <p className="text-xs font-medium truncate" style={{ color: tokens.colors.textMuted }}>{member.role}</p>
                    </div>
                    {isAdmin && (
                    <button 
                      onClick={() => setEditModal({ isOpen: true, type: 'management', index: idx, data: { ...member } })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Form Teachers */}
            {teacherViewTab === 'Classes' && (
              <div className="rounded-2xl p-6 shadow-sm hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-extrabold" style={{ color: tokens.colors.textNavy }}>Form Teachers (Guru Kelas)</h3>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white text-slate-600 shadow-sm">
                      {filteredFormTeachers.length} Classes
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      const columns = [
                        { key: 'name' as keyof typeof filteredFormTeachers[0], label: 'Class Name' },
                        { key: 'teacher' as keyof typeof filteredFormTeachers[0], label: 'Teacher Name' },
                      ];
                      exportToCSV(filteredFormTeachers, columns, `teachers-form-classes-${Date.now()}.csv`);
                    }}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200 whitespace-nowrap cursor-pointer" style={{ color: tokens.colors.textNavy }}
                  >
                    <Download className="w-4 h-4 inline-block mr-1.5" />
                    Export Form Teachers
                  </button>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFormTeachers.map((cls, idx) => (
                  <div key={idx} className="rounded-2xl p-4 shadow-sm bg-white hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative">
                    <div>
                      <h4 className="font-extrabold text-sm" style={{ color: tokens.colors.textNavy }}>{cls.name}</h4>
                      <p className="text-xs font-medium mt-0.5" style={{ color: tokens.colors.textMuted }}>{cls.teacher}</p>
                    </div>
                    {isAdmin && (
                    <button 
                      onClick={() => setEditModal({ isOpen: true, type: 'formTeacher', index: idx, data: { ...cls } })}
                      className="p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Co-Curricular Advisors */}
            {teacherViewTab === 'Kokurikulum' && (
              <div className="rounded-2xl p-6 shadow-sm hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>Co-Curricular Units</h3>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white text-slate-600 shadow-sm">
                      {filteredUnits.length} Units
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      const exportData = filteredUnits.flatMap(unit => [
                        { unit: unit.name, category: unit.category, role: 'Head', teacher: unit.chief },
                        ...unit.advisors.map((adv: string) => ({ unit: unit.name, category: unit.category, role: 'Advisor', teacher: adv }))
                      ]).filter(item => item.teacher && item.teacher !== '');
                      const columns = [
                        { key: 'unit' as keyof typeof exportData[0], label: 'Unit Name' },
                        { key: 'category' as keyof typeof exportData[0], label: 'Category' },
                        { key: 'role' as keyof typeof exportData[0], label: 'Role' },
                        { key: 'teacher' as keyof typeof exportData[0], label: 'Teacher Name' },
                      ];
                      exportToCSV(exportData, columns, `teachers-kokurikulum-${Date.now()}.csv`);
                    }}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200 whitespace-nowrap cursor-pointer" style={{ color: tokens.colors.textNavy }}
                  >
                    <Download className="w-4 h-4 inline-block mr-1.5" />
                    Export Kokurikulum
                  </button>
                </div>
                <div className="space-y-6">
                  {['Kelab & Persatuan', 'Badan Beruniform', 'Sukan dan Permainan'].map(category => {
                    const unitsInCategory = filteredUnits.filter(u => u.category === category);
                    if (unitsInCategory.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h4 className="text-lg font-extrabold mb-4" style={{ color: tokens.colors.textNavy }}>{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {unitsInCategory.map((unit, idx) => (
                            <div key={idx} className="rounded-2xl p-5 shadow-sm bg-white flex flex-col gap-3 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative">
                              <div className="flex justify-between items-start">
                                <h5 className="font-extrabold text-sm" style={{ color: tokens.colors.textNavy }}>{unit.name}</h5>
                                {isAdmin && (
                                <button 
                                  onClick={() => setEditModal({ isOpen: true, type: 'unit', index: coCurricularUnitsData.findIndex(u => u.name === unit.name), data: { ...unit, advisors: [...unit.advisors] } })}
                                  className="p-1.5 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                                  style={{ color: tokens.colors.textNavy }}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Head</p>
                                <p className="text-xs font-bold text-slate-700">{unit.chief}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Advisors</p>
                                <p className="text-xs font-medium text-slate-600">
                                  {unit.advisors.length > 0 ? unit.advisors.join(', ') : '-'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending Role Assignments */}
            {teacherViewTab === 'Pending Roles' && (
              <div className="rounded-2xl p-6 shadow-sm mb-6 hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>
                      Pending Role Assignments
                    </h3>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white text-slate-600 shadow-sm">
                      {pendingRoleAssignments.length} Pending
                    </span>
                  </div>
                </div>
                {pendingRoleAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No pending role assignments</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingRoleAssignments.map((teacher, idx) => {
                      const approvedDate = teacher.reviewed_at ? new Date(teacher.reviewed_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                      return (
                      <div 
                        key={idx} 
                        className="rounded-2xl p-6 shadow-sm bg-white hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative"
                        title={`Pending since ${approvedDate} - awaiting form class or AJKT role`}
                      >
                        <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: tokens.colors.cardOuterBg }}>
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ color: tokens.colors.primaryRed }}>
                            {teacher.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'T'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-base leading-tight truncate" style={{ color: tokens.colors.textNavy }}>{teacher.full_name}</h4>
                            {teacher.email && (
                              <p className="text-xs font-medium mt-0.5 truncate" style={{ color: tokens.colors.textMuted }}>
                                {teacher.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs font-medium" style={{ color: tokens.colors.textMuted }}>
                            Approved: {teacher.reviewed_at ? new Date(teacher.reviewed_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                          <button
                          onClick={() => {
                            setTeacherViewTab('Classes');
                            setEditModal({ 
                              isOpen: true, 
                              type: 'formTeacher', 
                              index: -1, 
                              data: { 
                                name: '', 
                                teacher: teacher.full_name,
                                surname: teacher.full_name.split(' ').slice(0, -1).join(' '),
                                givenName: teacher.full_name.split(' ').slice(-1).join(' '),
                                tahun: selectedYear 
                              } 
                            });
                          }}
                          className="mt-4 w-full px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 text-white whitespace-nowrap cursor-pointer"
                          style={{ backgroundColor: tokens.colors.primaryRed }}
                        >
                          <Plus className="w-4 h-4" />
                          Assign Role
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Students Content - per design_tokens.md + ui-ux-pro-max rules */}
        {activeTab === 'Students' && (
          <div className="px-8 pb-10 space-y-6 mt-6 animate-in fade-in duration-500">
            <StudentTable
              classId={selectedStudentClassId}
              className={studentClassFilter || 'All Students'}
              onBack={() => {}}
              tokens={tokens}
              studentsData={studentsData}
              studentClassFilter={studentClassFilter}
              onStudentClassFilterChange={setStudentClassFilter}
              availableStudentClasses={availableStudentClasses}
              setEditModal={setEditModal}
              isAdmin={isAdmin}
              formClassId={formClassId}
              formClassName={formClassName}
              selectedYear={selectedYear}
              currentYear={new Date().getFullYear()}
              onYearChange={(year) => setSelectedYear(year)}
            />
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'Dashboard' && activeTab !== 'Teachers' && activeTab !== 'Students' && (
          <div className="p-10 flex items-center justify-center h-[calc(100vh-8rem)] animate-in fade-in">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm" style={{ backgroundColor: tokens.colors.cardOuterBg, color: tokens.colors.textNavy }}>
                {(() => {
                  const Icon = navItems.find(i => i.name === activeTab)?.icon;
                  return Icon ? <Icon className="w-10 h-10" /> : null;
                })()}
              </div>
              <h2 className="text-3xl font-extrabold mb-3" style={{ color: tokens.colors.textNavy }}>{activeTab}</h2>
              <p className="font-medium leading-relaxed" style={{ color: tokens.colors.textMuted }}>
                The {activeTab.toLowerCase()} module is currently under development. Check back soon for updates and new features.
              </p>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <EditTeacherModal 
          editModal={editModal} 
          setEditModal={setEditModal} 
          tokens={tokens}
          managementTeamData={managementTeamData}
          setManagementTeamData={setManagementTeamData}
          formTeachersData={formTeachersData}
          setFormTeachersData={setFormTeachersData}
          coCurricularUnitsData={coCurricularUnitsData}
          setCoCurricularUnitsData={setCoCurricularUnitsData}
          studentsData={studentsData}
          setStudentsData={setStudentsData}
          isAdmin={isAdmin}
          allFormClasses={schoolData?.formClasses || []}
          allUnits={schoolData?.kokurikulumUnits || []}
          selectedYear={selectedYear}
        />

      </main>
    </div>
  </div>
  );
}
