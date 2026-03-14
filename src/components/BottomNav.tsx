"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User, Users } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/map" || pathname === "/";
  const isFriends = pathname === "/friends";
  const isProfile = pathname === "/insights";

  return (
    <nav className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] left-1/2 -translate-x-1/2 z-50 flex items-end gap-3 mb-4">
      {/* Home */}
      <Link
        href="/map"
        className="flex flex-col items-center justify-center gap-1 w-[64px] h-[64px] rounded-[20px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors"
      >
        <Home
          size={22}
          className={isHome ? "text-[#6baa96]" : "text-[#99a1af]"}
        />
        <span
          className={`text-[10px] font-medium leading-none ${
            isHome ? "text-[#6baa96]" : "text-[#99a1af]"
          }`}
        >
          Home
        </span>
      </Link>

      {/* Mood (Add) */}
      <Link
        href="/map?addMood=true"
        className="flex flex-col items-center justify-center gap-1 w-[72px] h-[72px] rounded-[20px] bg-[#c8f0c8] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors"
      >
        <Plus size={22} className="text-[#1e2939]" />
        <span className="text-[10px] font-medium leading-none text-[#1e2939]">
          Mood
        </span>
      </Link>

      {/* Friends */}
      <Link
        href="/friends"
        className="flex flex-col items-center justify-center gap-1 w-[64px] h-[64px] rounded-[20px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors"
      >
        <Users
          size={22}
          className={isFriends ? "text-[#6baa96]" : "text-[#99a1af]"}
        />
        <span
          className={`text-[10px] font-medium leading-none ${
            isFriends ? "text-[#6baa96]" : "text-[#99a1af]"
          }`}
        >
          Friends
        </span>
      </Link>

      {/* Profile */}
      <Link
        href="/insights"
        className="flex flex-col items-center justify-center gap-1 w-[64px] h-[64px] rounded-[20px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors"
      >
        <User
          size={22}
          className={isProfile ? "text-[#6baa96]" : "text-[#99a1af]"}
        />
        <span
          className={`text-[10px] font-medium leading-none ${
            isProfile ? "text-[#6baa96]" : "text-[#99a1af]"
          }`}
        >
          Profile
        </span>
      </Link>
    </nav>
  );
}
