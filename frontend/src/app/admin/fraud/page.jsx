"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import Card from "../../../components/ui/Card";
import { getFraudOverview } from "../../../services/adminService";

export default function FraudPage() {
  const [fraud, setFraud] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFraud = async () => {
      try {
        const data = await getFraudOverview();
        setFraud(data.fraudSignals);
      } catch (err) {
        setError(err.message);
      }
    };

    loadFraud();
  }, []);

  return (
    <AdminLayout title="كشف الاحتيال">
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div style={{ display: "grid", gap: "20px" }}>
        <Card>
          <h3>مستخدمون لديهم منشورات كثيرة</h3>
          <p>{fraud?.usersWithManyPosts?.length ?? 0} نتيجة مشبوهة</p>
        </Card>

        <Card>
          <h3>عناصر عليها بلاغات كثيرة</h3>
          <p>{fraud?.reportedTargets?.length ?? 0} نتيجة مشبوهة</p>
        </Card>

        <Card>
          <h3>مستخدمون يرسلون رسائل كثيرة</h3>
          <p>{fraud?.usersWithManyMessages?.length ?? 0} نتيجة مشبوهة</p>
        </Card>
      </div>
    </AdminLayout>
  );
}