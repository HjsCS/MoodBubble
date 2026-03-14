"use client";

import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Camera,
  Lock,
  Users,
  Utensils,
  TreePine,
  UserRound,
  Briefcase,
  BookOpen,
  Gamepad2,
  Dumbbell,
  Plane,
  Leaf,
} from "lucide-react";
import type { EmotionCategory, Visibility } from "@/types/database";

interface AddMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    emotion_score: number;
    category: EmotionCategory;
    note: string;
    visibility: Visibility;
  }) => void;
}

const CATEGORY_ICONS: {
  key: EmotionCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "social", label: "Social", icon: UserRound },
  { key: "work_study", label: "Work", icon: Briefcase },
  { key: "nature", label: "Nature", icon: TreePine },
  { key: "food_dining", label: "Food", icon: Utensils },
  { key: "relaxation", label: "Study", icon: BookOpen },
  { key: "entertainment", label: "Gaming", icon: Gamepad2 },
  { key: "health_exercise", label: "Sport", icon: Dumbbell },
  { key: "travel", label: "Travel", icon: Plane },
  { key: "environment", label: "Eco", icon: Leaf },
];

export default function AddMoodModal({
  isOpen,
  onClose,
  onSubmit,
}: AddMoodModalProps) {
  const [score, setScore] = useState(5);
  const [category, setCategory] = useState<EmotionCategory>("other");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      emotion_score: score,
      category,
      note,
      visibility,
    });
    setScore(5);
    setCategory("other");
    setNote("");
    setVisibility("private");
    onClose();
  }

  // Map score (1-10) to slider percentage
  const sliderPercent = ((score - 1) / 9) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#fefbf6] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[50px] pb-4">
        <button
          type="button"
          onClick={onClose}
          className="w-[40px] h-[40px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-[#364153]" />
        </button>
        <span className="text-[16px] font-medium text-[#101828]">New Mood</span>
        <span className="text-[14px] font-medium text-[#e8b4a0]">Drafts</span>
      </div>

      {/* Form content */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-5 pb-[120px]"
      >
        {/* Location card */}
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.08)] px-4 pt-4 pb-4 opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] bg-[#b8e6d5] rounded-full flex items-center justify-center">
              <MapPin size={20} className="text-[#6baa96]" />
            </div>
            <span className="text-[14px] text-[#364153]">Melbourne CBD</span>
          </div>
        </div>

        {/* Text area */}
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] p-5">
          <textarea
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 280))}
            placeholder="How are you feeling right now..."
            className="w-full resize-none text-[14px] text-[#364153] placeholder-[#99a1af] bg-transparent outline-none"
          />
          <div className="text-right text-[12px] text-[#99a1af]">
            {note.length} / 280
          </div>
        </div>

        {/* Photo section */}
        <div className="flex gap-3">
          <div className="w-[96px] h-[96px] rounded-[16px] bg-[#f3f4f6] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#b8e6d5] to-[#ffe8b8] opacity-60" />
          </div>
          <button
            type="button"
            className="w-[96px] h-[96px] rounded-[16px] bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-1"
          >
            <Camera size={24} className="text-[#99a1af]" />
            <span className="text-[11px] font-medium text-[#99a1af]">
              Add Photo
            </span>
          </button>
        </div>

        {/* Emotion Categories */}
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] p-5">
          <h3 className="text-[15px] font-medium text-[#101828] mb-4">
            Emotion Categories
          </h3>
          <div className="flex gap-[10px] overflow-x-auto hide-scrollbar">
            {CATEGORY_ICONS.map(({ key, label, icon: Icon }) => {
              const isActive = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className="flex flex-col items-center gap-[5px] shrink-0"
                >
                  <div
                    className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors ${
                      isActive ? "bg-[#b8e6d5]" : "bg-[#f3f4f6]"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-[#6baa96]" : "text-[#6a7282]"}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isActive ? "text-[#6baa96]" : "text-[#6a7282]"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotion Slider */}
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] p-5">
          <h3 className="text-[14px] font-medium text-[#101828] mb-6">
            How does this feel?
          </h3>

          {/* Slider track */}
          <div className="relative mb-4">
            <div
              className="w-full h-[8px] rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #b8e6d5 0%, #b8e6d5 20%, #ffe8b8 40%, #ffe8b8 60%, #ffd4d4 80%, #ffd4d4 100%)",
              }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full bg-[#ffe8b8] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] cursor-grab"
              style={{ left: `calc(${sliderPercent}% - 16px)` }}
            />
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-[32px] top-1/2 -translate-y-1/2"
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#6baa96]">Calm</span>
            <span className="text-[12px] text-[#e8b963]">Happy</span>
            <span className="text-[12px] text-[#e89b9b]">Excited</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-[#364153]">Visibility:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex items-center gap-2 px-4 h-[34px] rounded-full text-[12px] font-medium transition-colors ${
                  visibility === "private"
                    ? "bg-[#b8e6d5] text-[#6baa96]"
                    : "bg-[#f3f4f6] text-[#6a7282]"
                }`}
              >
                <Lock size={16} />
                Private
              </button>
              <button
                type="button"
                onClick={() => setVisibility("friends")}
                className={`flex items-center gap-2 px-4 h-[34px] rounded-full text-[12px] font-medium transition-colors ${
                  visibility === "friends"
                    ? "bg-[#b8e6d5] text-[#6baa96]"
                    : "bg-[#f3f4f6] text-[#6a7282]"
                }`}
              >
                <Users size={16} />
                Friends
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-[56px] rounded-[24px] bg-[#ffe8b8] shadow-[0px_4px_15px_0px_rgba(232,185,99,0.25)] text-[16px] font-medium text-[#9d7d3f] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Post to Map
        </button>
      </form>
    </div>
  );
}
