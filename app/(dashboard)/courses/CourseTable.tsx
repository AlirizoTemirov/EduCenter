"use client";

import { Course, Group } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useCourseStore } from "@/store/CourseStore";

interface CourseTableProps {
  courses: Course[];
  groups: Group[];
}

export default function CourseTable({ courses, groups }: CourseTableProps) {
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    name,
    price,
    duration,
    search,
    isLoading,
    isEditMode,
    editingCourseId,
    setName,
    setPrice,
    setDuration,
    setSearch,
    setLoading,
    startEdit,
    stopEdit,
    reset,
  } = useCourseStore();
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("courses")
        .insert({ name, price: Number(price), duration });

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

  const handleUpdate = async () => {
    if (!editingCourseId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("courses")
        .update({ name, price: Number(price), duration })
        .eq("id", editingCourseId);

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

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      setDeleteLoading(true);

      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", selectedCourse.id);

      if (error) throw error;
      setDeleteModal(false);
      setSelectedCourse(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  const averagePrice =
    courses.length > 0
      ? Math.round(
          courses.reduce((total, course) => total + Number(course.price), 0) /
            courses.length
        )
      : 0;

  return (
    <div className="h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-bold">Kurslar</h1>
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
            + Yangi kurs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Jami kurslar</p>
          <h1 className="text-2xl font-bold mt-3">
            {courses.length} <span className="text-xl">ta</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Guruhlar soni</p>
          <h1 className="text-2xl font-bold mt-3">
            {groups.length} <span className="text-xl">ta</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">O'rtacha narx</p>
          <h1 className="text-2xl font-bold mt-3">
            {averagePrice.toLocaleString()} <span className="text-xl">so'm</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden mt-10">
        <table className="w-full text-center">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="py-4 px-6 font-medium">#</th>
              <th className="py-4 px-6 font-medium">Kurs nomi</th>
              <th className="py-4 px-6 font-medium">Narxi</th>
              <th className="py-4 px-6 font-medium">Davomiyligi</th>
              <th className="py-4 px-6 font-medium">Guruhlar</th>
              <th className="py-4 px-6 font-medium">Yaratilgan sana</th>
              <th className="py-4 px-6 font-medium">Amallar</th>
            </tr>
          </thead>

          <tbody>
            {filteredCourses.map((course, index) => (
              <tr
                key={course.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-5 px-6">{index + 1}</td>
                <td className="py-5 px-6 font-medium">{course.name}</td>
                <td className="py-5 px-6 text-slate-600">
                  {Number(course.price).toLocaleString()} so'm
                </td>
                <td className="py-5 px-6 text-slate-600">{course.duration}</td>
                <td className="py-5 px-6 text-slate-600">
                  {groups.filter((group) => group.cours_id === course.id).length} ta
                </td>
                <td className="py-5 px-6 text-slate-600">
                  {new Date(course.created_at)
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
                        startEdit(course);
                        setOpen(true);
                      }}
                      className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer flex justify-center items-center"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
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
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-lg rounded-4xl bg-white p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                      {isEditMode ? "Kursni tahrirlash" : "Yangi kurs"}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Kurs ma'lumotlarini kiriting
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
                    X
                  </button>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Kurs nomi
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Frontend"
                      className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Narxi
                    </label>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      placeholder="800000"
                      className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Davomiyligi
                    </label>
                    <input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      type="text"
                      placeholder="6 oy"
                      className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    />
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
                      {isLoading ? "Saqlanmoqda..." : isEditMode ? "Saqlash" : "Kursni qo'shish"}
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
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-4xl bg-white p-8 shadow-2xl"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <FiTrash2 size={36} className="text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mt-6">
                  Kursni o'chirish
                </h2>
                <p className="text-slate-500 text-center mt-3">
                  Rostan ham{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedCourse?.name}
                  </span>{" "}
                  kursini o'chirmoqchimisiz?
                </p>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setDeleteModal(false);
                      setSelectedCourse(null);
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
      </div>
    </div>
  );
}
