import { Bell, Check, X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationOverlayProps {
  notifications: NotificationItem[];
  role: "tenant" | "organizer";
  onClose: () => void;
  onRead: (id: string) => void;
  onReadAll: () => void;
}

export default function NotificationOverlay({
  notifications,
  role,
  onClose,
  onRead,
  onReadAll,
}: NotificationOverlayProps) {
  const items = notifications.filter((n) => n.role === role || n.role === "all");

  const getTypeStyles = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
          iconBg: "bg-emerald-100/70",
          icon: Check,
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-700",
          iconBg: "bg-amber-100/70",
          icon: AlertTriangle,
        };
      case "error":
        return {
          bg: "bg-rose-50",
          border: "border-rose-100",
          text: "text-rose-700",
          iconBg: "bg-rose-100/70",
          icon: AlertCircle,
        };
      case "info":
      default:
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-100",
          text: "text-indigo-700",
          iconBg: "bg-indigo-100/70",
          icon: Info,
        };
    }
  };

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[24px] p-5 max-h-[75%] overflow-y-auto border-t border-slate-100 flex flex-col fade-up-anim shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-600" />
            Notifikasi
          </h3>
          <div className="flex gap-3 items-center">
            {items.some((i) => !i.read) && (
              <button
                onClick={onReadAll}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Baca Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-slate-100 border-none hover:bg-slate-200 rounded-xl w-8 h-8 flex items-center justify-center cursor-pointer text-slate-505 hover:text-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pb-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-300 text-sm">
              <Bell className="w-12 h-12 stroke-1 mx-auto mb-3 opacity-30" />
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            items.map((n) => {
              const styles = getTypeStyles(n.type);
              const IsIcon = styles.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => onRead(n.id)}
                  className={`border rounded-2xl p-3.5 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                    n.read
                      ? "bg-slate-50/60 border-slate-100/70 text-slate-400"
                      : `${styles.bg} ${styles.border}`
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${styles.iconBg} ${styles.text} flex items-center justify-center shrink-0`}
                    >
                      <IsIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <p
                          className={`text-dd text-[13px] leading-tight font-extrabold truncate ${
                            n.read ? "text-slate-400" : "text-slate-800"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed break-words ${n.read ? "text-slate-400" : "text-slate-500"}`}>
                        {n.msg}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
