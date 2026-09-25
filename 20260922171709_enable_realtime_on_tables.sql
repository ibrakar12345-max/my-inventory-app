/*
# Enable realtime replication on inventory tables

1. Changes
- Add `items` table to the `supabase_realtime` publication so postgres_changes
  (INSERT, UPDATE, DELETE) are broadcast to all subscribed clients.
- Add `activity_logs` table to the same publication for real-time log streaming.
- This is required for supabase.channel().on('postgres_changes', ...) to fire
  on the frontend. Without it, changes are written to the DB but never pushed
  to subscribers.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
