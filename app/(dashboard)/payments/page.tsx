import { createClient } from "@/utils/server";
import PaymentTable from "./PaymentTable";
import { Course, Group, GroupStudent, Payment, Student } from "@/types";

export default async function page() {
  const supabase = await createClient();
  const { data: sutudentsData } = await supabase.from("students").select("*");
  const { data: groupsData } = await supabase.from("groups").select("*");
  const { data: groupStudent } = await supabase
    .from("group_students")
    .select("*");
  const { data: paymentData } = await supabase.from("paymants").select("*");
  const { data: coursesData } = await supabase.from("courses").select("*");

  return (
    <div className="h-screen">
      <PaymentTable
        groups={(groupsData as Group[]) || []}
        students={(sutudentsData as Student[]) || []}
        groupStudent={(groupStudent as GroupStudent[]) || []}
        payments={(paymentData as Payment[]) || []}
        courses={(coursesData as Course[]) || []}
      />
    </div>
  );
}
