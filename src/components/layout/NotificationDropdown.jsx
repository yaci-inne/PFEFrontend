import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Calendar, Briefcase, Info, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(false);
  const [swipedId, setSwipedId] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

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
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSwipedId(null);
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

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}/`, { showSuccessToast: false, showErrorToast: false });
      const notif = notifications.find(n => n.notificationId === id);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
      if (notif && !notif.lu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setSwipedId(null);
    } catch (err) {
      console.error("Erreur suppression notification", err);
    }
  };

  const handleTouchStart = (e, id) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e, id) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (deltaX > 50 && deltaY < 30) {
      setSwipedId(prev => (prev === id ? null : id));
    } else if (deltaX < -20) {
      if (swipedId === id) setSwipedId(null);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
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
      return hours === 1 ? "Il y a 1 heure" : "Il y a " + hours + " heures";
    }
    interval = seconds / 60;
    if (interval >= 1) {
      const mins = Math.floor(interval);
      return mins === 1 ? "Il y a 1 minute" : "Il y a " + mins + " minutes";
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
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .notif-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* ── Swipe (mobile) ── */
        .notif-swipe-wrapper {
          position: relative;
          overflow: hidden;
        }
        .notif-swipe-content {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
        .notif-swipe-wrapper.swiped .notif-swipe-content {
          transform: translateX(-72px);
        }
        .notif-delete-reveal {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ef4444;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .notif-swipe-wrapper.swiped .notif-delete-reveal {
          opacity: 1;
          pointer-events: auto;
        }

        /* ── Bouton delete inline (toujours visible) ── */
        .notif-inline-delete {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background: transparent;
          color: #94a3b8;
          border: 1px solid transparent;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .notif-inline-delete:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
        }
        .notif-inline-delete:active {
          background: #fecaca;
          color: #dc2626;
        }

        /* ── Positioning ──
           Desktop  : absolute right-0 (normal dropdown)
           Mobile   : fixed, centré horizontalement, collé sous la navbar
        */
        .notif-panel {
          position: absolute;
          right: 0;
          margin-top: 12px;
          width: 420px;
          border-radius: 16px;
          background: white;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(148,163,184,0.2);
          z-index: 50;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 100px);
          transform-origin: top right;
          animation: notif-in 0.2s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes notif-in {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Mobile : on sort du flux et on centre */
        @media (max-width: 640px) {
          .notif-panel {
            position: fixed;
            /* Décalage depuis le haut : hauteur navbar ≈ 64px + 8px de marge */
            top: 72px;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            width: calc(100vw - 24px);   /* pleine largeur avec marges */
            max-width: 440px;
            margin-top: 0;
            border-radius: 20px;
            max-height: calc(100dvh - 88px);
            transform-origin: top center;
            animation: notif-in-mobile 0.22s cubic-bezier(0.16,1,0.3,1);
          }
          @keyframes notif-in-mobile {
            from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.97); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          }
        }
      `}</style>

      {/* Bell button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setSwipedId(null); }}
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
        <div className="notif-panel">
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
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="group text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  Tout marquer lu
                </button>
              )}
              {/* Bouton fermer (mobile) */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 notif-scroll bg-slate-50/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 font-syne mb-1">Vous êtes à jour</h4>
                <p className="text-xs text-slate-500">Aucune nouvelle notification pour le moment.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100/80">
                {notifications.map((notif) => (
                  <li key={notif.notificationId}>
                    <div
                      className={`notif-swipe-wrapper ${swipedId === notif.notificationId ? "swiped" : ""}`}
                      onTouchStart={(e) => handleTouchStart(e, notif.notificationId)}
                      onTouchEnd={(e) => handleTouchEnd(e, notif.notificationId)}
                    >
                      {/* Contenu principal */}
                      <div
                        className={`notif-swipe-content group relative px-4 py-4 cursor-pointer transition-all duration-200 hover:bg-white flex items-start gap-3 ${
                          !notif.lu ? "bg-blue-50/40" : "bg-transparent"
                        }`}
                        onClick={() => {
                          if (swipedId === notif.notificationId) {
                            setSwipedId(null);
                          } else {
                            markAsRead(notif.notificationId, notif.lien);
                          }
                        }}
                      >
                        {/* Barre gauche non-lu */}
                        {!notif.lu && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                        )}

                        {getNotificationIcon(notif.type)}

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-sm font-semibold leading-tight transition-colors group-hover:text-blue-600 ${
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

                        {/* Point non-lu */}
                        {!notif.lu && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2 shadow-sm shadow-blue-200" />
                        )}

                        {/* ── Bouton delete TOUJOURS visible ── */}
                        <button
                          onClick={(e) => deleteNotification(e, notif.notificationId)}
                          className="notif-inline-delete"
                          title="Supprimer"
                          aria-label="Supprimer la notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bouton rouge swipe — mobile (glisser gauche) */}
                      <button
                        className="notif-delete-reveal"
                        onClick={(e) => deleteNotification(e, notif.notificationId)}
                        aria-label="Supprimer la notification"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-xs font-medium text-slate-500">Fin des notifications récentes</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;