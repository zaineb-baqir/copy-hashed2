/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { trpc } from "../../../lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdjustBalancePage() {
  const utils = trpc.useContext();

  const [employeeName, setEmployeeName] = useState<string>("");
  const [adjustment, setAdjustment] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // جلب كل الموظفين
  const { data: employees } = trpc.employee.getAll.useQuery();

  // اقتراحات البحث
  const filteredEmployees = employees?.filter(e =>
    e.name.toLowerCase().includes(employeeName.toLowerCase())
  ) || [];

  // تحديث employeeId عند اختيار اسم
  useEffect(() => {
    const emp = employees?.find(e => e.name.toLowerCase() === employeeName.toLowerCase());
    setEmployeeId(emp ? emp.id : null);
  }, [employeeName, employees]);

  // جلب رصيد الموظف الحالي عند تغييره
  const { data: balance, refetch: refetchBalance } = trpc.vacation.getEmployeeBalance.useQuery(
    { employeeId: employeeId || 0 },
    { enabled: !!employeeId }
  );

  // تعديل الرصيد
  const adjustBalanceMutation = trpc.vacation.adjustEmployeeBalance.useMutation({
    onSuccess: (data) => {
      setMessage(`✅ تم تعديل الرصيد بنجاح. الرصيد الجديد: ${data.newBalance}`);
      utils.vacation.getEmployeeBalance.invalidate();
    },
    onError: (err: any) => {
      setMessage("❌ خطأ: " + err.message);
    },
  });

  const handleAdjust = async () => {
    if (!employeeId) {
      alert("❌ الموظف غير موجود أو لم يتم إدخال الاسم بشكل صحيح");
      return;
    }
    await adjustBalanceMutation.mutateAsync({ employeeId, adjustment });
    setAdjustment(0);
    refetchBalance();
  };

  const handleSuggestionClick = (name: string) => {
    setEmployeeName(name);
    setShowSuggestions(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-4">✏️ تعديل رصيد الموظف</h2>

      {/* إدخال اسم الموظف مع Autocomplete */}
      <div className="relative">
        <Label htmlFor="employee">الموظف</Label>
        <Input
          id="employee"
          type="text"
          value={employeeName}
          onChange={(e) => {
            setEmployeeName(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="أدخل اسم الموظف"
          autoComplete="off"
        />
        {showSuggestions && employeeName && filteredEmployees.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-auto rounded shadow-md">
            {filteredEmployees.map(emp => (
              <li
                key={emp.id}
                onClick={() => handleSuggestionClick(emp.name)}
                className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
              >
                {emp.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {employeeId && balance !== undefined && (
        <div className="text-sm text-gray-600 mb-2">الرصيد الحالي: {balance} يوم</div>
      )}

      {/* تعديل الرصيد */}
      <div>
        <Label htmlFor="adjustment">تعديل الرصيد (+ لإضافة، - للخصم)</Label>
        <Input
          id="adjustment"
          type="number"
          value={adjustment}
          onChange={(e) => setAdjustment(Number(e.target.value))}
        />
      </div>

      <Button onClick={handleAdjust} className="w-full">
        تعديل الرصيد
      </Button>

      {message && <div className="font-bold text-blue-600">{message}</div>}
    </div>
  );
}
