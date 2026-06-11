import { createClient } from "@/utils/server";
import { Course, Group, GroupStudent, Teacher } from "@/types";
import GroupTable from "./GroupTable";

export default async function page() {
  const supabase = await createClient();

  const { data: groups } = await supabase.from("groups").select("*");
  const { data: courses } = await supabase.from("courses").select("*");
  const { data: teachers } = await supabase.from("teachers").select("*");
  const { data: groupStudents } = await supabase
    .from("group_students")
    .select("*");

  return (
    <GroupTable
      groups={(groups as Group[]) || []}
      courses={(courses as Course[]) || []}
      teachers={(teachers as Teacher[]) || []}
      groupStudents={(groupStudents as GroupStudent[]) || []}
    />
  );
}
