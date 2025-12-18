// Mock Data Service - Provides realistic rental data for testing and demo purposes
// This allows the MVP to be fully functional without a backend API

/**
 * Generate mock rental results for a given city
 * @param {string} city - City name
 * @param {number} count - Number of results to generate (default: 25)
 * @returns {Array} Array of mock rental results
 */
export function generateMockResults(city = 'London', count = 25) {
  const providers = ['Enterprise', 'Hertz', 'Avis', 'Budget', 'Europcar', 'Sixt'];
  const carModels = [
    { name: 'Toyota Corolla', category: 'Economy', passengers: 5, transmission: 'manual' },
    { name: 'Volkswagen Golf', category: 'Compact', passengers: 5, transmission: 'manual' },
    { name: 'Ford Focus', category: 'Compact', passengers: 5, transmission: 'automatic' },
    { name: 'BMW 3 Series', category: 'Premium', passengers: 5, transmission: 'automatic' },
    { name: 'Mercedes C-Class', category: 'Luxury', passengers: 5, transmission: 'automatic' },
    { name: 'Renault Clio', category: 'Economy', passengers: 5, transmission: 'manual' },
    { name: 'Peugeot 308', category: 'Compact', passengers: 5, transmission: 'manual' },
    { name: 'Audi A4', category: 'Premium', passengers: 5, transmission: 'automatic' },
    { name: 'Fiat 500', category: 'Mini', passengers: 4, transmission: 'manual' },
    { name: 'Nissan Qashqai', category: 'SUV', passengers: 5, transmission: 'automatic' },
  ];

  // London-specific attractions
  const londonAttractions = [
    {
      id: 'attr-001',
      name: 'Windsor Castle',
      description: 'Historic royal castle and residence, the oldest and largest occupied castle in the world',
      location: { city: 'Windsor', coordinates: { lat: 51.4834, lon: -0.6044 } },
      category: 'Historical',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599974718898-d0a04e3bbb67?w=400',
      estimatedVisitTime: { hours: 2, minutes: 30 }
    },
    {
      id: 'attr-002',
      name: 'Oxford University',
      description: 'World-famous university city with stunning architecture and rich academic history',
      location: { city: 'Oxford', coordinates: { lat: 51.7520, lon: -1.2577 } },
      category: 'Educational',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606924795863-fd1e92fd0300?w=400',
      estimatedVisitTime: { hours: 3, minutes: 0 }
    },
    {
      id: 'attr-003',
      name: 'Stonehenge',
      description: 'Prehistoric monument and UNESCO World Heritage Site, one of the wonders of the world',
      location: { city: 'Amesbury', coordinates: { lat: 51.1789, lon: -1.8262 } },
      category: 'Historical',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599833975787-5d9b2d1a6d5e?w=400',
      estimatedVisitTime: { hours: 2, minutes: 0 }
    },
    {
      id: 'attr-004',
      name: 'Bath Roman Baths',
      description: 'Ancient Roman site of thermal baths in the beautiful Georgian city of Bath',
      location: { city: 'Bath', coordinates: { lat: 51.3811, lon: -2.3590 } },
      category: 'Historical',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603969072881-b0fc7f3d77d7?w=400',
      estimatedVisitTime: { hours: 2, minutes: 0 }
    },
    {
      id: 'attr-005',
      name: 'Canterbury Cathedral',
      description: 'Stunning medieval cathedral and UNESCO World Heritage Site, seat of the Archbishop',
      location: { city: 'Canterbury', coordinates: { lat: 51.2799, lon: 1.0830 } },
      category: 'Religious',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571639690383-bc0f8d44e8e0?w=400',
      estimatedVisitTime: { hours: 1, minutes: 30 }
    },
    {
      id: 'attr-006',
      name: 'Cotswolds Villages',
      description: 'Picturesque area of rolling hills and charming honey-colored stone villages',
      location: { city: 'Cotswolds', coordinates: { lat: 51.8330, lon: -1.8433 } },
      category: 'Natural',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599070509926-51ef6c2bce51?w=400',
      estimatedVisitTime: { hours: 4, minutes: 0 }
    },
  ];

  // Sample itineraries
  const itineraries = [
    [
      { day: 1, stops: ['London', 'Windsor', 'Oxford'], description: 'Royal heritage and academic excellence' },
      { day: 2, stops: ['Oxford', 'Cotswolds', 'Bath'], description: 'Scenic countryside and Roman history' },
      { day: 3, stops: ['Bath', 'Stonehenge', 'London'], description: 'Ancient wonders return journey' }
    ],
    [
      { day: 1, stops: ['London', 'Canterbury', 'Brighton'], description: 'Cathedral city and seaside charm' }
    ],
    [
      { day: 1, stops: ['London', 'Windsor', 'Stonehenge', 'Bath'], description: 'Historic highlights day trip' }
    ],
    [
      { day: 1, stops: ['London', 'Oxford', 'Cotswolds'], description: 'Academic and rural escape' },
      { day: 2, stops: ['Cotswolds', 'Bath', 'London'], description: 'Spa town return journey' }
    ]
  ];

  const recommendations = [
    'Perfect for history enthusiasts and castle lovers',
    'Ideal for a romantic countryside getaway',
    'Great for families with educational attractions',
    'Best for photography and scenic drives',
    'Recommended for first-time visitors to England',
    'Excellent for architecture and heritage tours',
    'Perfect for a relaxing weekend escape',
    'Ideal for exploring quintessential English villages'
  ];

  const results = [];

  for (let i = 0; i < count; i++) {
    const provider = providers[i % providers.length];
    const carModel = carModels[i % carModels.length];
    const basePrice = carModel.category === 'Luxury' ? 120 :
                      carModel.category === 'Premium' ? 80 :
                      carModel.category === 'SUV' ? 70 :
                      carModel.category === 'Compact' ? 50 : 40;

    const priceVariation = Math.floor(Math.random() * 30) - 15;
    const finalPrice = basePrice + priceVariation + (i * 2);

    // Select 2-4 random attractions
    const attractionCount = 2 + Math.floor(Math.random() * 3);
    const selectedAttractions = londonAttractions
      .sort(() => Math.random() - 0.5)
      .slice(0, attractionCount);

    // Select itinerary based on attraction count
    const itinerary = attractionCount > 3 ? itineraries[0] :
                      attractionCount === 3 ? itineraries[3] :
                      itineraries[2];

    const totalDistance = 100 + (attractionCount * 50) + Math.floor(Math.random() * 100);
    const totalHours = Math.floor(totalDistance / 60);
    const totalMinutes = Math.floor((totalDistance % 60) + (Math.random() * 30));

    results.push({
      id: `rental-${String(i + 1).padStart(3, '0')}`,
      provider,
      price: {
        amount: finalPrice,
        currency: 'EUR'
      },
      carModel: {
        ...carModel,
        imageUrl: `https://images.unsplash.com/photo-${1492144000000 + i * 100000}?w=400&auto=format&fit=crop`
      },
      availability: Math.random() > 0.1, // 90% available
      routeInfo: {
        thumbnailUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=600&auto=format&fit=crop`,
        estimatedDuration: {
          hours: totalHours,
          minutes: totalMinutes
        },
        totalDistance: {
          value: totalDistance,
          unit: 'km'
        },
        attractions: selectedAttractions,
        itinerary,
        recommendations: recommendations[i % recommendations.length]
      }
    });
  }

  return results;
}

/**
 * Simulate API search call with mock data
 * @param {object} searchParams - Search parameters
 * @returns {Promise<object>} Mock search results
 */
export async function mockSearch(searchParams) {
  const { city } = searchParams;

  // Simulate network delay (200-800ms)
  const delay = 200 + Math.floor(Math.random() * 600);
  await new Promise(resolve => setTimeout(resolve, delay));

  // Generate mock results
  const results = generateMockResults(city, 25);

  return {
    success: true,
    results,
    totalResults: results.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if mock mode is enabled
 * @returns {boolean} True if mock mode is enabled
 */
export function isMockModeEnabled() {
  // Enable mock mode if:
  // 1. Environment variable VITE_USE_MOCK_DATA is set to 'true'
  // 2. Or running in development mode (default)
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false';
}
