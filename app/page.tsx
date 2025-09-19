/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../lib/trpc/client"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = trpc.user.login.useMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginMutation.mutateAsync({ username, password });

      // تخزين التوكن في cookie
      Cookies.set("token", result.token, { expires: 1, sameSite: "lax" });

      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (err: any) {
      console.error("خطأ:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-center text-xl font-semibold">تسجيل الدخول</h2>
        <div className="mb-3">
          <Input type="text" placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <Input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </div>
  );
}

