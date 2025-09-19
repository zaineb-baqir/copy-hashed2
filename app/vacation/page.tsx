/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VacationPage() {
  const utils = trpc.useContext();

  const [sectionId, setSectionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [reason, setReason] = useState("");
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  // جلب الأقسام والشُعب والموظفين
  const { data: sections } = trpc.org.getSections.useQuery();
  const { data: departments } = trpc.org.getDepartmentsBySection.useQuery(
    sectionId || 0,
    { enabled: !!sectionId }
  );
  const { data: employees } = trpc.org.getEmployeeByDepartment.useQuery(
    { departmentId: departmentId || 0 },
    { enabled: !!departmentId }
  );

  // جلب الرصيد المتاح للموظف
  const { data: balance } = trpc.vacation.getEmployeeBalance.useQuery(
    { employeeId: employeeId || 0 },
    { enabled: !!employeeId }
  );

  useEffect(() => {
    if (balance !== undefined) setAvailableBalance(balance);
  }, [balance]);

  // إنشاء إجازة
  const createVacation = trpc.vacation.createVacation.useMutation({
    onSuccess: (res) => {
      utils.vacation.getAllVacations.invalidate();
      alert(res.message);
      setSectionId(null);
      setDepartmentId(null);
      setEmployeeId(null);
      setDateStart("");
      setDateEnd("");
      setReason("");
      setAvailableBalance(null);
    },
    onError: (err: any) => alert(err.message),
  });

  const handleCreateVacation = async () => {
    if (!sectionId || !departmentId || !employeeId || !dateStart || !dateEnd) {
      alert("يرجى ملء جميع الحقول الضرورية");
      return;
    }

    await createVacation.mutateAsync({
      sectionId,
      departmentId,
      employeeId,
      dateStart,
      dateEnd,
      reason,
    });
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-4">
      <CardHeader>
        <CardTitle>➕ إضافة إجازة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {employeeId && availableBalance !== null && (
          <div className="text-sm text-gray-600 mb-2">
            الرصيد المتاح للموظف: {availableBalance} يوم
          </div>
        )}

        {/* القسم */}
        <div>
          <Label>القسم</Label>
          <select
            value={sectionId || ""}
            onChange={(e) => {
              setSectionId(Number(e.target.value));
              setDepartmentId(null);
              setEmployeeId(null);
            }}
          >
            <option value="">اختر القسم</option>
            {sections?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* الشعبة */}
        <div>
          <Label>الشعبة</Label>
          <select
            value={departmentId || ""}
            onChange={(e) => {
              setDepartmentId(Number(e.target.value));
              setEmployeeId(null);
            }}
            disabled={!sectionId}
          >
            <option value="">اختر الشعبة</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* الموظف */}
        <div>
          <Label>الموظف</Label>
          <select
            value={employeeId || ""}
            onChange={(e) => setEmployeeId(Number(e.target.value))}
            disabled={!departmentId}
          >
            <option value="">اختر الموظف</option>
            {employees?.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        {/* تاريخ البداية */}
        <div>
          <Label>تاريخ البداية</Label>
          <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
        </div>

        {/* تاريخ النهاية */}
        <div>
          <Label>تاريخ النهاية</Label>
          <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
        </div>

        {/* السبب */}
        <div>
          <Label>السبب (اختياري)</Label>
          <Input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <Button onClick={handleCreateVacation} className="w-full">إضافة الإجازة</Button>
      </CardContent>
    </Card>
  );
}
