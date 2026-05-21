export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export const team: TeamMember[] = [
  {
    id: 'anna-miller',
    name: 'Anna Miller',
    role: 'General Manager',
    bio: 'With over 20 years in luxury hospitality, Anna ensures every guest feels at home.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop',
  },
  {
    id: 'emily-davis',
    name: 'Emily Davis',
    role: 'Head of Concierge',
    bio: 'Emily knows the city inside out and creates tailor-made experiences for our guests.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
  },
  {
    id: 'james-carter',
    name: 'James Carter',
    role: 'Executive Chef',
    bio: 'Award-winning chef James brings international flavours with a local touch.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 'sophie-lee',
    name: 'Sophie Lee',
    role: 'Spa Director',
    bio: "Sophie's holistic approach has made our spa a destination in itself.",
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
  },
  {
    id: 'maria-silva',
    name: 'Maria Silva',
    role: 'Front Office Manager',
    bio: "Maria's smile and efficiency make every check-in a pleasure.",
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'leo-dubois',
    name: 'Leo Dubois',
    role: 'Head Mixologist',
    bio: 'Leo crafts signature cocktails that are as creative as they are delicious.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 'daniel-reyes',
    name: 'Daniel Reyes',
    role: 'Maintenance Chief',
    bio: 'Daniel keeps everything running smoothly behind the scenes.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'emily-carter',
    name: 'Emily Carter',
    role: 'Event Coordinator',
    bio: 'From weddings to conferences, Emily brings every event to life.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
  },
];
