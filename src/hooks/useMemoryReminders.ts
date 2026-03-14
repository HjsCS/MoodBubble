"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { MapEntry } from "@/components/MapView";
import { getDistanceMeters, PROXIMITY_RADIUS } from "@/utils/proximity";
import { getEmotionEmoji } from "@/utils/emotion-emoji";

export interface MemoryReminder {
  entry: MapEntry;
  type: "location" | "anniversary";
  label: string;
}

/** Anniversary windows we care about: [months, label] */
const ANNIVERSARY_WINDOWS: [number, string][] = [
  [1, "1 month ago"],
  [3, "3 months ago"],
  [6, "6 months ago"],
  [12, "1 year ago"],
];

/** Tolerance in days for anniversary matching */
const DATE_TOLERANCE_DAYS = 2;

/** Minimum gap between two reminders (ms) */
const REMINDER_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/** Max reminders per session */
const MAX_REMINDERS_PER_SESSION = 5;

/** Check interval for location proximity (ms) */
const LOCATION_CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds

/**
 * Hook that produces memory reminders based on:
 * 1. Proximity — user is near a location where they recorded a mood before
 * 2. Anniversary — an entry was created ~1mo / 3mo / 6mo / 1yr ago today
 */
export function useMemoryReminders(
  entries: MapEntry[],
  userLocation: { lat: number; lng: number } | null,
) {
  const [currentReminder, setCurrentReminder] = useState<MemoryReminder | null>(
    null,
  );

  // Track which entries have been shown today (by id)
  const shownIds = useRef(new Set<string>());
  // Total reminders shown this session
  const reminderCount = useRef(0);
  // Last reminder timestamp
  const lastReminderTime = useRef(0);
  // Whether anniversary check has run
  const anniversaryChecked = useRef(false);

  /** Try to show a reminder (respects cooldown & limits) */
  const tryShowReminder = useCallback((reminder: MemoryReminder) => {
    const now = Date.now();
    if (reminderCount.current >= MAX_REMINDERS_PER_SESSION) return;
    if (now - lastReminderTime.current < REMINDER_COOLDOWN_MS) return;
    if (shownIds.current.has(reminder.entry.id)) return;

    shownIds.current.add(reminder.entry.id);
    reminderCount.current += 1;
    lastReminderTime.current = now;
    setCurrentReminder(reminder);
  }, []);

  /** Dismiss the current reminder */
  const dismissReminder = useCallback(() => {
    setCurrentReminder(null);
  }, []);

  // ─── Anniversary check (runs once when entries load) ───────
  useEffect(() => {
    if (anniversaryChecked.current || entries.length === 0) return;
    anniversaryChecked.current = true;

    const now = new Date();
    const ownEntries = entries.filter((e) => e.is_own !== false);

    for (const entry of ownEntries) {
      const created = new Date(entry.created_at);

      for (const [months, label] of ANNIVERSARY_WINDOWS) {
        // Build the anniversary date
        const anniversary = new Date(created);
        anniversary.setMonth(anniversary.getMonth() + months);

        const diffDays = Math.abs(
          (now.getTime() - anniversary.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays <= DATE_TOLERANCE_DAYS) {
          const emoji = getEmotionEmoji(entry.emotion_score);
          const noteSnippet = entry.note
            ? `"${entry.note.slice(0, 40)}${entry.note.length > 40 ? "…" : ""}"`
            : `feeling ${emoji}`;

          tryShowReminder({
            entry,
            type: "anniversary",
            label: `${label}: ${noteSnippet}`,
          });
          return; // Only one anniversary reminder at a time
        }
      }
    }
  }, [entries, tryShowReminder]);

  // ─── Proximity check (runs every 60s while user moves) ─────
  useEffect(() => {
    if (!userLocation || entries.length === 0) return;

    function checkProximity() {
      if (!userLocation) return;

      const ownEntries = entries.filter((e) => e.is_own !== false);

      // Find entries within radius, pick a random one
      const nearby = ownEntries.filter((entry) => {
        if (shownIds.current.has(entry.id)) return false;
        const dist = getDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          entry.latitude,
          entry.longitude,
        );
        return dist <= PROXIMITY_RADIUS;
      });

      if (nearby.length === 0) return;

      // Pick random nearby entry
      const pick = nearby[Math.floor(Math.random() * nearby.length)];
      const emoji = getEmotionEmoji(pick.emotion_score);
      const created = new Date(pick.created_at);
      const daysAgo = Math.floor(
        (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
      );

      let timeLabel: string;
      if (daysAgo === 0) timeLabel = "earlier today";
      else if (daysAgo === 1) timeLabel = "yesterday";
      else if (daysAgo < 30) timeLabel = `${daysAgo} days ago`;
      else if (daysAgo < 365)
        timeLabel = `${Math.floor(daysAgo / 30)} months ago`;
      else
        timeLabel = `${Math.floor(daysAgo / 365)} year${Math.floor(daysAgo / 365) > 1 ? "s" : ""} ago`;

      tryShowReminder({
        entry: pick,
        type: "location",
        label: `You felt ${emoji} here ${timeLabel}`,
      });
    }

    // Check immediately, then every interval
    checkProximity();
    const interval = setInterval(checkProximity, LOCATION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [userLocation, entries, tryShowReminder]);

  return { currentReminder, dismissReminder };
}
