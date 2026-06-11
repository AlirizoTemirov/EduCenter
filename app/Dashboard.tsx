"use client";

import Link from "next/link";
import {
  Course,
  FinanceTransaction,
  Group,
  GroupStudent,
  Payment,
  Student,
  Teacher,
} from "@/types";
import { PiStudentFill } from "react-icons/pi";
import { LuBookOpen, LuSchool } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
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

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  groups: Group[];
  groupStudents: GroupStudent[];
  transactions: FinanceTransaction[];
  payments: Payment[];
}

const monthNames = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyun",
  "Iyul",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];
const formatMoney = (value: number) => `${value.toLocaleString()} so'm`;

export default function Dashboard({
  students,
  teachers,
  courses,
  groups,
  groupStudents,
  transactions,
  payments,
}: DashboardProps) {
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const studentById = new Map(students.map((student) => [student.id, student]));
  const transactionIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount), 0);
  const transactionExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount), 0);
  const paymentIncome = payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );
  const totalIncome = transactionIncome + paymentIncome;
  const totalExpense = transactionExpense;
  const profit = totalIncome - totalExpense;

  const now = new Date();
  const chartMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: monthNames[date.getMonth()],
      income: 0,
      expense: 0,
    };
  });
  const chartData = chartMonths.map((item) => ({ ...item }));

  payments.forEach((payment) => {
    const date = new Date(payment.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = chartData.find((item) => item.key === key);

    if (month) month.income += Number(payment.amount);
  });

  transactions.forEach((transaction) => {
    const date = new Date(transaction.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = chartData.find((item) => item.key === key);

    if (!month) return;

    if (transaction.type === "income") {
      month.income += Number(transaction.amount);
    } else {
      month.expense += Number(transaction.amount);
    }
  });

  const currentMonthPayments = payments.filter((payment) => {
    const date = new Date(payment.created_at);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
  const paidStudentIds = new Set(
    currentMonthPayments.map((payment) => payment.student_id)
  );
  const expectedStudentIds = new Set(
    groupStudents.map((item) => item.student_id)
  );
  const paidCount = [...expectedStudentIds].filter((id) =>
    paidStudentIds.has(id)
  ).length;
  const unpaidCount = Math.max(expectedStudentIds.size - paidCount, 0);

  const paymentData = [
    { name: "To'langan", value: paidCount, color: "#4F46E5" },
    { name: "Kutilmoqda", value: unpaidCount, color: "#F59E0B" },
  ].filter((item) => item.value > 0);

  const recentOperations = [
    ...transactions.map((item) => ({
      id: `transaction-${item.id}`,
      title: item.title,
      description: item.category,
      amount: Number(item.amount),
      type: item.type,
      date: item.created_at,
    })),
    ...payments.map((payment) => {
      const student = studentById.get(payment.student_id);
      const group = groupById.get(payment.group_id);

      return {
        id: `payment-${payment.id}`,
        title: student ? `${student.fullName} to'lovi` : "Talaba to'lovi",
        description: group?.name || "Guruh topilmadi",
        amount: Number(payment.amount),
        type: "income" as const,
        date: payment.created_at,
      };
    }),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const cards = [
    {
      href: "/students",
      label: "Talabalar",
      value: students.length,
      note: `${
        students.filter((student) => student.status).length
      } faol talaba`,
      icon: <PiStudentFill size={24} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      href: "/courses",
      label: "Kurslar",
      value: courses.length,
      note: `${groups.length} ta guruh`,
      icon: <LuBookOpen size={24} />,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      href: "/groups",
      label: "Guruhlar",
      value: groups.length,
      note: `${groups.filter((group) => group.status).length} faol guruh`,
      icon: <LuSchool size={24} />,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      href: "/teachers",
      label: "O'qituvchilar",
      value: teachers.length,
      note: `${
        teachers.filter((teacher) => teacher.status).length
      } band o'qituvchi`,
      icon: <FaChalkboardTeacher size={24} />,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8 pb-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bosh sahifa</h1>
        <p className="text-slate-500 mt-1">
          Umumiy ma'lumotlar va ko'rsatkichlar
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-4 hover:shadow-md transition">
              <div
                className={`w-14 h-14 rounded-2xl flex justify-center items-center ${card.color}`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="font-bold text-2xl mt-1">{card.value}</p>
                <p className="text-xs text-slate-500 mt-2">{card.note}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Moliyaviy ko'rsatkichlar
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Jami daromad</p>
            <h3 className="text-2xl font-bold mt-3 text-slate-900">
              {formatMoney(totalIncome)}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              To'lovlar va daromad operatsiyalari
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Jami xarajat</p>
            <h3 className="text-2xl font-bold mt-3 text-slate-900">
              {formatMoney(totalExpense)}
            </h3>
            <p className="text-sm text-rose-500 mt-2">
              Finance xarajat operatsiyalari
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Sof foyda</p>
            <h3
              className={`text-2xl font-bold mt-3 ${
                profit >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatMoney(profit)}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Daromad va xarajat farqi
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">
              Daromad statistikasi
            </h3>
            <Link
              href="/finance"
              className="text-sm text-indigo-600 hover:underline"
            >
              Moliya
            </Link>
          </div>
          <div className="h-72 min-h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ left: 0, right: 20, top: 10, bottom: 0 }}
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Number(value) / 1000000}M`}
                />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4F46E5"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#4F46E5" }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#F43F5E"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#F43F5E" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">
            To'lovlar holati
          </h3>
          <div className="relative h-64 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  stroke="none"
                >
                  {paymentData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} nafar`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <h3 className="text-2xl font-bold text-slate-900">
                {expectedStudentIds.size}
              </h3>
              <p className="text-xs text-slate-500">talaba</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {paymentData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold">{item.value} nafar</span>
              </div>
            ))}
            {paymentData.length === 0 && (
              <p className="text-sm text-slate-500">
                Bu oy uchun to'lov ma'lumoti yo'q
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-lg">So'nggi operatsiyalar</h3>
        <div className="space-y-4 mt-6">
          {recentOperations.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-slate-100 pb-3"
            >
              <div>
                <p className="text-slate-700">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.description} -{" "}
                  {new Date(item.date).toLocaleDateString("en-GB")}
                </p>
              </div>
              <span
                className={
                  item.type === "income" ? "text-emerald-500" : "text-rose-500"
                }
              >
                {item.type === "income" ? "+" : "-"}{" "}
                {formatMoney(Number(item.amount))}
              </span>
            </div>
          ))}
          {recentOperations.length === 0 && (
            <p className="text-slate-500">Hali operatsiyalar kiritilmagan</p>
          )}
        </div>
      </div>
    </div>
  );
}
