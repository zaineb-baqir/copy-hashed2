/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLogs } from "../api/logs"; // افترض عندك API جلب اللوجات

export default function InfoSystemPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      const data = await getLogs();
      setLogs(data);
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) =>
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">نظام المعلومات</h1>

      <div className="flex gap-2 mb-4">
        <Input placeholder="ابحث هنا..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => setSearch("")}>مسح</Button>
      </div>
<div className="h-[500px] overflow-auto border rounded-md">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th>المستخدم</th>
        <th>العملية</th>
        <th>التفاصيل</th>
        <th>التاريخ</th>
      </tr>
    </thead>
    <tbody>
      {filteredLogs.map((log) => (
        <tr key={log.id}>
          <td>{log.userName}</td>
          <td>{log.action}</td>
          <td>{log.details}</td>
          <td>{new Date(log.createdAt).toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}
