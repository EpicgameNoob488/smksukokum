import React from 'react';
import { ArrowLeft, Download, Search, Edit2, ChevronDown, Filter, Plus, Users, BookOpen, Trophy, MoreHorizontal } from 'lucide-react';
import { Student } from '../data/studentData';
import { cn } from '../lib/utils';
import { exportToCSV } from '../lib/csvExport';
import type { CSVColumn } from '../lib/csvExport';
import SearchableDropdown from './SearchableDropdown';
import { getAvailableFilterOptions, type FilterSelections } from '../lib/filterUtils';

interface StudentTableProps {
  classId: string;
  className: string;
  onBack: () => void;
  tokens: any;
  studentsData: Student[];
  setEditModal: (modal: any) => void;
  isAdmin?: boolean;
  formClassId?: string | null;
  formClassName?: string | null;
  selectedYear?: number;
  currentYear?: number;
  onYearChange?: (year: number) => void;
}

const STUDENTS_PER_PAGE = 12;

const DT = {
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    modal: 'shadow-2xl',
  },
  spacing: {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  },
  transition: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
  },
};

export default function StudentTable({ classId, className, onBack, tokens, studentsData, setEditModal, isAdmin = false, formClassId, formClassName, selectedYear = 2025, currentYear = 2026, onYearChange }: StudentTableProps) {
  const isFormTeacher = (!!formClassId && formClassId === classId) || (!!formClassName && formClassName === className);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);
  
  const [uniformFilter, setUniformFilter] = React.useState('All Units');
  const [clubFilter, setClubFilter] = React.useState('All Clubs');
  const [sportFilter, setSportFilter] = React.useState('All Sports');
  const [scoreFilter, setScoreFilter] = React.useState('All Scores');
  const [attendanceFilter, setAttendanceFilter] = React.useState('All Attendance');

  // Available filter options that update based on current selections
  const [availableUniforms, setAvailableUniforms] = React.useState<string[]>([]);
  const [availableClubs, setAvailableClubs] = React.useState<string[]>([]);
  const [availableSports, setAvailableSports] = React.useState<string[]>([]);
  const [availableScores, setAvailableScores] = React.useState<string[]>([]);
  const [availableAttendances, setAvailableAttendances] = React.useState<string[]>([]);

  const classStudents = React.useMemo(() => {
    // Show all students when className indicates "All" or no classId
    if (!classId || className === 'All Students' || className === 'All') {
      return studentsData;
    }
    return studentsData.filter(s => s.classId === classId);
  }, [studentsData, classId, className]);

  // Smart year filter - only show years that exist in data (min 2025)
  const availableYears = React.useMemo(() => {
    const yearsInData = new Set(studentsData.map(s => s.tahun).filter(Boolean));
    const minYear = 2025;
    const maxYear = currentYear;
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      if (yearsInData.has(y)) {
        years.push(y);
      }
    }
    if (years.length === 0) {
      return [currentYear, currentYear - 1].filter(y => y >= minYear);
    }
    return years;
  }, [studentsData, currentYear]);

  const filteredStudents = React.useMemo(() => {
    return classStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (uniformFilter !== 'All Units' && s.uniformUnit !== uniformFilter) return false;
      if (clubFilter !== 'All Clubs' && s.club !== clubFilter) return false;
      if (sportFilter !== 'All Sports' && s.sport !== sportFilter) return false;

      if (scoreFilter !== 'All Scores') {
        if (scoreFilter === '80+' && s.estimatedPAJSK < 80) return false;
        if (scoreFilter === '60-80' && (s.estimatedPAJSK < 60 || s.estimatedPAJSK >= 80)) return false;
        if (scoreFilter === '<60' && s.estimatedPAJSK >= 60) return false;
      }

      if (attendanceFilter !== 'All Attendance') {
        if (attendanceFilter === '95%+' && s.attendance < 95) return false;
        if (attendanceFilter === '75%+' && s.attendance < 75) return false;
        if (attendanceFilter === '<75%' && s.attendance >= 75) return false;
      }

      return true;
    });
  }, [classStudents, searchTerm, uniformFilter, clubFilter, sportFilter, scoreFilter, attendanceFilter]);

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

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

  const resetFilters = () => {
    setSearchTerm('');
    setUniformFilter('All Units');
    setClubFilter('All Clubs');
    setSportFilter('All Sports');
    setScoreFilter('All Scores');
    setAttendanceFilter('All Attendance');
    setCurrentPage(1);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, uniformFilter, clubFilter, sportFilter, scoreFilter, attendanceFilter]);

  // Initialize available filter options on mount
  React.useEffect(() => {
    const initialSelections: FilterSelections = {
      uniformUnit: 'All Units',
      club: 'All Clubs',
      sport: 'All Sports',
      scoreRange: 'All Scores',
      attendanceRange: 'All Attendance'
    };

    const options = getAvailableFilterOptions(classStudents, initialSelections);
    setAvailableUniforms(options.uniforms);
    setAvailableClubs(options.clubs);
    setAvailableSports(options.sports);
    setAvailableScores(options.scores);
    setAvailableAttendances(options.attendances);
  }, [classStudents]);

  // Update available filter options when any filter changes
  React.useEffect(() => {
    const currentSelections: FilterSelections = {
      uniformUnit: uniformFilter,
      club: clubFilter,
      sport: sportFilter,
      scoreRange: scoreFilter,
      attendanceRange: attendanceFilter
    };

    const options = getAvailableFilterOptions(classStudents, currentSelections);
    setAvailableUniforms(options.uniforms);
    setAvailableClubs(options.clubs);
    setAvailableSports(options.sports);
    setAvailableScores(options.scores);
    setAvailableAttendances(options.attendances);
  }, [uniformFilter, clubFilter, sportFilter, scoreFilter, attendanceFilter]);

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return { bg: tokens.colors.trendGreenBg, text: tokens.colors.trendGreenText };
    if (attendance >= 75) return { bg: tokens.colors.warningBg, text: tokens.colors.warningText };
    return { bg: tokens.colors.dangerBg, text: tokens.colors.dangerText };
  };

  const getPAJSKColor = (score: number) => {
    if (score >= 80) return tokens.colors.trendGreenText;
    if (score >= 60) return tokens.colors.accentYellow;
    return tokens.colors.accentRed;
  };

  const toggleRowExpand = (studentId: string) => {
    setExpandedRowId(prev => prev === studentId ? null : studentId);
  };

  return (
    <div className="animate-in slide-in-from-right duration-500">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>Student List</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100" style={{ color: tokens.colors.primaryRed }}>
                  Year {selectedYear}
                </span>
              </div>
              <p className="text-sm font-medium mt-1" style={{ color: tokens.colors.textMuted }}>Viewing all students and their co-curricular details.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
              <input 
                type="text" 
                placeholder="Search student..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 transition-all w-64 font-medium border border-slate-200"
                style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
              />
            </div>
            <select 
              value={selectedYear}
              onChange={(e) => {
                if (onYearChange) {
                  onYearChange(Number(e.target.value));
                }
              }}
              className="text-sm font-bold bg-white border border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer"
              style={{ color: tokens.colors.primaryRed }}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all border flex items-center gap-2",
                showFilters ? "bg-slate-800 text-white border-slate-800" : "bg-white hover:bg-slate-50 border-slate-200"
              )}
              style={!showFilters ? { color: tokens.colors.textNavy } : {}}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <ChevronDown className={cn("w-4 h-4 transition-transform ml-1", showFilters && "rotate-180")} />
            </button>
            <button
              onClick={() => {
                resetFilters();
                setShowFilters(false);
              }}
              className="px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
              style={{ color: tokens.colors.textNavy }}
            >
              Reset
            </button>
            <button 
              onClick={() => {
                const columns: CSVColumn<Student>[] = [
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Name' },
                  { key: 'estimatedPAJSK', label: 'PAJSK Score' },
                  { key: 'attendance', label: 'Attendance %' },
                  { key: 'uniformUnit', label: 'Uniform Unit' },
                  { key: 'club', label: 'Club' },
                  { key: 'sport', label: 'Sport' },
                  { getValue: (s) => s.rawPenglibatan?.badan_beruniform?.jawatan || '', label: 'Uniform Jawatan' },
                  { getValue: (s) => s.rawPenglibatan?.badan_beruniform?.peringkat || '', label: 'Uniform Peringkat' },
                  { getValue: (s) => s.rawPenglibatan?.badan_beruniform?.pencapaian || '', label: 'Uniform Pencapaian' },
                  { getValue: (s) => s.rawPenglibatan?.badan_beruniform?.kehadiran || '0', label: 'Uniform Kehadiran' },
                  { getValue: (s) => s.rawPenglibatan?.kelab_dan_persatuan?.jawatan || '', label: 'Club Jawatan' },
                  { getValue: (s) => s.rawPenglibatan?.kelab_dan_persatuan?.peringkat || '', label: 'Club Peringkat' },
                  { getValue: (s) => s.rawPenglibatan?.kelab_dan_persatuan?.pencapaian || '', label: 'Club Pencapaian' },
                  { getValue: (s) => s.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || '0', label: 'Club Kehadiran' },
                  { getValue: (s) => s.rawPenglibatan?.sukan_dan_permainan?.jawatan || '', label: 'Sport Jawatan' },
                  { getValue: (s) => s.rawPenglibatan?.sukan_dan_permainan?.peringkat || '', label: 'Sport Peringkat' },
                  { getValue: (s) => s.rawPenglibatan?.sukan_dan_permainan?.pencapaian || '', label: 'Sport Pencapaian' },
                  { getValue: (s) => s.rawPenglibatan?.sukan_dan_permainan?.kehadiran || '0', label: 'Sport Kehadiran' },
                ];
                exportToCSV(filteredStudents, columns, `students-${className}-${Date.now()}.csv`);
              }}
              className="px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer" style={{ color: tokens.colors.textNavy }}
            >
              <Download className="w-4 h-4 inline-block mr-2" />
              Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 2xl:gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="space-y-1 w-full max-w-[240px] justify-self-start">
              <label className="text-xs font-semibold leading-tight break-words" style={{ color: tokens.colors.textMuted }}>Uniform Unit</label>
              <SearchableDropdown
                className="w-full max-w-[240px]"
                value={uniformFilter}
                onChange={(value) => setUniformFilter(value || 'All Units')}
                options={availableUniforms}
                placeholder="All Units"
                textSize="xs"
                controlClassName="h-10 px-4 pr-10 py-2 bg-white border border-slate-200 rounded-full flex items-center"
              />
            </div>
            <div className="space-y-1 w-full max-w-[240px] justify-self-start">
              <label className="text-xs font-semibold leading-tight break-words" style={{ color: tokens.colors.textMuted }}>Club/Persatuan</label>
              <SearchableDropdown
                className="w-full max-w-[240px]"
                value={clubFilter}
                onChange={(value) => setClubFilter(value || 'All Clubs')}
                options={availableClubs}
                placeholder="All Clubs"
                textSize="xs"
                controlClassName="h-10 px-4 pr-10 py-2 bg-white border border-slate-200 rounded-full flex items-center"
              />
            </div>
            <div className="space-y-1 w-full max-w-[240px] justify-self-start">
              <label className="text-xs font-semibold leading-tight break-words" style={{ color: tokens.colors.textMuted }}>Sukan/Permainan</label>
              <SearchableDropdown
                className="w-full max-w-[240px]"
                value={sportFilter}
                onChange={(value) => setSportFilter(value || 'All Sports')}
                options={availableSports}
                placeholder="All Sports"
                textSize="xs"
                controlClassName="h-10 px-4 pr-10 py-2 bg-white border border-slate-200 rounded-full flex items-center"
              />
            </div>
            <div className="space-y-1 w-full max-w-[240px] justify-self-start">
              <label className="text-xs font-semibold leading-tight break-words" style={{ color: tokens.colors.textMuted }}>PAJSK Score</label>
              <div className="relative">
                <select 
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-full h-10 px-4 pr-10 rounded-full text-xs font-semibold border border-slate-200 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent"
                  style={{ color: tokens.colors.textNavy }}
                >
                  {availableScores.map(opt => (
                    <option key={opt} value={opt === 'All Scores' ? '' : opt}>
                      {opt === 'All Scores' ? opt : opt === '80+' ? 'Elite (80+)' : opt === '60-80' ? 'Standard (60-80)' : 'Needs Focus (<60)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1 w-full max-w-[240px] justify-self-start">
              <label className="text-xs font-semibold leading-tight break-words" style={{ color: tokens.colors.textMuted }}>Attendance</label>
              <div className="flex gap-2 min-w-0 justify-end">
                <div className="relative flex-1 min-w-0">
                  <select 
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="w-full h-10 px-4 pr-10 rounded-full text-xs font-semibold border border-slate-200 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent"
                    style={{ color: tokens.colors.textNavy }}
                  >
                    {availableAttendances.map(opt => (
                      <option key={opt} value={opt === 'All Attendance' ? '' : opt}>
                        {opt === 'All Attendance' ? opt : opt === '95%+' ? 'Excellent (95%+)' : opt === '75%+' ? 'Good (75%+)' : 'Needs Focus (<75%)'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => {
                    resetFilters();
                    setShowFilters(false);
                  }}
                  className="h-10 min-w-[72px] px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                  style={{ color: tokens.colors.textNavy }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={cn("rounded-2xl p-6 shadow-sm", DT.shadow.sm)} style={{ backgroundColor: tokens.colors.cardOuterBg }}>
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold" style={{ color: tokens.colors.textMuted }}>No students found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                  <th className="w-10 px-4 py-3 text-left">
                    <ChevronDown className="w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>#</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>Student</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>Attendance</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>PAJSK</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>Uniform</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>Club</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>Sport</th>
                  <th className="px-4 py-3 text-right text-xs font-extrabold uppercase tracking-wider" style={{ color: tokens.colors.textNavy }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, idx) => {
                  const globalIdx = (currentPage - 1) * STUDENTS_PER_PAGE + idx;
                  const isEvenRow = globalIdx % 2 === 0;
                  const isExpanded = expandedRowId === student.id;
                  const attendanceColors = getAttendanceColor(student.attendance);
                  const pajskColor = getPAJSKColor(student.estimatedPAJSK);
                   
                  return (
                    <React.Fragment key={student.id}>
                      <tr 
                        onClick={() => toggleRowExpand(student.id)}
                        className={cn(
                          "cursor-pointer border-b group relative",
                          isEvenRow ? tokens.colors.cardInnerBg : tokens.colors.mainBg,
                          isExpanded ? "border-l-4" : "border-l-4 border-transparent",
                          "hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200"
                        )}
                        style={{ 
                          borderLeftColor: isExpanded ? tokens.colors.accentNavy : 'transparent'
                        }}
                      >
                        <td className="px-4 py-4">
                          <ChevronDown 
                            className={cn("w-4 h-4 transition-transform", DT.transition.normal)} 
                            style={{ color: tokens.colors.textMuted, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} 
                          />
                        </td>
                        <td className="px-4 py-4 text-sm font-medium" style={{ color: tokens.colors.textMuted }}>
                          {globalIdx + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold", DT.radius.full)}
                              style={{ backgroundColor: tokens.colors.trendGreenBg, color: tokens.colors.primaryRed }}
                            >
                              {student.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: tokens.colors.textNavy }}>{student.name}</p>
                              <p className="text-xs font-medium" style={{ color: tokens.colors.textMuted }}>ID: {student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span 
                            className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs", DT.radius.full)}
                            style={{ backgroundColor: attendanceColors.bg, color: attendanceColors.text }}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", DT.radius.full)} style={{ backgroundColor: attendanceColors.text }}></span>
                            {student.attendance}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold" style={{ color: tokens.colors.textNavy }}>
                              {student.estimatedPAJSK}
                              <span className="text-xs font-medium ml-1" style={{ color: tokens.colors.textMuted }}>/100</span>
                            </span>
                            <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                              <div 
                                className="h-full rounded-full" 
                                style={{ width: `${student.estimatedPAJSK}%`, backgroundColor: pajskColor }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("text-sm font-medium", student.uniformUnit === 'Tiada' && "italic")} style={{ color: student.uniformUnit === 'Tiada' ? tokens.colors.textMuted : tokens.colors.textNavy }}>
                            {student.uniformUnit}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("text-sm font-medium", student.club === 'Tiada' && "italic")} style={{ color: student.club === 'Tiada' ? tokens.colors.textMuted : tokens.colors.textNavy }}>
                            {student.club}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("text-sm font-medium", student.sport === 'Tiada' && "italic")} style={{ color: student.sport === 'Tiada' ? tokens.colors.textMuted : tokens.colors.textNavy }}>
                            {student.sport}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {(isAdmin || isFormTeacher) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const globalIndex = studentsData.findIndex(s => s.id === student.id);
                                setEditModal({ isOpen: true, type: 'student', index: globalIndex, data: { ...student } });
                              }}
                              className={cn("p-2 rounded-xl transition-colors", DT.transition.fast)}
                              style={{ color: tokens.colors.primaryRed, backgroundColor: tokens.colors.trendGreenBg }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="border-b" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
                          <td colSpan={9} className="px-4 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Uniform Details */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2" style={{ color: tokens.colors.accentNavy }}>
                                  <Users className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Uniform</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Jawatan: </span>
                                    <span style={{ color: tokens.colors.textNavy }}>{student.rawPenglibatan?.badan_beruniform?.jawatan || '-'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Peringkat: </span>
                                    <span className="italic font-medium" style={{ color: tokens.colors.accentRed }}>{student.rawPenglibatan?.badan_beruniform?.peringkat || '-'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Pencapaian: </span>
                                    <span style={{ color: tokens.colors.textNavy }}>{student.rawPenglibatan?.badan_beruniform?.pencapaian || '-'}</span>
                                  </p>
                                  <span 
                                    className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1", DT.radius.full)}
                                    style={{ 
                                      backgroundColor: Number(student.rawPenglibatan?.badan_beruniform?.kehadiran || 0) >= 10 ? tokens.colors.trendGreenBg :
                                      Number(student.rawPenglibatan?.badan_beruniform?.kehadiran || 0) >= 5 ? tokens.colors.warningBg :
                                      tokens.colors.dangerBg,
                                      color: Number(student.rawPenglibatan?.badan_beruniform?.kehadiran || 0) >= 10 ? tokens.colors.trendGreenText :
                                      Number(student.rawPenglibatan?.badan_beruniform?.kehadiran || 0) >= 5 ? tokens.colors.warningText :
                                      tokens.colors.dangerText
                                    }}
                                  >
                                    Kehadiran: {student.rawPenglibatan?.badan_beruniform?.kehadiran || '0'}
                                  </span>
                                </div>
                              </div>

                              {/* Club Details */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2" style={{ color: tokens.colors.accentNavy }}>
                                  <BookOpen className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Club</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Jawatan: </span>
                                    <span style={{ color: tokens.colors.textNavy }}>{student.rawPenglibatan?.kelab_dan_persatuan?.jawatan || '-'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Peringkat: </span>
                                    <span className="italic font-medium" style={{ color: tokens.colors.accentRed }}>{student.rawPenglibatan?.kelab_dan_persatuan?.peringkat || '-'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Pencapaian: </span>
                                    <span style={{ color: tokens.colors.textNavy }}>{student.rawPenglibatan?.kelab_dan_persatuan?.pencapaian || '-'}</span>
                                  </p>
                                  <span 
                                    className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1", DT.radius.full)}
                                    style={{ 
                                      backgroundColor: Number(student.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || 0) >= 10 ? tokens.colors.trendGreenBg :
                                      Number(student.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || 0) >= 5 ? tokens.colors.warningBg :
                                      tokens.colors.dangerBg,
                                      color: Number(student.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || 0) >= 10 ? tokens.colors.trendGreenText :
                                      Number(student.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || 0) >= 5 ? tokens.colors.warningText :
                                      tokens.colors.dangerText
                                    }}
                                  >
                                    Kehadiran: {student.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || '0'}
                                  </span>
                                </div>
                              </div>

                              {/* Sport Details */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2" style={{ color: tokens.colors.accentNavy }}>
                                  <Trophy className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Sport</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Jawatan: </span>
                                    <span style={{ color: tokens.colors.textNavy }}>{student.rawPenglibatan?.sukan_dan_permainan?.jawatan || '-'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Peringkat: </span>
                                    <span className="italic font-medium" style={{ color: tokens.colors.accentRed }}>{student.rawPenglibatan?.sukan_dan_permainan?.peringkat || '-'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium" style={{ color: tokens.colors.textMuted }}>Pencapaian: </span>
                                    <span style={{ color: tokens.colors.textNavy }}>{student.rawPenglibatan?.sukan_dan_permainan?.pencapaian || '-'}</span>
                                  </p>
                                  <span 
                                    className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1", DT.radius.full)}
                                    style={{ 
                                      backgroundColor: Number(student.rawPenglibatan?.sukan_dan_permainan?.kehadiran || 0) >= 10 ? tokens.colors.trendGreenBg :
                                      Number(student.rawPenglibatan?.sukan_dan_permainan?.kehadiran || 0) >= 5 ? tokens.colors.warningBg :
                                      tokens.colors.dangerBg,
                                      color: Number(student.rawPenglibatan?.sukan_dan_permainan?.kehadiran || 0) >= 10 ? tokens.colors.trendGreenText :
                                      Number(student.rawPenglibatan?.sukan_dan_permainan?.kehadiran || 0) >= 5 ? tokens.colors.warningText :
                                      tokens.colors.dangerText
                                    }}
                                  >
                                    Kehadiran: {student.rawPenglibatan?.sukan_dan_permainan?.kehadiran || '0'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* PAJSK Breakdown */}
                            <div className="mt-6 pt-6 border-t" style={{ borderColor: tokens.colors.textMuted }}>
                              <h4 className="text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: tokens.colors.accentNavy }}>PAJSK Breakdown</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: tokens.colors.cardInnerBg }}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Sukan</p>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Penglibatan:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.sukan?.penglibatan || 0}</span></p>
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Kehadiran:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.sukan?.kehadiran || 0}</span></p>
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Pencapaian:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.sukan?.pencapaian || 0}</span></p>
                                    <p className="font-bold pt-1 border-t" style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.textMuted }}>Total: {student.pajskBreakdown?.sukan?.total || 0}</p>
                                  </div>
                                </div>
                                <div className="p-3 rounded-xl" style={{ backgroundColor: tokens.colors.cardInnerBg }}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Kelab</p>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Penglibatan:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.kelab?.penglibatan || 0}</span></p>
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Kehadiran:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.kelab?.kehadiran || 0}</span></p>
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Pencapaian:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.kelab?.pencapaian || 0}</span></p>
                                    <p className="font-bold pt-1 border-t" style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.textMuted }}>Total: {student.pajskBreakdown?.kelab?.total || 0}</p>
                                  </div>
                                </div>
                                <div className="p-3 rounded-xl" style={{ backgroundColor: tokens.colors.cardInnerBg }}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Uniform</p>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Penglibatan:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.uniform?.penglibatan || 0}</span></p>
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Kehadiran:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.uniform?.kehadiran || 0}</span></p>
                                    <p><span className="font-medium" style={{ color: tokens.colors.textMuted }}>Pencapaian:</span> <span style={{ color: tokens.colors.textNavy }}>{student.pajskBreakdown?.uniform?.pencapaian || 0}</span></p>
                                    <p className="font-bold pt-1 border-t" style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.textMuted }}>Total: {student.pajskBreakdown?.uniform?.total || 0}</p>
                                  </div>
                                </div>
                                <div className="p-3 rounded-xl" style={{ backgroundColor: tokens.colors.cardInnerBg }}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Extra Kurikulum</p>
                                  <div className="space-y-1 text-sm">
                                    <p className="font-bold pt-4" style={{ color: tokens.colors.textNavy }}>Score: {student.pajskBreakdown?.extraKurikulum || 0}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-end gap-4">
            <span className="text-xs font-bold" style={{ color: tokens.colors.textMuted }}>
              Showing {(currentPage - 1) * STUDENTS_PER_PAGE + 1} - {Math.min(currentPage * STUDENTS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length}
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold",
                  currentPage === 1 ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              
              <div className="flex items-center gap-1">
                {getVisiblePages(currentPage, totalPages).map((p, idx) => {
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
                      onClick={() => setCurrentPage(p as number)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold text-sm",
                        currentPage === p 
                          ? "text-white" 
                          : "bg-white text-slate-600 hover:bg-slate-50"
                      )}
                      style={currentPage === p ? { backgroundColor: tokens.colors.primaryRed } : {}}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold",
                  currentPage === totalPages ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
