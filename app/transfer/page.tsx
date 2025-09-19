"use client";

import { useState } from "react";
import { trpc } from "../../lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TransferPage() {
  const [mode, setMode] = useState<"employee" | "department">("employee");

  // =================== نقل موظف ===================
  const [fromSection, setFromSection] = useState<number | null>(null);
  const [fromDepartment, setFromDepartment] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [toSection, setToSection] = useState<number | null>(null);
  const [toDepartment, setToDepartment] = useState<number | null>(null);

  // =================== نقل شعبة ===================
  const [deptToMove, setDeptToMove] = useState<number | null>(null);
  const [newSectionForDept, setNewSectionForDept] = useState<number | null>(
    null
  );

  // =================== جلب البيانات ===================
  const { data: sections } = trpc.org.getSections.useQuery();
  const { data: departmentsFrom } = trpc.org.getDepartmentsBySection.useQuery(
    fromSection || 0,
    { enabled: !!fromSection }
  );
  const { data: departmentsTo } = trpc.org.getDepartmentsBySection.useQuery(
    toSection || 0,
    { enabled: !!toSection }
  );
  const { data: employees } = trpc.org.getEmployeeByDepartment.useQuery(
    { departmentId: fromDepartment || 0 },
    { enabled: !!fromDepartment }
  );
  const { data: allDepartments } = trpc.org.getAllDepartments.useQuery();

  const transferEmployee = trpc.org.transferEmployee.useMutation();
  const transferDepartment = trpc.org.transferDepartment.useMutation();

  // =================== Handlers ===================
  const handleEmployeeTransfer = async () => {
    if (!employeeId || !toSection || !toDepartment) return;

    await transferEmployee.mutateAsync({
      employeeId,
      newSectionId: toSection,
      newDepartmentId: toDepartment,
    });

    alert("✅ تم نقل الموظف بنجاح");
  };

  const handleDepartmentTransfer = () => {
    if (!deptToMove || !newSectionForDept) return;

    transferDepartment.mutate({
      departmentId: deptToMove,
      newSectionId: newSectionForDept,
    });

    alert("✅ تم نقل الشعبة بنجاح");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">🔀 صفحة النقل</h2>

      {/* اختيار الوضع */}
      <div className="flex gap-4">
        <Button
          variant={mode === "employee" ? "default" : "outline"}
          onClick={() => setMode("employee")}
        >
          نقل موظف
        </Button>
        <Button
          variant={mode === "department" ? "default" : "outline"}
          onClick={() => setMode("department")}
        >
          نقل شعبة كاملة
        </Button>
      </div>

      {/* ========== نقل موظف ========== */}
      {mode === "employee" && (
        <div className="space-y-4">
          <h3 className="font-semibold">🚹 نقل موظف</h3>

          <div>
            <Label>القسم الحالي</Label>
            <select
              className="border rounded p-2 w-full"
              value={fromSection || ""}
              onChange={(e) => setFromSection(Number(e.target.value))}
            >
              <option value="">اختر القسم</option>
              {sections?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>الشعبة الحالية</Label>
            <select
              className="border rounded p-2 w-full"
              value={fromDepartment || ""}
              onChange={(e) => setFromDepartment(Number(e.target.value))}
            >
              <option value="">اختر الشعبة</option>
              {departmentsFrom?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>الموظف</Label>
            <select
              className="border rounded p-2 w-full"
              value={employeeId || ""}
              onChange={(e) => setEmployeeId(Number(e.target.value))}
            >
              <option value="">اختر الموظف</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <hr />

          <div>
            <Label>القسم الجديد</Label>
            <select
              className="border rounded p-2 w-full"
              value={toSection || ""}
              onChange={(e) => setToSection(Number(e.target.value))}
            >
              <option value="">اختر القسم الجديد</option>
              {sections?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>الشعبة الجديدة</Label>
            <select
              className="border rounded p-2 w-full"
              value={toDepartment || ""}
              onChange={(e) => setToDepartment(Number(e.target.value))}
            >
              <option value="">اختر الشعبة الجديدة</option>
              {departmentsTo?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleEmployeeTransfer} className="w-full">
            تأكيد نقل الموظف
          </Button>
        </div>
      )}

      {/* ========== نقل شعبة ========== */}
      {mode === "department" && (
        <div className="space-y-4">
          <h3 className="font-semibold">🏢 نقل شعبة كاملة</h3>

          <div>
            <Label>الشعبة المراد نقلها</Label>
            <select
              className="border rounded p-2 w-full"
              value={deptToMove || ""}
              onChange={(e) => setDeptToMove(Number(e.target.value))}
            >
              <option value="">اختر الشعبة</option>
              {allDepartments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>القسم الجديد</Label>
            <select
              className="border rounded p-2 w-full"
              value={newSectionForDept || ""}
              onChange={(e) => setNewSectionForDept(Number(e.target.value))}
            >
              <option value="">اختر القسم الجديد</option>
              {sections?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleDepartmentTransfer} className="w-full">
            تأكيد نقل الشعبة
          </Button>
        </div>
      )}
    </div>
  );
}
