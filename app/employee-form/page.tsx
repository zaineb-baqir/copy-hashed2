"use client";
import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmployeeFormPage() {
  const [firstName, setFirstName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [grandName, setGrandName] = useState("");
  const [fullName, setFullName] = useState("");

  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  const [sectionQuery, setSectionQuery] = useState("");
  const [departmentQuery, setDepartmentQuery] = useState("");

  const [day, setDay] = useState("الأحد");
  const [startShift, setStartShift] = useState("08:00");
  const [endShift, setEndShift] = useState("14:00");

  const [workingDays, setWorkingDays] = useState<
    { day: string; startShift: string; endShift: string; original?: { day: string; startShift: string; endShift: string } }[]
  >([]);

  const { data: sections } = trpc.org.getSections.useQuery();
  const { data: departments } = trpc.org.getDepartmentsBySection.useQuery(selectedSection || 0, {
    enabled: !!selectedSection,
  });

  const addEmployee = trpc.employee.create.useMutation();

  useEffect(() => {
    setFullName(`${firstName} ${fatherName} ${grandName}`);
  }, [firstName, fatherName, grandName]);

  // إضافة يوم عمل
  const addWorkingDay = () => {
    if (!day || !startShift || !endShift) return;
    setWorkingDays(prev => [...prev, { day, startShift, endShift, original: { day, startShift, endShift } }]);
  };

  // حذف يوم عمل
  const removeWorkingDay = (idx: number) => {
    setWorkingDays(prev => prev.filter((_, i) => i !== idx));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !selectedSection || !selectedDepartment) return;

    addEmployee.mutate({
      name: fullName,
      privilege: "employee",
      sectionId: selectedSection,
      departmentId: selectedDepartment,
      workingDays,
    });
  };

  const weekDays = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

  // فلترة للأوتوكومبليت
  const filteredSections = sections?.filter(s => s.name.includes(sectionQuery)) || [];
  const filteredDepartments = departments?.filter(d => d.name.includes(departmentQuery)) || [];

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">إدخال بيانات الموظف</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* الاسم الثلاثي */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>الاسم</Label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>اسم الأب</Label>
            <Input value={fatherName} onChange={e => setFatherName(e.target.value)} />
          </div>
          <div>
            <Label>اسم الجد</Label>
            <Input value={grandName} onChange={e => setGrandName(e.target.value)} />
          </div>
        </div>

        {/* القسم */}
        <div>
          <Label>القسم</Label>
          <Input
            value={sectionQuery}
            onChange={e => {
              setSectionQuery(e.target.value);
              const match = sections?.find(s => s.name === e.target.value);
              if (match) setSelectedSection(match.id);
            }}
            placeholder="اكتب لاختيار القسم"
            className="border rounded p-2 w-full"
            list="sections-list"
          />
          <datalist id="sections-list">
            {filteredSections.map(s => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        </div>

        {/* الشعبة */}
        <div>
          <Label>الشعبة</Label>
          <Input
            value={departmentQuery}
            onChange={e => {
              setDepartmentQuery(e.target.value);
              const match = departments?.find(d => d.name === e.target.value);
              if (match) setSelectedDepartment(match.id);
            }}
            placeholder="اكتب لاختيار الشعبة"
            className="border rounded p-2 w-full"
            list="departments-list"
          />
          <datalist id="departments-list">
            {filteredDepartments.map(d => (
              <option key={d.id} value={d.name} />
            ))}
          </datalist>
        </div>

        <hr className="my-4" />
        <h3 className="font-semibold">أيام العمل</h3>

        <div>
          <Label>اليوم</Label>
          <select value={day} onChange={e => setDay(e.target.value)} className="border rounded p-2 w-full">
            {weekDays.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>بداية الشفت</Label>
            <Input type="time" value={startShift} onChange={e => setStartShift(e.target.value)} />
          </div>
          <div>
            <Label>نهاية الشفت</Label>
            <Input type="time" value={endShift} onChange={e => setEndShift(e.target.value)} />
          </div>
        </div>

        <Button type="button" onClick={addWorkingDay} className="w-full">أضف يوم</Button>

        {workingDays.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">الأيام المضافة:</h4>
            <ul className="space-y-1">
              {workingDays.map((wd, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 border rounded p-2">
                  <span>{wd.day}: {wd.startShift} - {wd.endShift}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="destructive" onClick={() => removeWorkingDay(idx)}>حذف</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="submit" className="w-full mt-4" disabled={addEmployee.status === "pending"}>
          {addEmployee.status === "pending" ? "جاري الحفظ..." : "حفظ الموظف"}
        </Button>

        {addEmployee.status === "success" && <p className="text-green-600 mt-2">✅ تم حفظ الموظف بنجاح</p>}
        {addEmployee.status === "error" && <p className="text-red-600 mt-2">❌ حدث خطأ أثناء الحفظ</p>}
      </form>
    </div>
  );
}
