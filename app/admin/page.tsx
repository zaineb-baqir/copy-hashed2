/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../lib/trpc/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function AdminDashboard() {
  const router = useRouter();
  const utils = trpc.useContext();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState({
    sections: [] as { id: number; name: string }[],
    departments: [] as { id: number; name: string; sectionId: number | null }[],
    employees: [] as { id: number; name: string; privilege: string; sectionId: number; departmentId: number }[],
    days: [] as { day: string; employeeId: number; employeeName: string }[],
  });
  const queryResult = trpc.org.search.useQuery(searchText, {
    enabled: !!searchText,
  });

 useEffect(() => {
  if (queryResult.data) {
    const fixedData = {
      ...queryResult.data,
      days: queryResult.data.days.map((d: any) => ({
        day: d.day,
        employeeId: (d as any).employeeId ?? 0,
        employeeName: (d as any).employeeName ?? "",
      })),
    };
    setSearchResults(fixedData);
  } else {
    setSearchResults({
      sections: [],
      departments: [],
      employees: [],
      days: [],
    });
  }
}, [queryResult.data]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* أزرار الأدمن */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        <button
          className="bg-blue-500 text-white py-4 px-6 rounded shadow hover:bg-blue-600 transition"
          onClick={() => router.push("/users")}
        >
          إضافة المستخدم
        </button>
        <button
          className="bg-purple-500 text-white py-4 px-6 rounded shadow hover:bg-gray-600 transition"
          onClick={() => router.push("/userList")}
        >
          قائمة المستخدمين
        </button>
        <button
          className="bg-green-500 text-white py-4 px-6 rounded shadow hover:bg-green-600 transition"
          onClick={() => router.push("/employee-form")}
        >
          إضافة الموظفين
        </button>
        <button
          className="bg-yellow-500 text-white py-4 px-6 rounded shadow hover:bg-yellow-600 transition"
          onClick={() => router.push("/employee-list")}
        >
          قائمة الموظفين
        </button>
        <button
          className="bg-purple-500 text-white py-4 px-6 rounded shadow hover:bg-purple-600 transition"
          onClick={() => router.push("/org")}
        >
          قائمة الأقسام والشعب
        </button>
        <button
          className="bg-gray-500 text-white py-4 px-6 rounded shadow hover:bg-gray-600 transition"
          onClick={() => router.push("/vacation")}
        >
          اجازات
        </button>
        <button
          className="bg-gray-500 text-white py-4 px-6 rounded shadow hover:bg-gray-600 transition"
          onClick={() => router.push("/info-system")}
        >
          معلومات النظام
        </button>
        <button
          className="bg-blue-500 text-white py-4 px-6 rounded shadow hover:bg-gray-600 transition"
          onClick={() => router.push("/timeallowence")}
        >
          زمنيات
        </button>
        <button
          className="bg-green-500 text-white py-4 px-6 rounded shadow hover:bg-green-600 transition"
          onClick={() => router.push("/transfer")}
        >
          نقل
        </button>
        <button
          className="bg-yellow-500 text-white py-4 px-6 rounded shadow hover:bg-green-600 transition"
          onClick={() => router.push("/admin/adjust-balance")}
        >
          تعديل رصيد الاجازات 
        </button>
      </div>

      {/* حقل البحث */}
      <div className="mb-6 max-w-md">
        <Label>بحث </Label>
        <Input
          type="text"
          placeholder="اكتب اسم الموظف، القسم، الشعبة أو يوم العمل"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* نتائج البحث */}
      <div className="space-y-4">
        {/* الأقسام */}
        {searchResults.sections.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-2">الأقسام</h2>
            <ul>
              {searchResults.sections.map((s) => (
                <li key={s.id}>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => router.push(`/org?sectionId=${s.id}`)}
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* الشعب */}
        {searchResults.departments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-2">الشُعب</h2>
            <ul>
              {searchResults.departments.map((d) => (
                <li key={d.id}>
                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => router.push(`/org?departmentId=${d.id}`)}
                  >
                    {d.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* الموظفين */}
        {searchResults.employees.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-2">الموظفين</h2>
            <ul>
              {searchResults.employees.map((emp) => (
                <li key={emp.id}>
                  <button
                    className="text-purple-600 hover:underline"
                    onClick={() => router.push(`/profile/${emp.id}`)}
                  >
                    {emp.name} - {emp.privilege}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* الأيام */}
        {searchResults.days.map((d) => (
  <div
    key={`${d.day}-${d.employeeId}`}
    className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
    onClick={() => router.push(`/profile/${d.employeeId}`)}
  >
    <Label>{d.day}</Label>
  </div>
))}

      </div>
    </div>
  );
}
