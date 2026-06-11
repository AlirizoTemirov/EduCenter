import { createClient } from "@/utils/server";
import { Course, Group } from "@/types";
import CourseTable from "./CourseTable";

export default async function page() {
  const supabase = await createClient();

  const [{ data: groups }, { data: courses }] = await Promise.all([
    supabase.from("groups").select("*"),
    supabase.from("courses").select("*"),
  ]);

  return (
    <CourseTable
      courses={(courses as Course[]) || []}
      groups={(groups as Group[]) || []}
    />
  );
}
