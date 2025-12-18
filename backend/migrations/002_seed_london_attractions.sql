-- Seed London attractions data
-- Requires: 001_create_attractions.sql

INSERT INTO attractions (city_code, name, description, location, category, rating, visit_duration_minutes, thumbnail_url) VALUES
(
    'LON',
    'Windsor Castle',
    'Historic royal castle and residence, the oldest and largest occupied castle in the world with over 900 years of history.',
    ST_SetSRID(ST_MakePoint(-0.6044, 51.4834), 4326),
    'Historical',
    4.8,
    150,
    'https://images.unsplash.com/photo-1599974718898-d0a04e3bbb67?w=400'
),
(
    'LON',
    'Oxford University',
    'World-famous university city with stunning architecture, rich academic history, and beautiful colleges dating back to the 12th century.',
    ST_SetSRID(ST_MakePoint(-1.2577, 51.7520), 4326),
    'Cultural',
    4.9,
    180,
    'https://images.unsplash.com/photo-1606924795863-fd1e92fd0300?w=400'
),
(
    'LON',
    'Stonehenge',
    'Prehistoric monument and UNESCO World Heritage Site, one of the wonders of the world with mysterious stone circle dating to 3000 BC.',
    ST_SetSRID(ST_MakePoint(-1.8262, 51.1789), 4326),
    'Historical',
    4.7,
    120,
    'https://images.unsplash.com/photo-1599833975787-5d9b2d1a6d5e?w=400'
),
(
    'LON',
    'Bath Roman Baths',
    'Ancient Roman site of thermal baths in the beautiful Georgian city of Bath, remarkably preserved spa complex.',
    ST_SetSRID(ST_MakePoint(-2.3590, 51.3811), 4326),
    'Historical',
    4.6,
    120,
    'https://images.unsplash.com/photo-1603969072881-b0fc7f3d77d7?w=400'
),
(
    'LON',
    'Canterbury Cathedral',
    'Stunning medieval cathedral and UNESCO World Heritage Site, seat of the Archbishop of Canterbury since 597 AD.',
    ST_SetSRID(ST_MakePoint(1.0830, 51.2799), 4326),
    'Historical',
    4.8,
    90,
    'https://images.unsplash.com/photo-1571639690383-bc0f8d44e8e0?w=400'
),
(
    'LON',
    'Cotswolds Villages',
    'Picturesque area of rolling hills and charming honey-colored stone villages, perfect for scenic drives and countryside exploration.',
    ST_SetSRID(ST_MakePoint(-1.8433, 51.8330), 4326),
    'Nature',
    4.9,
    240,
    'https://images.unsplash.com/photo-1599070509926-51ef6c2bce51?w=400'
),
(
    'LON',
    'Stratford-upon-Avon',
    'Birthplace of William Shakespeare, charming market town with Tudor architecture and Royal Shakespeare Theatre.',
    ST_SetSRID(ST_MakePoint(-1.7078, 52.1917), 4326),
    'Cultural',
    4.7,
    150,
    'https://images.unsplash.com/photo-1605035015938-4d0ce9e6d4b3?w=400'
),
(
    'LON',
    'Cambridge University',
    'Historic university city famous for punting on the River Cam, beautiful colleges, and prestigious academic heritage.',
    ST_SetSRID(ST_MakePoint(0.1218, 52.2053), 4326),
    'Cultural',
    4.8,
    180,
    'https://images.unsplash.com/photo-1602416431062-d3b9d6adcdfd?w=400'
),
(
    'LON',
    'Brighton Pier',
    'Iconic seaside resort town with Victorian pier, pebble beach, and vibrant cultural scene by the English Channel.',
    ST_SetSRID(ST_MakePoint(-0.1372, 50.8198), 4326),
    'Entertainment',
    4.5,
    120,
    'https://images.unsplash.com/photo-1590670897605-57036d29cb53?w=400'
),
(
    'LON',
    'Leeds Castle',
    'Beautiful moated castle surrounded by 500 acres of parkland, known as the "loveliest castle in the world".',
    ST_SetSRID(ST_MakePoint(0.6301, 51.2488), 4326),
    'Historical',
    4.7,
    150,
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400'
)
ON CONFLICT DO NOTHING;
