import { ShieldCheck, GraduationCap, ArrowRight, LayoutDashboard, UserPlus } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const tokens = {
  colors: {
    primaryRed: '#F04444',
    navy: '#2B3674',
    textMuted: '#8F9BBA',
    mainBg: '#F4F7F6',
    white: '#FFFFFF',
  }
};

interface LandingPageProps {
  onSelectRole: (role: 'admin' | 'teacher') => void;
  onRegister?: () => void;
}

export default function LandingPage({ onSelectRole, onRegister }: LandingPageProps) {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-100 selection:text-red-900" style={{ backgroundColor: tokens.colors.mainBg }}>
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-2%] w-[20%] h-[30%] rounded-full blur-[60px] opacity-20" style={{ backgroundColor: tokens.colors.primaryRed }}></div>
        <div className="absolute bottom-[-5%] left-[-2%] w-[20%] h-[30%] rounded-full blur-[60px] opacity-10" style={{ backgroundColor: tokens.colors.navy }}></div>
      </div>

      {/* Header / Nav */}
      <nav className="relative z-20 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-lg overflow-hidden shrink-0" style={{ backgroundColor: tokens.colors.primaryRed }}>
             {settings.logoUrl ? (
               <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             ) : (
               <GraduationCap className="text-white w-5 h-5" />
             )}
          </div>
          <span className="text-sm font-black tracking-tight" style={{ color: tokens.colors.navy }} title={settings.schoolName}>{settings.schoolName}</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: tokens.colors.textMuted }}>Session 2025/2026</span>
          <div className="h-3 w-[1px] bg-slate-200"></div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.colors.navy }}>KOKURIKULUM PORTAL</p>
        </div>
      </nav>

{/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 md:py-16 text-center max-w-4xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tokens.colors.primaryRed }}></span>
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: tokens.colors.navy }}>Staff Portal</span>
            </div>

           <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-3 tracking-tight" style={{ color: tokens.colors.navy }}>
              Kokurikulum <span style={{ color: tokens.colors.primaryRed }}>Management</span> System
            </h1>

            <p className="text-sm md:text-base font-medium max-w-xl mx-auto mb-6 leading-relaxed" style={{ color: tokens.colors.textMuted }}>
              Manage activities, attendance, and PAJSK scores for all co-curricular units.
            </p>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-3xl mx-auto">
                {/* Admin Box */}
<button
  onClick={() => onSelectRole('admin')}
  className="group relative bg-white p-5 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-left overflow-hidden border border-slate-100 cursor-pointer"
>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-inner bg-slate-50 text-navy group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                   <h3 className="relative z-10 text-xl md:text-2xl font-black mb-2" style={{ color: tokens.colors.navy }}>Administrator</h3>
                   <p className="relative z-10 text-sm md:text-base font-medium leading-relaxed mb-4" style={{ color: tokens.colors.textMuted }}>
                    Manage teachers, students, units, and view school-wide reports.
                  </p>
                  <div className="relative z-10 flex items-center gap-1 text-sm font-extrabold uppercase tracking-widest group-hover:gap-2 transition-all" style={{ color: tokens.colors.primaryRed }}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </div>
               </button>

               {/* Teacher Box */}
<div
  className="group relative p-5 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-left overflow-hidden border border-slate-100 cursor-pointer"
  style={{ backgroundColor: tokens.colors.navy }}
  onClick={() => onSelectRole('teacher')}
>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[80px] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-white/10 text-white group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                   <h3 className="relative z-10 text-xl md:text-2xl font-black mb-2 text-white">Teacher</h3>
                   <p className="relative z-10 text-sm md:text-base font-medium leading-relaxed mb-4 text-white/60">
                    Record attendance, track participation, and manage your class activities.
                  </p>
                 <div className="relative z-10 flex flex-col gap-1">
                   <div className="flex items-center gap-1 text-sm font-extrabold uppercase tracking-widest group-hover:gap-2 transition-all text-red-400 group-hover:text-red-300">
                      Continue <ArrowRight className="w-4 h-4" />
                   </div>
                    {onRegister && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegister();
                        }}
                        className="text-sm font-bold text-white/60 hover:text-white transition-colors underline text-left cursor-pointer"
                      >
                        Don't have an account? Request Access
                      </button>
                    )}
                 </div>
              </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center border-t border-slate-200/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: tokens.colors.textMuted }}>
            © {new Date().getFullYear()} {settings.schoolName} • All Rights Reserved
          </p>
          <div className="flex items-center gap-4">
            {onRegister && (
              <>
                <button
                  onClick={onRegister}
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" style={{ color: tokens.colors.primaryRed }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.colors.primaryRed }}>Request Access</span>
                </button>
                <div className="h-4 w-[1px] bg-slate-200"></div>
              </>
            )}
             <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.colors.navy }}>Privacy & Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
