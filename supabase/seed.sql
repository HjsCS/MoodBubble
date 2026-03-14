-- ============================================================
-- Seed data for local development
-- ============================================================

insert into mood_entries (user_id, latitude, longitude, emotion_score, category, note, visibility) values
  ('anonymous', -37.8136, 144.9631, 8, 'social',       'Coffee with friends in the CBD',           'private'),
  ('anonymous', -37.8076, 144.9568, 6, 'work_study',   'Long study session at the library',        'private'),
  ('anonymous', -37.7963, 144.9614, 9, 'nature',       'Beautiful morning walk in Carlton Gardens', 'friends'),
  ('anonymous', -37.8583, 144.9867, 7, 'relaxation',   'Relaxing afternoon at St Kilda Beach',     'friends'),
  ('anonymous', -37.8170, 144.9560, 3, 'work_study',   'Stressful exam today',                     'private'),
  ('anonymous', -37.8100, 144.9700, 5, 'food_dining',  'Quick lunch between classes',               'private');
