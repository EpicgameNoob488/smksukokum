import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Save, AlertTriangle, Settings, Loader2 } from 'lucide-react';
import { supabase, isOfflineMode } from '../lib/supabase';
import { cn } from '../lib/utils';
import SearchableDropdown from './SearchableDropdown';
import { useSchoolData } from '../contexts/DataContext';

interface EditTeacherModalProps {
  editModal: any;
  setEditModal: (modal: any) => void;
  tokens: any;
  managementTeamData: any[];
  setManagementTeamData: (data: any[]) => void;
  formTeachersData: any[];
  setFormTeachersData: (data: any[]) => void;
  coCurricularUnitsData: any[];
  setCoCurricularUnitsData: (data: any[]) => void;
  studentsData?: any[];
  setStudentsData?: (data: any[]) => void;
  isAdmin?: boolean;
  allFormClasses?: any[];
  allUnits?: any[];
  selectedYear?: number;
}

export default function EditTeacherModal({
  editModal,
  setEditModal,
  tokens,
  managementTeamData,
  setManagementTeamData,
  formTeachersData,
  setFormTeachersData,
  coCurricularUnitsData,
  setCoCurricularUnitsData,
  studentsData,
  setStudentsData,
  isAdmin = false,
  allFormClasses = [],
  allUnits = [],
  selectedYear: propsSelectedYear
}: EditTeacherModalProps) {
  const { refresh } = useSchoolData();
  const [isSaving, setIsSaving] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    editModal.index === -1 ? currentYear : (propsSelectedYear ?? currentYear)
  );

  const allTeachers = useMemo(() => {
    const teachersFromManagement = managementTeamData.map(t => t.name).filter(Boolean);
    const teachersFromForm = formTeachersData.map(t => t.teacher).filter(Boolean);
    const all = [...teachersFromManagement, ...teachersFromForm];
    return [...new Set(all)].sort((a, b) => a.localeCompare(b));
  }, [managementTeamData, formTeachersData]);

  React.useEffect(() => {
    if (editModal.isOpen && editModal.data && editModal.data.name !== undefined && (editModal.data.surname === undefined || editModal.data.givenName === undefined)) {
      const name = editModal.data.name || '';
      const parts = name.trim().split(' ');
      let surname = '';
      let givenName = '';
      
      if (parts.length > 1) {
        surname = parts.pop() || '';
        givenName = parts.join(' ');
      } else {
        givenName = name;
      }
      
      setEditModal({
        ...editModal,
        data: {
          ...editModal.data,
          surname,
          givenName
        }
      });
    }
  }, [editModal.isOpen, editModal.data, editModal.index]);

  React.useEffect(() => {
    if (editModal.isOpen) {
      if (editModal.index === -1) {
        setSelectedYear(currentYear);
      } else {
        setSelectedYear(propsSelectedYear ?? currentYear);
      }
    }
  }, [editModal.isOpen, editModal.index, propsSelectedYear, currentYear]);

  const roleOptions = [
    "10 - Pengerusi",
    "10 - Ketua Rumah",
    "10 - Kapten Pasukan",
    "8 – Naib Pengerusi",
    "8 – Penolong Ketua Rumah",
    "8 – Penolong Kapten",
    "8 – Setiausaha",
    "8 – Bendahari",
    "7 – Setiausaha",
    "7 – Bendahari",
    "6 – Penolong Setiausaha",
    "6 – Penolong Bendahari",
    "6 – Ahli Jawatankuasa",
    "5 – AJK",
    "5 – Ketua Kumpulan",
    "2 - Biasa"
  ];

  const levelOptions = [
    "Sekolah",
    "Daerah",
    "Negeri",
    "Kebangsaan",
    "Antarabangsa"
  ];

  const achievementOptions = [
    "Johan",
    "Naib Johan",
    "Ketiga",
    "Keempat",
    "Kelima",
    "Penyertaan"
  ];

  const attendanceOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "> 12"];

  const getCalculatedValues = (raw: any) => {
    const parse = (k: any) => {
      if (!k) return 0;
      if (k === "> 12") return 12;
      const n = parseInt(k);
      return isNaN(n) ? 0 : Math.min(12, n);
    };
    const u = parse(raw?.badan_beruniform?.kehadiran);
    const c = parse(raw?.kelab_dan_persatuan?.kehadiran);
    const s = parse(raw?.sukan_dan_permainan?.kehadiran);
    const attendance = Math.min(100, Math.round(((u + c + s) / 36) * 100));
    const pajskScore = Math.round(attendance * 0.8 + 20);
    return { attendance, pajskScore };
  };

  if (!editModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-extrabold truncate" style={{ color: tokens.colors.textNavy }}>
            {editModal.type === 'management' && (editModal.index === -1 ? 'Add Management Role' : 'Edit Management Role')}
            {editModal.type === 'formTeacher' && (editModal.index === -1 ? 'Add New Teacher' : 'Edit Form Teacher')}
            {editModal.type === 'unit' && (editModal.index === -1 ? 'Add Co-Curricular Unit' : 'Edit Co-Curricular Unit')}
            {editModal.type === 'student' && (editModal.index === -1 ? 'Add Student Details' : 'Edit Student Details')}
            {editModal.type === 'fullTeacher' && (editModal.index === -1 ? 'Add New Teacher' : 'Edit Teacher Profile')}
          </h3>
          <button 
            onClick={() => setEditModal({ isOpen: false, type: null, index: -1, data: null })}
            className="p-2 rounded-full hover:bg-slate-200 transition-colors"
            style={{ color: tokens.colors.textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {editModal.type === 'management' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Year</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                    style={{ color: tokens.colors.textNavy }}
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Role</label>
                <select 
                  value={editModal.data.role}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, role: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="Pengetua">Pengetua</option>
                  <option value="Penolong Kanan Pentadbiran">Penolong Kanan Pentadbiran</option>
                  <option value="Penolong Kanan Hal Ehwal Murid">Penolong Kanan Hal Ehwal Murid</option>
                  <option value="Penolong Kanan Kokurikulum">Penolong Kanan Kokurikulum</option>
                  <option value="Penolong Kanan Petang">Penolong Kanan Petang</option>
                  <option value="Setiausaha Kokurikulum & Penyelaras PAJSK">Setiausaha Kokurikulum & Penyelaras PAJSK</option>
                  <option value="Setiausaha Sukan">Setiausaha Sukan</option>
                  <option value="Setiausaha Sukan (Pembangunan Sekolah)">Setiausaha Sukan (Pembangunan Sekolah)</option>
                  <option value="Penyelaras PAJSK">Penyelaras PAJSK</option>
                  <option value="Penyelaras Badan Beruniform & RIMUP / Perpaduan">Penyelaras Badan Beruniform & RIMUP / Perpaduan</option>
                  <option value="Penyelaras Kelab dan Persatuan">Penyelaras Kelab dan Persatuan</option>
                  <option value="Penyelaras Sukan dan Permainan">Penyelaras Sukan dan Permainan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Surname</label>
                  <input 
                    type="text" 
                    value={editModal.data.surname || ''}
                    onChange={(e) => {
                      const surname = e.target.value;
                      const givenName = editModal.data.givenName || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, surname, name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Given Name</label>
                  <input 
                    type="text" 
                    value={editModal.data.givenName || ''}
                    onChange={(e) => {
                      const givenName = e.target.value;
                      const surname = editModal.data.surname || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, givenName, name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
              </div>
            </>
          )}

          {editModal.type === 'formTeacher' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Class Name</label>
                <select 
                  value={editModal.data.name}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, name: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="" disabled>Select a class</option>
                  {allFormClasses.length > 0 ? allFormClasses.map((cls) => (
                    <option key={cls.id} value={cls.nama_kelas}>{cls.nama_kelas}</option>
                  )) : formTeachersData.map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Surname</label>
                  <input 
                    type="text" 
                    value={editModal.data.surname || ''}
                    onChange={(e) => {
                      const surname = e.target.value;
                      const givenName = editModal.data.givenName || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, surname, teacher: `${givenName} ${surname}`.trim(), name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Given Name</label>
                  <input 
                    type="text" 
                    value={editModal.data.givenName || ''}
                    onChange={(e) => {
                      const givenName = e.target.value;
                      const surname = editModal.data.surname || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, givenName, teacher: `${givenName} ${surname}`.trim(), name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
              </div>
            </>
          )}

          {editModal.type === 'unit' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Unit Name</label>
                  <select 
                    value={editModal.data.name}
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, name: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                    style={{ color: tokens.colors.textNavy }}
                  >
                    <option value="" disabled>Select a unit</option>
                    {allUnits.length > 0 ? allUnits.map((unit, idx) => (
                      <option key={idx} value={unit.nama_rasmi}>{unit.nama_rasmi}</option>
                    )) : coCurricularUnitsData.map((unit, idx) => (
                      <option key={idx} value={unit.name}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>Unit Code</label>
                    {!isAdmin && (
                      <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Admin Only
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={editModal.data.code || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, code: e.target.value } })}
                      disabled={!isAdmin}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold font-mono transition-all duration-200",
                        !isAdmin && "bg-slate-50 cursor-not-allowed opacity-70 border-slate-100"
                      )}
                      style={{ color: tokens.colors.textNavy }}
                    />
                    {!isAdmin && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <Settings className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Category</label>
                <select 
                  value={editModal.data.category}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, category: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="Kelab & Persatuan">Kelab & Persatuan</option>
                  <option value="Badan Beruniform">Badan Beruniform</option>
                  <option value="Sukan dan Permainan">Sukan dan Permainan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Chief Advisor (Ketua Guru Penasihat)</label>
                <SearchableDropdown
                  value={editModal.data.chief || ''}
                  onChange={(value) => setEditModal({ ...editModal, data: { ...editModal.data, chief: value } })}
                  options={allTeachers}
                  placeholder="Select or type chief advisor..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center" style={{ color: tokens.colors.textMuted }}>
                  <span>Other Advisors</span>
                  <button 
                    onClick={() => setEditModal({ ...editModal, data: { ...editModal.data, advisors: [...editModal.data.advisors, ''] } })}
                    className="text-[10px] font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                    style={{ color: tokens.colors.primaryRed }}
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </label>
                <div className="space-y-3">
                  {editModal.data.advisors.length === 0 && (
                    <p className="text-xs font-medium italic" style={{ color: tokens.colors.textMuted }}>No other advisors assigned.</p>
                  )}
                  {editModal.data.advisors.map((adv: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SearchableDropdown
                          value={adv}
                          onChange={(value) => {
                            const newAdvisors = [...editModal.data.advisors];
                            newAdvisors[i] = value;
                            setEditModal({ ...editModal, data: { ...editModal.data, advisors: newAdvisors } });
                          }}
                          options={allTeachers}
                          placeholder="Select or type advisor..."
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newAdvisors = editModal.data.advisors.filter((_: any, idx: number) => idx !== i);
                          setEditModal({ ...editModal, data: { ...editModal.data, advisors: newAdvisors } });
                        }}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

           {editModal.type === 'student' && (
             <>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Year</label>
                 {editModal.index === -1 ? (
                   <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold" style={{ color: tokens.colors.primaryRed }}>
                     {currentYear}
                   </div>
                 ) : (
                   <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold" style={{ color: tokens.colors.primaryRed }}>
                     {selectedYear}
                   </div>
                 )}
               </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Surname</label>
                  <input 
                    type="text" 
                    value={editModal.data.surname || ''}
                    onChange={(e) => {
                      const surname = e.target.value;
                      const givenName = editModal.data.givenName || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, surname, name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Given Name</label>
                  <input 
                    type="text" 
                    value={editModal.data.givenName || ''}
                    onChange={(e) => {
                      const givenName = e.target.value;
                      const surname = editModal.data.surname || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, givenName, name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Form (Class)</label>
                <select 
                  value={editModal.data.classId}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, classId: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  {allFormClasses.length > 0 ? allFormClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.nama_kelas}</option>
                  )) : formTeachersData.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>PAJSK Score (Auto)</label>
                  <div 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                    style={{ color: tokens.colors.textNavy }}
                  >
                    {editModal.data.pajskScore}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Attendance % (Auto)</label>
                  <div 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                    style={{ color: tokens.colors.textNavy }}
                  >
                    {editModal.data.attendance}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>Uniform Unit</label>
                <select 
                  value={editModal.data.uniformUnit || 'Tiada'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const unit = coCurricularUnitsData.find(u => u.name === val);
                    const newRaw = {
                      ...editModal.data.rawPenglibatan,
                      badan_beruniform: {
                        ...editModal.data.rawPenglibatan?.badan_beruniform,
                        unit_code: unit ? unit.code : '',
                        name_in_record: val,
                        kehadiran: val === 'Tiada' ? '0' : (editModal.data.rawPenglibatan?.badan_beruniform?.kehadiran || '0')
                      }
                    };
                    const { attendance, pajskScore } = getCalculatedValues(newRaw);
                    setEditModal({ 
                      ...editModal, 
                      data: { 
                        ...editModal.data, 
                        uniformUnit: val,
                        attendance,
                        pajskScore,
                        rawPenglibatan: newRaw
                      } 
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="Tiada">Tiada</option>
                  {coCurricularUnitsData.filter(u => u.category === 'Badan Beruniform').map((unit, idx) => (
                    <option key={idx} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Role</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.badan_beruniform?.jawatan || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, badan_beruniform: {...editModal.data.rawPenglibatan?.badan_beruniform, jawatan: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {roleOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Level</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.badan_beruniform?.peringkat || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, badan_beruniform: {...editModal.data.rawPenglibatan?.badan_beruniform, peringkat: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {levelOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Achievement</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.badan_beruniform?.pencapaian || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, badan_beruniform: {...editModal.data.rawPenglibatan?.badan_beruniform, pencapaian: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {achievementOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Attendance</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.badan_beruniform?.kehadiran || '0'} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const newRaw = {
                          ...editModal.data.rawPenglibatan,
                          badan_beruniform: {
                            ...editModal.data.rawPenglibatan?.badan_beruniform,
                            kehadiran: val
                          }
                        };
                        const { attendance, pajskScore } = getCalculatedValues(newRaw);
                        setEditModal({
                          ...editModal,
                          data: {
                            ...editModal.data,
                            attendance,
                            pajskScore,
                            rawPenglibatan: newRaw
                          }
                        });
                      }} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      {attendanceOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>Club / Association</label>
                <select 
                  value={editModal.data.club || 'Tiada'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const unit = coCurricularUnitsData.find(u => u.name === val);
                    const newRaw = {
                      ...editModal.data.rawPenglibatan,
                      kelab_dan_persatuan: {
                        ...editModal.data.rawPenglibatan?.kelab_dan_persatuan,
                        unit_code: unit ? unit.code : '',
                        name_in_record: val,
                        kehadiran: val === 'Tiada' ? '0' : (editModal.data.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || '0')
                      }
                    };
                    const { attendance, pajskScore } = getCalculatedValues(newRaw);
                    setEditModal({ 
                      ...editModal, 
                      data: { 
                        ...editModal.data, 
                        club: val,
                        attendance,
                        pajskScore,
                        rawPenglibatan: newRaw
                      } 
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="Tiada">Tiada</option>
                  {coCurricularUnitsData.filter(u => u.category === 'Kelab & Persatuan').map((unit, idx) => (
                    <option key={idx} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Role</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.kelab_dan_persatuan?.jawatan || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, kelab_dan_persatuan: {...editModal.data.rawPenglibatan?.kelab_dan_persatuan, jawatan: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {roleOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Level</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.kelab_dan_persatuan?.peringkat || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, kelab_dan_persatuan: {...editModal.data.rawPenglibatan?.kelab_dan_persatuan, peringkat: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {levelOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Achievement</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.kelab_dan_persatuan?.pencapaian || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, kelab_dan_persatuan: {...editModal.data.rawPenglibatan?.kelab_dan_persatuan, pencapaian: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {achievementOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Attendance</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || '0'} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const newRaw = {
                          ...editModal.data.rawPenglibatan,
                          kelab_dan_persatuan: {
                            ...editModal.data.rawPenglibatan?.kelab_dan_persatuan,
                            kehadiran: val
                          }
                        };
                        const { attendance, pajskScore } = getCalculatedValues(newRaw);
                        setEditModal({
                          ...editModal,
                          data: {
                            ...editModal.data,
                            attendance,
                            pajskScore,
                            rawPenglibatan: newRaw
                          }
                        });
                      }} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      {attendanceOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>Sport / Game</label>
                <select 
                  value={editModal.data.sport || 'Tiada'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const unit = coCurricularUnitsData.find(u => u.name === val);
                    const newRaw = {
                      ...editModal.data.rawPenglibatan,
                      sukan_dan_permainan: {
                        ...editModal.data.rawPenglibatan?.sukan_dan_permainan,
                        unit_code: unit ? unit.code : '',
                        name_in_record: val,
                        kehadiran: val === 'Tiada' ? '0' : (editModal.data.rawPenglibatan?.sukan_dan_permainan?.kehadiran || '0')
                      }
                    };
                    const { attendance, pajskScore } = getCalculatedValues(newRaw);
                    setEditModal({ 
                      ...editModal, 
                      data: { 
                        ...editModal.data, 
                        sport: val,
                        attendance,
                        pajskScore,
                        rawPenglibatan: newRaw
                      } 
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="Tiada">Tiada</option>
                  {coCurricularUnitsData.filter(u => u.category === 'Sukan dan Permainan').map((unit, idx) => (
                    <option key={idx} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Role</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.sukan_dan_permainan?.jawatan || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, sukan_dan_permainan: {...editModal.data.rawPenglibatan?.sukan_dan_permainan, jawatan: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {roleOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Level</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.sukan_dan_permainan?.peringkat || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, sukan_dan_permainan: {...editModal.data.rawPenglibatan?.sukan_dan_permainan, peringkat: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {levelOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Achievement</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.sukan_dan_permainan?.pencapaian || ''} 
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, rawPenglibatan: {...editModal.data.rawPenglibatan, sukan_dan_permainan: {...editModal.data.rawPenglibatan?.sukan_dan_permainan, pencapaian: e.target.value}}}})} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      <option value="">-</option>
                      {achievementOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Attendance</label>
                    <select 
                      value={editModal.data.rawPenglibatan?.sukan_dan_permainan?.kehadiran || '0'} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const newRaw = {
                          ...editModal.data.rawPenglibatan,
                          sukan_dan_permainan: {
                            ...editModal.data.rawPenglibatan?.sukan_dan_permainan,
                            kehadiran: val
                          }
                        };
                        const { attendance, pajskScore } = getCalculatedValues(newRaw);
                        setEditModal({
                          ...editModal,
                          data: {
                            ...editModal.data,
                            attendance,
                            pajskScore,
                            rawPenglibatan: newRaw
                          }
                        });
                      }} 
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={{ color: tokens.colors.textNavy }}
                    >
                      {attendanceOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {editModal.type === 'fullTeacher' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Surname</label>
                  <input 
                    type="text" 
                    value={editModal.data.surname || ''}
                    onChange={(e) => {
                      const surname = e.target.value;
                      const givenName = editModal.data.givenName || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, surname, name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Given Name</label>
                  <input 
                    type="text" 
                    value={editModal.data.givenName || ''}
                    onChange={(e) => {
                      const givenName = e.target.value;
                      const surname = editModal.data.surname || '';
                      setEditModal({ ...editModal, data: { ...editModal.data, givenName, name: `${givenName} ${surname}`.trim() } });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                    style={{ color: tokens.colors.textNavy }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Email Address</label>
                <input 
                  type="email" 
                  value={editModal.data.email || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, email: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold"
                  style={{ color: tokens.colors.textNavy }}
                  placeholder="teacher@school.edu.my"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase mb-2 flex justify-between items-center" style={{ color: tokens.colors.textMuted }}>
                  <span className="tracking-[0.3em] flex-1">Management Roles (AJKT)</span>
                  <div className="relative flex justify-end w-28">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          setEditModal({ ...editModal, data: { ...editModal.data, managementRoles: [...editModal.data.managementRoles, e.target.value] } });
                          e.target.value = ''; // Reset
                        }
                      }}
                      className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-4 text-right w-full"
                      style={{ color: tokens.colors.primaryRed, textAlignLast: 'right' }}
                    >
                      <option value="">+ Add Role</option>
                      <option value="Pengetua">Pengetua</option>
                      <option value="Penolong Kanan Pentadbiran">Penolong Kanan Pentadbiran</option>
                      <option value="Penolong Kanan Hal Ehwal Murid">Penolong Kanan Hal Ehwal Murid</option>
                      <option value="Penolong Kanan Kokurikulum">Penolong Kanan Kokurikulum</option>
                      <option value="Penolong Kanan Petang">Penolong Kanan Petang</option>
                      <option value="Setiausaha Kokurikulum & Penyelaras PAJSK">Setiausaha Kokurikulum & Penyelaras PAJSK</option>
                      <option value="Setiausaha Sukan">Setiausaha Sukan</option>
                      <option value="Setiausaha Sukan (Pembangunan Sekolah)">Setiausaha Sukan (Pembangunan Sekolah)</option>
                      <option value="Penyelaras PAJSK">Penyelaras PAJSK</option>
                      <option value="Penyelaras Badan Beruniform & RIMUP / Perpaduan">Penyelaras Badan Beruniform & RIMUP / Perpaduan</option>
                      <option value="Penyelaras Kelab dan Persatuan">Penyelaras Kelab dan Persatuan</option>
                      <option value="Penyelaras Sukan dan Permainan">Penyelaras Sukan dan Permainan</option>
                    </select>
                  </div>
                </label>
                <div className="space-y-3">
                  {editModal.data.managementRoles.length === 0 && (
                    <p className="text-xs font-medium italic" style={{ color: tokens.colors.textMuted }}>No management roles assigned.</p>
                  )}
                  {editModal.data.managementRoles.map((role: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <select 
                        value={role}
                        onChange={(e) => {
                          const newRoles = [...editModal.data.managementRoles];
                          newRoles[i] = e.target.value;
                          setEditModal({ ...editModal, data: { ...editModal.data, managementRoles: newRoles } });
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                        style={{ color: tokens.colors.textNavy }}
                      >
                        <option value="" disabled>Select Role</option>
                        <option value="Pengetua">Pengetua</option>
                        <option value="Penolong Kanan Pentadbiran">Penolong Kanan Pentadbiran</option>
                        <option value="Penolong Kanan Hal Ehwal Murid">Penolong Kanan Hal Ehwal Murid</option>
                        <option value="Penolong Kanan Kokurikulum">Penolong Kanan Kokurikulum</option>
                        <option value="Penolong Kanan Petang">Penolong Kanan Petang</option>
                        <option value="Setiausaha Kokurikulum & Penyelaras PAJSK">Setiausaha Kokurikulum & Penyelaras PAJSK</option>
                        <option value="Setiausaha Sukan">Setiausaha Sukan</option>
                        <option value="Setiausaha Sukan (Pembangunan Sekolah)">Setiausaha Sukan (Pembangunan Sekolah)</option>
                        <option value="Penyelaras PAJSK">Penyelaras PAJSK</option>
                        <option value="Penyelaras Badan Beruniform & RIMUP / Perpaduan">Penyelaras Badan Beruniform & RIMUP / Perpaduan</option>
                        <option value="Penyelaras Kelab dan Persatuan">Penyelaras Kelab dan Persatuan</option>
                        <option value="Penyelaras Sukan dan Permainan">Penyelaras Sukan dan Permainan</option>
                      </select>
                      <button 
                        onClick={() => {
                          const newRoles = editModal.data.managementRoles.filter((_: any, idx: number) => idx !== i);
                          setEditModal({ ...editModal, data: { ...editModal.data, managementRoles: newRoles } });
                        }}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>Form Teacher Assignment</label>
                <select 
                  value={editModal.data.classes[0] || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, classes: e.target.value ? [e.target.value] : [] } })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-bold bg-white"
                  style={{ color: tokens.colors.textNavy }}
                >
                  <option value="">None</option>
                  {allFormClasses.length > 0 ? allFormClasses.map((cls) => (
                    <option key={cls.id} value={cls.nama_kelas}>{cls.nama_kelas}</option>
                  )) : formTeachersData.map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center" style={{ color: tokens.colors.textMuted }}>
                  <span>HEAD UNITS</span>
                  <div className="relative flex justify-end">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          const unitName = e.target.value;
                          const unit = coCurricularUnitsData.find(u => u.name === unitName);
                          if (unit) {
                            const newKokurikulum = { ...editModal.data.kokurikulum };
                            newKokurikulum.head = [...newKokurikulum.head, { name: unit.name, category: unit.category }];
                            setEditModal({ ...editModal, data: { ...editModal.data, kokurikulum: newKokurikulum } });
                          }
                          e.target.value = ''; // Reset
                        }
                      }}
                      className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-0 text-right"
                      style={{ color: tokens.colors.primaryRed, textAlignLast: 'right' }}
                    >
                      <option value="">+ Add Unit</option>
                      {allUnits.length > 0 ? allUnits.map((u, i) => (
                        <option key={`h-add-${i}`} value={u.nama_rasmi}>{u.nama_rasmi}</option>
                      )) : coCurricularUnitsData.map((u, i) => (
                        <option key={`h-add-${i}`} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <div className="space-y-2 mb-6">
                  {editModal.data.kokurikulum.head.map((unit: any, i: number) => (
                    <div key={`h-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                      <div>
                        <select 
                          value={unit.name}
                          onChange={(e) => {
                            const newUnitName = e.target.value;
                            const newUnit = (allUnits.length > 0 ? allUnits : coCurricularUnitsData).find(u => (u.nama_rasmi || u.name) === newUnitName);
                            if (newUnit) {
                              const newHead = [...editModal.data.kokurikulum.head];
                              newHead[i] = { name: newUnitName, category: newUnit.category };
                              setEditModal({ ...editModal, data: { ...editModal.data, kokurikulum: { ...editModal.data.kokurikulum, head: newHead } } });
                            }
                          }}
                          className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer p-0 w-full"
                          style={{ color: tokens.colors.textNavy }}
                        >
                          {allUnits.length > 0 ? allUnits.map((u, idx) => (
                            <option key={idx} value={u.nama_rasmi}>{u.nama_rasmi}</option>
                          )) : coCurricularUnitsData.map((u, idx) => (
                            <option key={idx} value={u.name}>{u.name}</option>
                          ))}
                        </select>
                        <p className="text-[10px] font-bold text-orange-600">Head Advisor</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                          Unit Head
                        </span>
                        <button 
                          onClick={() => {
                            const newHead = editModal.data.kokurikulum.head.filter((_: any, idx: number) => idx !== i);
                            setEditModal({ ...editModal, data: { ...editModal.data, kokurikulum: { ...editModal.data.kokurikulum, head: newHead } } });
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editModal.data.kokurikulum.head.length === 0 && (
                    <p className="text-xs font-medium italic" style={{ color: tokens.colors.textMuted }}>No head advisor units assigned.</p>
                  )}
                </div>

                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center" style={{ color: tokens.colors.textMuted }}>
                  <span>ADVISOR UNITS</span>
                  <div className="relative flex justify-end">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          const unitName = e.target.value;
                          const unit = coCurricularUnitsData.find(u => u.name === unitName);
                          if (unit) {
                            const newKokurikulum = { ...editModal.data.kokurikulum };
                            newKokurikulum.advisor = [...newKokurikulum.advisor, { name: unit.name, category: unit.category }];
                            setEditModal({ ...editModal, data: { ...editModal.data, kokurikulum: newKokurikulum } });
                          }
                          e.target.value = ''; // Reset
                        }
                      }}
                      className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-0 text-right"
                      style={{ color: tokens.colors.primaryRed, textAlignLast: 'right' }}
                    >
                      <option value="">+ Add Unit</option>
                      {allUnits.length > 0 ? allUnits.map((u, i) => (
                        <option key={`a-add-${i}`} value={u.nama_rasmi}>{u.nama_rasmi}</option>
                      )) : coCurricularUnitsData.map((u, i) => (
                        <option key={`a-add-${i}`} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <div className="space-y-2">
                  {editModal.data.kokurikulum.advisor.map((unit: any, i: number) => (
                    <div key={`a-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                      <div>
                        <select 
                          value={unit.name}
                          onChange={(e) => {
                            const newUnitName = e.target.value;
                            const newUnit = (allUnits.length > 0 ? allUnits : coCurricularUnitsData).find(u => (u.nama_rasmi || u.name) === newUnitName);
                            if (newUnit) {
                              const newAdvisor = [...editModal.data.kokurikulum.advisor];
                              newAdvisor[i] = { name: newUnitName, category: newUnit.category };
                              setEditModal({ ...editModal, data: { ...editModal.data, kokurikulum: { ...editModal.data.kokurikulum, advisor: newAdvisor } } });
                            }
                          }}
                          className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer p-0 w-full"
                          style={{ color: tokens.colors.textNavy }}
                        >
                          {allUnits.length > 0 ? allUnits.map((u, idx) => (
                            <option key={idx} value={u.nama_rasmi}>{u.nama_rasmi}</option>
                          )) : coCurricularUnitsData.map((u, idx) => (
                            <option key={idx} value={u.name}>{u.name}</option>
                          ))}
                        </select>
                        <p className="text-[10px] font-medium" style={{ color: tokens.colors.textMuted }}>Advisor</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                          Advisor
                        </span>
                        <button 
                          onClick={() => {
                            const newAdvisor = editModal.data.kokurikulum.advisor.filter((_: any, idx: number) => idx !== i);
                            setEditModal({ ...editModal, data: { ...editModal.data, kokurikulum: { ...editModal.data.kokurikulum, advisor: newAdvisor } } });
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editModal.data.kokurikulum.advisor.length === 0 && (
                    <p className="text-xs font-medium italic" style={{ color: tokens.colors.textMuted }}>No advisor units assigned.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between">
          <div>
            {isAdmin && editModal.index !== -1 && (
              <button
                onClick={async () => {
                  const confirmDelete = window.confirm(`Are you sure you want to remove this ${editModal.type === 'student' ? 'student' : 'teacher'}? This action cannot be undone.`);
                  if (!confirmDelete) return;
                  
                  setIsSaving(true);
                  try {
                    if (editModal.type === 'student' && studentsData && setStudentsData) {
                      const newData = [...studentsData];
                      newData.splice(editModal.index, 1);
                      if (!isOfflineMode && editModal.index !== -1) {
                        const studentIdStr = (editModal.data.id || '').replace(/\D/g, '');
                        const studentIdInt = parseInt(studentIdStr, 10);
                        if (!isNaN(studentIdInt) && studentIdInt > 0 && studentIdInt < 2147483647) {
                          await supabase.from('students').delete().eq('id', studentIdInt);
                        }
                      }
                      setStudentsData(newData);
                    } else if (editModal.type === 'management') {
                      const newData = [...managementTeamData];
                      const itemToDelete = newData[editModal.index];
                      newData.splice(editModal.index, 1);
                      if (!isOfflineMode && itemToDelete?.id) {
                        await supabase.from('management_team').delete().eq('id', itemToDelete.id);
                      }
                      setManagementTeamData(newData);
                    } else if (editModal.type === 'formTeacher') {
                      const newData = [...formTeachersData];
                      const itemToDelete = newData[editModal.index];
                      newData.splice(editModal.index, 1);
                      if (!isOfflineMode && itemToDelete?.id) {
                        await supabase.from('form_classes').delete().eq('id', itemToDelete.id);
                      }
                      setFormTeachersData(newData);
                    } else if (editModal.type === 'unit') {
                      const newData = [...coCurricularUnitsData];
                      const itemToDelete = newData[editModal.index];
                      newData.splice(editModal.index, 1);
                      if (!isOfflineMode && itemToDelete?.code) {
                        await supabase.from('kokurikulum_units').delete().eq('unit_code', itemToDelete.code);
                      }
                      setCoCurricularUnitsData(newData);
                    } else if (editModal.type === 'fullTeacher') {
                      const teacherName = editModal.originalName || editModal.data.name;
                      
                      let newManagement = [...managementTeamData];
                      newManagement = newManagement.filter(m => m.name !== teacherName);
                      setManagementTeamData(newManagement);
                      
                      let newFormTeachers = [...formTeachersData];
                      newFormTeachers = newFormTeachers.filter(t => t.teacher !== teacherName);
                      setFormTeachersData(newFormTeachers);
                      
                      let newUnits = [...coCurricularUnitsData];
                      newUnits = newUnits.map(u => ({
                        ...u,
                        chief: u.chief === teacherName ? '' : u.chief,
                        advisors: u.advisors.filter((a: string) => a !== teacherName)
                      }));
                      setCoCurricularUnitsData(newUnits);
                      
                      if (!isOfflineMode) {
                        await supabase.from('management_team').delete().eq('teacher_name', teacherName);
                        await supabase.from('form_classes').delete().eq('teacher', teacherName);
                        await supabase.from('kokurikulum_units').delete().eq('chief', teacherName);
                      }
                    }
                    
                    if (!isOfflineMode) {
                      await refresh();
                    }
                    
                    setEditModal({ isOpen: false, type: null, index: -1, data: null });
                  } catch (error) {
                    console.error('[EditTeacherModal] Delete error:', error);
                    alert('Failed to delete. Please try again.');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-colors hover:bg-red-50 disabled:opacity-50"
                style={{ 
                  borderColor: tokens.colors.dangerText, 
                  color: tokens.colors.dangerText 
                }}
              >
                {isSaving ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setEditModal({ isOpen: false, type: null, index: -1, data: null })}
              className="px-6 py-2.5 rounded-full text-sm font-bold transition-colors hover:bg-slate-200"
              style={{ color: tokens.colors.textNavy }}
            >
              Cancel
            </button>
            <button 
            onClick={async () => {
              if (!isAdmin && !(editModal.type === 'student')) {
                console.warn('[EditTeacherModal] Save blocked: user is not admin');
                return;
              }
              setIsSaving(true);
              try {
                if (editModal.type === 'management') {
                  const updatedData = { ...editModal.data, tahun: selectedYear };
                  const newData = [...managementTeamData];
                  if (editModal.index === -1) {
                    newData.push(updatedData);
                  } else {
                    newData[editModal.index] = updatedData;
                  }
                  
                  if (!isOfflineMode) {
                    const { error } = await supabase.from('management_team').upsert({
                      id: editModal.index === -1 ? undefined : editModal.data.id,
                      role: editModal.data.role,
                      teacher_name: editModal.data.name,
                      tahun: selectedYear
                    });
                    if (error) throw error;
                  }
                  setManagementTeamData(newData);
                } else if (editModal.type === 'formTeacher') {
                  const updatedData = { ...editModal.data, tahun: selectedYear };
                  const newData = [...formTeachersData];
                  if (editModal.index === -1) {
                    newData.push(updatedData);
                  } else {
                    newData[editModal.index] = updatedData;
                  }
                  
                  if (!isOfflineMode) {
                    const { error } = await supabase.from('form_classes').upsert({
                       id: editModal.data.id,
                       nama_kelas: editModal.data.name,
                       teacher_name: editModal.data.teacher,
                       tahun: selectedYear
                    });
                    if (error) throw error;
                  }
                  setFormTeachersData(newData);
                } else if (editModal.type === 'unit') {
                  const updatedData = { ...editModal.data, tahun: selectedYear };
                  const newData = [...coCurricularUnitsData];
                  if (editModal.index === -1) {
                    newData.push(updatedData);
                  } else {
                    newData[editModal.index] = updatedData;
                  }
                  
                  if (!isOfflineMode) {
                    const { error } = await supabase.from('kokurikulum_units').upsert({
                       unit_code: editModal.data.code,
                       kategori: editModal.data.category,
                       nama_rasmi: editModal.data.name,
                       nama_singing: editModal.data.name,
                       chief_teacher: editModal.data.chief || null,
                       adapters: editModal.data.advisors || [],
                       tahun: selectedYear
                    });
                    if (error) throw error;
                  }
                  setCoCurricularUnitsData(newData);
                } else if (editModal.type === 'student' && studentsData && setStudentsData) {
                  const updatedData = { ...editModal.data, tahun: selectedYear };
                  const newData = [...studentsData];
                  if (editModal.index === -1) {
                    newData.push(updatedData);
                  } else {
                    newData[editModal.index] = updatedData;
                  }
                  
                  if (!isOfflineMode) {
                      const classObj = allFormClasses.find(c => c.id === editModal.data.classId);
                      const kelasName = classObj?.nama_kelas || editModal.data.classId;
                      
                      // Auto-create class if missing for this year
                      const { data: existingClass } = await supabase.from('form_classes')
                        .select('id').eq('nama_kelas', kelasName).eq('tahun', selectedYear).maybeSingle();
                      if (!existingClass) {
                        await supabase.from('form_classes').insert({
                          nama_kelas: kelasName,
                          tahun: selectedYear,
                          teacher_name: classObj?.teacher_name || ''
                        });
                      }

                      // Auto-create units if missing for this year
                      const uData = editModal.data.rawPenglibatan;
                      const uCodes = [
                        uData?.badan_beruniform?.unit_code,
                        uData?.kelab_dan_persatuan?.unit_code,
                        uData?.sukan_dan_permainan?.unit_code
                      ].filter(Boolean);

                      for (const code of uCodes) {
                        const { data: existingUnit } = await supabase.from('kokurikulum_units')
                          .select('id').eq('unit_code', code).eq('tahun', selectedYear).maybeSingle();
                        if (!existingUnit) {
                          const oldUnit = allUnits.find(u => u.code === code || u.name === code);
                          if (oldUnit) {
                            await supabase.from('kokurikulum_units').insert({
                              unit_code: oldUnit.code,
                              kategori: oldUnit.category || '',
                              nama_rasmi: oldUnit.name || '',
                              nama_singkat: oldUnit.shortName || '',
                              chief_teacher: oldUnit.chief || '',
                              tahun: selectedYear
                            });
                          }
                        }
                      }
                      
                      const studentPayload: any = {
                        nama: editModal.data.name,
                        kelas: kelasName,
                        uniform_unit: editModal.data.rawPenglibatan?.badan_beruniform?.unit_code || editModal.data.rawPenglibatan?.badan_beruniform?.name_in_record || '',
                        uniform_jawatan: editModal.data.rawPenglibatan?.badan_beruniform?.jawatan || '',
                        uniform_ahli: 'Aktif', 
                        uniform_kehadiran: parseInt(editModal.data.rawPenglibatan?.badan_beruniform?.kehadiran || '0'),
                        uniform_pencapaian: editModal.data.rawPenglibatan?.badan_beruniform?.pencapaian || '',
                        kelab_unit: editModal.data.rawPenglibatan?.kelab_dan_persatuan?.unit_code || editModal.data.rawPenglibatan?.kelab_dan_persatuan?.name_in_record || '',
                        kelab_jawatan: editModal.data.rawPenglibatan?.kelab_dan_persatuan?.jawatan || '',
                        kelab_ahli: 'Aktif',
                        kelab_kehadiran: parseInt(editModal.data.rawPenglibatan?.kelab_dan_persatuan?.kehadiran || '0'),
                        kelab_pencapaian: editModal.data.rawPenglibatan?.kelab_dan_persatuan?.pencapaian || '',
                        sukan_unit: editModal.data.rawPenglibatan?.sukan_dan_permainan?.unit_code || editModal.data.rawPenglibatan?.sukan_dan_permainan?.name_in_record || '',
                        sukan_jawatan: editModal.data.rawPenglibatan?.sukan_dan_permainan?.jawatan || '',
                        sukan_ahli: 'Aktif',
                        sukan_kehadiran: parseInt(editModal.data.rawPenglibatan?.sukan_dan_permainan?.kehadiran || '0'),
                        sukan_pencapaian: editModal.data.rawPenglibatan?.sukan_dan_permainan?.pencapaian || '',
                        tahun: selectedYear
                      };
                      
                      if (editModal.index !== -1) {
                        studentPayload.id = parseInt((editModal.data.id || '').replace(/\D/g, ''), 10);
                      }
                      
                      const { error } = await supabase.from('students').upsert(studentPayload);
                      if (error) throw error;
                   }
                  setStudentsData(newData);
                } else if (editModal.type === 'fullTeacher') {
                  const originalName = editModal.originalName || editModal.data.name;
                  const newName = editModal.data.name;
  
                  // 1. Update Management Team
                  let newManagement = [...managementTeamData];
                  newManagement = newManagement.filter(m => m.name !== originalName);
                  editModal.data.managementRoles.forEach((role: string) => {
                    if (role.trim()) {
                      newManagement.push({ name: newName, role: role.trim() });
                    }
                  });
                  setManagementTeamData(newManagement);
  
                  // 2. Update Form Teachers
                  const newFormTeachers = [...formTeachersData];
                  newFormTeachers.forEach(c => {
                    if (c.teacher === originalName) c.teacher = '';
                  });
                  if (editModal.data.classes.length > 0) {
                    const targetClass = newFormTeachers.find(c => c.name === editModal.data.classes[0]);
                    if (targetClass) targetClass.teacher = newName;
                  }
                  newFormTeachers.forEach(c => {
                     if (c.teacher === originalName) c.teacher = newName;
                  });
                  setFormTeachersData(newFormTeachers);
  
                  // 3. Update Co-Curricular Units
                  let newUnits = [...coCurricularUnitsData];
                  newUnits = newUnits.map(u => ({
                    ...u,
                    chief: u.chief === originalName ? '' : u.chief,
                    advisors: u.advisors.filter((a: string) => a !== originalName)
                  }));
                  editModal.data.kokurikulum.head.forEach((h: any) => {
                    const unitIndex = newUnits.findIndex(u => u.name === h.name);
                    if (unitIndex !== -1) {
                      newUnits[unitIndex].chief = newName;
                    }
                  });
                  editModal.data.kokurikulum.advisor.forEach((adv: any) => {
                    const unitIndex = newUnits.findIndex(u => u.name === adv.name);
                    if (unitIndex !== -1) {
                      if (!newUnits[unitIndex].advisors.includes(newName)) {
                        newUnits[unitIndex].advisors.push(newName);
                      }
                    }
                  });
                  setCoCurricularUnitsData(newUnits);
                  
                  if (!isOfflineMode) {
                    // Save to management_team
                    await supabase.from('management_team').upsert({
                      teacher_name: newName,
                      role: editModal.data.managementRoles[0] || 'Teacher',
                      tahun: selectedYear
                    });
                    // Save to form_classes
                    if (editModal.data.classes[0]) {
                      await supabase.from('form_classes').upsert({
                        nama_kelas: editModal.data.classes[0],
                        teacher_name: newName,
                        tahun: selectedYear
                      });
                    }
                  }
                }
                
                if (!isOfflineMode) {
                  await refresh();
                }
                
                setEditModal({ isOpen: false, type: null, index: -1, data: null });
              } catch (err: any) {
                 console.error("Save failed:", err);
                 alert("Failed to save to Supabase: " + err.message);
              } finally {
                 setIsSaving(false);
              }
            }}
            className="px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-md transition-transform hover:scale-105 flex items-center gap-2"
            style={{ backgroundColor: tokens.colors.primaryRed }}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editModal.index === -1 
              ? editModal.type === 'student' ? 'Add Student' 
              : editModal.type === 'management' ? 'Add Role'
              : editModal.type === 'unit' ? 'Add Unit'
              : 'Add Teacher' 
              : isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
