import { createClient } from "@/utils/server";
import StudentsTable from "./studentsTable";
import { Student } from "@/types";

export default async function page() {
  const supabase = await createClient();

  const { data } = await supabase.from("students").select("*");

  return <StudentsTable students={data as Student[]} />;
}
