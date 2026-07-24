/*
# Enable Supabase Realtime for system_metrics and infra_projects

Without being added to the `supabase_realtime` publication, INSERT events
are never broadcast to client-side subscriptions even if the channel is set up
correctly. This migration adds both tables to the publication so Realtime
listeners work as expected.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE system_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE infra_projects;
