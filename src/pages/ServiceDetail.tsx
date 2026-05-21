import { useParams, Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { Btn } from '../components/Btn';
import { services } from '../data/services';
import { ChevronRight } from 'lucide-react';

export function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.id === slug);

  if (!service) {
    return (
      <div className="section-py container-wide text-center">
        <p className="body-lg text-[#585858]">Service not found.</p>
        <Btn to="/our-services" variant="primary" size="md" className="mt-4">
          Back to Services
        </Btn>
      </div>
    );
  }

  return (
    <>
      <PageHero
        image={service.image}
        title={service.title}
        height="60vh"
      />
      <section className="section-py bg-white">
        <div className="container-wide max-w-[800px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 body-sm text-[#585858] mb-8">
            <Link to="/our-services" className="hover:text-[#000000] transition-colors">Services</Link>
            <ChevronRight size={14} />
            <span>{service.title}</span>
          </div>
          <p className="body-lg text-[#585858] mb-8">{service.description}</p>
          <Btn to="/contact-us" variant="primary" size="lg">
            Book This Service
          </Btn>
        </div>
      </section>
    </>
  );
}
