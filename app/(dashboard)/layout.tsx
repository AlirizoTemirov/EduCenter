import Sidebar from "../_Components/Sidebar";
import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="ml-72 flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
