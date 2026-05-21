import { motion } from 'framer-motion';
import { Globe, Share2 } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { team } from '../data/team';

export function Team() {
  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1932&auto=format&fit=crop"
        title="Our Team"
        subtitle="The people behind your unforgettable experience"
        height="50vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <StaggerItem key={member.id}>
                <motion.div
                  className="group relative bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3]"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                    />
                    {/* Social hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      <a
                        href="#"
                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe size={20} />
                      </a>
                      <a
                        href="#"
                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Share2 size={20} />
                      </a>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <h3 className="heading-md text-[#000000]">{member.name}</h3>
                    <p className="body-sm text-[#585858]">{member.role}</p>
                    <p className="body-sm text-[#585858] mt-1">{member.bio}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
