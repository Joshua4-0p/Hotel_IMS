import { Link } from 'react-router-dom';
import { Globe, Share2, Send } from 'lucide-react';
import { useState } from 'react';

const sitemapLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about-us' },
  { label: 'Rooms', to: '/rooms' },
  { label: 'Services', to: '/our-services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact-us' },
];

export function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer style={{ background: '#141414', color: '#ffffff' }}>
      <div className="container-wide section-py">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span className="heading-md font-semibold">Lodr</span>
            <p className="body-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Your perfect retreat in the heart of the city.
            </p>
          </div>

          {/* Sitemap */}
          <div className="flex flex-col gap-4">
            <span className="label" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Sitemap
            </span>
            <ul className="flex flex-col gap-2">
              {sitemapLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="body-sm transition-colors hover:opacity-70"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hotel contact */}
          <div className="flex flex-col gap-4">
            <span className="label" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Hotel
            </span>
            <div className="flex flex-col gap-2">
              <p className="body-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                123 Oceanview Drive
                <br />
                Malibu, CA 90265
              </p>
              <a
                href="tel:+13105557890"
                className="body-sm hover:opacity-70 transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                +1 (310) 555 7890
              </a>
              <a
                href="mailto:hello@lodrhotel.com"
                className="body-sm hover:opacity-70 transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                hello@lodrhotel.com
              </a>
            </div>
          </div>

          {/* Social & Newsletter */}
          <div className="flex flex-col gap-4">
            <span className="label" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Connect
            </span>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full text-white border border-white/20 hover:opacity-70 transition-opacity"
                aria-label="Instagram"
              >
                <Globe size={16} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full text-white border border-white/20 hover:opacity-70 transition-opacity"
                aria-label="LinkedIn"
              >
                <Share2 size={16} />
              </a>
            </div>
            <p className="body-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Subscribe to our newsletter
            </p>
            <form
              className="flex"
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 body-sm bg-white/10 border border-white/20 rounded-l-[0.5rem] outline-none focus:border-white/50 placeholder:text-white/30 text-white"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="px-4 py-2 bg-white text-[#141414] body-sm font-medium rounded-r-[0.5rem] hover:bg-white/90 transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 body-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        >
          <span>© 2025 Lodr Hotel. All rights reserved.</span>
          <span>Template by Fourtwelve</span>
        </div>
      </div>
    </footer>
  );
}
