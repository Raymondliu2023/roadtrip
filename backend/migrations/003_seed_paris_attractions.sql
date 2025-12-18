-- Seed Paris attractions data
-- Requires: 001_create_attractions.sql

INSERT INTO attractions (city_code, name, description, location, category, rating, visit_duration_minutes, thumbnail_url) VALUES
(
    'PAR',
    'Palace of Versailles',
    'Magnificent royal château with stunning gardens, Hall of Mirrors, and opulent state apartments of Louis XIV.',
    ST_SetSRID(ST_MakePoint(2.1204, 48.8049), 4326),
    'Historical',
    4.9,
    240,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'
),
(
    'PAR',
    'Mont Saint-Michel',
    'Stunning island commune with medieval abbey, UNESCO World Heritage site rising dramatically from tidal flats.',
    ST_SetSRID(ST_MakePoint(-1.5114, 48.6361), 4326),
    'Historical',
    4.9,
    180,
    'https://images.unsplash.com/photo-1591034748263-ffb7e68c1f92?w=400'
),
(
    'PAR',
    'Loire Valley Châteaux',
    'Series of magnificent Renaissance castles along the Loire River, including Chambord, Chenonceau, and Amboise.',
    ST_SetSRID(ST_MakePoint(1.4442, 47.5167), 4326),
    'Historical',
    4.8,
    300,
    'https://images.unsplash.com/photo-1590070600248-af4ba8c3c4b9?w=400'
),
(
    'PAR',
    'Champagne Region (Reims)',
    'Famous wine region centered on Reims Cathedral, with champagne houses offering tours and tastings.',
    ST_SetSRID(ST_MakePoint(4.0317, 49.2583), 4326),
    'Food',
    4.7,
    210,
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'
),
(
    'PAR',
    'Giverny (Monet\'s Garden)',
    'Claude Monet\'s house and stunning water lily gardens that inspired his famous impressionist paintings.',
    ST_SetSRID(ST_MakePoint(1.5331, 49.0753), 4326),
    'Cultural',
    4.8,
    120,
    'https://images.unsplash.com/photo-1534970376987-19c6f1b1b754?w=400'
),
(
    'PAR',
    'Normandy D-Day Beaches',
    'Historic WWII landing beaches with museums, memorials, and American Cemetery honoring Allied forces.',
    ST_SetSRID(ST_MakePoint(-0.8522, 49.3411), 4326),
    'Historical',
    4.9,
    240,
    'https://images.unsplash.com/photo-1588167758729-c6c3c3d8e0b2?w=400'
),
(
    'PAR',
    'Fontainebleau Palace',
    'Grand royal château with rich Renaissance and classical architecture, once home to Napoleon Bonaparte.',
    ST_SetSRID(ST_MakePoint(2.6999, 48.4024), 4326),
    'Historical',
    4.7,
    180,
    'https://images.unsplash.com/photo-1599643958506-b9b0a4a63ad9?w=400'
),
(
    'PAR',
    'Chartres Cathedral',
    'Magnificent Gothic cathedral with stunning stained glass windows, UNESCO World Heritage site.',
    ST_SetSRID(ST_MakePoint(1.4879, 48.4472), 4326),
    'Historical',
    4.8,
    90,
    'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=400'
),
(
    'PAR',
    'Disneyland Paris',
    'World-famous theme park and resort offering magical experiences for families and Disney enthusiasts.',
    ST_SetSRID(ST_MakePoint(2.7859, 48.8674), 4326),
    'Entertainment',
    4.6,
    480,
    'https://images.unsplash.com/photo-1605710463842-c0d3eb67e298?w=400'
),
(
    'PAR',
    'Provence Lavender Fields',
    'Stunning purple lavender fields in bloom, picturesque villages, and beautiful southern French countryside.',
    ST_SetSRID(ST_MakePoint(5.4474, 43.8338), 4326),
    'Nature',
    4.9,
    240,
    'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=400'
),
(
    'PAR',
    'Rouen (Medieval City)',
    'Historic Norman city with stunning Gothic cathedral, medieval architecture, and Joan of Arc heritage.',
    ST_SetSRID(ST_MakePoint(1.0999, 49.4432), 4326),
    'Cultural',
    4.7,
    150,
    'https://images.unsplash.com/photo-1590508707850-7009f8ca84e5?w=400'
)
ON CONFLICT DO NOTHING;
