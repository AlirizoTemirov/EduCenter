"use client";

import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { Course, Group, GroupStudent, Payment, Student } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePaymentStore } from "@/store/PaymentStore";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import { RiDeleteBin6Line } from "react-icons/ri";

interface PaymentsProps {
  students: Student[];
  groups: Group[];
  groupStudent: GroupStudent[];
  payments: Payment[];
  courses: Course[];
}

export default function PaymentTable({
  students,
  groups,
  groupStudent,
  payments,
  courses,
}: PaymentsProps) {
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    groupId,
    studentId,
    amount,
    method,
    note,
    isLoading,

    setGroupId,
    setStudentId,
    setAmount,
    setMethod,
    setNote,

    setLoading,
    reset,
  } = usePaymentStore();
  const supabase = createClient();
  const router = useRouter();

  const formatDate = (value: string) =>
    new Date(value)
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replaceAll("/", "-");

  const formatInputDate = (value: string) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getStudent = (id: string) =>
    students.find((student) => student.id === id);

  const getGroup = (id: string) => groups.find((group) => group.id === id);

  const getCourse = (group?: Group) =>
    group ? courses.find((course) => course.id === group.cours_id) : undefined;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("paymants").insert({
        student_id: studentId,
        group_id: groupId,
        amount: Number(amount),
        payment_method: method,
        note,
      });

      if (error) throw error;

      reset();
      setOpenPaymentModal(false);
      router.refresh();
    } catch (error) {
      console.log("PAYMENT ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      setDeleteLoading(true);

      const { error } = await supabase
        .from("paymants")
        .delete()
        .eq("id", selectedPayment.id);

      if (error) throw error;

      setDeleteModal(false);
      setSelectedPayment(null);
      router.refresh();
    } catch (error) {
      console.error("PAYMENT DELETE ERROR:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthPayments = payments.filter((payment) => {
    const date = new Date(payment.created_at);

    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const totalIncome = thisMonthPayments.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0
  );

  const paidStudents = new Set(
    thisMonthPayments.map((payment) => payment.student_id)
  ).size;

  const debtors = students.length - paidStudents;

  const filteredPayments = payments.filter((payment) => {
    const student = getStudent(payment.student_id);
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      student?.fullName.toLowerCase().includes(normalizedSearch) ||
      student?.phone.includes(normalizedSearch);
    const matchesGroup = !filterGroupId || payment.group_id === filterGroupId;
    const matchesDate =
      !filterDate || formatInputDate(payment.created_at) === filterDate;

    return matchesSearch && matchesGroup && matchesDate;
  });

  const selectedStudent = selectedPayment
    ? getStudent(selectedPayment.student_id)
    : null;
  const selectedGroup = selectedPayment
    ? getGroup(selectedPayment.group_id)
    : null;
  const selectedCourse = getCourse(selectedGroup || undefined);
  const selectedStudentPayments = selectedStudent
    ? payments
        .filter((payment) => payment.student_id === selectedStudent.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    : [];
  const selectedLastPayment = selectedStudentPayments[0];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-bold">To'lovlar</h1>
        <button
          onClick={() => setOpenPaymentModal(true)}
          className="px-3 py-2 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-400 transition"
        >
          + Yangi to'lov
        </button>
      </div>
      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Jami tushum (oy)</p>
          <h1 className="text-2xl font-bold mt-3">
            {totalIncome.toLocaleString()} <span className="text-xl">so'm</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">To'laganlar</p>
          <h1 className="text-2xl font-bold mt-3">
            {paidStudents} <span className="text-xl">ta</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Qarzdorlar</p>
          <h1 className="text-2xl font-bold mt-3">
            {debtors} <span className="text-xl">ta</span>
          </h1>
        </div>
      </div>

      <div className="bg-white mt-5 rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-70">
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Talaba nomi yoki telefon..."
                className=" w-75 h-12  pl-11  pr-4  rounded-2xl border border-slate-200 outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Group Filter */}
            <select
              value={filterGroupId}
              onChange={(e) => setFilterGroupId(e.target.value)}
              className="h-12 cursor-pointer  px-4  rounded-2xl  border  border-slate-200  outline-none  focus:border-blue-500  min-w-45"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            {/* Date */}
            <input
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              type="date"
              className=" h-12  px-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setSearch("");
              setFilterGroupId("");
              setFilterDate("");
            }}
            className="h-12 px-5 cursor-pointer rounded-2xl bg-slate-100 hover:bg-slate-200  transition  flex  items-center  gap-2"
          >
            <IoClose size={18} />
            Tozalash
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden mt-10">
        <table className="w-full text-center">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="py-4 px-6 font-medium">#</th>
              <th className="py-4 px-6 font-medium">Ism familiya</th>
              <th className="py-4 px-6 font-medium">Guruh</th>
              <th className="py-4 px-6 font-medium">Summa</th>
              <th className="py-4 px-6 font-medium">To'lov sanasi</th>
              <th className="py-4 px-6 font-medium">Holat</th>
              <th className="py-4 px-6 font-medium">Amallar</th>
            </tr>
          </thead>

          <tbody>
            {filteredPayments.map((payment, index) => {
              const student = getStudent(payment.student_id);

              const group = getGroup(payment.group_id);

              return (
                <tr
                  key={payment.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-5 px-6">{index + 1}</td>
                  <td className="py-5 px-6 font-medium">{student?.fullName}</td>
                  <td className="py-5 px-6 text-slate-600">{group?.name}</td>
                  <td className="py-5 px-6 text-slate-600">
                    {parseInt(payment.amount).toLocaleString()}
                  </td>
                  <td className="py-5 px-6 text-slate-600">
                    {formatDate(payment.created_at)}
                  </td>
                  <td className="py-5 px-6">
                    <span
                      className={`px-3 py-1 rounded-lg bg-green-50 text-green-600 text-sm font-medium`}
                    >
                      To'langan
                    </span>
                  </td>
                  <td className="py-5 px-6 text-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-300  hover:bg-gray-100 transition cursor-pointer flex justify-center items-center"
                      >
                        <FaRegEye size={20} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setDeleteModal(true);
                        }}
                        className="p-3 rounded-xl text-red-500 bg-red-50 border border-red-300  hover:bg-red-100 transition cursor-pointer flex justify-center items-center"
                      >
                        <RiDeleteBin6Line size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-slate-500">
                  To'lov topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedPayment && !deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl rounded-4xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    Talaba ma'lumotlari
                  </h2>
                  <p className="text-slate-500 mt-1">
                    To'lov tarixi va guruh ma'lumotlari
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  X
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Ism familiya</p>
                  <h3 className="font-semibold text-xl mt-2">
                    {selectedStudent?.fullName || "Noma'lum talaba"}
                  </h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Telefon</p>
                  <h3 className="font-semibold text-xl mt-2">
                    {selectedStudent?.phone || "-"}
                  </h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Guruh</p>
                  <h3 className="font-semibold text-xl mt-2">
                    {selectedGroup?.name || "Guruh topilmadi"}
                  </h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Guruh narxi</p>
                  <h3 className="font-semibold text-xl mt-2">
                    {selectedCourse
                      ? `${Number(selectedCourse.price).toLocaleString()} so'm`
                      : "-"}
                  </h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">To'lovlar soni</p>
                  <h3 className="font-semibold text-xl mt-2">
                    {selectedStudentPayments.length} marta
                  </h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Oxirgi to'lov</p>
                  <h3 className="font-semibold text-xl mt-2">
                    {selectedLastPayment
                      ? formatDate(selectedLastPayment.created_at)
                      : "-"}
                  </h3>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  To'lov qilingan sanalar
                </h3>
                <div className="max-h-56 overflow-y-auto rounded-3xl border border-slate-100">
                  {selectedStudentPayments.map((payment) => {
                    const paymentGroup = getGroup(payment.group_id);

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {formatDate(payment.created_at)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {paymentGroup?.name || "Guruh topilmadi"}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-800">
                          {Number(payment.amount).toLocaleString()} so'm
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-4xl bg-white p-8 shadow-2xl"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <RiDeleteBin6Line size={36} className="text-red-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mt-6">
                To'lovni o'chirish
              </h2>

              <p className="text-slate-500 text-center mt-3">
                Rostan ham{" "}
                <span className="font-semibold text-slate-800">
                  {selectedStudent?.fullName || "bu talaba"}
                </span>{" "}
                uchun {formatDate(selectedPayment.created_at)} sanasidagi
                to'lovni o'chirmoqchimisiz?
              </p>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setDeleteModal(false);
                    setSelectedPayment(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Yo'q
                </button>

                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
                >
                  {deleteLoading ? "O'chirilmoqda..." : "Ha"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl rounded-4xl bg-white p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    To'lov qo'shish
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Talaba uchun yangi to'lov qo'shish
                  </p>
                </div>

                <button
                  onClick={() => {
                    reset();
                    setOpenPaymentModal(false);
                  }}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* STEP 1 */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Guruh tanlang
                </label>

                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="
              w-full
              mt-2
              h-14
              rounded-2xl
              border
              border-slate-200
              px-4
              outline-none
              focus:border-indigo-500
            "
                >
                  <option value="">Guruh tanlang</option>

                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 2 */}
              {groupId && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-2 gap-6">
                    {/* Student */}
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Talaba
                      </label>

                      <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="
                    w-full
                    mt-2
                    h-14
                    rounded-2xl
                    border
                    border-slate-200
                    px-4
                    outline-none
                    focus:border-indigo-500
                  "
                      >
                        <option value="">Talaba tanlang</option>

                        {students
                          .filter((student) =>
                            groupStudent.some(
                              (gs) =>
                                gs.group_id === groupId &&
                                gs.student_id === student.id
                            )
                          )
                          .map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.fullName}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Method */}
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        To'lov usuli
                      </label>

                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="
                    w-full
                    mt-2
                    h-14
                    rounded-2xl
                    border
                    border-slate-200
                    px-4
                    outline-none
                    focus:border-indigo-500
                  "
                      >
                        <option value="cash">Naqd</option>
                        <option value="card">Karta</option>
                      </select>
                    </div>
                  </div>

                  {/* Student tanlangandan keyin */}
                  {studentId && (
                    <>
                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="rounded-3xl bg-slate-50 p-5">
                          <p className="text-slate-500 text-sm">
                            Tanlangan guruh
                          </p>

                          <h3 className="font-semibold text-xl mt-2">
                            {groups.find((g) => g.id === groupId)?.name}
                          </h3>
                        </div>

                        <div className="rounded-3xl bg-slate-50 p-5">
                          <p className="text-slate-500 text-sm">Oylik to'lov</p>

                          <h3 className="font-semibold text-xl mt-2">
                            {Number(
                              getCourse(groups.find((g) => g.id === groupId))
                                ?.price || 0
                            ).toLocaleString()}{" "}
                            so'm
                          </h3>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="mt-6">
                        <label className="text-sm font-medium text-slate-600">
                          To'lov summasi
                        </label>

                        <div className="relative mt-2">
                          <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number"
                            placeholder="800000"
                            className="
                        w-full
                        h-14
                        rounded-2xl
                        border
                        border-slate-200
                        px-4
                        pr-20
                        outline-none
                        focus:border-indigo-500
                      "
                          />

                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                            so'm
                          </span>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="mt-6">
                        <label className="text-sm font-medium text-slate-600">
                          Izoh
                        </label>

                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          placeholder="Ixtiyoriy izoh..."
                          className="
                      w-full
                      mt-2
                      rounded-2xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      resize-none
                      outline-none
                      focus:border-indigo-500
                    "
                        />
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end gap-4 mt-8">
                        <button
                          onClick={() => {
                            reset();
                            setOpenPaymentModal(false);
                          }}
                          className="
                      px-6
                      py-3
                      rounded-2xl
                      bg-slate-100
                      hover:bg-slate-200
                      transition
                      cursor-pointer
                    "
                        >
                          Bekor qilish
                        </button>

                        <button
                          disabled={isLoading || !studentId || !amount}
                          onClick={handleSubmit}
                          className="
                      px-8
                      py-3
                      rounded-2xl
                      bg-linear-to-r
                      from-indigo-500
                      to-violet-500
                      text-white
                      font-medium
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Saqlanmoqda...</span>
                            </div>
                          ) : (
                            "Saqlash"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
