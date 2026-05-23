import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { matchExcelTeachers, ExcelTeacherRow, MatchedTeacher, UnmatchedRow } from '../lib/excelUploadUtils';
import { bulkSaveUnitAdvisors } from '../lib/dataService';
import { cn } from '../lib/utils';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: any;
  registeredTeachers: Array<{ name: string; userId: string }>;
  availableUnits: Array<{ unit_code: string; nama_rasmi: string }>;
  tahun: number;
  onSuccess: () => void;
}

export default function ExcelUploadModal({
  isOpen,
  onClose,
  tokens,
  registeredTeachers,
  availableUnits,
  tahun,
  onSuccess,
}: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [matched, setMatched] = useState<MatchedTeacher[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setError(null);
    setHasParsed(false);
    setMatched([]);
    setUnmatched([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, string>>;

      const rows: ExcelTeacherRow[] = jsonData
        .map(row => ({
          teacherName: (row['Teacher Name'] || row['teacher_name'] || row['Name'] || row['name'] || '').toString().trim(),
          unitName: (row['Unit Name'] || row['unit_name'] || row['Unit'] || row['unit'] || '').toString().trim(),
        }))
        .filter(r => r.teacherName && r.unitName);

      if (rows.length === 0) {
        setError('No valid data found. Expected columns: "Teacher Name" and "Unit Name"');
        setIsParsing(false);
        return;
      }

      const result = matchExcelTeachers(rows, registeredTeachers, availableUnits);
      setMatched(result.matched);
      setUnmatched(result.unmatched);
      setHasParsed(true);
    } catch (err: any) {
      setError('Failed to parse Excel file: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (matched.length === 0) return;

    setIsSaving(true);
    try {
      const assignments = matched.map(m => ({
        userId: m.userId,
        unitCode: m.unitCode,
        tahun,
      }));

      await bulkSaveUnitAdvisors(assignments);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError('Failed to save assignments: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setMatched([]);
    setUnmatched([]);
    setHasParsed(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" style={{ margin: '1rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-extrabold" style={{ color: tokens.colors.textNavy }}>
            Bulk Upload Unit Advisors
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" style={{ color: tokens.colors.textMuted }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
              file ? "border-green-400 bg-green-50" : "border-slate-300 hover:border-red-300 hover:bg-slate-50"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {isParsing ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: tokens.colors.primaryRed }} />
                <span className="text-sm font-medium" style={{ color: tokens.colors.textNavy }}>Parsing file...</span>
              </div>
            ) : file ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium" style={{ color: tokens.colors.textNavy }}>{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: tokens.colors.textMuted }} />
                <p className="text-sm font-bold mb-1" style={{ color: tokens.colors.textNavy }}>
                  Click to upload Excel file
                </p>
                <p className="text-xs" style={{ color: tokens.colors.textMuted }}>
                  Expected columns: "Teacher Name", "Unit Name"
                </p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Preview */}
          {hasParsed && (
            <>
              {/* Matched Summary */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-700">
                  {matched.length} teacher(s) matched successfully
                </p>
              </div>

              {/* Matched Table */}
              {matched.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold" style={{ color: tokens.colors.textMuted }}>Excel Name</th>
                        <th className="px-4 py-2 text-left font-bold" style={{ color: tokens.colors.textMuted }}>Matched Teacher</th>
                        <th className="px-4 py-2 text-left font-bold" style={{ color: tokens.colors.textMuted }}>Unit</th>
                        <th className="px-4 py-2 text-right font-bold" style={{ color: tokens.colors.textMuted }}>Similarity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matched.map((m, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-4 py-2 font-medium" style={{ color: tokens.colors.textNavy }}>{m.teacherName}</td>
                          <td className="px-4 py-2" style={{ color: tokens.colors.textNavy }}>{m.matchedName}</td>
                          <td className="px-4 py-2" style={{ color: tokens.colors.textNavy }}>{m.unitName}</td>
                          <td className="px-4 py-2 text-right">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-bold",
                              m.similarity >= 95 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                              {m.similarity}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Unmatched Summary */}
              {unmatched.length > 0 && (
                <>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-amber-700">
                      {unmatched.length} row(s) skipped - assign manually after teachers register
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-bold" style={{ color: tokens.colors.textMuted }}>Teacher Name</th>
                          <th className="px-4 py-2 text-left font-bold" style={{ color: tokens.colors.textMuted }}>Unit</th>
                          <th className="px-4 py-2 text-left font-bold" style={{ color: tokens.colors.textMuted }}>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unmatched.map((u, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-4 py-2 font-medium" style={{ color: tokens.colors.textNavy }}>{u.teacherName}</td>
                            <td className="px-4 py-2" style={{ color: tokens.colors.textNavy }}>{u.unitName}</td>
                            <td className="px-4 py-2 text-xs" style={{ color: tokens.colors.textMuted }}>
                              {u.reason === 'teacher_not_found' ? 'Teacher not registered' : 'Unit not found'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-full text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            style={{ color: tokens.colors.textNavy }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={matched.length === 0 || isSaving}
            className={cn(
              "px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-md transition-transform flex items-center gap-2",
              matched.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            )}
            style={{ backgroundColor: tokens.colors.primaryRed }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {isSaving ? 'Saving...' : `Save ${matched.length} Assignment(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
