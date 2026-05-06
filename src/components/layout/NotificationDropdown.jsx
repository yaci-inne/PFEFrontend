import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
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
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " j";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return Math.floor(seconds) + " s";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
            <h3 className="font-semibold font-syne text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Aucune notification pour le moment.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <li
                    key={notif.notificationId}
                    onClick={() => markAsRead(notif.notificationId, notif.lien)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${
                      !notif.lu ? "bg-slate-50/50" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notif.lu ? "text-slate-900" : "text-slate-700"}`}>
                          {notif.titre}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                          {timeAgo(notif.dateCreation)}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${!notif.lu ? "text-slate-600" : "text-slate-500"}`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.lu && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
