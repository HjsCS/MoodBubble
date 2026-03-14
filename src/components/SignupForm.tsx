"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, UserRound } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || email.split("@")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed.");
        return;
      }

      // Signup successful — redirect to map
      router.push("/map");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <img
          src="/MoodBubbleLogo.png"
          alt="MoodBubble"
          className="w-[100px] h-[100px] object-contain"
        />
        <h1 className="text-[24px] font-semibold text-[#101828]">MoodBubble</h1>
        <p className="text-[14px] text-[#6a7282]">
          Create an account to start journaling.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {error && (
          <div className="rounded-[12px] bg-[#ffd4d4] px-4 py-3 text-[13px] text-[#9b4a4a]">
            {error}
          </div>
        )}

        {/* Display name */}
        <div className="relative">
          <UserRound
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99a1af]"
          />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full h-[52px] pl-11 pr-4 rounded-[16px] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] text-[14px] text-[#364153] placeholder-[#99a1af] outline-none focus:ring-2 focus:ring-[#b8e6d5] transition-shadow"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99a1af]"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full h-[52px] pl-11 pr-4 rounded-[16px] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] text-[14px] text-[#364153] placeholder-[#99a1af] outline-none focus:ring-2 focus:ring-[#b8e6d5] transition-shadow"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99a1af]"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="w-full h-[52px] pl-11 pr-12 rounded-[16px] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] text-[14px] text-[#364153] placeholder-[#99a1af] outline-none focus:ring-2 focus:ring-[#b8e6d5] transition-shadow"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99a1af] hover:text-[#6a7282]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm password */}
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99a1af]"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            minLength={6}
            className="w-full h-[52px] pl-11 pr-4 rounded-[16px] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] text-[14px] text-[#364153] placeholder-[#99a1af] outline-none focus:ring-2 focus:ring-[#b8e6d5] transition-shadow"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] rounded-[16px] bg-[#b8e6d5] text-[16px] font-medium text-[#2d6b59] shadow-[0px_4px_15px_0px_rgba(107,170,150,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-[14px] text-[#6a7282]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#6baa96] hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
