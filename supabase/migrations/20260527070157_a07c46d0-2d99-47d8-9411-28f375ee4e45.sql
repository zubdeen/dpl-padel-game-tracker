
-- 1. Schema changes
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS is_captain boolean NOT NULL DEFAULT false;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS tie_breaker boolean NOT NULL DEFAULT false;

-- 2. Reset roster (also clears matches due to FK references)
DELETE FROM public.matches;
DELETE FROM public.players;

-- 3. Seed teams + players
-- category values: 'M1','M2','Star','Core','Dev'
-- ranking is a numeric order used for sorting within team

-- ACE DEUCE
INSERT INTO public.players (name, team, category, is_captain, ranking) VALUES
  ('Aahil',            'ACE DEUCE', 'M1',   false, 1),
  ('Rayhaan',          'ACE DEUCE', 'M2',   false, 2),
  ('M.Tawfeeq',        'ACE DEUCE', 'Star', true,  3),
  ('Ahmed',            'ACE DEUCE', 'Star', false, 4),
  ('Zaid',             'ACE DEUCE', 'Core', false, 5),
  ('Taha',             'ACE DEUCE', 'Core', false, 6),
  ('Fahim',            'ACE DEUCE', 'Dev',  false, 7);

-- LOS TOROS
INSERT INTO public.players (name, team, category, is_captain, ranking) VALUES
  ('Ammar',            'LOS TOROS', 'M1',   false, 1),
  ('Leeroy',           'LOS TOROS', 'M2',   true,  2),
  ('M.Nabeel',         'LOS TOROS', 'Star', false, 3),
  ('M.Aqeel',          'LOS TOROS', 'Star', false, 4),
  ('Ali R',            'LOS TOROS', 'Core', false, 5),
  ('Zain',             'LOS TOROS', 'Core', false, 6),
  ('M.Adnan',          'LOS TOROS', 'Dev',  false, 7);

-- SMASH BROS GC
INSERT INTO public.players (name, team, category, is_captain, ranking) VALUES
  ('Ali T',            'SMASH BROS GC', 'M1',   true,  1),
  ('Danyaal',          'SMASH BROS GC', 'M2',   false, 2),
  ('Ali G',            'SMASH BROS GC', 'Star', false, 3),
  ('Ishtiyak',         'SMASH BROS GC', 'Star', false, 4),
  ('Zavi',             'SMASH BROS GC', 'Core', false, 5),
  ('Zohaib',           'SMASH BROS GC', 'Core', false, 6),
  ('Zayaan',           'SMASH BROS GC', 'Dev',  false, 7);

-- SMASH MASTERS
INSERT INTO public.players (name, team, category, is_captain, ranking) VALUES
  ('Umair',            'SMASH MASTERS', 'M1',   false, 1),
  ('Abuzar',           'SMASH MASTERS', 'M2',   true,  2),
  ('Aatiq',            'SMASH MASTERS', 'Star', false, 3),
  ('Talha',            'SMASH MASTERS', 'Star', false, 4),
  ('M.Sulaiman',       'SMASH MASTERS', 'Core', false, 5),
  ('Asher',            'SMASH MASTERS', 'Core', false, 6),
  ('Eyad/Judaan',      'SMASH MASTERS', 'Dev',  false, 7);

-- TOKOLOSHE
INSERT INTO public.players (name, team, category, is_captain, ranking) VALUES
  ('Arham',            'TOKOLOSHE', 'M1',   false, 1),
  ('Abdullah',         'TOKOLOSHE', 'M2',   false, 2),
  ('Umar',             'TOKOLOSHE', 'Star', true,  3),
  ('M.Asfiyan',        'TOKOLOSHE', 'Star', false, 4),
  ('Abu M',            'TOKOLOSHE', 'Core', false, 5),
  ('Zakee',            'TOKOLOSHE', 'Core', false, 6),
  ('Zubair',           'TOKOLOSHE', 'Dev',  false, 7);

-- VIBORA RAPTORS
INSERT INTO public.players (name, team, category, is_captain, ranking) VALUES
  ('Faizan',           'VIBORA RAPTORS', 'M1',   true,  1),
  ('Ridwan',           'VIBORA RAPTORS', 'M2',   false, 2),
  ('Zuber',            'VIBORA RAPTORS', 'Star', false, 3),
  ('Stephan',          'VIBORA RAPTORS', 'Star', false, 4),
  ('Altamus',          'VIBORA RAPTORS', 'Core', false, 5),
  ('Saboor',           'VIBORA RAPTORS', 'Core', false, 6),
  ('Jaydan',           'VIBORA RAPTORS', 'Dev',  false, 7);
