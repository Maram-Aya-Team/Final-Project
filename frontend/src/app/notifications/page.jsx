"use client";

import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  clearReadNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("ar-JO");
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getNotifications({ limit: 30 });
      setNotifications(data?.data || []);
    } catch (err) {
      setError(err.message || "تعذر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markOneAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    } catch (err) {
      setError(err.message || "تعذر تحديث الإشعار");
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(err.message || "تعذر تحديث الإشعارات");
    }
  };

  const clearRead = async () => {
    try {
      await clearReadNotifications();
      setNotifications((prev) => prev.filter((item) => !item.isRead));
    } catch (err) {
      setError(err.message || "تعذر حذف الإشعارات المقروءة");
    }
  };

  return (
    <MainLayout>
      <section className="pageHeader split">
        <div>
          <h1>الإشعارات</h1>
          <p>متابعة التنبيهات الخاصة بحسابك.</p>
        </div>

        <div className="rowActions">
          <Button variant="outline" onClick={() => void markAll()}>
            تعليم الكل كمقروء
          </Button>
          <Button variant="outline" onClick={() => void clearRead()}>
            حذف المقروء
          </Button>
        </div>
      </section>

      {error && <div className="stateError">{error}</div>}

      <div className="notificationList">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeletonCard" />)
        ) : notifications.length === 0 ? (
          <div className="stateEmpty">لا توجد إشعارات</div>
        ) : (
          notifications.map((item) => (
            <Card key={item._id} className={`notificationCard ${item.isRead ? "read" : "unread"}`}>
              <div>
                <h3>{item.title || "إشعار"}</h3>
                <p>{item.body || item.message || ""}</p>
                <small>{formatDate(item.createdAt)}</small>
              </div>

              {!item.isRead && (
                <Button variant="outline" onClick={() => void markOneAsRead(item._id)}>
                  تعليم كمقروء
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </MainLayout>
  );
}
