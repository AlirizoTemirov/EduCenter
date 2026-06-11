"use client";

import { useState } from "react";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-center bg-slate-900 text-white p-16">
        <h1 className="text-5xl font-bold">EduCenter</h1>

        <p className="mt-5 text-slate-300 text-lg">
          O'quv markazi boshqaruv tizimi.
        </p>

        <div className="mt-10 space-y-4">
          <div className="bg-white/5 p-5 rounded-2xl">Talabalar boshqaruvi</div>

          <div className="bg-white/5 p-5 rounded-2xl">To'lov nazorati</div>

          <div className="bg-white/5 p-5 rounded-2xl">Davomat monitoringi</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold">Kirish</h2>

          <p className="text-slate-500 mt-2">Admin hisobiga kiring</p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6">
            <label className="text-sm text-slate-600">Email</label>

            <div className="relative mt-2">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@gmail.com"
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm text-slate-600">Parol</label>

            <div className="relative mt-2">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="********"
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </div>
      </div>
    </div>
  );
}
