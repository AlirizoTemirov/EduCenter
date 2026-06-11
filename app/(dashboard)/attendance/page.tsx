import { createClient } from "@/utils/server";
import { Attendance, Group, GroupStudent, Student } from "@/types";
import AttendanceTable from "./AttendanceTable";

export default async function page() {
  const supabase = await createClient();

  const [
    { data: groups },
    { data: students },
    { data: group_students },
    { data: attendances },
  ] = await Promise.all([
    supabase.from("groups").select("*"),
    supabase.from("students").select("*"),
    supabase.from("group_students").select("*"),
    supabase.from("attendances").select("*"),
  ]);

  return (
    <AttendanceTable
      groups={(groups as Group[]) || []}
      students={(students as Student[]) || []}
      groupStudents={(group_students as GroupStudent[]) || []}
      attendance={(attendances as Attendance[]) || []}
    />
  );
}
