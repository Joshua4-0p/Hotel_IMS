export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
}

export const services: Service[] = [
  {
    id: 'swimming-pool',
    title: 'Swimming Pool',
    description:
      'Dive into our heated infinity pool with panoramic city views. Poolside service available all day.',
    image: 'https://images.unsplash.com/photo-1572331165267-3cda20a1a6fb?q=80&w=2070&auto=format&fit=crop',
    icon: 'Waves',
  },
  {
    id: 'game-center',
    title: 'Game Center',
    description:
      'Enjoy billiards, table tennis, and classic arcade games in our vibrant game center.',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98c2e09?q=80&w=2071&auto=format&fit=crop',
    icon: 'Gamepad2',
  },
  {
    id: 'fitness-area',
    title: 'Fitness Area',
    description:
      'Stay active with state-of-the-art cardio and weight equipment, plus yoga classes.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    icon: 'Dumbbell',
  },
  {
    id: 'transfers',
    title: 'Transfers',
    description:
      'Book our luxury airport transfers and city tours with professional drivers.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop',
    icon: 'Car',
  },
  {
    id: 'parking-space',
    title: 'Parking Space',
    description: 'Secure underground parking with valet service available 24/7.',
    image: 'https://images.unsplash.com/photo-1621977717126-e29965156a27?q=80&w=2073&auto=format&fit=crop',
    icon: 'ParkingSquare',
  },
  {
    id: 'kids-room',
    title: 'Kids Room',
    description:
      'A safe, supervised play area where children can have fun while you relax.',
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop',
    icon: 'Baby',
  },
];
