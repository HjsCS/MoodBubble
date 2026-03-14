"use client";

import { useState, useRef } from "react";
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
  ChevronRight,
  X,
  Loader2,
  ImagePlus,
} from "lucide-react";
import type { EmotionCategory, Visibility } from "@/types/database";
import LocationPickerSheet from "@/components/LocationPickerSheet";
import { compressImage } from "@/utils/compress-image";
import { createClient } from "@/lib/supabase/client";

interface AddMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    emotion_score: number;
    category: EmotionCategory;
    note: string;
    visibility: Visibility;
    media_url: string | null;
  }) => void;
  coordinates?: { lat: number; lng: number } | null;
  locationName?: string | null;
  onLocationChange?: (loc: { lat: number; lng: number; name: string }) => void;
  onPickOnMap?: () => void;
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
  coordinates,
  locationName,
  onLocationChange,
  onPickOnMap,
}: AddMoodModalProps) {
  const [score, setScore] = useState(5);
  const [category, setCategory] = useState<EmotionCategory>("other");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup photo preview URL
  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  // Handle file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit on original file
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }

    // Clear previous preview
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let media_url: string | null = null;

    // Upload photo if selected
    if (photoFile) {
      setUploading(true);
      try {
        const compressed = await compressImage(photoFile);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id ?? "anonymous";
        const path = `${userId}/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("mood-media")
          .upload(path, compressed, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload failed:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("mood-media")
            .getPublicUrl(path);
          media_url = urlData.publicUrl;
        }
      } catch (err) {
        console.error("Photo upload error:", err);
      } finally {
        setUploading(false);
      }
    }

    onSubmit({
      emotion_score: score,
      category,
      note,
      visibility,
      media_url,
    });

    // Reset state
    setScore(5);
    setCategory("other");
    setNote("");
    setVisibility("private");
    clearPhoto();
    onClose();
  }

  // Map score (1-10) to slider percentage
  const sliderPercent = ((score - 1) / 9) * 100;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#fefbf6] overflow-y-auto">
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
        {/* Location card — interactive */}
        <button
          type="button"
          onClick={() => setLocationSheetOpen(true)}
          className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.08)] px-4 py-4 w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] bg-[#b8e6d5] rounded-full flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[#6baa96]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[14px] text-[#364153]">
                {locationName ??
                  (coordinates ? "Loading location…" : "Set location")}
              </span>
              {coordinates && (
                <span className="text-[11px] text-[#99a1af]">
                  {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-[#99a1af]" />
        </button>

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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex gap-3">
          {/* Photo preview or placeholder */}
          <div className="w-[96px] h-[96px] rounded-[16px] bg-[#f3f4f6] shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] overflow-hidden relative">
            {photoPreview ? (
              <>
                <img
                  src={photoPreview}
                  alt="Selected photo"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute top-1 right-1 w-[22px] h-[22px] bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#b8e6d5] to-[#ffe8b8] opacity-60" />
            )}
          </div>
          {/* Camera button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-[96px] h-[96px] rounded-[16px] bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-1"
          >
            <Camera size={24} className="text-[#99a1af]" />
            <span className="text-[11px] font-medium text-[#99a1af]">
              Camera
            </span>
          </button>
          {/* Gallery button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-[96px] h-[96px] rounded-[16px] bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-1"
          >
            <ImagePlus size={24} className="text-[#99a1af]" />
            <span className="text-[11px] font-medium text-[#99a1af]">
              Gallery
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
          disabled={uploading}
          className="w-full h-[56px] rounded-[24px] bg-[#ffe8b8] shadow-[0px_4px_15px_0px_rgba(232,185,99,0.25)] text-[16px] font-medium text-[#9d7d3f] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Uploading…
            </>
          ) : (
            "Post to Map"
          )}
        </button>
      </form>

      {/* Location Picker Sheet */}
      <LocationPickerSheet
        isOpen={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        onPickOnMap={() => {
          setLocationSheetOpen(false);
          onPickOnMap?.();
        }}
        onAddressSelect={(name, lat, lng) => {
          setLocationSheetOpen(false);
          onLocationChange?.({ lat, lng, name });
        }}
        onGpsSelect={(name, lat, lng) => {
          setLocationSheetOpen(false);
          onLocationChange?.({ lat, lng, name });
        }}
      />
    </div>
  );
}
