-- Migration: Enable RLS and allow authenticated users to read all tables
-- Applied: 2026-03-19

-- Enable RLS on all tables (students already has it)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE management_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kokurikulum_units ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON management_team FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON form_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON kokurikulum_units FOR SELECT TO authenticated USING (true);
