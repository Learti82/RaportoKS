-- RaportoKS Database Schema
-- Run this in the Supabase SQL Editor

CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_clerk_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'rruge_deme', 'ndricim', 'mbeturina', 'trotuare', 'uji_kanalizimi',
    'ndertim_ilegal', 'parkimi', 'pemve_parqe', 'tjeter'
  )),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address_text TEXT,
  municipality TEXT NOT NULL DEFAULT 'Prishtinë',
  neighbourhood TEXT,
  photo_url TEXT,
  photo_path TEXT,
  status TEXT NOT NULL DEFAULT 'raportuar' CHECK (status IN (
    'raportuar', 'shqyrtim', 'ne_proces', 'zgjidhur', 'refuzuar'
  )),
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE report_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, clerk_user_id)
);

CREATE TABLE report_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_clerk_id TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can update own reports" ON reports FOR UPDATE USING (reporter_clerk_id = current_setting('app.clerk_user_id', true));

CREATE POLICY "Public can read upvotes" ON report_upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated can upvote" ON report_upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Can delete own upvote" ON report_upvotes FOR DELETE USING (clerk_user_id = current_setting('app.clerk_user_id', true));

CREATE POLICY "Public can read comments" ON report_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can comment" ON report_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read history" ON status_history FOR SELECT USING (true);
CREATE POLICY "Admin can insert history" ON status_history FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_municipality ON reports(municipality);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);

-- Helper functions for upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(report_id UUID)
RETURNS VOID AS $$
  UPDATE reports SET upvotes = upvotes + 1 WHERE id = report_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_upvotes(report_id UUID)
RETURNS VOID AS $$
  UPDATE reports SET upvotes = GREATEST(0, upvotes - 1) WHERE id = report_id;
$$ LANGUAGE SQL;
