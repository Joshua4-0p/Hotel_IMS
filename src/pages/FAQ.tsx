import { PageHero } from '../components/PageHero';
import { AccordionItem } from '../components/Accordion';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { faqItems } from '../data/faq';

const categoryOrder = ['Booking', 'Cancellation', 'Amenities', 'Payment'];

export function FAQ() {
  const grouped = categoryOrder.reduce<Record<string, typeof faqItems>>((acc, cat) => {
    acc[cat] = faqItems.filter((item) => item.category === cat);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
        title="Frequently Asked Questions"
        height="50vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide max-w-[800px] flex flex-col gap-12">
          {categoryOrder.map((cat) => (
            <RevealOnScroll key={cat}>
              <div>
                <h2 className="heading-lg text-[#000000] mb-6">{cat}</h2>
                {grouped[cat].map((item, i) => (
                  <AccordionItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </>
  );
}
