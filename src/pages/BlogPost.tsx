import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogPosts } from '../data/blog';
import { Btn } from '../components/Btn';
import { StaggerContainer, StaggerItem } from '../components/RevealOnScroll';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="section-py container-wide text-center">
        <p className="body-lg text-[#585858]">Post not found.</p>
        <Btn to="/blog" variant="primary" size="md" className="mt-4">Back to Blog</Btn>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, idx) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={idx} className="heading-lg text-[#000000] mt-8 mb-4">
            {block.replace('## ', '')}
          </h2>
        );
      }
      if (block.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-[#141414] pl-6 italic body-lg text-[#585858] my-6"
          >
            {block.replace('> ', '')}
          </blockquote>
        );
      }
      return (
        <p key={idx} className="body-lg text-[#585858] mb-4">
          {block}
        </p>
      );
    });
  };

  return (
    <>
      {/* Hero */}
      <div className="relative pt-[72px]" style={{ minHeight: '60vh' }}>
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
        <div className="relative z-10 flex items-end h-full" style={{ minHeight: '60vh' }}>
          <div className="container-wide pb-12">
            <motion.div
              className="max-w-3xl flex flex-col gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center gap-3">
                <span className="label px-3 py-1 rounded-full bg-white/20 text-white">
                  {post.category}
                </span>
                <span className="body-sm text-white/70">{post.date}</span>
              </div>
              <h1 className="heading-xl text-white">{post.title}</h1>
              <p className="body-lg text-white/80">{post.excerpt}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-py bg-white">
        <div className="container-wide">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 body-sm text-[#585858] mb-10">
            <Link to="/blog" className="hover:text-[#000000] transition-colors">Blog</Link>
            <ChevronRight size={14} />
            <span className="line-clamp-1">{post.title}</span>
          </div>

          <div className="max-w-[720px] mx-auto">
            {renderContent(post.content)}
          </div>
        </div>
      </section>

      {/* Related posts */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide flex flex-col gap-10">
          <h2 className="heading-xl text-[#000000]">Related Posts</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((p) => (
              <StaggerItem key={p.slug}>
                <Link to={`/blog/${p.slug}`} className="group block">
                  <motion.div
                    className="bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3]"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                    whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="overflow-hidden aspect-[4/3]">
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex flex-col gap-2">
                      <span className="body-sm text-[#585858]">{p.date}</span>
                      <h3 className="heading-md text-[#000000] group-hover:opacity-80">{p.title}</h3>
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
