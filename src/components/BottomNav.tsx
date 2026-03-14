"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/map" || pathname === "/";
  const isProfile = pathname === "/insights";

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-end gap-4">
      {/* Home */}
      <Link
        href="/map"
        className={`flex flex-col items-center justify-center gap-1 rounded-[20px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors ${
          isHome
            ? "bg-white w-[70px] h-[70px]"
            : "bg-white w-[70px] h-[70px]"
        }`}
      >
        <Home size={24} className={isHome ? "text-[#6baa96]" : "text-[#99a1af]"} />
        <span
          className={`text-[11px] font-medium leading-none ${
            isHome ? "text-[#6baa96]" : "text-[#99a1af]"
          }`}
        >
          Home
        </span>
      </Link>

      {/* Mood (Add) */}
      <Link
        href="/map?addMood=true"
        className="flex flex-col items-center justify-center gap-1 w-[80px] h-[80px] rounded-[20px] bg-[#c8f0c8] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors"
      >
        <Plus size={23} className="text-[#1e2939]" />
        <span className="text-[11px] font-medium leading-none text-[#1e2939]">
          Mood
        </span>
      </Link>

      {/* Profile */}
      <Link
        href="/insights"
        className={`flex flex-col items-center justify-center gap-1 rounded-[20px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors ${
          isProfile
            ? "bg-white w-[70px] h-[70px]"
            : "bg-white w-[70px] h-[70px]"
        }`}
      >
        <User size={24} className={isProfile ? "text-[#6baa96]" : "text-[#99a1af]"} />
        <span
          className={`text-[11px] font-medium leading-none ${
            isProfile ? "text-[#6baa96]" : "text-[#99a1af]"
          }`}
        >
          Profile
        </span>
      </Link>
    </nav>
  );
}
