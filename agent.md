# Lodr Hotel Frontend Replication — Design & Implementation Brief

## 1. Project Overview
- **Template:** Lodr — Hotels & Lodging Framer Template  
- **Pages:** 14 (Home, About, Team [CMS], Services [CMS], Rooms [CMS], Room Detail, Gallery, Pricing, Accommodation, Reviews, FAQ, Blog [CMS], Blog Post, Contact, 404)  
- **Style:** Warm, modern hospitality. Generous whitespace, soft shadows, smooth reveal animations, clean typography.  
- **Goal:** Build a 100% accurate frontend replica using the given tech stack.

---

## 2. Tech Stack
- **Framework:** React.js + Vite  
- **Styling:** Tailwind CSS (custom theme)  
- **Animations:** Framer Motion  
- **Routing:** React Router DOM (v6)  
- **Carousels:** Swiper.js  
- **Scroll triggers:** react-intersection-observer  
- **Others:** Framer Motion’s `AnimatePresence` for page transitions, `useInView` for scroll reveals, `staggerChildren` for grouped animations.

---

## 3. Design Tokens (Tailwind Configuration)

### Typography
- **Font Family:** Instrument Sans (weights 400, 500, 600) – from Google Fonts.
- **Scale:**
  - `display-xl`: 5.5rem / 1.1 / weight 400 (hero headlines)
  - `display-lg`: 4rem / 1.15 / 400 (section titles)
  - `display-md`: 3rem / 1.2 / 400 (card headlines)
  - `heading-xl`: 2.5rem / 1.25 / 500 (page titles)
  - `heading-lg`: 2rem / 1.3 / 500 (sub-section titles)
  - `heading-md`: 1.25rem / 1.4 / 500 (card titles)
  - `body-lg`: 1.125rem / 1.6 / 400 (lead paragraphs)
  - `body-md`: 1rem / 1.6 / 400 (body copy)
  - `body-sm`: 0.875rem / 1.5 / 400 (small text)
  - `label`: 0.75rem / 1 / 600, uppercase, 0.08em letter-spacing (overlines/labels)
- All heading sizes use `clamp()` for fluid responsiveness.

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-black` | `#141414` | Footer background, main dark elements |
| `brand-white` | `#FFFFFF` | Backgrounds, cards |
| `brand-cream` | `#F8F8F8` | Section backgrounds |
| `brand-sand` | `#E3DFD4` | Accent backgrounds |
| `brand-sage` | `#E9EBE1` | Alternate section backgrounds |
| `brand-olive` | `#F6F7F1` | Light section backgrounds |
| `text-primary` | `#000000` | Headlines, body text |
| `text-secondary` | `#585858` | Subdued text |
| `text-tertiary` | `#BDBDBD` | Disabled/muted |
| `border-light` | `#E3E3E3` | Card borders |
| `border-subtle` | `#C3C3C3` | Input borders |
| Overlays | `rgba(0,0,0,0.8)`, `rgba(0,0,0,0.5)`, `rgba(0,0,0,0.1)` | For hero overlays, modals |

### Spacing & Effects
- Section vertical padding: `5rem` (desktop), `3rem` (mobile)
- Border radius: cards `0.75rem`, buttons `0.5rem`, images `1rem`
- Shadows: `shadow-card` (0 2px 16px rgba(0,0,0,0.06)), `shadow-card-hover` (0 8px 32px rgba(0,0,0,0.1)), `shadow-nav` (0 1px 0 rgba(0,0,0,0.06))

---

## 4. Common Animation & Interaction Patterns
All animations are implemented using **Framer Motion**.

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Page transition | Route change | Fade in + slide up (20px) | 0.6s | `cubic-bezier(0.25,0.46,0.45,0.94)` |
| Page exit | Route change | Fade out + slide down | 0.4s | ease |
| Scroll reveal | Element enters viewport | Fade in + slide up (40px) | 0.7s | `cubic-bezier(0.25,0.46,0.45,0.94)` |
| Stagger children | Container in view | Sequential fade+slide up (40px → 0) | stagger 0.12s per child | easeOut |
| Image hover | Mouse enter | Scale to 1.05 | 0.4s | easeOut |
| Card hover | Mouse enter | Lift: translateY(-2px), shadow increase | 0.3s | easeOut |
| Button hover | Mouse enter | Scale to 1.02 | 0.2s | ease |
| Button tap | Click | Scale to 0.98 | 0.2s | ease |
| Navigation background | Scroll > 50px | Background from transparent to solid white + backdrop blur | 0.3s | ease |
| Mobile menu | Toggle | Slide from right | 0.4s | easeOut |
| Accordion | Click | Height expand/collapse | 0.35s | easeInOut |
| Modal/lightbox | Open | Fade + scale up | 0.3s | easeOut |
| Number counter | In view | Animate from 0 to target number | 2s | easeOut |

**Implementation notes:**
- Page transitions: wrap route content in `AnimatePresence` with `motion.div` using `variants` for initial/animate/exit.
- Scroll reveals: use custom component with `useInView` from `react-intersection-observer` (`once: true`, margin `-80px`).
- Stagger containers: parent `variants` `staggerChildren: 0.12`, children have `y: 24` hidden state.
- Hover scale: wrap image in `overflow-hidden` container, use `whileHover={{ scale: 1.05 }}`.
- Button motion: wrap button/link in `motion.div` with scale transforms.
- Nav bar: state `scrolled` toggles class after 50px scroll, background transition via CSS.
- Number counter: custom hook using `requestAnimationFrame`, triggered by `useInView`.

---

## 5. Component Architecture

### Global Components
All components must be fully responsive and use the design tokens.

**Navigation**
- Position: fixed top, z-50, full width.
- States: transparent on hero (text white), solid white background with shadow on scroll.
- Logo: left side (link to home).  
- Desktop links: center or right: Home, About, Rooms, Services, Gallery, Blog, Contact.  
- CTA button: “Book Now” (primary variant, black bg on white nav).  
- Mobile: hamburger icon → full-screen overlay/drawer sliding from right, with AnimatePresence, links stacked vertically.

**Footer**
- Background: `brand-black`. Text: white.
- Grid 4 columns:  
  1. Brand: logo, short description.  
  2. Sitemap: links to all pages.  
  3. Contact: address, phone, email.  
  4. Social & Newsletter: social icons (Instagram, LinkedIn), email input + submit button (outline variant, inverted).
- Bottom bar: copyright text + “Template by Fourtwelve” attribution.

**Section Header**
- Optional overline label (`label` style, `text-secondary`).
- Title: `display-lg` or `heading-xl` (dynamic), `text-primary`, `text-balance`.
- Description: `body-lg`, `text-secondary`, max-width ~600px.
- Optional CTA button.
- Alignment prop: `left` or `center`.
- Wrapped in scroll‑reveal animation.

**Button**
- Variants:  
  - `primary`: black background, white text.  
  - `outline`: transparent background, black border and text.  
  - `ghost`: no background, only text, hover underline.
- Sizes: `sm`, `md`, `lg` (padding scales accordingly).
- Rounded corners: `rounded-button` (0.5rem).
- Supports: internal link (`to`), external link (`href`), or `onClick`.  
- Motion: scales on hover/tap.

**Card** (generic, used for rooms, blog posts, team members)
- Structure: image container (top, flush, with HoverImage effect), content padding (1.5rem).
- Content: optional label, title (`heading-md`), description (`body-sm`, `text-secondary`), optional link/button.
- Style: white background, border `border-light`, `shadow-card`. Hover: `shadow-card-hover`, slight lift (`-2px`).
- Border radius: `rounded-card`.

**HoverImage**
- Wrapper with `overflow-hidden` and `rounded-image`.
- Inside `motion.img` with `whileHover={{ scale: 1.05 }}`.

**StatItem**
- Large number: `display-md` or `display-lg`, with `+` suffix.
- Label below: `body-sm`, `text-secondary`.
- Animate number count-up on scroll (use custom hook, duration 2s).

**Accordion**
- Expandable item with smooth height animation (Framer Motion `AnimatePresence` + `motion.div` with `animate={{ height: 'auto' }}`).
- Used for FAQ and possibly other expandable sections.

**Lightbox (for gallery)**
- Full‑screen overlay with `AnimatePresence`.
- Image displayed centered, close button, navigation arrows.

---

## 6. Page-by-Page Specifications

### Home (`/`)
1. **Hero**  
   - Full viewport height (`100vh`, min 700px).  
   - Background image with dark overlay (opacity 0.3).  
   - Centered content: overline “Welcome to Lodr” (`label`, white/80%), headline “Find Your Perfect Stay” (`display-xl`, white), subtitle (`body-lg`, white/70%).  
   - Two buttons: “Explore Rooms” (primary white bg) and “Learn More” (outline white border).  
   - Animated scroll-down indicator (chevron bouncing).  
   - Nav: transparent initially, switches to white solid on scroll.
2. **Intro / About Snippet**  
   - 2‑column (text left, image right).  
   - Overline: “About Lodr Hotel”. Title: “We’re redefining what it means to feel at home”.  
   - Short description + 3 stat items (Guest Satisfaction 98%, Rooms 150+, Years Experience 25+).  
   - Image: 4:5 aspect, rounded corners, shadow.  
   - Animations: text staggers from left, image fades in from right.
3. **Rooms Preview**  
   - Background: `brand-cream`.  
   - Centered section header.  
   - Grid 3‑column (desktop) of RoomCards (image, title, description, link).  
   - Stagger reveal on grid.  
   - “View All Rooms” CTA button below.
4. **Dining Highlight**  
   - Two‑column (image left, text right).  
   - Label “Our Restaurant”, title “Dining is more than a meal…”, description, CTA.  
   - White background.
5. **Amenities Grid**  
   - 6 icons grid (spa, wifi, pool, restaurant, gym, parking) with title and short description.  
   - 2 rows of 3, centered.
6. **Testimonials**  
   - Background: `brand-sage`.  
   - Section header centered.  
   - Swiper carousel, one testimonial per slide, autoplay 5s, pause on hover.  
   - Each: large quote (`heading-lg`, italic), guest name, location, star rating.
7. **Gallery Preview**  
   - 5–6 image masonry grid.  
   - Hover overlay with Instagram icon, link to full gallery.
8. **Newsletter / Booking CTA**  
   - Background: `brand-black`.  
   - Title “Stay in Touch” (white), description (white/70%).  
   - Email input + submit button (primary white).  
   - Alternatively, a full‑width “Book Your Stay” banner.

### About (`/about`)
- **Hero**: half‑height, image background, page title overlay.  
- **Our Story**: two‑column text+image, mission statement.  
- **Values**: 3‑column icon+text (Comfort, Quality, Hospitality).  
- **Stats Counter**: animated number counters for rooms, guests, awards, staff.  
- **Team Preview**: link to `/team` with a few team cards.  
- **CTA**: “Book Your Stay” banner.

### Rooms Listing (`/rooms`)
- **Hero**: title + breadcrumb.  
- **Filter bar**: category buttons (All, Standard, Deluxe, Suite).  
- **Room cards grid**: 3‑column, each card includes an image carousel (Swiper with thumbnails), title, price/night, capacity, amenities icons, “Book Now” button.  
- **Pagination** or “Load More” button.  
- Each card links to `/rooms/:id`.

### Room Detail (`/rooms/:id`)
- **Hero gallery**: full‑width Swiper with room images, thumbnail navigation.  
- **Info block**: room title, price/night, capacity, bed type, size.  
- **Description**: full text.  
- **Amenities list**: icon + text grid.  
- **Booking form**: date check‑in, check‑out, guests selector, “Check Availability” button.  
- **Related rooms**: 3‑card grid below.

### Services (`/services`)
- **Hero**: page title.  
- **Alternating rows**: image left/right, text block (icon, title, description, “Learn More” link).  
- Services: Spa & Wellness, Concierge, Room Service, Airport Transfer, Event Spaces, Laundry.

### Gallery (`/gallery`)
- **Filter tabs**: All, Rooms, Dining, Facilities, Events.  
- **Masonry grid**: images, click to open lightbox.  
- **Lightbox**: AnimatePresence overlay with navigation arrows.

### Pricing (`/pricing`)
- **Pricing cards**: 3‑column (Standard, Deluxe, Premium).  
- Each card: tier name, price, feature list with checkmarks, “Book Now” CTA.  
- **FAQ accordion** below the cards.

### Blog Listing (`/blog`)
- **Featured post**: large hero card at top.  
- **Post grid**: 3‑column of blog cards (image, date, category label, title, excerpt, “Read More”).  
- **Sidebar** (optional): categories, recent posts, newsletter signup form.

### Blog Post (`/blog/:slug`)
- **Hero**: full‑width featured image with title overlay.  
- **Content**: centered narrow container (`max-w-[720px]`) with rich typography (headings, paragraphs, blockquotes, images).  
- **Share buttons**: social icons.  
- **Related posts**: 3 cards at bottom.

### Contact (`/contact`)
- **Two‑column**: contact form left, info right.  
- **Form fields**: name, email, subject, message, submit button.  
- **Info**: address, phone, email, embedded map placeholder.  
- **Social links**.

### FAQ (`/faq`)
- **Accordion items** grouped by categories: Booking, Cancellation, Amenities, Payment.  
- Smooth height expansion with Framer Motion.

### Reviews (`/reviews`)
- **Overall rating**: large average rating display.  
- **Grid**: 2‑column review cards (quote, author, date, stars).  
- **Pagination**.

### Team (`/team`)
- **Grid**: 4‑column, team member cards (photo, name, role, short bio).  
- **Hover**: social links overlay.

### 404 (`*`)
- **Centered**: large “404” (`display-xl`), “Page Not Found” heading, description, “Back to Home” button.

---

## 7. Routing Structure
All routes wrapped in `AnimatePresence` for page transitions.

| Path | Component |
|------|-----------|
| `/` | Home |
| `/about` | About |
| `/rooms` | Rooms |
| `/rooms/:id` | RoomDetail |
| `/services` | Services |
| `/gallery` | Gallery |
| `/pricing` | Pricing |
| `/blog` | Blog |
| `/blog/:slug` | BlogPost |
| `/contact` | Contact |
| `/faq` | FAQ |
| `/reviews` | Reviews |
| `/team` | Team |
| `*` | NotFound |

---

## 8. Responsive Breakpoints
- **Desktop** (≥1024px): full multi‑column layouts, expanded nav.  
- **Tablet** (768‑1023px): 2‑column grids, hamburger menu.  
- **Mobile** (<768px): single column, stacked sections, simplified nav.

**Key behavior:**  
- Grid columns reduce automatically.  
- Typography scales via `clamp()`.  
- Padding reduces: `px-16` → `px-10` → `px-6`.  
- Touch targets ≥44px.  
- Swiper carousels enable touch on all devices.

---

## 9. Data Layer
For CMS‑driven pages, use static data files (`src/data/rooms.js`, `services.js`, `blog.js`, `team.js`) that mimic the CMS structure. This allows later swap with a headless CMS.

**Example Room object:**
- `id`, `name`, `category`, `price`, `capacity`, `bedType`, `size`, `images[]`, `amenities[]`, `description`

---

## 10. Performance & SEO
- Images: use WebP, lazy loading, responsive `srcset`.  
- Code splitting: `React.lazy()` + Suspense for pages.  
- Fonts: preconnect to Google Fonts, `font-display: swap`.  
- Animation: only animate `transform` and `opacity`.  
- SEO: use React Helmet for per‑page meta tags, semantic HTML, JSON‑LD structured data for hotel.

---

## 11. Implementation Order
1. Set up Vite + React + Tailwind with the custom theme.  
2. Build global components (Navigation, Footer, Button, SectionHeader, RevealOnScroll, etc.).  
3. Create page shells with routing and page transitions.  
4. Develop the Home page (most complex) as a template.  
5. Build remaining pages using shared components.  
6. Add all animations and interactions.  
7. Implement responsive tests and performance optimizations.

---

**This brief contains every design, interaction, and structural decision needed to replicate the Lodr template exactly. Provide it to the AI to generate clean, production‑ready code.**