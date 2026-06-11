"use client";

import { Student } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentStore } from "@/store/StudentStore";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface StudentProps {
  students: Student[];
}

export default function StudentsTable({ students }: StudentProps) {
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    fullName,
    phone,
    birthDate,
    isLoading,
    isEditMode,
    editingStudentId,
    search,
    setFullName,
    setPhone,
    setBirthDate,
    setLoading,
    setSearch,
    startEdit,
    stopEdit,
    reset,
  } = useStudentStore();
  const supabase = createClient();
  const router = useRouter();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const newStudentsThisMonth = students.filter((student) => {
    const date = new Date(student.created_at);

    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  }).length;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("students")
        .insert({ fullName, phone, birth_date: birthDate });

      if (error) throw error;
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      setDeleteLoading(true);

      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", selectedStudent.id);

      if (error) throw error;

      setDeleteModal(false);
      setSelectedStudent(null);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingStudentId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("students")
        .update({
          fullName,
          phone,
          birth_date: birthDate,
        })
        .eq("id", editingStudentId);

      if (error) throw error;

      reset();
      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.phone.includes(search)
  );

  return (
    <div className="h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-bold">Talabalar</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidiruv..."
            type="search"
            className="w-75 rounded-xl border border-slate-200 pl-4 pr-2 py-2 outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-2 bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-400 transition text-white"
          >
            + Yangi talaba
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mt-8">
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Jami talabalar</p>
          <h1 className="text-2xl font-bold mt-3">
            {students.length} <span className="text-xl">nafar</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Faol talabalar</p>
          <h1 className="text-2xl font-bold mt-3">
            {students.filter((s) => s.status).length}{" "}
            <span className="text-xl">nafar</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Yangi talabalar (oy)</p>
          <h1 className="text-2xl font-bold mt-3">
            {newStudentsThisMonth} <span className="text-xl">nafar</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Bitiruvchilar (oy)</p>
          <h1 className="text-2xl font-bold mt-3">
            0 <span className="text-xl">nafar</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden mt-10">
        <table className="w-full text-center">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="py-4 px-6 font-medium">#</th>
              <th className="py-4 px-6 font-medium">Ism familiya</th>
              <th className="py-4 px-6 font-medium">Telefon</th>
              <th className="py-4 px-6 font-medium">Tug'ilgan sana</th>
              <th className="py-4 px-6 font-medium">Holat</th>
              <th className="py-4 px-6 font-medium">Ro'yxatdan o'tgan sana</th>
              <th className="py-4 px-6 font-medium">Amallar</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student, index) => (
              <tr
                key={student.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-5 px-6">{index + 1}</td>
                <td className="py-5 px-6 font-medium">{student.fullName}</td>
                <td className="py-5 px-6 text-slate-600">{student.phone}</td>
                <td className="py-5 px-6 text-slate-600">
                  {student.birth_date}
                </td>
                <td className="py-5 px-6">
                  <span
                    className={`px-3 py-1 rounded-lg ${
                      student.status === true
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    } text-sm font-medium`}
                  >
                    {student.status === true ? "Faol" : "NoFaol"}
                  </span>
                </td>
                <td className="py-5 px-6 text-slate-600">
                  {new Date(student.created_at)
                    .toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })
                    .replaceAll("/", "-")}
                </td>
                <td className="py-5 px-6 text-slate-600">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        startEdit(student);
                        setOpen(true);
                      }}
                      className=" w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer flex justify-center items-center"
                    >
                      <FiEdit2 size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setDeleteModal(true);
                      }}
                      className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer flex justify-center items-center"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 40,
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
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="w-full max-w-lg rounded-4xl bg-white p-8 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                      {isEditMode ? "Talabani tahrirlash" : "Yangi talaba"}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Talaba ma'lumotlarini kiriting
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOpen(false);
                      reset();
                      stopEdit();
                    }}
                    className="w-10 h-10 cursor-pointer rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form className="space-y-6">
                  <div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Ism familiya
                      </label>

                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        type="text"
                        placeholder="Ali Valiyev"
                        className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="text-sm font-medium text-slate-600">
                        Telefon
                      </label>

                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="text"
                        placeholder="+998 90 123 45 67"
                        className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="text-sm font-medium text-slate-600">
                        Tug'ilgan sana
                      </label>

                      <input
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        type="date"
                        className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-5 py-3 cursor-pointer rounded-2xl bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Bekor qilish
                    </button>

                    <button
                      disabled={isLoading}
                      onClick={isEditMode ? handleUpdate : handleSubmit}
                      type="button"
                      className="px-6 py-3 cursor-pointer rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:scale-105 transition"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <p>Saplanmoqda...</p>
                        </div>
                      ) : isEditMode ? (
                        "Saqlash"
                      ) : (
                        "Talabani qo'shish"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{
                  scale: 0.9,
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                  y: 30,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="w-full max-w-md rounded-4xl bg-white p-8 shadow-2xl"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <FiTrash2 size={36} className="text-red-600" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mt-6">
                  Talabani o'chirish
                </h2>

                <p className="text-slate-500 text-center mt-3">
                  Rostan ham
                  <span className="font-semibold text-slate-800">
                    {" "}
                    {selectedStudent?.fullName}
                  </span>{" "}
                  ni o'chirmoqchimisiz?
                </p>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setDeleteModal(false);
                      setSelectedStudent(null);
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
                    {deleteLoading ? (
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>O'chirilmoqda...</span>
                      </div>
                    ) : (
                      "Ha"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
