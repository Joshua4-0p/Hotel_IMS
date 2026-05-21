import { PageHero } from '../components/PageHero';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { reviews } from '../data/reviews';

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-xl" style={{ color: i < count ? '#f59e0b' : '#e3e3e3' }}>
          ★
        </span>
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1529290130-4ca3753253ae?q=80&w=2076&auto=format&fit=crop"
        title="Guest Reviews"
        subtitle="What our guests say about us"
        height="50vh"
      />

      {/* Average rating */}
      <section className="py-12 bg-white border-b border-[#E3E3E3]">
        <div className="container-wide flex flex-col sm:flex-row items-center gap-6">
          <RevealOnScroll className="flex flex-col items-center gap-2 text-center">
            <span className="display-xl text-[#000000]">4.9</span>
            <Stars count={5} />
            <span className="heading-md text-[#000000]">Excellent</span>
            <span className="body-sm text-[#585858]">Based on {reviews.length} reviews</span>
          </RevealOnScroll>
        </div>
      </section>

      {/* Review cards */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
              <StaggerItem key={i}>
                <div
                  className="bg-white p-6 rounded-[0.75rem] border border-[#E3E3E3] flex flex-col gap-4"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                >
                  <Stars count={review.rating} />
                  <p className="body-lg italic text-[#000000]">"{review.quote}"</p>
                  <div>
                    <p className="heading-md text-[#000000]">{review.name}</p>
                    <p className="body-sm text-[#585858]">{review.location}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
