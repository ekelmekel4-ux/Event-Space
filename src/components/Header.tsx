import { Bell, ChevronLeft } from "lucide-react";
import { User, NotificationItem } from "../types";

interface HeaderProps {
  user: User | null;
  notifications: NotificationItem[];
  onOpenNotif: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  activeScreen?: string;
  onNavigate?: (screen: string) => void;
}

export default function Header({ 
  user, 
  notifications, 
  onOpenNotif, 
  showBack, 
  onBack, 
  title, 
  activeScreen, 
  onNavigate 
}: HeaderProps) {
  if (!user) return null;
  
  const role = user.role;
  const unreadCount = notifications.filter(n => !n.read && n.role === role).length;
  
  // Custom theme colors matching role
  const isOrg = role === "organizer";
  const primaryText = isOrg ? "text-orange-600" : "text-violet-600";
  const primaryBg = isOrg ? "bg-orange-50" : "bg-violet-50";
  const activeBorder = isOrg ? "border-orange-600" : "border-violet-600";
  const ringColor = isOrg ? "#f97316" : "#7c5cfc";

  // Tab definitions
  const tenantTabs = [
    { label: "Beranda", screen: "home" },
    { label: "Explore", screen: "explore" },
    { label: "Booking", screen: "my_bookings" },
    { label: "Profil", screen: "profile" },
  ];

  const organizerTabs = [
    { label: "Dashboard", screen: "org_dashboard" },
    { label: "Events", screen: "org_events" },
    { label: "Booking", screen: "org_bookings" },
    { label: "Profil", screen: "profile" },
  ];

  const tabs = isOrg ? organizerTabs : tenantTabs;

  return (
    <div className="flex items-center justify-between px-6 py-3.5 shrink-0 bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 font-sans select-none no-print">
      {/* LEFT: LOGO / BACK */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onBack}
              className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center cursor-pointer text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-slate-800 leading-none">
              {title || "Kembali"}
            </span>
          </div>
        ) : (
          <div 
            onClick={() => onNavigate && onNavigate(isOrg ? "org_dashboard" : "home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Elegant Brand Logo */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-transparent shrink-0 transition-transform duration-300 group-hover:scale-105 active:scale-95">
              <img src="/logo.svg" alt="logo" className="w-8 h-8 object-contain float-anim" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-0.5">
                {isOrg ? "Organizer Hub" : "Tenant Portal"}
              </span>
              <span className="text-sm font-black text-slate-800 leading-none tracking-tight">
                EventSpace
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MIDDLE: HORIZONTAL NAV LINKS (Desktop & Tablet only) */}
      {!showBack && activeScreen && onNavigate && (
        <div className="hidden md:flex items-center gap-6 h-full">
          {tabs.map((tab) => {
            const isActive = tab.screen === activeScreen;
            return (
              <button
                key={tab.screen}
                onClick={() => onNavigate(tab.screen)}
                className={`relative py-2 px-1 cursor-pointer font-bold text-xs transition-colors duration-200 uppercase tracking-wider font-sans border-none bg-transparent outline-none ${
                  isActive 
                    ? `${primaryText}` 
                    : "text-slate-450 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {/* Underline for active state */}
                {isActive && (
                  <span className={`absolute bottom-[-14px] left-0 w-full h-[2.5px] rounded-full ${activeBorder}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* RIGHT: NOTIFICATIONS */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotif}
          className="relative bg-slate-50 border border-slate-100 rounded-xl w-9.5 h-9.5 flex items-center justify-center cursor-pointer text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100 shrink-0"
        >
          <Bell className="w-4.5 h-4.5" style={{ color: unreadCount > 0 ? ringColor : undefined }} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white px-0.5 select-none">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
