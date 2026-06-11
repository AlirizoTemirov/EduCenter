import { Course, FinanceTransaction, Group, GroupStudent, Teacher } from "@/types";
import { createClient } from "@/utils/server";
import FinanceDashboard from "./FinanceDashboard";

export default async function page() {
  const supabase = await createClient();

  const { data: teachers } = await supabase.from("teachers").select("*");
  const { data: courses } = await supabase.from("courses").select("*");
  const { data: groups } = await supabase.from("groups").select("*");
  const { data: groupStudents } = await supabase
    .from("group_students")
    .select("*");
  const { data: transactions, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <FinanceDashboard
      teachers={(teachers as Teacher[]) || []}
      courses={(courses as Course[]) || []}
      groups={(groups as Group[]) || []}
      groupStudents={(groupStudents as GroupStudent[]) || []}
      transactions={(transactions as FinanceTransaction[]) || []}
      hasFinanceTable={!error}
    />
  );
}
