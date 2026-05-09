"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import { getDashboardStats } from "../../services/adminService";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminLayout title="لوحة التحكم">
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="statsGrid">
        <StatCard title="المستخدمين" value={stats?.totalUsers ?? "..."} />
        <StatCard title="المنشورات" value={stats?.totalPosts ?? "..."} />
        <StatCard title="المفقودات" value={stats?.lostPosts ?? "..."} />
        <StatCard title="الموجودات" value={stats?.foundPosts ?? "..."} />
        <StatCard title="المحلولة" value={stats?.resolvedPosts ?? "..."} />
        <StatCard title="المحادثات" value={stats?.totalConversations ?? "..."} />
        <StatCard title="الرسائل" value={stats?.totalMessages ?? "..."} />
      </div>
    </AdminLayout>
  );
}