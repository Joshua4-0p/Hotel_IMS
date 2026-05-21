export interface Review {
  name: string;
  location: string;
  rating: number;
  quote: string;
}

export const reviews: Review[] = [
  {
    name: 'Sarah Johnson',
    location: 'New York, USA',
    rating: 5,
    quote:
      "The best hotel experience I've ever had. The staff was incredibly attentive and the room was stunning.",
  },
  {
    name: 'Thomas Müller',
    location: 'Berlin, Germany',
    rating: 5,
    quote:
      'Perfect location, beautiful design, and the restaurant was outstanding. Will definitely return.',
  },
  {
    name: 'Priya Patel',
    location: 'Mumbai, India',
    rating: 5,
    quote:
      'From the welcome drink to the turn-down service, every detail was pure luxury.',
  },
  {
    name: 'Carlos Mendes',
    location: 'São Paulo, Brazil',
    rating: 4,
    quote:
      'Great facilities and friendly staff. The pool area was a highlight. Slight noise from the street.',
  },
  {
    name: 'Emily White',
    location: 'Sydney, Australia',
    rating: 5,
    quote:
      'A true gem! The spa was heavenly and the breakfast buffet had so many choices.',
  },
  {
    name: 'David Kim',
    location: 'Seoul, South Korea',
    rating: 5,
    quote: 'Exceptional service and a wonderfully comfortable bed. I felt like royalty.',
  },
];
