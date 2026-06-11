import { createClient } from "@/utils/server";
import { Attendance, Group, GroupStudent, Student } from "@/types";
import AttendanceTable from "./AttendanceTable";

export default async function page() {
  const supabase = await createClient();

  const { data: groups } = await supabase.from("groups").select("*");
  const { data: students } = await supabase.from("students").select("*");
  const { data: groupStudents } = await supabase
    .from("group_students")
    .select("*");
  const { data: attendance } = await supabase.from("attendances").select("*");

  return (
    <AttendanceTable
      groups={(groups as Group[]) || []}
      students={(students as Student[]) || []}
      groupStudents={(groupStudents as GroupStudent[]) || []}
      attendance={(attendance as Attendance[]) || []}
    />
  );
}
