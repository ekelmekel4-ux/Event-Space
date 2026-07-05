import { Home, Calendar, User, LayoutGrid, Store, Search } from "lucide-react";

interface NavbarProps {
  role: "tenant" | "organizer";
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function Navbar({ role, activeScreen, onNavigate }: NavbarProps) {
  const tenantTabs = [
    { icon: Home, label: "Beranda", screen: "home" },
    { icon: Search, label: "Explore", screen: "explore" },
    { icon: Calendar, label: "Booking", screen: "my_bookings" },
    { icon: User, label: "Profil", screen: "profile" },
  ];

  const organizerTabs = [
    { icon: LayoutGrid, label: "Dashboard", screen: "org_dashboard" },
    { icon: Calendar, label: "Events", screen: "org_events" },
    { icon: Store, label: "Booking", screen: "org_bookings" },
    { icon: User, label: "Profil", screen: "profile" },
  ];

  const tabs = role === "organizer" ? organizerTabs : tenantTabs;

  return (
    <nav className="bg-white border-t border-slate-100 md:border-t-0 md:border-r py-2.5 px-1 pb-4.5 md:p-4 flex md:flex-col md:h-full justify-around md:justify-start md:gap-4 shrink-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] md:shadow-none h-full no-print">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.screen === activeScreen;
        
        let activeClass = "text-slate-400 hover:text-slate-600";
        if (isActive) {
          activeClass = role === "organizer" 
            ? "bg-orange-50 text-orange-600" 
            : "bg-violet-50 text-violet-600";
        }

        return (
          <button
            key={tab.screen}
            onClick={() => onNavigate(tab.screen)}
            className={`flex flex-col lg:flex-row items-center lg:justify-start gap-1 cursor-pointer py-2 px-3 rounded-xl min-w-[62px] lg:w-full transition-all duration-200 hover:scale-105 active:scale-95 ${activeClass}`}
          >
            <Icon className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
            <span className={`text-[10px] lg:text-sm lg:font-bold font-bold ${isActive ? (role === "organizer" ? "text-orange-600" : "text-violet-600") : "text-slate-400"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
