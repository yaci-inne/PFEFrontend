import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Calendar, Briefcase, Info, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/", { showSuccessToast: false, showErrorToast: false });
      if (res.status === 200) {
        const data = res.data.results || res.data;
        setNotifications(Array.isArray(data) ? data : []);
        setUnreadCount(Array.isArray(data) ? data.filter(n => !n.lu).length : 0);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id, lien) => {
    try {
      await api.patch(`/notifications/${id}/mark_read/`, {}, { showSuccessToast: false });
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, lu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (lien) {
        setIsOpen(false);
        navigate(lien);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/mark_all_read/", {}, { showSuccessToast: false });
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (dateStr) => {
    // Ensure the date is treated as UTC if it comes without timezone info (DRF default format)
    let parsedStr = dateStr;
    if (parsedStr && parsedStr.includes(" ") && !parsedStr.includes("Z")) {
      parsedStr = parsedStr.replace(" ", "T") + "Z";
    }
    
    const date = new Date(parsedStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return "À l'instant";
    
    let interval = seconds / 31536000;
    if (interval >= 1) return "Il y a " + Math.floor(interval) + " an" + (Math.floor(interval) > 1 ? "s" : "");
    
    interval = seconds / 2592000;
    if (interval >= 1) return "Il y a " + Math.floor(interval) + " mois";
    
    interval = seconds / 86400;
    if (interval >= 1) {
      const days = Math.floor(interval);
      if (days === 1) return "Hier";
      return "Il y a " + days + " jours";
    }
    
    interval = seconds / 3600;
    if (interval >= 1) {
      const hours = Math.floor(interval);
      if (hours === 1) return "Il y a 1 heure";
      return "Il y a " + hours + " heures";
    }
    
    interval = seconds / 60;
    if (interval >= 1) {
      const mins = Math.floor(interval);
      if (mins === 1) return "Il y a 1 minute";
      return "Il y a " + mins + " minutes";
    }
    
    return "À l'instant";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "rendez_vous":
        return (
          <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case "candidature":
        return (
          <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
            <Briefcase className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <style>{`
        .notif-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .notif-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .notif-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }
        .notif-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${
          isOpen ? "bg-slate-100 text-slate-900" : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200"
        }`}
      >
        <Bell className={`w-[22px] h-[22px] transition-transform duration-300 ${isOpen ? "rotate-12" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-[360px] sm:w-[420px] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 z-50 overflow-hidden flex flex-col origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200"
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-syne text-slate-900 tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center bg-slate-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="group text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" /> 
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 notif-scroll bg-slate-50/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 font-syne mb-1">Vous êtes à jour</h4>
                <p className="text-xs text-slate-500">
                  Aucune nouvelle notification pour le moment.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100/80">
                {notifications.map((notif) => (
                  <li
                    key={notif.notificationId}
                    onClick={() => markAsRead(notif.notificationId, notif.lien)}
                    className={`group relative px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-white flex items-start gap-4 ${
                      !notif.lu ? "bg-blue-50/40" : "bg-transparent"
                    }`}
                  >
                    {/* Unread indicator line */}
                    {!notif.lu && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                    )}

                    {getNotificationIcon(notif.type)}

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className={`text-sm font-semibold truncate transition-colors group-hover:text-blue-600 ${
                          !notif.lu ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {notif.titre}
                        </p>
                        <span className={`text-[11px] font-medium whitespace-nowrap shrink-0 mt-0.5 ${
                          !notif.lu ? "text-blue-600" : "text-slate-400"
                        }`}>
                          {timeAgo(notif.dateCreation)}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${
                        !notif.lu ? "text-slate-700" : "text-slate-500"
                      }`}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.lu && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-2 shadow-sm shadow-blue-200" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer view all link if needed (optional) */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-xs font-medium text-slate-500">
                Fin des notifications récentes
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
