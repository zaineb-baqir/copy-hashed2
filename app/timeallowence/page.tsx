/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { trpc } from "../../lib/trpc/client";
import { Button } from "@/components/ui/button";

export default function TimeAllowancePage() {
  const [selectedSection, setSelectedSection] = useState<number | undefined>();
  const [sectionQuery, setSectionQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>();
  const [employeeQuery, setEmployeeQuery] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const utils = trpc.useContext();
  const { data: sections } = trpc.org.getSections.useQuery();
  const { data: departments } = trpc.org.getDepartmentsBySection.useQuery(
    selectedSection ?? 0,
    { enabled: !!selectedSection }
  );
  const { data: employees } = trpc.org.getEmployeeByDepartment.useQuery(
    { departmentId: selectedDepartment ?? 0 },
    { enabled: !!selectedDepartment }
  );
  const { data: balance } = trpc.timeAllowence.getBalance.useQuery(
    selectedEmployee ?? 0,
    { enabled: !!selectedEmployee }
  );

  const createTime = trpc.timeAllowence.create.useMutation({
    onSuccess: () => {
      if (selectedEmployee) utils.timeAllowence.getBalance.invalidate(selectedEmployee);
      setStartTime("");
      setEndTime("");
      setReason("");
      alert("تم تسجيل الوقت بنجاح");
    },
    onError: (err: any) => alert(err.message),
  });

  const handleSubmit = () => {
    if (!selectedSection || !selectedDepartment || !selectedEmployee || !startTime || !endTime) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createTime.mutate({
      sectionId: selectedSection,
      departmentId: selectedDepartment,
      employeeId: selectedEmployee,
      startTime,
      endTime,
      reason,
    });
  };

  // فلترة حسب الكتابة
  const filteredSections = sections?.filter(sec => sec.name.toLowerCase().includes(sectionQuery.toLowerCase()));
  const filteredDepartments = departments?.filter(dep => dep.name.toLowerCase().includes(departmentQuery.toLowerCase()));
  const filteredEmployees = employees?.filter(emp => emp.name.toLowerCase().includes(employeeQuery.toLowerCase()));

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">تسجيل الزمنية</h1>

      {/* القسم */}
      <div className="mb-3">
        <label>القسم:</label>
        <input
          value={sectionQuery}
          onChange={(e) => {
            setSectionQuery(e.target.value);
            const match = sections?.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
            setSelectedSection(match?.id);
            setSelectedDepartment(undefined);
            setDepartmentQuery("");
            setSelectedEmployee(undefined);
            setEmployeeQuery("");
          }}
          placeholder="اكتب أو اختر القسم"
        />
        <div className="border max-h-40 overflow-auto">
          {filteredSections?.map(sec => (
            <div
              key={sec.id}
              onClick={() => {
                setSelectedSection(sec.id);
                setSectionQuery(sec.name);
                setSelectedDepartment(undefined);
                setDepartmentQuery("");
                setSelectedEmployee(undefined);
                setEmployeeQuery("");
              }}
              className="p-1 hover:bg-gray-200 cursor-pointer"
            >
              {sec.name}
            </div>
          ))}
        </div>
      </div>

      {/* الشعبة */}
      <div className="mb-3">
        <label>الشعبة:</label>
        <input
          value={departmentQuery}
          onChange={(e) => {
            setDepartmentQuery(e.target.value);
            const match = departments?.find(d => d.name.toLowerCase() === e.target.value.toLowerCase());
            setSelectedDepartment(match?.id);
            setSelectedEmployee(undefined);
            setEmployeeQuery("");
          }}
          placeholder="اكتب أو اختر الشعبة"
          disabled={!selectedSection}
        />
        <div className="border max-h-40 overflow-auto">
          {filteredDepartments?.map(dep => (
            <div
              key={dep.id}
              onClick={() => {
                setSelectedDepartment(dep.id);
                setDepartmentQuery(dep.name);
                setSelectedEmployee(undefined);
                setEmployeeQuery("");
              }}
              className="p-1 hover:bg-gray-200 cursor-pointer"
            >
              {dep.name}
            </div>
          ))}
        </div>
      </div>

      {/* الموظف */}
      <div className="mb-3">
        <label>الموظف:</label>
        <input
          value={employeeQuery}
          onChange={(e) => {
            setEmployeeQuery(e.target.value);
            const match = employees?.find(emp => emp.name.toLowerCase() === e.target.value.toLowerCase());
            setSelectedEmployee(match?.id);
          }}
          placeholder="اكتب أو اختر الموظف"
          disabled={!selectedDepartment}
        />
        <div className="border max-h-40 overflow-auto">
          {filteredEmployees?.map(emp => (
            <div
              key={emp.id}
              onClick={() => {
                setSelectedEmployee(emp.id);
                setEmployeeQuery(emp.name);
              }}
              className="p-1 hover:bg-gray-200 cursor-pointer"
            >
              {emp.name}
            </div>
          ))}
        </div>
      </div>

      {/* الوقت */}
      <div className="mb-3">
        <label>وقت البداية:</label>
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
      </div>
      <div className="mb-3">
        <label>وقت النهاية:</label>
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
      </div>

      {/* السبب */}
      <div className="mb-3">
        <label>السبب:</label>
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="السبب" />
      </div>

      {/* الرصيد */}
      {balance && (
        <p className="mt-2 text-sm">
          رصيد الموظف: {balance.used} / {balance.allowed} ساعة، متبقي: {balance.remaining} ساعة
        </p>
      )}

      <Button onClick={handleSubmit} className="mt-4 w-full">
        تسجيل الزمنية
      </Button>
    </div>
  );
}
