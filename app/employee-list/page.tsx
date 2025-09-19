"use client";

import { trpc } from "../../lib/trpc/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function EmployeesListPage() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // جلب الأقسام
  const { data: sections } = trpc.org.getSections.useQuery();

  // جلب الشعب حسب القسم
  const { data: departments } = trpc.org.getDepartmentsBySection.useQuery(
    selectedSection!,
    { enabled: !!selectedSection }
  );

 // جلب الموظفين حسب الشعبة
const { data: employees, isLoading } = trpc.org.getEmployeeByDepartment.useQuery(
  { departmentId: selectedDepartment! }, 
  { enabled: !!selectedDepartment }    
);

  // حذف موظف
 const deleteEmployee = trpc.employee.deleteEmployee.useMutation({
  onSuccess: () => {
    if (selectedDepartment) {
      utils.org.getEmployeeByDepartment.invalidate({ departmentId: selectedDepartment });
    }
  },
});


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold mb-4">قائمة الموظفين</h1>

      {/* اختيار القسم */}
      <div>
        <h2 className="font-semibold mb-2">الأقسام</h2>
        <div className="flex gap-2 flex-wrap">
          {sections?.map((sect) => (
            <Button
              key={sect.id}
              variant={selectedSection === sect.id ? "secondary" : "outline"}
              onClick={() => {
                setSelectedSection(sect.id);
                setSelectedDepartment(null); // نفرغ الشعبة عند تغيير القسم
              }}
            >
              {sect.name}
            </Button>
          ))}
        </div>
      </div>

      {/*  اختيار الشعبة */}
      {departments && (
        <div>
          <h2 className="font-semibold mb-2">الشُعب</h2>
          <div className="flex gap-2 flex-wrap">
            {departments.map((dept) => (
              <Button
                key={dept.id}
                variant={selectedDepartment === dept.id ? "secondary" : "outline"}
                onClick={() => setSelectedDepartment(dept.id)}
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* عرض الموظفين */}
      {isLoading && <p>جاري التحميل...</p>}
      {employees && (
        <div>
          <h2 className="font-semibold mb-2">الموظفين</h2>
          <ul className="space-y-2">
            {employees.map((emp) => (
              <li key={emp.id} className="flex items-center gap-2">
                {/* زر عرض البروفايل */}
                <Button
                  variant="outline"
                  onClick={() => router.push(`/employee-profile/${emp.id}`)}
                >
                  {emp.name}
                </Button>

                {/* زر التعديل */}
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/employee-profile/${emp.id}?edit=true`)}
                >
                  ✏️ تعديل
                </Button>

                {/* زر الحذف */}
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
                      deleteEmployee.mutate({ id: emp.id });
                    }
                  }}
                >
                  🗑️ حذف
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
