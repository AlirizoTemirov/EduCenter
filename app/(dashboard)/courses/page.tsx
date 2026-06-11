import { createClient } from "@/utils/server";
import { Course, Group } from "@/types";
import CourseTable from "./CourseTable";

export default async function page() {
  const supabase = await createClient();

  const { data: courses } = await supabase.from("courses").select("*");
  const { data: groups } = await supabase.from("groups").select("*");

  return (
    <CourseTable
      courses={(courses as Course[]) || []}
      groups={(groups as Group[]) || []}
    />
  );
}
