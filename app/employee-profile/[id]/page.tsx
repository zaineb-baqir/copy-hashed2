"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../../../lib/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function EmployeeProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEdit = searchParams.get("edit") === "true";
  const id = Number(params.id);

  const { data, isLoading } = trpc.employee.getById.useQuery(id);
  const { data: vacationBalance } = trpc.vacation.getEmployeeBalance.useQuery({ employeeId: id });

  const updateEmployee = trpc.employee.update.useMutation({
    onSuccess: () => router.push(`/employee-profile/${id}`),
  });

  // حالة الفورم
  const [name, setName] = useState("");
  const [privilege, setPrivilege] = useState("");
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [workingDays, setWorkingDays] = useState<{ id?: number; day: string; startshift: string; endshift: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vacation, setVacation] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeallowances, setTimeAllowances] = useState<any[]>([]);

  // جلب الأقسام والشعب
  const { data: sections } = trpc.org.getSections.useQuery();
  const { data: departments } = trpc.org.getDepartmentsBySection.useQuery(sectionId || 0, {
    enabled: !!sectionId,
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setPrivilege(data.privilege);
      setSectionId(data.sectionId);
      setDepartmentId(data.departmentId);
      setWorkingDays(data.workingDays);
      setVacation(data.vacation);
      setTimeAllowances(data.timeallowances);
    }
  }, [data]);

  if (isLoading) return <p>جاري التحميل...</p>;
  if (!data) return <p>الموظف غير موجود</p>;

  // دالة تحويل ISO إلى HH:MM:SS
  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // حساب مجموع الساعات المتبقية من 4 ساعات لكل الزمنيات
  let totalHours = 0;
  timeallowances.forEach((t) => {
    const start = new Date(`1970-01-01T${t.startTime}`);
    const end = new Date(`1970-01-01T${t.endTime}`);
    totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  });
  const remainingHours = Math.max(0, 4 - totalHours);

  const handleSave = () => {
    updateEmployee.mutate({
      id,
      name,
      privilege,
      sectionId,
      departmentId,
      workingDays,
      vacation,
      timeallowances,
    });
  };

  // وضع التعديل
  if (isEdit) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">تعديل الموظف</h1>

        <div className="space-y-4">
          <div>
            <label>الاسم</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full rounded" />
          </div>

          <div>
            <label>الصلاحية</label>
            <input value={privilege} onChange={(e) => setPrivilege(e.target.value)} className="border p-2 w-full rounded" />
          </div>

          <div>
            <label>القسم</label>
            <select value={sectionId || ""} onChange={(e) => setSectionId(Number(e.target.value))} className="border p-2 w-full rounded">
              <option value="">اختر القسم</option>
              {sections?.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>

          <div>
            <label>الشعبة</label>
            <select value={departmentId || ""} onChange={(e) => setDepartmentId(Number(e.target.value))} className="border p-2 w-full rounded">
              <option value="">اختر الشعبة</option>
              {departments?.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>

          {/* أيام العمل */}
          <div>
            <h2 className="font-semibold">أيام العمل</h2>
            {workingDays.map((wd, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input value={wd.day} onChange={(e) => { const newWD = [...workingDays]; newWD[idx].day = e.target.value; setWorkingDays(newWD); }} className="border p-1 w-24" />
                <input value={wd.startshift} onChange={(e) => { const newWD = [...workingDays]; newWD[idx].startshift = e.target.value; setWorkingDays(newWD); }} type="time" className="border p-1" />
                <input value={wd.endshift} onChange={(e) => { const newWD = [...workingDays]; newWD[idx].endshift = e.target.value; setWorkingDays(newWD); }} type="time" className="border p-1" />
                <Button variant="destructive" onClick={() => setWorkingDays(workingDays.filter((_, i) => i !== idx))}>حذف</Button>
              </div>
            ))}
            <Button onClick={() => setWorkingDays([...workingDays, { day: "", startshift: "08:00", endshift: "16:00" }])}>إضافة يوم</Button>
          </div>

          {/* حفظ / إلغاء */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>حفظ</Button>
            <Button variant="outline" onClick={() => router.push(`/employee-profile/${id}`)}>إلغاء</Button>
          </div>
        </div>
      </div>
    );
  }

  // وضع العرض فقط
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <Button onClick={() => router.push(`/employee-profile/${id}?edit=true`)}>تعديل</Button>
      </div>
      <p><strong>الصلاحية:</strong> {data.privilege}</p>
      <p><strong>القسم:</strong> {data.departmentName}</p>
      <p><strong>الشعبة:</strong> {data.sectionName}</p>

      <hr />

      <h2 className="text-xl font-semibold">أيام العمل</h2>
      {data.workingDays.length === 0 ? (<p>لا توجد أيام عمل</p>) : (
        <ul>
          {data.workingDays.map((wd) => <li key={wd.id}>{wd.day}: {wd.startshift} - {wd.endshift}</li>)}
        </ul>
      )}

      <hr />

      <h2 className="text-xl font-semibold">الإجازات</h2>
      <p className="mb-2">رصيد الإجازات الحالي: {vacationBalance ?? 0} يوم</p>
      {data.vacation.length === 0 ? (<p>لا توجد إجازات</p>) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>السبب</TableCell>
              <TableCell>من</TableCell>
              <TableCell>إلى</TableCell>
              <TableCell>الرصيد المتبقي بعد الإجازة</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.vacation.map((v, idx) => {
              // حساب رصيد متبقي لكل إجازة
              let balanceAfter = vacationBalance ?? 0;
              for (let i = 0; i <= idx; i++) {
                const start = new Date(data.vacation[i].dateStart);
                const end = new Date(data.vacation[i].dateEnd);
                const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                balanceAfter -= days;
              }
              return (
                <TableRow key={v.id}>
                  <TableCell>{v.reason}</TableCell>
                  <TableCell>{formatDateTime(v.dateStart)}</TableCell>
                  <TableCell>{formatDateTime(v.dateEnd)}</TableCell>
                  <TableCell>{balanceAfter}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">الزمنيات (Time Allowance)</h2>
          <p className="mb-2">المتبقي لهذا الشهر: {remainingHours.toFixed(2)} ساعة</p>
          {timeallowances.length === 0 ? (<p>لا توجد زمنيات</p>) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>السبب</TableCell>
                  <TableCell>من</TableCell>
                  <TableCell>إلى</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeallowances.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.reason}</TableCell>
                    <TableCell>{t.startTime}</TableCell>
                    <TableCell>{t.endTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}