"use client";

import { Course, Group, GroupStudent, Teacher } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useGroupStore } from "@/store/GroupStore";

interface GroupTableProps {
  groups: Group[];
  courses: Course[];
  teachers: Teacher[];
  groupStudents: GroupStudent[];
}

export default function GroupTable({
  groups,
  courses,
  teachers,
  groupStudents,
}: GroupTableProps) {
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    name,
    coursId,
    teachersId,
    status,
    search,
    isLoading,
    isEditMode,
    editingGroupId,
    setName,
    setCoursId,
    setTeachersId,
    setStatus,
    setSearch,
    setLoading,
    startEdit,
    stopEdit,
    reset,
  } = useGroupStore();
  const supabase = createClient();
  const router = useRouter();

  const getCourseName = (id: string) =>
    courses.find((course) => course.id === id)?.name || "Kurs tanlanmagan";

  const getTeacherName = (id: string) =>
    teachers.find((teacher) => teacher.id === id)?.fullName ||
    "O'qituvchi tanlanmagan";

  const getGroupTeacherId = (group: Group) =>
    group.teachers_id || group.teacher_id || "";

  const busyTeacherIds = groups
    .filter((group) => !isEditMode || group.id !== editingGroupId)
    .map((group) => getGroupTeacherId(group))
    .filter(Boolean);

  const availableTeachers = teachers.filter(
    (teacher) =>
      !busyTeacherIds.includes(teacher.id) || teacher.id === teachersId
  );

  const selectedGroupTeacherId = selectedGroup
    ? getGroupTeacherId(selectedGroup)
    : "";

  const isMissingColumnError = (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    (error.message.includes("teachers_id") ||
      error.message.includes("schema cache"));

  const insertGroup = async () => {
    const groupData = {
      name,
      cours_id: coursId,
      teachers_id: teachersId,
      status,
    };

    const { error } = await supabase.from("groups").insert(groupData);

    if (!error || !isMissingColumnError(error)) return { error };

    return supabase.from("groups").insert({
      name,
      cours_id: coursId,
      teacher_id: teachersId,
      status,
    });
  };

  const updateGroup = async (groupId: string) => {
    const groupData = {
      name,
      cours_id: coursId,
      teachers_id: teachersId,
      status,
    };

    const { error } = await supabase
      .from("groups")
      .update(groupData)
      .eq("id", groupId);

    if (!error || !isMissingColumnError(error)) return { error };

    return supabase
      .from("groups")
      .update({
        name,
        cours_id: coursId,
        teacher_id: teachersId,
        status,
      })
      .eq("id", groupId);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (teachersId && busyTeacherIds.includes(teachersId)) {
        throw new Error("Bu o'qituvchi boshqa guruhga biriktirilgan");
      }

      const { error } = await insertGroup();

      if (error) throw error;

      if (teachersId) {
        const { error: teacherStatusError } = await supabase
          .from("teachers")
          .update({ status: true })
          .eq("id", teachersId);

        if (teacherStatusError) throw teacherStatusError;
      }

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
    if (!editingGroupId) return;

    try {
      setLoading(true);

      if (teachersId && busyTeacherIds.includes(teachersId)) {
        throw new Error("Bu o'qituvchi boshqa guruhga biriktirilgan");
      }

      const editingGroup = groups.find((group) => group.id === editingGroupId);
      const oldTeacherId = editingGroup ? getGroupTeacherId(editingGroup) : "";
      const { error } = await updateGroup(editingGroupId);

      if (error) throw error;

      if (oldTeacherId && oldTeacherId !== teachersId) {
        const { error: oldTeacherStatusError } = await supabase
          .from("teachers")
          .update({ status: false })
          .eq("id", oldTeacherId);

        if (oldTeacherStatusError) throw oldTeacherStatusError;
      }

      if (teachersId) {
        const { error: teacherStatusError } = await supabase
          .from("teachers")
          .update({ status: true })
          .eq("id", teachersId);

        if (teacherStatusError) throw teacherStatusError;
      }

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
    if (!selectedGroup) return;

    try {
      setDeleteLoading(true);

      const selectedGroupStudentIds = groupStudents
        .filter((item) => item.group_id === selectedGroup.id)
        .map((item) => item.student_id);

      await supabase
        .from("group_students")
        .delete()
        .eq("group_id", selectedGroup.id);

      if (selectedGroupStudentIds.length > 0) {
        const { error: studentStatusError } = await supabase
          .from("students")
          .update({ status: false })
          .in("id", selectedGroupStudentIds);

        if (studentStatusError) throw studentStatusError;
      }

      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", selectedGroup.id);

      if (error) throw error;

      if (selectedGroupTeacherId) {
        const { error: teacherStatusError } = await supabase
          .from("teachers")
          .update({ status: false })
          .eq("id", selectedGroupTeacherId);

        if (teacherStatusError) throw teacherStatusError;
      }

      setDeleteModal(false);
      setSelectedGroup(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      getCourseName(group.cours_id)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      getTeacherName(getGroupTeacherId(group))
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-bold">Guruhlar</h1>
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
            + Yangi guruh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mt-8">
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Jami guruhlar</p>
          <h1 className="text-2xl font-bold mt-3">
            {groups.length} <span className="text-xl">ta</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Faol guruhlar</p>
          <h1 className="text-2xl font-bold mt-3">
            {groups.filter((group) => group.status).length}{" "}
            <span className="text-xl">ta</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Kurslar</p>
          <h1 className="text-2xl font-bold mt-3">
            {courses.length} <span className="text-xl">ta</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Biriktirilgan talabalar</p>
          <h1 className="text-2xl font-bold mt-3">
            {groupStudents.length} <span className="text-xl">nafar</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden mt-10">
        <table className="w-full text-center">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="py-4 px-6 font-medium">#</th>
              <th className="py-4 px-6 font-medium">Guruh nomi</th>
              <th className="py-4 px-6 font-medium">Kurs</th>
              <th className="py-4 px-6 font-medium">O'qituvchi</th>
              <th className="py-4 px-6 font-medium">Talabalar</th>
              <th className="py-4 px-6 font-medium">Holat</th>
              <th className="py-4 px-6 font-medium">Amallar</th>
            </tr>
          </thead>

          <tbody>
            {filteredGroups.map((group, index) => (
              <tr
                key={group.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-5 px-6">{index + 1}</td>
                <td className="py-5 px-6 font-medium">
                  <Link
                    className="text-indigo-600 hover:underline"
                    href={`/groups/${group.id}`}
                  >
                    {group.name}
                  </Link>
                </td>
                <td className="py-5 px-6 text-slate-600">
                  {getCourseName(group.cours_id)}
                </td>
                <td className="py-5 px-6 text-slate-600">
                  {getTeacherName(getGroupTeacherId(group))}
                </td>
                <td className="py-5 px-6 text-slate-600">
                  {
                    groupStudents.filter((item) => item.group_id === group.id)
                      .length
                  }{" "}
                  nafar
                </td>
                <td className="py-5 px-6">
                  <span
                    className={`px-3 py-1 rounded-lg ${
                      group.status
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    } text-sm font-medium`}
                  >
                    {group.status ? "Faol" : "NoFaol"}
                  </span>
                </td>
                <td className="py-5 px-6 text-slate-600">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        startEdit(group);
                        setOpen(true);
                      }}
                      className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer flex justify-center items-center"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
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
                      {isEditMode ? "Guruhni tahrirlash" : "Yangi guruh"}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Guruh ma'lumotlarini kiriting
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
                      Guruh nomi
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Frontend N1"
                      className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Kurs
                    </label>
                    <select
                      value={coursId}
                      onChange={(e) => setCoursId(e.target.value)}
                      className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    >
                      <option value="">Kurs tanlang</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      O'qituvchi
                    </label>
                    <select
                      value={teachersId}
                      onChange={(e) => setTeachersId(e.target.value)}
                      className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    >
                      <option value="">O'qituvchi tanlang</option>
                      {availableTeachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <input
                      checked={status}
                      onChange={(e) => setStatus(e.target.checked)}
                      type="checkbox"
                      className="w-5 h-5"
                    />
                    Faol guruh
                  </label>

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
                      {isLoading
                        ? "Saqlanmoqda..."
                        : isEditMode
                        ? "Saqlash"
                        : "Guruhni qo'shish"}
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
                  Guruhni o'chirish
                </h2>
                <p className="text-slate-500 text-center mt-3">
                  Rostan ham{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedGroup?.name}
                  </span>{" "}
                  guruhini o'chirmoqchimisiz?
                </p>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setDeleteModal(false);
                      setSelectedGroup(null);
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
