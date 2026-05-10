"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  clearReadNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  Target,
  MessageCircle,
  MapPin,
  CheckCircle2
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return d.toLocaleDateString("ar-JO");
};

const getNotifStyle = (type) => {
  const map = {
    match: { icon: Target, color: "#2563eb", bg: "#dbeafe", label: "تطابق" },
    message: { icon: MessageCircle, color: "#059669", bg: "#d1fae5", label: "رسالة" },
    found: { icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7", label: "تم العثور" },
    lost: { icon: MapPin, color: "#dc2626", bg: "#fee2e2", label: "مفقود" },
  };
  return map[type] || { icon: Bell, color: "#d97706", bg: "#fef3c7", label: "إشعار" };
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let active = true;
    getNotifications({ limit: 50 })
      .then((data) => { if (active) setNotifications(data?.data || []); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const markOne = async (id) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAll = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearRead = async () => {
    await clearReadNotifications();
    setNotifications(prev => prev.filter(n => !n.isRead));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayed = activeTab === "unread" ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <MainLayout>
      <div className="notifContainer">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="notifPageTitle">
              الإشعارات <Bell className="text-yellow-500 fill-yellow-500" size={28} />
              {unreadCount > 0 && <span className="notifBadgeCount">{unreadCount}</span>}
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1 px-1">جميع التحديثات في مكان واحد</p>
          </div>

          {/* الأزرار بالعرض - Forced Horizontal Row */}
          <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("unread")}
              className={`notifActionBtn shrink-0 ${activeTab === 'unread' ? 'active shadow-md border-blue-200' : ''}`}
              style={activeTab === 'unread' ? {color: 'var(--blue)', background: 'var(--white)'} : {}}
            >
              غير مقروء
            </button>
            <button 
              onClick={() => setActiveTab("all")}
              className={`notifActionBtn shrink-0 ${activeTab === 'all' ? 'active shadow-md' : ''}`}
              style={activeTab === 'all' ? {color: 'var(--blue)', background: 'var(--white)'} : {}}
            >
              الكل
            </button>
            <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0"></div>
            <button onClick={markAll} className="notifActionBtn shrink-0">
              <CheckCheck size={16} className="text-blue-600" /> تحديد الكل
            </button>
            <button onClick={clearRead} className="notifActionBtn clear shrink-0">
              <Trash2 size={16} /> حذف المقروء
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[450px]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/50 animate-pulse rounded-[28px]" />)}
            </div>
          ) : displayed.length === 0 ? (
            
            /* Empty State */
            <div className="notifEmptyState">
              <div className="notifEmptyIcon">
                <Bell size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-[#152b5b]">لا توجد إشعارات</h3>
              <p className="text-slate-400 font-medium mt-1">يبدو أن كل شيء هادئ حالياً!</p>
            </div>

          ) : (
            <div className="space-y-4" dir="rtl">
              {displayed.map((item) => {
                const style = getNotifStyle(item.type);
                const Icon = style.icon;
                return (
                  <div key={item._id} className={`notifCard ${!item.isRead ? 'unread' : 'read'}`}>
                    {!item.isRead && <span className="unreadDot" />}
                    
                    <div className="notifIconBox" style={{ backgroundColor: style.bg, color: style.color }}>
                      <Icon size={24} />
                    </div>

                    <div className="notifContent text-right">
                      <div className="notifMainRow">
                        <h4 className="notifTitle">{item.title || style.label}</h4>
                        <div className="notifTimeBox">
                          <Clock size={12} /> {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <p className="notifMessage">{item.body || item.message}</p>
                      
                      <div className="notifFooter">
                        <span className="notifTag">{style.label}</span>
                        {!item.isRead && (
                          <button onClick={() => markOne(item._id)} className="markReadBtn">
                            تحديد كمقروء
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
