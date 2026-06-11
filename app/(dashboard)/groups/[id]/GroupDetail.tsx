"use client";

import { Course, Group, GroupStudent, Student, Teacher } from "@/types";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa";

interface GroupDetailProps {
  group: Group;
  groups: Group[];
  courses: Course[];
  teachers: Teacher[];
  students: Student[];
  groupStudents: GroupStudent[];
}

export default function GroupDetail({
  group,
  groups,
  courses,
  teachers,
  students,
  groupStudents,
}: GroupDetailProps) {
  const [addModal, setAddModal] = useState(false);
  const groupTeacherId = group.teachers_id || group.teacher_id || "";
  const [teacherId, setTeacherId] = useState(groupTeacherId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const course = courses.find((item) => item.id === group.cours_id);
  const teacher = teachers.find((item) => item.id === groupTeacherId);
  const getGroupTeacherId = (item: Group) =>
    item.teachers_id || item.teacher_id || "";
  const busyTeacherIds = groups
    .filter((item) => item.id !== group.id)
    .map((item) => getGroupTeacherId(item))
    .filter(Boolean);
  const availableTeachers = teachers.filter(
    (item) => !busyTeacherIds.includes(item.id) || item.id === groupTeacherId
  );

  const isMissingColumnError = (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    (error.message.includes("teachers_id") ||
      error.message.includes("schema cache"));

  const updateGroupTeacher = async () => {
    const { error } = await supabase
      .from("groups")
      .update({ teachers_id: teacherId })
      .eq("id", group.id);

    if (!error || !isMissingColumnError(error)) return { error };

    return supabase
      .from("groups")
      .update({ teacher_id: teacherId })
      .eq("id", group.id);
  };

  const currentGroupStudentIds = groupStudents
    .filter((item) => item.group_id === group.id)
    .map((item) => item.student_id);

  const groupStudentList = students.filter((student) =>
    currentGroupStudentIds.includes(student.id)
  );

  const availableStudents = useMemo(() => {
    const busyStudentIds = groupStudents.map((item) => item.student_id);
    return students.filter((student) => !busyStudentIds.includes(student.id));
  }, [groupStudents, students]);

  const handleTeacherChange = async () => {
    try {
      setLoading(true);

      if (teacherId && busyTeacherIds.includes(teacherId)) {
        throw new Error("Bu o'qituvchi boshqa guruhga biriktirilgan");
      }

      const { error } = await updateGroupTeacher();

      if (error) throw error;

      if (groupTeacherId && groupTeacherId !== teacherId) {
        const { error: oldTeacherStatusError } = await supabase
          .from("teachers")
          .update({ status: false })
          .eq("id", groupTeacherId);

        if (oldTeacherStatusError) throw oldTeacherStatusError;
      }

      if (teacherId) {
        const { error: teacherStatusError } = await supabase
          .from("teachers")
          .update({ status: true })
          .eq("id", teacherId);

        if (teacherStatusError) throw teacherStatusError;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) return;

    try {
      setLoading(true);

      const { error } = await supabase.from("group_students").insert(
        selectedStudentIds.map((studentId) => ({
          group_id: group.id,
          student_id: studentId,
        }))
      );

      if (error) throw error;

      const { error: studentStatusError } = await supabase
        .from("students")
        .update({ status: true })
        .in("id", selectedStudentIds);

      if (studentStatusError) throw studentStatusError;

      const { error: groupStatusError } = await supabase
        .from("groups")
        .update({ status: true })
        .eq("id", group.id);

      if (groupStatusError) throw groupStatusError;

      setSelectedStudentIds([]);
      setAddModal(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("group_students")
        .delete()
        .eq("group_id", group.id)
        .eq("student_id", studentId);

      if (error) throw error;

      const { error: studentStatusError } = await supabase
        .from("students")
        .update({ status: false })
        .eq("id", studentId);

      if (studentStatusError) throw studentStatusError;

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="h-screen">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/groups" className="mb-3">
            <button className="flex items-center justify-end gap-1 text-gray-500 hover:text-black hover:gap-2 transition-all cursor-pointer w-41.25">
              <FaAngleLeft size={20} />
              Guruhlarga qaytish
            </button>
          </Link>
          <h1 className="text-5xl font-bold mt-3">{group.name}</h1>
          <p className="text-slate-500 mt-2">
            {course?.name || "Kurs tanlanmagan"} |{" "}
            {group.status ? "Faol" : "NoFaol"}
          </p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="px-3 py-2 bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-400 transition text-white"
        >
          + O'quvchi qo'shish
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">O'qituvchi</p>
          <h1 className="text-2xl font-bold mt-3">
            {teacher?.fullName || "Tanlanmagan"}
          </h1>
          <p className="text-slate-500 mt-2">
            {teacher?.phone || "Telefon raqami yo'q"}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Kurs</p>
          <h1 className="text-2xl font-bold mt-3">
            {course?.name || "Tanlanmagan"}
          </h1>
          <p className="text-slate-500 mt-2">
            {course ? `${Number(course.price).toLocaleString()} so'm` : ""}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Talabalar</p>
          <h1 className="text-2xl font-bold mt-3">
            {groupStudentList.length} <span className="text-xl">nafar</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-6 mt-10">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-600">
              Biriktirilgan o'qituvchini almashtirish
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="">O'qituvchi tanlang</option>
              {availableTeachers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName} - {item.phone}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={isLoading || teacherId === groupTeacherId}
            onClick={handleTeacherChange}
            className="px-6 py-3 cursor-pointer rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:scale-105 transition disabled:opacity-50"
          >
            Saqlash
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden mt-10">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold">O'quvchilar ro'yxati</h2>
          {groupStudentList.length === 0 && (
            <button
              onClick={() => setAddModal(true)}
              className="px-3 py-2 bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-400 transition text-white"
            >
              O'quvchi qo'shish
            </button>
          )}
        </div>

        {groupStudentList.length > 0 ? (
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="py-4 px-6 font-medium">#</th>
                <th className="py-4 px-6 font-medium">Ism familiya</th>
                <th className="py-4 px-6 font-medium">Telefon</th>
                <th className="py-4 px-6 font-medium">Holat</th>
                <th className="py-4 px-6 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {groupStudentList.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-5 px-6">{index + 1}</td>
                  <td className="py-5 px-6 font-medium">{student.fullName}</td>
                  <td className="py-5 px-6 text-slate-600">{student.phone}</td>
                  <td className="py-5 px-6">
                    <span
                      className={`px-3 py-1 rounded-lg ${
                        student.status
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      } text-sm font-medium`}
                    >
                      {student.status ? "Faol" : "NoFaol"}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <button
                      disabled={isLoading}
                      onClick={() => handleRemoveStudent(student.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                    >
                      Guruhdan chiqarish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center text-slate-500">
            Bu guruhga hali o'quvchi qo'shilmagan
          </div>
        )}
      </div>

      <AnimatePresence>
        {addModal && (
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
              className="w-full max-w-2xl rounded-4xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    O'quvchi qo'shish
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Hali boshqa guruhga qo'shilmagan o'quvchilar
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAddModal(false);
                    setSelectedStudentIds([]);
                  }}
                  className="w-10 h-10 cursor-pointer rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                >
                  X
                </button>
              </div>

              <div className="max-h-96 overflow-auto rounded-2xl border border-slate-100">
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center justify-between gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-slate-500">
                          {student.phone}
                        </p>
                      </div>
                      <input
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        type="checkbox"
                        className="w-5 h-5"
                      />
                    </label>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    Qo'shish uchun bo'sh o'quvchi yo'q
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAddModal(false);
                    setSelectedStudentIds([]);
                  }}
                  className="px-5 py-3 cursor-pointer rounded-2xl bg-slate-100 hover:bg-slate-200 transition"
                >
                  Bekor qilish
                </button>
                <button
                  disabled={isLoading || selectedStudentIds.length === 0}
                  onClick={handleAddStudents}
                  type="button"
                  className="px-6 py-3 cursor-pointer rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:scale-105 transition disabled:opacity-50"
                >
                  {isLoading ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
