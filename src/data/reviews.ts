export interface Review {
  name: string;
  location: string;
  rating: number;
  quote: string;
}

export const reviews: Review[] = [
  {
    name: 'Amara Fotso',
    location: 'Douala, Cameroon',
    rating: 5,
    quote:
      "The best hotel experience I've ever had. The staff was incredibly attentive and the room was stunning.",
  },
  {
    name: 'Thierry Nkemdirim',
    location: 'Yaoundé, Cameroon',
    rating: 5,
    quote:
      'Perfect location, beautiful design, and the restaurant was outstanding. Will definitely return.',
  },
  {
    name: 'Ngozi Tagne',
    location: 'Buea, Cameroon',
    rating: 5,
    quote:
      'From the welcome drink to the turn-down service, every detail was pure luxury.',
  },
  {
    name: 'Brice Ewane',
    location: 'Bafoussam, Cameroon',
    rating: 4,
    quote:
      'Great facilities and friendly staff. The pool area was a highlight. Slight noise from the street.',
  },
  {
    name: 'Christelle Mbeki',
    location: 'Limbe, Cameroon',
    rating: 5,
    quote:
      'A true gem! The spa was heavenly and the breakfast buffet had so many choices.',
  },
  {
    name: 'Jean-Pierre Fongo',
    location: 'Bamenda, Cameroon',
    rating: 5,
    quote: 'Exceptional service and a wonderfully comfortable bed. I felt like royalty.',
  },
];
