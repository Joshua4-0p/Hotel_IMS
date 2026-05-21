import { PageHero } from '../components/PageHero';
import { SectionHeader } from '../components/SectionHeader';
import { HoverImage } from '../components/HoverImage';
import { StatItem } from '../components/StatItem';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { Btn } from '../components/Btn';
import { team } from '../data/team';
import { motion } from 'framer-motion';

const values = [
  { title: 'Comfort', desc: 'Every detail designed for your relaxation.' },
  { title: 'Quality', desc: 'No compromises on service or amenities.' },
  { title: 'Hospitality', desc: 'Genuine warmth from the moment you arrive.' },
];

export function About() {
  const previewTeam = team.slice(0, 4);

  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop"
        title="About Us"
        subtitle="Learn more about our story and values"
        height="60vh"
        overlayOpacity={0.4}
      />

      {/* Our Story */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll direction="left" className="flex flex-col gap-6">
              <span className="label text-[#585858]">Our Story</span>
              <h2 className="display-lg text-[#000000]" style={{ textWrap: 'balance' }}>
                A tradition of hospitality since 1998
              </h2>
              <p className="body-lg text-[#585858]">
                Lodr began as a small family-run inn and has grown into one of the most beloved hotels in the region. We combine timeless elegance with modern comfort, always putting our guests first.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="right">
              <HoverImage
                src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1932&auto=format&fit=crop"
                alt="Historic hotel building"
                aspectRatio="4/3"
                className="shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide flex flex-col gap-12">
          <SectionHeader title="Our Core Values" />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex flex-col gap-3 p-8 bg-white rounded-[0.75rem] border border-[#E3E3E3]">
                  <h3 className="heading-lg text-[#000000]">{v.title}</h3>
                  <p className="body-md text-[#585858]">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <RevealOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <StatItem value={150} suffix="+" label="Rooms" />
              <StatItem value={98} suffix="%" label="Satisfaction" />
              <StatItem value={25} suffix="+" label="Years" />
              <StatItem value={50} suffix="+" label="Staff" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Team Preview */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide flex flex-col gap-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <SectionHeader
              title="Meet Our Team"
              align="left"
            />
            <Btn to="/our-team" variant="outline" size="sm">
              View all team members →
            </Btn>
          </div>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewTeam.map((member) => (
              <StaggerItem key={member.id}>
                <motion.div
                  className="bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3]"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <HoverImage
                    src={member.image}
                    alt={member.name}
                    aspectRatio="1/1"
                    className="rounded-none"
                  />
                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="heading-md text-[#000000]">{member.name}</h3>
                    <p className="body-sm text-[#585858]">{member.role}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-py" style={{ background: '#141414' }}>
        <div className="container-wide text-center flex flex-col items-center gap-6">
          <RevealOnScroll>
            <h2 className="heading-xl text-white">Ready for an unforgettable stay?</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="body-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Book your room today and experience the best of Lodr.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <Btn to="/rooms" variant="primary" size="lg" inverted>
              Book Now →
            </Btn>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
