import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Download, Search, User, Edit2, ChevronDown, Filter, Plus, AlertTriangle, Copy, Users, BookOpen, Trophy } from 'lucide-react';
import { Student } from '../data/studentData';
import { cn } from '../lib/utils';
import { exportToCSV } from '../lib/csvExport';
import type { CSVColumn } from '../lib/csvExport';
import SearchableDropdown from './SearchableDropdown';

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
}

const STUDENTS_PER_PAGE = 12;

export default function StudentTable({ classId, className, onBack, tokens, studentsData, setEditModal, isAdmin = false, formClassId, formClassName, selectedYear = 2025, currentYear = 2026 }: StudentTableProps) {
  const isFormTeacher = (!!formClassId && formClassId === classId) || (!!formClassName && formClassName === className);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);
  
  // Year prompt modal states
  const [showYearPrompt, setShowYearPrompt] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<'add' | 'edit' | null>(null);
  const [pendingEditData, setPendingEditData] = React.useState<any>(null);
  
  // Advanced Filters
  const [uniformFilter, setUniformFilter] = React.useState('All Units');
  const [clubFilter, setClubFilter] = React.useState('All Clubs');
  const [sportFilter, setSportFilter] = React.useState('All Sports');
  const [scoreFilter, setScoreFilter] = React.useState('All Scores');
  const [attendanceFilter, setAttendanceFilter] = React.useState('All Attendance');

  const classStudents = React.useMemo(() => studentsData.filter(s => s.classId === classId), [studentsData, classId]);
  
  const uniqueUniforms = React.useMemo(() => Array.from(new Set(classStudents.map(s => s.uniformUnit))).sort(), [classStudents]);
  const uniqueClubs = React.useMemo(() => Array.from(new Set(classStudents.map(s => s.club))).sort(), [classStudents]);
  const uniqueSports = React.useMemo(() => Array.from(new Set(classStudents.map(s => s.sport))).sort(), [classStudents]);

  const filteredStudents = React.useMemo(() => {
    return classStudents.filter(s => {
      // Search term
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Uniform filter
      if (uniformFilter !== 'All Units' && s.uniformUnit !== uniformFilter) return false;
      
      // Club filter
      if (clubFilter !== 'All Clubs' && s.club !== clubFilter) return false;
      
      // Sport filter
      if (sportFilter !== 'All Sports' && s.sport !== sportFilter) return false;

      // Score filter
      if (scoreFilter !== 'All Scores') {
        if (scoreFilter === '80+' && s.estimatedPAJSK < 80) return false;
        if (scoreFilter === '60-80' && (s.estimatedPAJSK < 60 || s.estimatedPAJSK >= 80)) return false;
        if (scoreFilter === '<60' && s.estimatedPAJSK >= 60) return false;
      }

      // Attendance filter
      if (attendanceFilter !== 'All Attendance') {
        if (attendanceFilter === '95%+' && s.attendance < 95) return false;
        if (attendanceFilter === '<95%' && s.attendance >= 95) return false;
      }

      return true;
    });
  }, [classStudents, searchTerm, uniformFilter, clubFilter, sportFilter, scoreFilter, attendanceFilter]);

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  const resetFilters = () => {
    setSearchTerm('');
    setUniformFilter('All Units');
    setClubFilter('All Clubs');
    setSportFilter('All Sports');
    setScoreFilter('All Scores');
    setAttendanceFilter('All Attendance');
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, uniformFilter, clubFilter, sportFilter, scoreFilter, attendanceFilter]);

  return (
    <div className="animate-in slide-in-from-right duration-500">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              style={{ color: tokens.colors.textNavy }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold" style={{ color: tokens.colors.textNavy }}>{className} - Student List</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100" style={{ color: tokens.colors.primaryRed }}>
                  Year {selectedYear}
                </span>
              </div>
              <p className="text-sm font-medium mt-1" style={{ color: tokens.colors.textMuted }}>Viewing all students in this class and their co-curricular details.</p>
            </div>
          </div>
          
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
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
                  const columns: CSVColumn<Student>[] = [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Name' },
                    { key: 'estimatedPAJSK', label: 'PAJSK Score' },
                    { key: 'attendance', label: 'Attendance %' },
                    { key: 'uniformUnit', label: 'Uniform Unit' },
                    { key: 'club', label: 'Club' },
                    { key: 'sport', label: 'Sport' },
                  ];
                  exportToCSV(filteredStudents, columns, `students-${className}-${Date.now()}.csv`);
                }}
                className="px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer" style={{ color: tokens.colors.textNavy }}
              >
                <Download className="w-4 h-4 inline-block mr-2" />
                Export
              </button>
              <button 
                onClick={() => {
                  if (selectedYear < currentYear) {
                    setPendingAction('add');
                    setPendingEditData(null);
                    setShowYearPrompt(true);
                  } else {
                    setEditModal({ 
                      isOpen: true, 
                      type: 'student', 
                      index: -1, 
                      data: { 
                        id: `STU${Date.now()}`, 
                        name: '', 
                        surname: '', 
                        givenName: '', 
                        classId: classId, 
                        uniformUnit: 'Tiada', 
                        club: 'Tiada', 
                        sport: 'Tiada', 
                        estimatedPAJSK: 0,
                        pajskGrade: 'E',
                        pajskPoint: 0,
                        pajskGradeLabel: 'Tidak Memuaskan',
                        pajskBreakdown: {
                          sukan: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          kelab: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          uniform: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          extraKurikulum: 0
                        },
                        attendance: 0, 
                        rawPenglibatan: {
                          badan_beruniform: { 
                            kehadiran: '0', 
                            jawatan: '', 
                            peringkat: '', 
                            pencapaian: '' 
                          },
                          kelab_dan_persatuan: { 
                            kehadiran: '0', 
                            jawatan: '', 
                            peringkat: '', 
                            pencapaian: '' 
                          },
                          sukan_dan_permainan: { 
                            kehadiran: '0', 
                            jawatan: '', 
                            peringkat: '', 
                            pencapaian: '' 
                          }
                        } 
                      }
                    });
                  }
                }}
                className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 text-white whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: tokens.colors.primaryRed }}
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider ml-2" style={{ color: tokens.colors.textMuted }}>Uniform Unit</label>
              <SearchableDropdown
                value={uniformFilter === 'All Units' ? '' : uniformFilter}
                onChange={(value) => setUniformFilter(value || 'All Units')}
                options={uniqueUniforms}
                placeholder="All Units"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider ml-2" style={{ color: tokens.colors.textMuted }}>Club/Persatuan</label>
              <SearchableDropdown
                value={clubFilter === 'All Clubs' ? '' : clubFilter}
                onChange={(value) => setClubFilter(value || 'All Clubs')}
                options={uniqueClubs}
                placeholder="All Clubs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider ml-2" style={{ color: tokens.colors.textMuted }}>Sukan/Permainan</label>
              <SearchableDropdown
                value={sportFilter === 'All Sports' ? '' : sportFilter}
                onChange={(value) => setSportFilter(value || 'All Sports')}
                options={uniqueSports}
                placeholder="All Sports"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider ml-2" style={{ color: tokens.colors.textMuted }}>PAJSK Score</label>
              <select 
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 focus:outline-none focus:ring-2 bg-slate-50"
                style={{ color: tokens.colors.textNavy }}
              >
                <option>All Scores</option>
                <option value="80+">Elite (80+)</option>
                <option value="60-80">Standard (60-80)</option>
                <option value="<60">Needs Focus (&lt;60)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider ml-2" style={{ color: tokens.colors.textMuted }}>Attendance</label>
              <div className="flex gap-2">
                <select 
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 focus:outline-none focus:ring-2 bg-slate-50"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option>All Attendance</option>
                  <option value="95%+">Excellent (95%+)</option>
                  <option value="<95%">Warning (&lt;95%)</option>
                </select>
                <button 
                  onClick={resetFilters}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                  title="Reset Filters"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6 shadow-sm hover:bg-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-200" style={{ backgroundColor: tokens.colors.cardOuterBg }}>
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold" style={{ color: tokens.colors.textMuted }}>No students found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {paginatedStudents.map((student, idx) => (
              <div 
                key={student.id} 
                className="rounded-2xl p-6 bg-white shadow-[0_24px_24px_rgba(19,31,93,0.03)] hover:shadow-[0_24px_24px_rgba(19,31,93,0.08)] transition-all duration-300 cursor-pointer group relative border border-gray-100/50"
              >
                {/* Header - Avatar, Name, ID, Attendance */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center text-xl font-extrabold flex-shrink-0 shadow-sm" style={{ color: tokens.colors.primaryRed }}>
                      {student.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: tokens.colors.textNavy }}>{student.name}</h3>
                      <p className="text-base font-medium text-gray-500 mb-1">ID: {student.id}</p>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider",
                        student.attendance >= 90 ? "bg-green-50 text-green-700" : 
                        student.attendance >= 75 ? "bg-orange-50 text-orange-700" : 
                        "bg-red-50 text-red-700"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          student.attendance >= 90 ? "bg-green-500" : 
                          student.attendance >= 75 ? "bg-orange-500" : 
                          "bg-red-500"
                        )}></span>
                        <span className="text-xs">{student.attendance}% Attendance</span>
                      </span>
                    </div>
                  </div>
                  {(isAdmin || isFormTeacher) && (
                  <button 
                    onClick={() => {
                      if (selectedYear < currentYear) {
                        setPendingAction('edit');
                        setPendingEditData({ ...student });
                        setShowYearPrompt(true);
                      } else {
                        const globalIndex = studentsData.findIndex(s => s.id === student.id);
                        setEditModal({ isOpen: true, type: 'student', index: globalIndex, data: { ...student } });
                      }
                    }}
                    className="p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                    style={{ color: tokens.colors.textNavy }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  )}
                </div>

                {/* PAJSK Score with Progress Bar */}
                <section className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">PAJSK Score</span>
                    <span className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>
                      {student.estimatedPAJSK} <span className="text-sm font-medium text-gray-400">/ 100</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full shadow-[0_0_8px_rgba(218,52,55,0.3)]" 
                      style={{ 
                        width: `${student.estimatedPAJSK}%`,
                        backgroundColor: student.estimatedPAJSK >= 80 ? tokens.colors.trendGreenText : 
                                        student.estimatedPAJSK >= 60 ? tokens.colors.accentYellow : 
                                        tokens.colors.accentRed
                      }}
                    ></div>
                  </div>
                </section>

                {/* Co-curricular Details - 2x3 Grid Layout */}
                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                  {/* Uniform Unit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2" style={{ color: tokens.colors.accentNavy }}>
                      <Users className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Uniform</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600 truncate">{student.uniformUnit}</p>
                      {student.rawPenglibatan?.badan_beruniform && student.uniformUnit !== 'Tiada' && (
                        <>
                          <p className="text-xs text-gray-500 font-medium">
                            {student.rawPenglibatan.badan_beruniform.jawatan || '-'}
                          </p>
                          <p className="text-xs font-bold italic mt-1" style={{ color: tokens.colors.accentRed }}>
                            {student.rawPenglibatan.badan_beruniform.peringkat || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.rawPenglibatan.badan_beruniform.pencapaian || '-'}
                          </p>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1",
                            Number(student.rawPenglibatan.badan_beruniform.kehadiran || 0) >= 10 ? "bg-green-100 text-green-700" :
                            Number(student.rawPenglibatan.badan_beruniform.kehadiran || 0) >= 5 ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            <span className={cn(
                              "w-1 h-1 rounded-full",
                              Number(student.rawPenglibatan.badan_beruniform.kehadiran || 0) >= 10 ? "bg-green-500" :
                              Number(student.rawPenglibatan.badan_beruniform.kehadiran || 0) >= 5 ? "bg-orange-500" :
                              "bg-red-500"
                            )}></span>
                            {student.rawPenglibatan.badan_beruniform.kehadiran || '0'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Club Unit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2" style={{ color: tokens.colors.accentNavy }}>
                      <BookOpen className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Club</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600 truncate">{student.club}</p>
                      {student.rawPenglibatan?.kelab_dan_persatuan && student.club !== 'Tiada' && (
                        <>
                          <p className="text-xs text-gray-500 font-medium">
                            {student.rawPenglibatan.kelab_dan_persatuan.jawatan || '-'}
                          </p>
                          <p className="text-xs font-bold italic mt-1" style={{ color: tokens.colors.accentRed }}>
                            {student.rawPenglibatan.kelab_dan_persatuan.peringkat || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.rawPenglibatan.kelab_dan_persatuan.pencapaian || '-'}
                          </p>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1",
                            Number(student.rawPenglibatan.kelab_dan_persatuan.kehadiran || 0) >= 10 ? "bg-green-100 text-green-700" :
                            Number(student.rawPenglibatan.kelab_dan_persatuan.kehadiran || 0) >= 5 ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            <span className={cn(
                              "w-1 h-1 rounded-full",
                              Number(student.rawPenglibatan.kelab_dan_persatuan.kehadiran || 0) >= 10 ? "bg-green-500" :
                              Number(student.rawPenglibatan.kelab_dan_persatuan.kehadiran || 0) >= 5 ? "bg-orange-500" :
                              "bg-red-500"
                            )}></span>
                            {student.rawPenglibatan.kelab_dan_persatuan.kehadiran || '0'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sport Unit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2" style={{ color: tokens.colors.accentNavy }}>
                      <Trophy className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sport</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600 truncate">{student.sport}</p>
                      {student.rawPenglibatan?.sukan_dan_permainan && student.sport !== 'Tiada' && (
                        <>
                          <p className="text-xs text-gray-500 font-medium">
                            {student.rawPenglibatan.sukan_dan_permainan.jawatan || '-'}
                          </p>
                          <p className="text-xs font-bold italic mt-1" style={{ color: tokens.colors.accentRed }}>
                            {student.rawPenglibatan.sukan_dan_permainan.peringkat || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.rawPenglibatan.sukan_dan_permainan.pencapaian || '-'}
                          </p>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1",
                            Number(student.rawPenglibatan.sukan_dan_permainan.kehadiran || 0) >= 10 ? "bg-green-100 text-green-700" :
                            Number(student.rawPenglibatan.sukan_dan_permainan.kehadiran || 0) >= 5 ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            <span className={cn(
                              "w-1 h-1 rounded-full",
                              Number(student.rawPenglibatan.sukan_dan_permainan.kehadiran || 0) >= 10 ? "bg-green-500" :
                              Number(student.rawPenglibatan.sukan_dan_permainan.kehadiran || 0) >= 5 ? "bg-orange-500" :
                              "bg-red-500"
                            )}></span>
                            {student.rawPenglibatan.sukan_dan_permainan.kehadiran || '0'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
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
                ))}
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
        
        {/* Year Prompt Modal */}
        {showYearPrompt && createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  Data from {selectedYear}
                </h3>
                <p className="text-slate-600">
                  You&apos;re viewing data from a previous year ({selectedYear}). To make changes, you must work on current year ({currentYear}) data.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowYearPrompt(false);
                    if (pendingAction === 'edit' && pendingEditData) {
                      const copiedData = {
                        ...pendingEditData,
                        id: `STU${Date.now()}`,
                        estimatedPAJSK: 0,
                        pajskGrade: 'E',
                        pajskPoint: 0,
                        pajskGradeLabel: 'Tidak Memuaskan',
                        attendance: 0,
                        pajskBreakdown: {
                          sukan: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          kelab: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          uniform: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          extraKurikulum: 0
                        },
                        rawPenglibatan: {
                          badan_beruniform: { 
                            kehadiran: '0', 
                            jawatan: pendingEditData.rawPenglibatan?.badan_beruniform?.jawatan || '', 
                            peringkat: '', 
                            pencapaian: '',
                            unit_code: pendingEditData.rawPenglibatan?.badan_beruniform?.unit_code || ''
                          },
                          kelab_dan_persatuan: { 
                            kehadiran: '0', 
                            jawatan: pendingEditData.rawPenglibatan?.kelab_dan_persatuan?.jawatan || '', 
                            peringkat: '', 
                            pencapaian: '',
                            unit_code: pendingEditData.rawPenglibatan?.kelab_dan_persatuan?.unit_code || '' 
                          },
                          sukan_dan_permainan: { 
                            kehadiran: '0', 
                            jawatan: pendingEditData.rawPenglibatan?.sukan_dan_permainan?.jawatan || '', 
                            peringkat: '', 
                            pencapaian: '',
                            unit_code: pendingEditData.rawPenglibatan?.sukan_dan_permainan?.unit_code || '' 
                          }
                        }
                      };
                      setEditModal({ isOpen: true, type: 'student', index: -1, data: copiedData });
                    } else {
                      setEditModal({ 
                        isOpen: true, 
                        type: 'student', 
                        index: -1, 
                        data: { 
                          id: `STU${Date.now()}`, 
                          name: '', 
                          surname: '', 
                          givenName: '', 
                          classId: classId, 
                          uniformUnit: 'Tiada', 
                          club: 'Tiada', 
                          sport: 'Tiada', 
                          estimatedPAJSK: 0,
                          pajskGrade: 'E',
                          pajskPoint: 0,
                          pajskGradeLabel: 'Tidak Memuaskan',
                          pajskBreakdown: {
                            sukan: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                            kelab: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                            uniform: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                            extraKurikulum: 0
                          },
                          attendance: 0, 
                          rawPenglibatan: {
                            badan_beruniform: { kehadiran: '0', jawatan: '', peringkat: '', pencapaian: '' },
                            kelab_dan_persatuan: { kehadiran: '0', jawatan: '', peringkat: '', pencapaian: '' },
                            sukan_dan_permainan: { kehadiran: '0', jawatan: '', peringkat: '', pencapaian: '' }
                          } 
                        }
                      });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: tokens.colors.primaryRed }}
                >
                  <Copy className="w-5 h-5" />
                  Copy {selectedYear} Data to {currentYear}
                </button>
                
                <button
                  onClick={() => {
                    setShowYearPrompt(false);
                    setEditModal({ 
                      isOpen: true, 
                      type: 'student', 
                      index: -1, 
                      data: { 
                        id: `STU${Date.now()}`, 
                        name: '', 
                        surname: '', 
                        givenName: '', 
                        classId: classId, 
                        uniformUnit: 'Tiada', 
                        club: 'Tiada', 
                        sport: 'Tiada', 
                        estimatedPAJSK: 0,
                        pajskGrade: 'E',
                        pajskPoint: 0,
                        pajskGradeLabel: 'Tidak Memuaskan',
                        pajskBreakdown: {
                          sukan: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          kelab: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          uniform: { penglibatan: 0, kehadiran: 0, pencapaian: 0, total: 0 },
                          extraKurikulum: 0
                        },
                        attendance: 0, 
                        rawPenglibatan: {
                          badan_beruniform: { kehadiran: '0', jawatan: '', peringkat: '', pencapaian: '' },
                          kelab_dan_persatuan: { kehadiran: '0', jawatan: '', peringkat: '', pencapaian: '' },
                          sukan_dan_permainan: { kehadiran: '0', jawatan: '', peringkat: '', pencapaian: '' }
                        } 
                      }
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <Plus className="w-5 h-5" />
                  Start Fresh for {currentYear}
                </button>
                
                <button
                  onClick={() => {
                    setShowYearPrompt(false);
                    setPendingAction(null);
                    setPendingEditData(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl font-bold border-2 transition-all hover:bg-slate-50"
                  style={{ borderColor: tokens.colors.textMuted, color: tokens.colors.textNavy }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
        document.body
        )}
      </div>
    </div>
  );
}
