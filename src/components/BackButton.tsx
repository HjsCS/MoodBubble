"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft size={24} className="text-[#364153]" />
    </button>
  );
}
