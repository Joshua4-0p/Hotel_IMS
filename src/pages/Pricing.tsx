import { Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { AccordionItem } from '../components/Accordion';
import { Btn } from '../components/Btn';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { faqItems } from '../data/faq';

const fmtXAF = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const plans = [
  {
    name: 'Standard',
    price: 120000,
    features: ['Queen bed', '28 m²', 'Wi-Fi', 'Tea/Coffee Maker', 'Safe', 'Hair Dryer'],
  },
  {
    name: 'Deluxe',
    price: 168000,
    popular: true,
    features: ['King bed', '32 m²', 'Wi-Fi', 'Tea/Coffee Maker', 'Safe', 'Private Balcony', 'Mini Bar', 'Flat-screen TV'],
  },
  {
    name: 'Suite',
    price: 300000,
    features: ['King bed', '55 m²', 'Wi-Fi', 'Mini Bar', 'Private Balcony', 'Living Area', 'Marble Bathroom', 'Butler Service'],
  },
];

export function Pricing() {
  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
        title="Pricing"
        subtitle="Simple, transparent rates"
        height="50vh"
      />

      {/* Pricing cards */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <StaggerItem key={plan.name}>
                <div
                  className={`relative flex flex-col gap-6 p-8 rounded-[0.75rem] border h-full ${
                    plan.popular
                      ? 'bg-[#141414] text-white border-[#141414]'
                      : 'bg-white border-[#E3E3E3]'
                  }`}
                  style={{ boxShadow: plan.popular ? '0 8px 32px rgba(0,0,0,0.15)' : '0 2px 16px rgba(0,0,0,0.06)' }}
                >
                  {plan.popular && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 label px-4 py-1.5 rounded-full bg-white text-[#141414]"
                    >
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h2 className="heading-lg" style={{ color: plan.popular ? '#ffffff' : '#000000' }}>
                      {plan.name}
                    </h2>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="display-md" style={{ color: plan.popular ? '#ffffff' : '#000000' }}>
                        {fmtXAF(plan.price)}
                      </span>
                      <span className="body-md pb-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.6)' : '#585858' }}>
                        /night
                      </span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 body-md" style={{ color: plan.popular ? 'rgba(255,255,255,0.85)' : '#585858' }}>
                        <Check
                          size={16}
                          style={{ color: plan.popular ? '#ffffff' : '#141414' }}
                          className="shrink-0"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Btn to="/rooms" variant={plan.popular ? 'primary' : 'outline'} size="md" inverted={plan.popular} className="w-full justify-center">
                    Book Now
                  </Btn>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide max-w-[800px]">
          <RevealOnScroll>
            <h2 className="heading-xl text-[#000000] mb-8">Frequently Asked Questions</h2>
          </RevealOnScroll>
          {faqItems.map((item, i) => (
            <AccordionItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>
    </>
  );
}
