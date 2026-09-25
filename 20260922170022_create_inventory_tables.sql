/*
# Create inventory tables for Center Logistic app

1. New Tables
- `items`: Stores inventory items across two locations (Room / Warehouse).
  - id (uuid, PK)
  - title (text, not null) — item name
  - description (text) — optional item description
  - quantity (int, not null, default 0)
  - image_url (text) — optional image URL
  - location (text, not null) — 'room' or 'warehouse'
  - created_by_username (text) — who added it
  - created_by_role (text) — 'admin' or 'user'
  - created_at (timestamptz)
  - updated_at (timestamptz)

- `activity_logs`: Tracks all modifications for the admin activity log.
  - id (uuid, PK)
  - item_id (uuid, FK to items, ON DELETE CASCADE)
  - item_name (text) — snapshot of item name at time of action
  - action (text) — 'add', 'edit', 'delete', 'decrease', 'restore'
  - details (text) — human-readable description, e.g. "Quantity changed from 10 to 9"
  - quantity_from (int) — previous quantity (nullable)
  - quantity_to (int) — new quantity (nullable)
  - username (text) — who made the change
  - role (text) — 'admin' or 'user'
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD on both tables (single-tenant shared inventory, custom auth handled in frontend).
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  location text NOT NULL CHECK (location IN ('room', 'warehouse')),
  created_by_username text DEFAULT '',
  created_by_role text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_items" ON items;
CREATE POLICY "anon_select_items" ON items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_items" ON items;
CREATE POLICY "anon_insert_items" ON items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_items" ON items;
CREATE POLICY "anon_update_items" ON items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_items" ON items;
CREATE POLICY "anon_delete_items" ON items FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  item_name text DEFAULT '',
  action text NOT NULL CHECK (action IN ('add', 'edit', 'delete', 'decrease', 'restore')),
  details text DEFAULT '',
  quantity_from integer,
  quantity_to integer,
  username text DEFAULT '',
  role text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_logs" ON activity_logs;
CREATE POLICY "anon_select_logs" ON activity_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_logs" ON activity_logs;
CREATE POLICY "anon_insert_logs" ON activity_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_logs" ON activity_logs;
CREATE POLICY "anon_update_logs" ON activity_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_logs" ON activity_logs;
CREATE POLICY "anon_delete_logs" ON activity_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_items_location ON items(location);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_item_id ON activity_logs(item_id);
