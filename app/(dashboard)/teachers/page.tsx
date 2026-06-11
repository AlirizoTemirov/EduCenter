import { createClient } from "@/utils/server";
import { Teacher } from "@/types";
import TeacherTable from "./TeacherTable";

export default async function page() {
  const supabase = await createClient();

  const { data } = await supabase.from("teachers").select("*");

  return <TeacherTable teachers={(data as Teacher[]) ?? []} />;
}
