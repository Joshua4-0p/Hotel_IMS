export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FaqItem[] = [
  {
    category: 'Booking',
    question: 'What time is check-in and check-out?',
    answer:
      'Check-in is from 3:00 PM and check-out is until 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability.',
  },
  {
    category: 'Booking',
    question: 'How far in advance should I book?',
    answer:
      'We recommend booking at least 2–4 weeks in advance for regular stays and 3–6 months ahead during peak season (June–September and December) to ensure availability.',
  },
  {
    category: 'Booking',
    question: 'Can I request a specific room or floor?',
    answer:
      'Yes, you may request specific preferences during booking or by contacting us directly. We will do our best to accommodate your request, subject to availability.',
  },
  {
    category: 'Cancellation',
    question: 'What is your cancellation policy?',
    answer:
      'Standard reservations can be cancelled free of charge up to 48 hours before arrival. Cancellations within 48 hours or no-shows will incur a charge equivalent to the first night\'s stay.',
  },
  {
    category: 'Cancellation',
    question: 'Can I modify my reservation?',
    answer:
      'Modifications to dates, room type, or guest count can be made up to 48 hours before arrival at no charge, subject to availability and any rate differences.',
  },
  {
    category: 'Amenities',
    question: 'Is breakfast included?',
    answer:
      'Yes, a complimentary breakfast buffet is served daily from 7:00 AM to 10:30 AM in our main restaurant. A la carte options are also available.',
  },
  {
    category: 'Amenities',
    question: 'Do you allow pets?',
    answer:
      'We love pets! Small dogs and cats (up to 10 kg) are welcome for a small additional fee of $30/night. Please inform us at the time of booking.',
  },
  {
    category: 'Amenities',
    question: 'Is there free Wi-Fi?',
    answer:
      'High-speed Wi-Fi is complimentary throughout the hotel, including all guest rooms, common areas, and outdoor spaces.',
  },
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express), bank transfers, and cash. A credit card is required to hold your reservation.',
  },
  {
    category: 'Payment',
    question: 'Is a deposit required at booking?',
    answer:
      'For most reservations, no deposit is required. For suite bookings and stays over 7 nights, a 20% deposit is required at the time of booking.',
  },
];
