import { createClient } from "@/utils/server";
import { Course, Group, GroupStudent, Teacher } from "@/types";
import GroupTable from "./GroupTable";

export default async function page() {
  const supabase = await createClient();

  const [
    { data: groups },
    { data: courses },
    { data: teachers },
    { data: group_students },
  ] = await Promise.all([
    supabase.from("groups").select("*"),
    supabase.from("courses").select("*"),
    supabase.from("teachers").select("*"),
    supabase.from("group_students").select("*"),
  ]);

  return (
    <GroupTable
      groups={(groups as Group[]) || []}
      courses={(courses as Course[]) || []}
      teachers={(teachers as Teacher[]) || []}
      groupStudents={(group_students as GroupStudent[]) || []}
    />
  );
}
