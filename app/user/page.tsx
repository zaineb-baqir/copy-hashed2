"use client";
import { useRouter } from "next/navigation";
export default function UserDashboard() {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* add employee*/}
        <button
          className="bg-green-500 text-white py-4 px-6 rounded shadow hover:bg-green-600 transition"
          onClick={() => router.push("/employee-form")}
        >
          إضافة الموظفين
        </button>
        {/* employee list*/}
        <button
          className="bg-yellow-500 text-white py-4 px-6 rounded shadow hover:bg-yellow-600 transition"
          onClick={() => router.push("/employee-list")}
        >
          قائمة الموظفين
        </button>

        {/* sections and department*/}
        <button
          className="bg-purple-500 text-white py-4 px-6 rounded shadow hover:bg-purple-600 transition"
          onClick={() => router.push("/org")}
        >
          قائمة الأقسام والشعب
        </button>
        {/*vacation */}
        <button
          className="bg-gray-500 text-white py-4 px-6 rounded shadow hover:bg-gray-600 transition"
          onClick={() => router.push("/vacation")}
        >
          اجازات
        </button>
        {/* timeallowence*/}
        <button
          className="bg-gray-500 text-white py-4 px-6 rounded shadow hover:bg-gray-600 transition"
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
      </div>
    </div>
  );
}
