import {
  Course,
  FinanceTransaction,
  Group,
  GroupStudent,
  Payment,
  Student,
  Teacher,
} from "@/types";
import { createClient } from "@/utils/server";
import Dashboard from "../Dashboard";

export default async function Home() {
  const supabase = await createClient();

  const { data: students } = await supabase.from("students").select("*");
  const { data: teachers } = await supabase.from("teachers").select("*");
  const { data: courses } = await supabase.from("courses").select("*");
  const { data: groups } = await supabase.from("groups").select("*");
  const { data: groupStudents } = await supabase
    .from("group_students")
    .select("*");
  const { data: transactions } = await supabase
    .from("finance_transactions")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: payments } = await supabase
    .from("paymants")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Dashboard
      students={(students as Student[]) || []}
      teachers={(teachers as Teacher[]) || []}
      courses={(courses as Course[]) || []}
      groups={(groups as Group[]) || []}
      groupStudents={(groupStudents as GroupStudent[]) || []}
      transactions={(transactions as FinanceTransaction[]) || []}
      payments={(payments as Payment[]) || []}
    />
  );
}
