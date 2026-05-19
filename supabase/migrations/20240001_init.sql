CREATE TABLE babies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL DEFAULT 'Bibi',
  birth_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TYPE event_type AS ENUM ('bottle', 'diaper', 'veggie', 'fruit', 'sleep');

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  baby_id uuid REFERENCES babies NOT NULL,
  type event_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bottle_events (
  event_id uuid PRIMARY KEY REFERENCES events ON DELETE CASCADE,
  time timestamptz NOT NULL,
  quantity_ml integer NOT NULL
);

CREATE TYPE diaper_poo_consistency AS ENUM ('normal', 'soft', 'liquid');

CREATE TABLE diaper_events (
  event_id uuid PRIMARY KEY REFERENCES events ON DELETE CASCADE,
  time timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('pee', 'poo')),
  poo_consistency diaper_poo_consistency
);

CREATE TABLE meal_events (
  event_id uuid PRIMARY KEY REFERENCES events ON DELETE CASCADE,
  time timestamptz NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('veggie', 'fruit')),
  quantity_gr integer NOT NULL,
  components text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE sleep_events (
  event_id uuid PRIMARY KEY REFERENCES events ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  type text NOT NULL CHECK (type IN ('nap', 'night'))
);

-- Phase 2 only — no UI or TypeScript types in Phase 1
CREATE TABLE meal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('veggie', 'fruit')),
  components text[] NOT NULL DEFAULT '{}'
);

-- RLS
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "babies: owner only" ON babies FOR ALL USING (user_id = auth.uid());

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events: owner only" ON events FOR ALL USING (user_id = auth.uid());

ALTER TABLE bottle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bottle_events: owner only" ON bottle_events FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = bottle_events.event_id AND events.user_id = auth.uid())
);

ALTER TABLE diaper_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diaper_events: owner only" ON diaper_events FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = diaper_events.event_id AND events.user_id = auth.uid())
);

ALTER TABLE meal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_events: owner only" ON meal_events FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = meal_events.event_id AND events.user_id = auth.uid())
);

ALTER TABLE sleep_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sleep_events: owner only" ON sleep_events FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = sleep_events.event_id AND events.user_id = auth.uid())
);

ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_templates: owner only" ON meal_templates FOR ALL USING (user_id = auth.uid());
