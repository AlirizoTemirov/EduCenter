import { createClient } from "@/utils/server";
import PaymentTable from "./PaymentTable";
import { Course, Group, GroupStudent, Payment, Student } from "@/types";

export default async function Page() {
  const supabase = await createClient();

  const [
    { data: students },
    { data: groups },
    { data: groupStudents },
    { data: payments },
    { data: courses },
  ] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("groups").select("*"),
    supabase.from("group_students").select("*"),
    supabase.from("paymants").select("*"),
    supabase.from("courses").select("*"),
  ]);

  return (
    <div className="h-screen">
      <PaymentTable
        students={(students as Student[]) ?? []}
        groups={(groups as Group[]) ?? []}
        groupStudent={(groupStudents as GroupStudent[]) ?? []}
        payments={(payments as Payment[]) ?? []}
        courses={(courses as Course[]) ?? []}
      />
    </div>
  );
}
