import { useState } from 'react';
import { MapPin, Phone, Mail, Globe, Share2 } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { Btn } from '../components/Btn';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop"
        title="Contact Us"
        subtitle="We'd love to hear from you"
        height="50vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <RevealOnScroll direction="left">
              {sent ? (
                <div className="flex flex-col gap-4 py-16">
                  <h2 className="heading-xl text-[#000000]">Message sent!</h2>
                  <p className="body-lg text-[#585858]">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    className="body-md font-medium text-[#141414] hover:underline text-left"
                    onClick={() => setSent(false)}
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h2 className="heading-xl text-[#000000] mb-2">Send a Message</h2>

                  {[
                    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
                    { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Room enquiry' },
                  ].map((field) => (
                    <label key={field.name} className="flex flex-col gap-1.5">
                      <span className="label text-[#585858]">{field.label}</span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        className="px-4 py-3 border border-[#C3C3C3] rounded-[0.5rem] body-md focus:outline-none focus:border-[#141414] transition-colors"
                      />
                    </label>
                  ))}

                  <label className="flex flex-col gap-1.5">
                    <span className="label text-[#585858]">Message</span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Your message..."
                      required
                      rows={5}
                      className="px-4 py-3 border border-[#C3C3C3] rounded-[0.5rem] body-md focus:outline-none focus:border-[#141414] transition-colors resize-none"
                    />
                  </label>

                  <Btn type="submit" variant="primary" size="lg">
                    Send Message
                  </Btn>
                </form>
              )}
            </RevealOnScroll>

            {/* Info */}
            <RevealOnScroll direction="right" className="flex flex-col gap-8">
              <h2 className="heading-xl text-[#000000]">Get in Touch</h2>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-[#141414] mt-1 shrink-0" />
                  <div>
                    <p className="heading-md text-[#000000]">Address</p>
                    <p className="body-md text-[#585858]">123 Oceanview Drive<br />Malibu, CA 90265</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} className="text-[#141414] mt-1 shrink-0" />
                  <div>
                    <p className="heading-md text-[#000000]">Phone</p>
                    <a href="tel:+13105557890" className="body-md text-[#585858] hover:text-[#000000] transition-colors">
                      +1 (310) 555 7890
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={20} className="text-[#141414] mt-1 shrink-0" />
                  <div>
                    <p className="heading-md text-[#000000]">Email</p>
                    <a href="mailto:hello@lodrhotel.com" className="body-md text-[#585858] hover:text-[#000000] transition-colors">
                      hello@lodrhotel.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-3 border border-[#E3E3E3] rounded-full text-[#585858] hover:border-[#141414] hover:text-[#141414] transition-colors"
                  aria-label="Instagram"
                >
                  <Globe size={20} />
                </a>
                <a
                  href="#"
                  className="p-3 border border-[#E3E3E3] rounded-full text-[#585858] hover:border-[#141414] hover:text-[#141414] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Share2 size={20} />
                </a>
              </div>

              {/* Map placeholder */}
              <div
                className="w-full rounded-[1rem] overflow-hidden border border-[#E3E3E3]"
                style={{ aspectRatio: '16/9', background: '#F8F8F8' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin size={32} className="text-[#BDBDBD]" />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
