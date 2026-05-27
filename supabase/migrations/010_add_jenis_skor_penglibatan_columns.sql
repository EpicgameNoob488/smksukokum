-- Add jenis_skor_penglibatan columns to students table
-- Run this in Supabase SQL Editor before deploying code changes
-- Applied: 2026-05-27

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS uniform_jenis_skor_penglibatan text,
ADD COLUMN IF NOT EXISTS kelab_jenis_skor_penglibatan text,
ADD COLUMN IF NOT EXISTS sukan_jenis_skor_penglibatan text;
