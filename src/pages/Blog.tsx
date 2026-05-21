import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHero } from '../components/PageHero';
import { StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { blogPosts } from '../data/blog';

export function Blog() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"
        title="Our Blog"
        subtitle="Tips, stories, and hotel insights"
        height="50vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide flex flex-col gap-12">
          {/* Featured post */}
          <Link to={`/blog/${featured.slug}`} className="group">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3]"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
              whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="overflow-hidden aspect-[4/3]">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                  loading="eager"
                />
              </div>
              <div className="p-8 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="label px-3 py-1 rounded-full" style={{ background: '#F8F8F8', color: '#585858' }}>
                    {featured.category}
                  </span>
                  <span className="body-sm text-[#585858]">{featured.date}</span>
                </div>
                <h2 className="heading-xl text-[#000000] group-hover:opacity-80 transition-opacity">
                  {featured.title}
                </h2>
                <p className="body-lg text-[#585858]">{featured.excerpt}</p>
                <span className="body-md font-medium text-[#141414] group-hover:underline">
                  Read More →
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Post grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <StaggerItem key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="group block">
                  <motion.div
                    className="bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3] h-full flex flex-col"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                    whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="overflow-hidden aspect-[4/3]">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="label px-2 py-1 rounded-full" style={{ background: '#F8F8F8', color: '#585858' }}>
                          {post.category}
                        </span>
                        <span className="body-sm text-[#585858]">{post.date}</span>
                      </div>
                      <h3 className="heading-md text-[#000000] group-hover:opacity-80 transition-opacity">
                        {post.title}
                      </h3>
                      <p className="body-sm text-[#585858] line-clamp-2">{post.excerpt}</p>
                      <span className="body-sm font-medium text-[#141414] group-hover:underline mt-auto">
                        Read More →
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
