"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminTable from "../../../components/admin/AdminTable";
import Button from "../../../components/ui/Button";
import { getReports, updateReportStatus } from "../../../services/adminService";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (id) => {
    await updateReportStatus(id, {
      status: "resolved",
      adminNote: "تمت المراجعة",
    });

    loadReports();
  };

  return (
    <AdminLayout title="إدارة البلاغات">
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <AdminTable columns={["المبلّغ", "النوع", "السبب", "الحالة", "إجراء"]}>
        {reports.map((report) => (
          <tr key={report._id}>
            <td>{report.reportedBy?.name || "غير معروف"}</td>
            <td>{report.targetType}</td>
            <td>{report.reason}</td>
            <td>{report.status}</td>
            <td>
              <Button variant="success" onClick={() => handleResolve(report._id)}>
                حل البلاغ
              </Button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminLayout>
  );
}