import { createClient } from "@/utils/server";
import { Course, Group, GroupStudent, Student, Teacher } from "@/types";
import { notFound } from "next/navigation";
import GroupDetail from "./GroupDetail";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: group },
    { data: groups },
    { data: courses },
    { data: teachers },
    { data: group_students },
    { data: students },
  ] = await Promise.all([
    supabase.from("groups").select("*").eq("id", id).single(),
    supabase.from("groups").select("*"),
    supabase.from("courses").select("*"),
    supabase.from("teachers").select("*"),
    supabase.from("group_students").select("*"),
    supabase.from("students").select("*"),
  ]);

  if (!group) notFound();

  return (
    <GroupDetail
      group={group as Group}
      groups={(groups as Group[]) || []}
      courses={(courses as Course[]) || []}
      teachers={(teachers as Teacher[]) || []}
      students={(students as Student[]) || []}
      groupStudents={(group_students as GroupStudent[]) || []}
    />
  );
}
