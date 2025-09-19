"use client";

import { trpc } from "../../lib/trpc/client";
import { useState } from "react";

export default function UsersPage() {
  const utils = trpc.useUtils();
  const usersQuery = trpc.user.getAll.useQuery();

  const updateUser = trpc.user.updateUser.useMutation({
    onSuccess: () => utils.user.getAll.invalidate(),
  });

  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => utils.user.getAll.invalidate(),
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");

  if (usersQuery.isLoading) return <p>جاري التحميل...</p>;
  if (usersQuery.error) return <p>خطأ: {usersQuery.error.message}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">قائمة المستخدمين</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Password</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersQuery.data?.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">
                {editId === user.id ? (
                  <input
                    className="border p-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : user.name}
              </td>
              <td className="border px-4 py-2">
                {editId === user.id ? (
                  <input
                    className="border p-1"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                ) : user.password}
              </td>
              <td className="border px-4 py-2">
                {editId === user.id ? (
                  <input
                    className="border p-1"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                ) : user.role}
              </td>
              <td className="border px-4 py-2 space-x-2">
                {editId === user.id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        updateUser.mutate({
                          id: user.id,
                          name: editName,
                          password: editPassword,
                          role: editRole,
                        });
                        setEditId(null);
                      }}
                    >
                      حفظ
                    </button>
                    <button
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                      onClick={() => setEditId(null)}
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        setEditId(user.id);
                        setEditName(user.name);
                        setEditPassword(user.password);
                        setEditRole(user.role);
                      }}
                    >
                      تعديل
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => deleteUser.mutate({ id: user.id })}
                    >
                      حذف
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
