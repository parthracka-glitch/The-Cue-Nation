-- supabase/seed.sql
-- Development and Staging reference seed data

-- 1. Tables
insert into game_tables (id, name, type, status, active) values
  ('11111111-1111-1111-1111-111111111111', 'Table 1 — Brunswick Gold Crown', 'pool', 'free', true),
  ('22222222-2222-2222-2222-222222222222', 'Table 2 — Rasson Ox Pool', 'pool', 'free', true),
  ('33333333-3333-3333-3333-333333333333', 'Table 3 — Diamond Pro-Am', 'pool', 'free', true),
  ('44444444-4444-4444-4444-444444444444', 'Table 4 — Dynamic III Pool', 'pool', 'free', true),
  ('55555555-5555-5555-5555-555555555555', 'Table 5 — Riley Aristocrat Snooker', 'snooker', 'free', true),
  ('66666666-6666-6666-6666-666666666666', 'Table 6 — Star Tournament Snooker', 'snooker', 'free', true)
on conflict (id) do nothing;

-- 2. Pricing
insert into pricing (table_type, label, days, start_time, end_time, price_per_hour) values
  ('pool', 'Standard Hours', array[1,2,3,4,5], '10:00:00', '18:00:00', 300.00),
  ('pool', 'Peak & Weekends', array[0,1,2,3,4,5,6], '18:00:00', '23:59:59', 400.00),
  ('snooker', 'Standard Snooker', array[1,2,3,4,5], '10:00:00', '18:00:00', 450.00),
  ('snooker', 'Championship Peak', array[0,1,2,3,4,5,6], '18:00:00', '23:59:59', 600.00);

-- 3. Café Menu Items
insert into menu_items (name, category, price, available, image_url) values
  ('Signature Baize Cold Brew', 'Coffee', 180.00, true, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'),
  ('Smoked Bronze Espresso Macchiato', 'Coffee', 150.00, true, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'),
  ('Artisanal Flat White', 'Coffee', 190.00, true, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80'),
  ('Truffle Parmesan Hand-cut Fries', 'Snacks', 240.00, true, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'),
  ('Smoked Chicken & Sourdough Club', 'Mains', 320.00, true, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'),
  ('Charred Paneer Pesto Brioche', 'Mains', 290.00, true, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'),
  ('Midnight Cascara Sparkler', 'Beverages', 190.00, true, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
  ('Dark Chocolate Sea Salt Brownie', 'Desserts', 220.00, true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80');

-- 4. Venue Site Content
insert into site_content (key, value) values
  ('venue_info', '{
    "name": "Cue Nation Parlour & Lounge",
    "tagline": "Own the Table.",
    "phone": "+91 98765 43210",
    "email": "concierge@cuenation.club",
    "address": "84, Baize Avenue, 3rd Block, Koramangala, Bengaluru, Karnataka 560034",
    "hours": "Mon - Sun: 10:00 AM – 1:00 AM",
    "amenities": ["Tournament-Grade Strachan 6811 Cloth", "Specialty Arabica Roastery", "High-Precision Aramith Pro Balls", "Private Lounge Seating", "High-speed Fiber Wi-Fi"]
  }'::jsonb)
on conflict (key) do update set value = excluded.value;
