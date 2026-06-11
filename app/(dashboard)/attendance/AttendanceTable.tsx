"use client";

import { Attendance, Group, GroupStudent, Student } from "@/types";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiCalendar, FiCheck, FiSave, FiUsers, FiX } from "react-icons/fi";

type AttendanceStatus = "kelgan" | "kelmagan";

interface AttendanceTableProps {
  groups: Group[];
  students: Student[];
  groupStudents: GroupStudent[];
  attendance: Attendance[];
}

export default function AttendanceTable({
  groups,
  students,
  groupStudents,
  attendance,
}: AttendanceTableProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(today);
  const [isLoading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  const groupStudentList = useMemo(() => {
    const currentGroupStudentIds = groupStudents
      .filter((item) => item.group_id === selectedGroupId)
      .map((item) => item.student_id);

    return students.filter((student) =>
      currentGroupStudentIds.includes(student.id)
    );
  }, [groupStudents, selectedGroupId, students]);

  const savedAttendanceByStudentId = useMemo(() => {
    return new Map(
      attendance
        .filter(
          (item) =>
            item.group_id === selectedGroupId &&
            item.attendance_date === selectedDate
        )
        .map((item) => [item.student_id, item.status as AttendanceStatus])
    );
  }, [attendance, selectedDate, selectedGroupId]);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    {}
  );

  const getStudentStatus = (studentId: string): AttendanceStatus =>
    statuses[studentId] ||
    savedAttendanceByStudentId.get(studentId) ||
    "kelgan";

  const presentCount = groupStudentList.filter(
    (student) => getStudentStatus(student.id) === "kelgan"
  ).length;
  const absentCount = groupStudentList.length - presentCount;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setStatuses({});
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setStatuses({});
  };

  const handleSave = async () => {
    if (!selectedGroupId || groupStudentList.length === 0) return;

    try {
      setLoading(true);

      const { error: deleteError } = await supabase
        .from("attendances")
        .delete()
        .eq("group_id", selectedGroupId)
        .eq("attendance_date", selectedDate);

      if (deleteError) throw deleteError;

      const { error } = await supabase.from("attendances").insert(
        groupStudentList.map((student) => ({
          group_id: selectedGroupId,
          student_id: student.id,
          attendance_date: selectedDate,
          status: getStudentStatus(student.id),
        }))
      );

      if (error) throw error;

      setStatuses({});
      router.refresh();
    } catch (error) {
      console.error("ATTENDANCE SAVE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Davomad olish</h1>
          <p className="text-slate-500 mt-2">
            {selectedGroup?.name || "Guruh tanlanmagan"} guruhi - {selectedDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiCalendar
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              type="date"
              className="h-12 w-44 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedGroupId}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="h-12 min-w-56 cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-500"
          >
            <option value="">Guruh tanlang</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Jami talabalar</p>
          <h1 className="text-2xl font-bold mt-3">
            {groupStudentList.length} <span className="text-xl">nafar</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Kelganlar</p>
          <h1 className="text-2xl font-bold mt-3 text-green-600">
            {presentCount} <span className="text-xl">nafar</span>
          </h1>
        </div>
        <div className="p-5 rounded-xl bg-white shadow">
          <p className="text-gray-500">Kelmaganlar</p>
          <h1 className="text-2xl font-bold mt-3 text-red-600">
            {absentCount} <span className="text-xl">nafar</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden mt-10">
        <table className="w-full text-center">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-sm">
              <th className="py-4 px-6 font-medium">#</th>
              <th className="py-4 px-6 font-medium text-left">Talaba</th>
              <th className="py-4 px-6 font-medium">Telefon</th>
              <th className="py-4 px-6 font-medium">Holat</th>
            </tr>
          </thead>

          <tbody>
            {groupStudentList.map((student, index) => {
              const status = getStudentStatus(student.id);

              return (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-5 px-6">{index + 1}</td>
                  <td className="py-5 px-6 font-medium text-left">
                    {student.fullName}
                  </td>
                  <td className="py-5 px-6 text-slate-600">{student.phone}</td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, "kelgan")}
                        className={`h-10 px-4 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                          status === "kelgan"
                            ? "bg-green-500 text-white"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        <FiCheck size={18} />
                        Kelgan
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(student.id, "kelmagan")
                        }
                        className={`h-10 px-4 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                          status === "kelmagan"
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <FiX size={18} />
                        Kelmagan
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {selectedGroupId && groupStudentList.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-slate-500">
                  Bu guruhda hali talaba yo'q
                </td>
              </tr>
            )}

            {!selectedGroupId && (
              <tr>
                <td colSpan={4} className="py-10 text-slate-500">
                  Davomad olish uchun guruh tanlang
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2 text-slate-500">
          <FiUsers size={20} />
          <span>
            Saqlash bosilganda tanlangan sana uchun barcha holatlar yangilanadi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStatuses({})}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            disabled={
              isLoading || !selectedGroupId || groupStudentList.length === 0
            }
            onClick={handleSave}
            className="px-7 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiSave size={18} />
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
