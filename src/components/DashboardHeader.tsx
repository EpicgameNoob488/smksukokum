import { Search, Settings, ToggleLeft, ToggleRight, Download, Filter, LogOut } from 'lucide-react';
import { DT } from '../lib/designTokens';
import { exportToCSV } from '../lib/csvExport';
import NotificationBell from './NotificationBell';

interface DashboardHeaderProps {
  activeTab: string;
  session: any;
  isAdmin: boolean;
  isOfflineMode: boolean;
  onLogout: () => void;
  onLoginRequired: () => void;
  onNavigateSettings?: () => void;
  projected: boolean;
  setProjected: (projected: boolean) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
  dashboardFormFilter: string;
  setDashboardFormFilter: (filter: string) => void;
  dashboardClassFilter: string;
  setDashboardClassFilter: (filter: string) => void;
  dashboardPillarFilter: string;
  setDashboardPillarFilter: (filter: string) => void;
  tokens: any;
  kpis?: Array<{
    title: string;
    value: string | number;
    unit: string;
    trend: string;
    color: string;
    isWarning: boolean;
  }>;
  onExportDashboard?: () => void;
}

export const DashboardHeader = ({
  activeTab,
  session,
  isAdmin,
  isOfflineMode,
  onLogout,
  onLoginRequired,
  onNavigateSettings,
  projected,
  setProjected,
  selectedYear,
  setSelectedYear,
  availableYears,
  dashboardFormFilter,
  setDashboardFormFilter,
  dashboardClassFilter,
  setDashboardClassFilter,
  dashboardPillarFilter,
  setDashboardPillarFilter,
  tokens,
  kpis = [],
  onExportDashboard
}: DashboardHeaderProps) => {
  const handleExportDashboard = () => {
    const columns = [
      { key: 'title' as const, label: 'KPI Title' },
      { key: 'value' as const, label: 'Value' },
      { key: 'unit' as const, label: 'Unit' },
      { key: 'trend' as const, label: 'Trend' },
    ];
    
    exportToCSV(kpis, columns, `dashboard-kpis-${Date.now()}.csv`);
    
    if (onExportDashboard) {
      onExportDashboard();
    }
  };

  return (
    <header className="px-8 py-5 flex flex-col gap-5 border-b sticky top-0 z-10" style={{ backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: tokens.colors.textNavy }}>
          {activeTab === 'Dashboard' ? 'Activities Overview' : activeTab}
        </h2>
        
        <div className="flex items-center gap-5">
          {activeTab !== 'Students' && activeTab !== 'Teachers' && (
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
              <input 
                type="text" 
                placeholder="Search student instantly..." 
                className={`pl-10 pr-4 py-2.5 ${DT.radius.full} text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all w-64 font-medium border`}
                style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed, borderColor: tokens.colors.lightBorder }}
              />
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {/* Notification Bell with hover dropdown */}
            <NotificationBell />
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
                    className={`w-10 h-10 ${DT.radius.full} flex items-center justify-center transition-all ${DT.shadow.sm} border cursor-pointer hover:bg-slate-50`}
                    style={{ borderColor: tokens.colors.cardOuterBg, color: tokens.colors.textNavy, backgroundColor: tokens.colors.cardInnerBg }}
                    title="System Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onLogout}
                    className={`w-10 h-10 ${DT.radius.full} flex items-center justify-center transition-all ${DT.shadow.sm} border cursor-pointer hover:bg-slate-50`}
                    style={{ borderColor: tokens.colors.cardOuterBg, color: tokens.colors.primaryRed, backgroundColor: tokens.colors.cardInnerBg }}
                    title="Logout (Esc)"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLogout}
                  className={`px-4 py-2 ${DT.radius.full} flex items-center justify-center transition-all ${DT.shadow.md} text-white text-xs font-bold cursor-pointer hover:scale-105 active:scale-95`}
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
            {/* Year Filter */}
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`text-sm font-bold border ${DT.radius.full} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer`} 
              style={{ color: tokens.colors.primaryRed, backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="relative hidden md:block mr-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className={`pl-10 pr-4 py-2 ${DT.radius.full} text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all w-44 font-medium border`}
                style={{ backgroundColor: tokens.colors.cardInnerBg, color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed, borderColor: tokens.colors.lightBorder }}
              />
            </div>
            <Filter className="w-4 h-4 mr-1" style={{ color: tokens.colors.textMuted }} />
            <select 
              value={dashboardFormFilter}
              onChange={(e) => setDashboardFormFilter(e.target.value)}
              className={`text-sm font-medium border ${DT.radius.full} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer`} 
              style={{ color: tokens.colors.textNavy, backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
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
              className={`text-sm font-medium border ${DT.radius.full} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer`} 
              style={{ color: tokens.colors.textNavy, backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
            >
              <option value="">All Classes</option>
            </select>
            <select 
              value={dashboardPillarFilter}
              onChange={(e) => setDashboardPillarFilter(e.target.value)}
              className={`text-sm font-medium border ${DT.radius.full} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer`} 
              style={{ color: tokens.colors.textNavy, backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
            >
              <option value="">All Pillars</option>
              <option>Kelab & Persatuan</option>
              <option>Badan Beruniform</option>
              <option>Sukan dan Permainan</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setProjected(!projected)}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${DT.radius.full} text-sm font-medium transition-colors border cursor-pointer ${projected ? 'border-transparent' : 'border hover:bg-slate-50'}`}
              style={projected ? { backgroundColor: tokens.colors.trendGreenBg, color: tokens.colors.trendGreenText } : { backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder, color: tokens.colors.textNavy }}
            >
              {projected ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Projected (Post-KRS)
            </button>
            <button 
              onClick={handleExportDashboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${DT.radius.full} text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer border`} 
              style={{ color: tokens.colors.textNavy, backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}
    </header>
  );
};