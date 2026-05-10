"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import Card from "../../../components/ui/Card";
import { getFraudOverview } from "../../../services/adminService";

export default function FraudPage() {
  const [fraud, setFraud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadFraud = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getFraudOverview();
        if (!active) return;
        setFraud(data?.fraudSignals || null);
      } catch (err) {
        if (!active) return;
        setError(err.message || "تعذر تحميل بيانات الاحتيال");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadFraud();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout title="كشف الاحتيال">
      {error && <div className="stateError">{error}</div>}

      <div className="postGrid">
        <Card>
          <h3>مستخدمون لديهم منشورات كثيرة</h3>
          <p>{loading ? "..." : fraud?.usersWithManyPosts?.length ?? 0} نتيجة</p>
        </Card>

        <Card>
          <h3>عناصر عليها بلاغات كثيرة</h3>
          <p>{loading ? "..." : fraud?.reportedTargets?.length ?? 0} نتيجة</p>
        </Card>

        <Card>
          <h3>مستخدمون يرسلون رسائل كثيرة</h3>
          <p>{loading ? "..." : fraud?.usersWithManyMessages?.length ?? 0} نتيجة</p>
        </Card>
      </div>
    </AdminLayout>
  );
}
