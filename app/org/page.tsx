"use client";

import { useState } from "react";
import { trpc } from "../../lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
export default function OrgPage() {
  const router = useRouter();
  // قسم جديد
  const [newSectionName, setNewSectionName] = useState("");
  // شعبة جديدة
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentSection, setNewDepartmentSection] = useState<number | null>(null);
  // تعديل قسم أو شعبة
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState("");
  // القسم والشعبة المحددة للعرض
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const utils = trpc.useUtils();
  // Queries
  const { data: sections } = trpc.org.getSections.useQuery();
  const { data: departments } = trpc.org.getDepartmentsBySection.useQuery(
    selectedSection || 0,
    { enabled: !!selectedSection }
  );
const { data: employees } = trpc.org.getEmployeeByDepartment.useQuery(
  { departmentId: selectedDepartment ?? -1 }, // رقم افتراضي غير موجود
  { 
    enabled: selectedDepartment !== null && selectedDepartment !== -1 
  }
);


  // Mutations
  const addSection = trpc.org.addSections.useMutation({
    onSuccess: () => {
      utils.org.getSections.invalidate();
      setNewSectionName("");
    },
  });

  const addDepartment = trpc.org.addDepartment.useMutation({
    onSuccess: () => {
      if (newDepartmentSection) {
        utils.org.getDepartmentsBySection.invalidate(newDepartmentSection);
        setNewDepartmentName("");
        setNewDepartmentSection(null);
      }
    },
  });

  const updateSection = trpc.org.updateSection.useMutation({
    onSuccess: () => {
      utils.org.getSections.invalidate();
      setEditingSectionId(null);
      setEditingSectionName("");
    },
  });

  const updateDepartment = trpc.org.updateDepartment.useMutation({
    onSuccess: () => {
      if (selectedSection) utils.org.getDepartmentsBySection.invalidate(selectedSection);
      setEditingDepartmentId(null);
      setEditingDepartmentName("");
    },
  });

  const deleteSection = trpc.org.deleteSection.useMutation({
    onSuccess: () => utils.org.getSections.invalidate(),
  });

  const deleteDepartment = trpc.org.deleteDepartment.useMutation({
    onSuccess: () => {
      if (selectedSection) utils.org.getDepartmentsBySection.invalidate(selectedSection);
    },
  });

  // Handlers
  const handleAddSection = () => {
    if (!newSectionName.trim()) return alert("❌ الرجاء إدخال اسم القسم");
    addSection.mutate({ name: newSectionName });
  };

  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) return alert("❌ الرجاء إدخال اسم الشعبة");
    if (!newDepartmentSection) return alert("❌ الرجاء اختيار القسم قبل إضافة الشعبة");
    addDepartment.mutate({
      name: newDepartmentName,
      sectionId: newDepartmentSection,
    });
  };

  const handleSectionSave = (id: number) => updateSection.mutate({ id, name: editingSectionName });
  const handleDepartmentSave = (id: number) => updateDepartment.mutate({ id, name: editingDepartmentName });

  return (
    <div className="p-6 space-y-6">
      {/* إضافة قسم */}
      <div className="flex gap-2">
        <Input
          placeholder="اسم القسم الجديد"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
        />
        <Button onClick={handleAddSection}>➕ إضافة قسم</Button>
      </div>

      {/* إضافة شعبة */}
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="اسم الشعبة الجديدة"
          value={newDepartmentName}
          onChange={(e) => setNewDepartmentName(e.target.value)}
        />
        <select
          value={newDepartmentSection || ""}
          onChange={(e) => setNewDepartmentSection(Number(e.target.value))}
          className="border rounded p-2"
        >
          <option value="">اختر القسم</option>
          {sections?.map((sect) => (
            <option key={sect.id} value={sect.id}>{sect.name}</option>
          ))}
        </select>
        <Button onClick={handleAddDepartment}>➕ إضافة شعبة</Button>
      </div>

      {/* الأقسام */}
      <div>
        <h2 className="font-semibold mt-6">الأقسام</h2>
        <div className="flex gap-2 flex-wrap">
          {sections?.map((sect) =>
            editingSectionId === sect.id ? (
              <div key={sect.id} className="flex gap-2">
                <Input
                  value={editingSectionName}
                  onChange={(e) => setEditingSectionName(e.target.value)}
                />
                <Button onClick={() => handleSectionSave(sect.id)}>حفظ</Button>
                <Button onClick={() => setEditingSectionId(null)}>إلغاء</Button>
              </div>
            ) : (
              <div key={sect.id} className="flex items-center gap-1">
                <Button onClick={() => {
                  setSelectedSection(sect.id);
                  setSelectedDepartment(null); // تصفير الشعبة المختارة
                }}>
                  {sect.name}
                </Button>
                <span
                  onClick={() => {
                    setEditingSectionId(sect.id);
                    setEditingSectionName(sect.name);
                  }}
                  className="text-sm text-yellow-500 cursor-pointer"
                >
                  ✏️
                </span>
                <Button
                  variant="destructive"
                  onClick={() => confirm("هل أنت متأكد من حذف هذا القسم؟") && deleteSection.mutate({ id: sect.id })}
                >
                  🗑️
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {/* الشعب */}
      {departments && selectedSection && (
        <div>
          <h2 className="font-semibold mt-4">الشعب</h2>
          <div className="flex gap-2 flex-wrap">
            {departments.map((dept) =>
              editingDepartmentId === dept.id ? (
                <div key={dept.id} className="flex gap-2">
                  <Input
                    value={editingDepartmentName}
                    onChange={(e) => setEditingDepartmentName(e.target.value)}
                  />
                  <Button onClick={() => handleDepartmentSave(dept.id)}>حفظ</Button>
                  <Button onClick={() => setEditingDepartmentId(null)}>إلغاء</Button>
                </div>
              ) : (
                <div key={dept.id} className="flex items-center gap-1">
                  <Button onClick={() => setSelectedDepartment(dept.id)}>
                    {dept.name}
                  </Button>
                  <span
                    onClick={() => {
                      setEditingDepartmentId(dept.id);
                      setEditingDepartmentName(dept.name);
                    }}
                    className="text-sm text-yellow-500 cursor-pointer"
                  >
                    ✏️
                  </span>
                  <Button
                    variant="destructive"
                    onClick={() => confirm("هل أنت متأكد من حذف هذه الشعبة؟") && deleteDepartment.mutate({ id: dept.id })}
                  >
                    🗑️
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* زر إضافة موظف */}
      <Button
        onClick={() => router.push("/employee-form")}
        className="bg-blue-500 text-white mt-4"
      >
        ➕ إضافة موظف
      </Button>

      {/* الموظفين */}
      {employees && selectedDepartment && (
  <div>
    <h2 className="font-semibold mt-4">الموظفين</h2>
    <div className="flex gap-2 flex-wrap">
      {employees
        .filter(emp => emp.departmentId === selectedDepartment) // فقط الموظفين التابعين للشعبة
        .map(emp => (
          <Button
            key={emp.id}
            onClick={() => router.push(`/employee-profile/${emp.id}`)} // يروح للبروفايل
          >
            {emp.name} 
          </Button>
        ))}
    </div>
  </div>
)}

    </div>
  );
}
