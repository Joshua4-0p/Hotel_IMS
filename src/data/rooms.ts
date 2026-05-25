export interface Room {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: number;
  bedType: string;
  size: string;
  images: string[];
  amenities: string[];
  description: string;
}

export const rooms: Room[] = [
  {
    id: 'serenity-suite',
    name: 'Serenity Suite',
    category: 'Suite',
    price: 300000,
    capacity: 2,
    bedType: 'King',
    size: '55 m²',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564078516393-cf04bd354b2b?q=80&w=1974&auto=format&fit=crop',
    ],
    amenities: ['Wi-Fi', 'Mini Bar', 'Air Conditioning', 'Room Service'],
    description:
      'A spacious suite with panoramic views, a separate living area, and luxurious marble bathroom.',
  },
  {
    id: 'sunlight-terrace-villa',
    name: 'Sunlight Terrace Villa',
    category: 'Suite',
    price: 360000,
    capacity: 4,
    bedType: 'King + Sofa Bed',
    size: '70 m²',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop',
    ],
    amenities: ['Wi-Fi', 'Private Terrace', 'Jacuzzi', 'Mini Bar'],
    description:
      'Indulge in your own private terrace with sun loungers, outdoor dining, and a hot tub.',
  },
  {
    id: 'tropical-zen-retreat',
    name: 'Tropical Zen Retreat',
    category: 'Deluxe',
    price: 210000,
    capacity: 2,
    bedType: 'Queen',
    size: '40 m²',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=2070&auto=format&fit=crop',
    ],
    amenities: ['Wi-Fi', 'Bathrobe & Slippers', 'Organic Toiletries', 'Air Conditioning'],
    description:
      'A peaceful oasis inspired by nature, with bamboo accents, a rain shower, and calming decor.',
  },
  {
    id: 'lodr-signature',
    name: 'Lodr Signature',
    category: 'Suite',
    price: 480000,
    capacity: 3,
    bedType: 'King + Rollaway',
    size: '65 m²',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?q=80&w=2070&auto=format&fit=crop',
    ],
    amenities: ['Butler Service', 'Champagne Bar', 'Walk-in Closet', 'Wi-Fi'],
    description:
      'Our most prestigious accommodation, with bespoke furniture, 24-hour butler, and exclusive lounge access.',
  },
  {
    id: 'terrace-room',
    name: 'Terrace Room',
    category: 'Deluxe',
    price: 168000,
    capacity: 2,
    bedType: 'King',
    size: '32 m²',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
    ],
    amenities: ['Wi-Fi', 'Private Balcony', 'Mini Bar', 'Flat-screen TV'],
    description:
      'A bright room with a private balcony overlooking the city or garden, perfect for morning coffee.',
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    category: 'Standard',
    price: 120000,
    capacity: 2,
    bedType: 'Queen',
    size: '28 m²',
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop',
    ],
    amenities: ['Wi-Fi', 'Tea/Coffee Maker', 'Hair Dryer', 'Safe'],
    description:
      'Comfortable and elegant, our Deluxe Room offers all the essentials for a restful stay at great value.',
  },
];
