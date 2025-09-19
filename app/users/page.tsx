// app/page.tsx
"use client";
import { trpc } from "../../lib/trpc/client";
import { useState } from "react";
export default function HomePage() {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const addUser = trpc.user.addUser.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate();
      setName("");
      setPassword("");
      alert("user added successfully");
    },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">User Management</h1>

      {/* Form */}
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="border px-2 py-1 rounded w-full"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "user" | "admin")}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => addUser.mutate({ name, password, role })}
          className="bg-blue-500 text-white px-3 py-1 rounded w-full"
        >
          Add User
        </button>
      </div>
    </div>
  );
}
