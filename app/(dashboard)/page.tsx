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

  const [
    { data: students = [] },
    { data: teachers = [] },
    { data: courses = [] },
    { data: groups = [] },
    { data: groupStudents = [] },
    { data: transactions = [] },
    { data: payments = [] },
  ] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("teachers").select("*"),
    supabase.from("courses").select("*"),
    supabase.from("groups").select("*"),
    supabase.from("group_students").select("*"),
    supabase
      .from("finance_transactions")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("paymants")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <Dashboard
      students={students as Student[]}
      teachers={teachers as Teacher[]}
      courses={courses as Course[]}
      groups={groups as Group[]}
      groupStudents={groupStudents as GroupStudent[]}
      transactions={transactions as FinanceTransaction[]}
      payments={payments as Payment[]}
    />
  );
}
