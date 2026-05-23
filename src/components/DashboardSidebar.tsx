import { cn } from '../lib/utils';
import { GraduationCap, LayoutDashboard, Users, UserCircle2 } from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: any;
  schoolData: any;
}

export const DashboardSidebar = ({ activeTab, setActiveTab, settings, schoolData }: DashboardSidebarProps) => {
  const iconMap = {
    LayoutDashboard,
    Users,
    UserCircle2,
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Teachers', icon: Users },
    { name: 'Students', icon: UserCircle2 },
  ];

  return (
    <aside className="w-56 flex flex-col flex-shrink-0 z-20 shadow-xl" style={{ backgroundColor: '#F04444' }}>
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden" style={{ color: '#F04444' }}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <GraduationCap className="w-6 h-6" />
          )}
        </div>
        <div className="overflow-hidden">
          <h1 className="text-[13px] font-extrabold text-white leading-tight tracking-wide truncate" title={settings.schoolName}>{settings.schoolName}</h1>
          <p className="text-[10px] font-semibold text-white/90 uppercase tracking-widest truncate">{schoolData?.metadata.unit || 'KOKURIKULUM'} {schoolData?.metadata.tahun || new Date().getFullYear()}</p>
        </div>
      </div>

      <nav className="flex-1 mt-2 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = iconMap[item.name as keyof typeof iconMap] || LayoutDashboard;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold transition-colors duration-200 w-full text-left cursor-pointer",
                isActive 
                  ? "rounded-xl mx-1" 
                  : "text-white hover:bg-white/10 mx-1 rounded-xl"
              )}
              style={isActive ? { backgroundColor: '#F4F7F6', color: '#F04444' } : {}}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
