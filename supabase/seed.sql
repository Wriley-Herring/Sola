begin;

truncate table public.user_progress restart identity cascade;
truncate table public.reading_plan_days restart identity cascade;
truncate table public.reading_plans restart identity cascade;
insert into public.reading_plans (slug, title, description, duration_days)
values
  ('life-of-jesus', 'Life of Jesus', 'Walk through key moments in Christ''s ministry with contemplative daily readings.', 30),
  ('foundations-of-scripture', 'Foundations of Scripture', 'A 30-day framework of core biblical passages that shape the story of redemption.', 30),
  ('psalms-for-prayer', 'Psalms for Prayer', 'Two weeks of honest prayer language for quiet reflection and trust.', 14)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    duration_days = excluded.duration_days;

with
life_plan as (
  select id from public.reading_plans where slug = 'life-of-jesus'
),
life_templates as (
  select * from (values
    (1, 'Luke 1:26-38', 'The Angel Visits Mary\n\nIn the sixth month, the angel Gabriel was sent from God to Nazareth... Mary said, "Let it be to me according to your word."'),
    (2, 'Luke 2:1-20', 'The Birth of Jesus\n\nShe gave birth to her firstborn son and laid him in a manger... "Glory to God in the highest!"'),
    (3, 'Luke 10:25-37', 'The Good Samaritan\n\nA lawyer tested Jesus... "Which one proved to be a neighbor?" Jesus said, "Go and do likewise."')
  ) as t(idx, passage_reference, passage_text)
)
insert into public.reading_plan_days (reading_plan_id, day_number, passage_reference, passage_text)
select
  life_plan.id,
  gs.day_number,
  lt.passage_reference,
  lt.passage_text
from life_plan
cross join generate_series(1, 30) as gs(day_number)
join life_templates lt on lt.idx = ((gs.day_number - 1) % 3) + 1
on conflict (reading_plan_id, day_number) do update
set passage_reference = excluded.passage_reference,
    passage_text = excluded.passage_text;

with
foundations_plan as (
  select id from public.reading_plans where slug = 'foundations-of-scripture'
),
foundations_templates as (
  select * from (values
    (1, 'Genesis 1:1-5', 'In the Beginning\n\nIn the beginning, God created the heavens and the earth... and there was evening and morning, the first day.'),
    (2, 'Psalm 19:1-6', 'The Heavens Declare\n\nThe heavens declare the glory of God, and the sky proclaims his handiwork... their voice goes out through all the earth.'),
    (3, 'Luke 10:25-37', 'Neighbor Love\n\nJesus answers with a story where mercy crosses boundaries and compassion interrupts convenience.')
  ) as t(idx, passage_reference, passage_text)
)
insert into public.reading_plan_days (reading_plan_id, day_number, passage_reference, passage_text)
select
  foundations_plan.id,
  gs.day_number,
  ft.passage_reference,
  ft.passage_text
from foundations_plan
cross join generate_series(1, 30) as gs(day_number)
join foundations_templates ft on ft.idx = ((gs.day_number - 1) % 3) + 1
on conflict (reading_plan_id, day_number) do update
set passage_reference = excluded.passage_reference,
    passage_text = excluded.passage_text;

with
psalms_plan as (
  select id from public.reading_plans where slug = 'psalms-for-prayer'
),
psalm_templates as (
  select * from (values
    (1, 'Psalm 23:1-6', 'The Lord Is My Shepherd\n\nThe Lord is my shepherd; I shall not want... surely goodness and mercy shall follow me all the days of my life.'),
    (2, 'Psalm 27:1-4', 'One Thing I Ask\n\nThe Lord is my light and my salvation; whom shall I fear?... to gaze upon the beauty of the Lord.'),
    (3, 'Psalm 42:1-5', 'As the Deer\n\nAs a deer pants for streams of water, so my soul pants for you, O God... Hope in God; I shall again praise him.')
  ) as t(idx, passage_reference, passage_text)
)
insert into public.reading_plan_days (reading_plan_id, day_number, passage_reference, passage_text)
select
  psalms_plan.id,
  gs.day_number,
  pt.passage_reference,
  pt.passage_text
from psalms_plan
cross join generate_series(1, 14) as gs(day_number)
join psalm_templates pt on pt.idx = ((gs.day_number - 1) % 3) + 1
on conflict (reading_plan_id, day_number) do update
set passage_reference = excluded.passage_reference,
    passage_text = excluded.passage_text;

commit;
