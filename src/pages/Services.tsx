import { PageHero } from '../components/PageHero';
import { HoverImage } from '../components/HoverImage';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { Btn } from '../components/Btn';
import { services } from '../data/services';
import {
  Waves, Gamepad2, Dumbbell, Car, ParkingSquare, Baby,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves size={32} />,
  Gamepad2: <Gamepad2 size={32} />,
  Dumbbell: <Dumbbell size={32} />,
  Car: <Car size={32} />,
  ParkingSquare: <ParkingSquare size={32} />,
  Baby: <Baby size={32} />,
};

export function Services() {
  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1559772526-200d0be0a2b7?q=80&w=2070&auto=format&fit=crop"
        title="Our Services"
        subtitle="Everything you need for a perfect stay"
        height="60vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide flex flex-col gap-20">
          {services.map((service, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
              >
                <RevealOnScroll direction={isEven ? 'left' : 'right'} className={isEven ? '' : 'lg:order-2'}>
                  <HoverImage
                    src={service.image}
                    alt={service.title}
                    aspectRatio="4/3"
                    className="shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
                  />
                </RevealOnScroll>
                <RevealOnScroll direction={isEven ? 'right' : 'left'} className={`flex flex-col gap-5 ${isEven ? '' : 'lg:order-1'}`}>
                  <span className="text-[#141414]">{iconMap[service.icon]}</span>
                  <h2 className="heading-xl text-[#000000]">{service.title}</h2>
                  <p className="body-lg text-[#585858]">{service.description}</p>
                  <Btn to={`/our-services/${service.id}`} variant="outline" size="md">
                    Learn More →
                  </Btn>
                </RevealOnScroll>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
