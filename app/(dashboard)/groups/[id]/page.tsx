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

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();
  const { data: groups } = await supabase.from("groups").select("*");
  const { data: courses } = await supabase.from("courses").select("*");
  const { data: teachers } = await supabase.from("teachers").select("*");
  const { data: students } = await supabase.from("students").select("*");
  const { data: groupStudents } = await supabase
    .from("group_students")
    .select("*");

  if (!group) notFound();

  return (
    <GroupDetail
      group={group as Group}
      groups={(groups as Group[]) || []}
      courses={(courses as Course[]) || []}
      teachers={(teachers as Teacher[]) || []}
      students={(students as Student[]) || []}
      groupStudents={(groupStudents as GroupStudent[]) || []}
    />
  );
}
