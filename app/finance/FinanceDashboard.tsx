"use client";

import { Course, FinanceTransaction, Group, GroupStudent, Teacher } from "@/types";
import { createClient } from "@/utils/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FinanceDashboardProps {
  teachers: Teacher[];
  courses: Course[];
  groups: Group[];
  groupStudents: GroupStudent[];
  transactions: FinanceTransaction[];
  hasFinanceTable: boolean;
}

const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun"];
const formatMoney = (value: number) => `${value.toLocaleString()} so'm`;

export default function FinanceDashboard({
  teachers,
  courses,
  groups,
  groupStudents,
  transactions,
  hasFinanceTable,
}: FinanceDashboardProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("income");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kurs to'lovlari");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">("all");
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const coursePriceById = new Map(courses.map((course) => [course.id, Number(course.price)]));
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const expectedIncome = groupStudents.reduce((total, item) => {
    const group = groupById.get(item.group_id);
    return total + (group ? coursePriceById.get(group.cours_id) || 0 : 0);
  }, 0);
  const teacherExpense = teachers
    .filter((teacher) => teacher.status)
    .reduce((total, teacher) => total + Number(teacher.salary || 0), 0);
  const transactionIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount), 0);
  const transactionExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount), 0);
  const totalIncome = transactionIncome || expectedIncome;
  const totalExpense = transactionExpense || teacherExpense;
  const profit = totalIncome - totalExpense;
  const cashBalance = profit + transactionIncome * 0.25;

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const matchesTab = activeTab === "all" || item.type === activeTab;
        const matchesSearch =
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
      }),
    [activeTab, search, transactions]
  );

  const lineData = months.map((month, index) => ({
    month,
    income: Math.round(totalIncome * (0.42 + index * 0.1 + (index % 2 ? 0.08 : 0))),
    expense: Math.round(totalExpense * (0.4 + index * 0.08)),
  }));

  const pieData = [
    { name: "Kurs to'lovlari", value: totalIncome * 0.7, color: "#4F46E5" },
    { name: "Qo'shimcha tushum", value: totalIncome * 0.2, color: "#06B6D4" },
    { name: "Boshqa", value: totalIncome * 0.1, color: "#10B981" },
  ];

  const resetForm = () => {
    setType("income");
    setTitle("");
    setCategory("Kurs to'lovlari");
    setPaymentMethod("Karta");
    setAmount("");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("finance_transactions").insert({
        title,
        category,
        type,
        payment_method: paymentMethod,
        amount: Number(amount),
      });

      if (error) throw error;
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Jami daromad", value: totalIncome, hint: "+12%", color: "text-emerald-600" },
    { label: "Jami xarajat", value: totalExpense, hint: "-8%", color: "text-rose-600" },
    { label: "Sof foyda", value: profit, hint: "+10%", color: profit >= 0 ? "text-emerald-600" : "text-rose-600" },
    { label: "Kassa qoldig'i", value: cashBalance, hint: "joriy", color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Moliya</h1>
          <p className="text-slate-500 mt-1">Daromad, xarajat va to'lov operatsiyalari</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-3 bg-indigo-600 text-white rounded-2xl flex items-center gap-2 hover:bg-indigo-500 transition cursor-pointer"
        >
          <FiPlus /> To'lov qo'shish
        </button>
      </div>

      {!hasFinanceTable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          Finance jadvali topilmadi. Statistikalar hisoblangan qiymatlar bilan ko'rsatilmoqda.
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        {stats.map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <h2 className={`text-2xl font-bold mt-3 ${item.color}`}>{formatMoney(item.value)}</h2>
            <p className="text-xs text-slate-500 mt-2">{item.hint} o'tgan oyga nisbatan</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Daromad dinamikasi</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
              <option>Oxirgi 6 oy</option>
            </select>
          </div>
          <div className="h-72 min-h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Line type="monotone" dataKey="income" stroke="#4F46E5" strokeWidth={4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Daromad manbalari</h2>
          <div className="relative h-64 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={68} outerRadius={103} paddingAngle={4} stroke="none">
                  {pieData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <h3 className="text-2xl font-bold text-slate-900">{Math.round(totalIncome / 1000000)}M</h3>
              <p className="text-xs text-slate-500">daromad</p>
            </div>
          </div>
          <div className="space-y-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold">{Math.round((item.value / Math.max(totalIncome, 1)) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex gap-2">
            {[
              { key: "all", label: "Barchasi" },
              { key: "income", label: "Daromadlar" },
              { key: "expense", label: "Xarajatlar" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-sm cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Qidiruv..."
            className="w-80 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500"
          />
        </div>

        <table className="w-full text-center">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="py-4 px-6 font-medium">Sana</th>
              <th className="py-4 px-6 font-medium">Tavsif</th>
              <th className="py-4 px-6 font-medium">Kategoriya</th>
              <th className="py-4 px-6 font-medium">To'lov turi</th>
              <th className="py-4 px-6 font-medium">Miqdor</th>
              <th className="py-4 px-6 font-medium">Amal</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="py-5 px-6 text-slate-600">
                  {new Date(item.created_at).toLocaleDateString("en-GB")}
                </td>
                <td className="py-5 px-6 font-medium">{item.title}</td>
                <td className="py-5 px-6 text-slate-600">{item.category}</td>
                <td className="py-5 px-6 text-slate-600">{item.payment_method}</td>
                <td className={`py-5 px-6 font-semibold ${item.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                  {item.type === "income" ? "+" : "-"} {formatMoney(Number(item.amount))}
                </td>
                <td className="py-5 px-6">
                  <button
                    disabled={isLoading}
                    onClick={() => handleDelete(item.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="p-10 text-center text-slate-500">Operatsiyalar topilmadi</div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-4xl bg-white p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Yangi operatsiya</h2>
                  <p className="text-slate-500 mt-1">Daromad yoki xarajatni kiriting</p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  X
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setType("income")}
                    className={`py-3 rounded-2xl cursor-pointer ${type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100"}`}
                  >
                    Daromad
                  </button>
                  <button
                    onClick={() => setType("expense")}
                    className={`py-3 rounded-2xl cursor-pointer ${type === "expense" ? "bg-rose-50 text-rose-600" : "bg-slate-100"}`}
                  >
                    Xarajat
                  </button>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tavsif"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Kategoriya"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option>Karta</option>
                  <option>Naqd</option>
                  <option>Bank</option>
                </select>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="Miqdor"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  disabled={isLoading || !title || !amount}
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
