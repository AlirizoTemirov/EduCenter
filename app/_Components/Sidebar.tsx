"use client";

import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import { AiFillHome } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { FaUsers as FaUsers6, FaCreditCard } from "react-icons/fa6";
import { LuBookOpen, LuSchool } from "react-icons/lu";
import { MdFactCheck } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/client";

export default function Sidebar() {
  const pathname = usePathname();

  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="fixed w-72 rounded-r-md left-0 h-screen py-5 bg-slate-900 text-white">
      <Link href={"/"}>
        <div className="flex items-center gap-2 ml-4 px-6">
          <h1 className="text-3xl font-bold">EduCenter</h1>
        </div>
      </Link>

      <div className="mt-5 flex flex-col gap-3 px-6">
        <Link href={"/"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/" ? "bg-blue-500" : ""
            }`}
          >
            <AiFillHome size={24} /> Bosh sahifa
          </button>
        </Link>
        <Link href={"/students"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/students" ? "bg-blue-500" : ""
            }`}
          >
            <FaUsers size={24} /> Talabalar
          </button>
        </Link>
        <Link href={"/teachers"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/teachers" ? "bg-blue-500" : ""
            }`}
          >
            <FaUsers6 size={24} /> O'qituvchilar
          </button>
        </Link>
        <Link href={"/courses"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/courses" ? "bg-blue-500" : ""
            }`}
          >
            <LuBookOpen size={24} /> Kurslar
          </button>
        </Link>
        <Link href={"/groups"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/groups" ? "bg-blue-500" : ""
            }`}
          >
            <LuSchool size={24} /> Guruhlar
          </button>
        </Link>
        <Link href={"/payments"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/payments" ? "bg-blue-500" : ""
            }`}
          >
            <FaCreditCard size={24} /> To'lovlar
          </button>
        </Link>
        <Link href={"/attendance"}>
          <button
            className={`w-full py-2 px-5 flex items-center gap-3 rounded-xl text-start text-md cursor-pointer hover:bg-blue-500 transition ${
              pathname === "/attendance" ? "bg-blue-500" : ""
            }`}
          >
            <MdFactCheck size={24} /> Davomad
          </button>
        </Link>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="
w-full
flex
items-center
justify-center
gap-2
py-3
rounded-2xl
bg-red-500/10
text-red-400
hover:bg-red-500/20
transition
cursor-pointer
"
        >
          <FiLogOut size={20} />
          Chiqish
        </button>
      </div>
    </div>
  );
}
