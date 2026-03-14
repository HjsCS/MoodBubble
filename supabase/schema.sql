-- ============================================================
-- MoodBubble — Supabase Schema
-- Run this in the Supabase SQL Editor to create the tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Emotion category enum
create type emotion_category as enum (
  'food_dining',
  'nature',
  'social',
  'work_study',
  'relaxation',
  'travel',
  'health_exercise',
  'environment',
  'entertainment',
  'other'
);

-- Visibility enum
create type visibility as enum (
  'private',
  'friends'
);

-- Main mood_entries table
create table mood_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  emotion_score integer not null check (emotion_score between 1 and 10),
  category    emotion_category not null default 'other',
  note        text,
  media_url   text,
  visibility  visibility not null default 'private',
  created_at  timestamptz not null default now()
);

-- Indexes for common queries
create index idx_mood_entries_user    on mood_entries (user_id);
create index idx_mood_entries_created on mood_entries (created_at desc);
create index idx_mood_entries_geo     on mood_entries (latitude, longitude);

-- ============================================================
-- Row Level Security (RLS)
-- Enable RLS and add a permissive policy for now.
-- Tighten these once auth is integrated.
-- ============================================================
alter table mood_entries enable row level security;

-- Allow all operations for authenticated and anonymous users (MVP)
create policy "Allow all for MVP"
  on mood_entries
  for all
  using (true)
  with check (true);
