import type {
  CanvasElement,
  Page,
  TemplateDefinition,
  WebElementType,
  WebNode,
  WebsiteDocument,
} from '../types/platform'

export const makeId = () => Math.random().toString(36).slice(2, 10)

export function makeBlankGraphicPage(
  name = 'Artboard 1',
  width = 1600,
  height = 1100,
  background = '#FFFEFA',
  transparentBg = false
): Page {
  return {
    id: makeId(),
    name,
    width,
    height,
    unit: 'px',
    dpi: 72,
    background,
    transparentBg,
    elements: [],
  }
}

export function makeBlankWhiteboardPage(name = 'Main Board'): Page {
  return {
    id: makeId(),
    name,
    width: 2400,
    height: 1600,
    unit: 'px',
    dpi: 72,
    background: '#F7F5EF',
    elements: [],
  }
}

export function makeBlankWebsiteDoc(title = 'Untitled Website'): WebsiteDocument {
  return {
    activePageId: 'web-home',
    pages: [
      {
        id: 'web-home',
        name: 'Home',
        slug: '/',
        title,
        nodes: [],
      },
    ],
  }
}

export function createWebNode(type: WebElementType): WebNode {
  const id = makeId()
  switch (type) {
    case 'navbar':
      return {
        id,
        type,
        name: 'Navigation Bar',
        tag: 'header',
        content: 'brand.',
        buttonText: 'Get Started',
        href: '#contact',
        items: [
          { title: 'Overview', href: '#hero' },
          { title: 'Features', href: '#features' },
          { title: 'Pricing', href: '#pricing' },
        ],
        visible: true,
        styles: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 32px',
          backgroundColor: '#FFFEFA',
          color: '#171717',
          borderWidth: '0px 0px 2px 0px',
          borderColor: '#171717',
        },
        responsive: {
          mobile: { padding: '14px 18px', flexDirection: 'column', gap: '10px' },
        },
      }
    case 'hero':
      return {
        id,
        type,
        name: 'Hero Section',
        tag: 'section',
        anchorId: 'hero',
        content: 'Build expressive sites with precision.',
        subContent:
          'Design responsive layouts visually across desktop, tablet, and mobile breakpoints.',
        buttonText: 'Start Building',
        href: '#features',
        visible: true,
        styles: {
          padding: '72px 40px',
          backgroundColor: '#F7F5EF',
          color: '#171717',
          textAlign: 'left',
          borderWidth: '0px 0px 2px 0px',
          borderColor: '#171717',
        },
        responsive: {
          tablet: { padding: '56px 28px' },
          mobile: { padding: '40px 20px', textAlign: 'center' },
        },
      }
    case 'feature-cards':
      return {
        id,
        type,
        name: 'Feature Section',
        tag: 'section',
        anchorId: 'features',
        content: 'Core platform capabilities',
        items: [
          {
            title: 'Responsive Breakpoints',
            subtitle: 'ADAPTIVE GRID',
            body: 'Override padding, columns, and typography per device without touching desktop.',
          },
          {
            title: 'Modular Components',
            subtitle: 'DESIGN SYSTEM',
            body: 'Reuse navigation bars, cards, and hero sections consistently across pages.',
          },
          {
            title: 'Production Export',
            subtitle: 'HTML + CSS',
            body: 'Download semantic HTML5, responsive stylesheets, and React JSX anytime.',
          },
        ],
        visible: true,
        styles: {
          padding: '64px 40px',
          backgroundColor: '#FFFEFA',
          color: '#171717',
          gridColumns: 3,
          gap: '20px',
        },
        responsive: {
          tablet: { gridColumns: 2, padding: '48px 24px' },
          mobile: { gridColumns: 1, padding: '36px 18px' },
        },
      }
    case 'testimonials':
      return {
        id,
        type,
        name: 'Testimonials',
        tag: 'section',
        content: 'Client Perspectives (Sample Preview)',
        items: [
          {
            title: 'Elena Vance',
            subtitle: 'Product Lead, Northstar',
            body: 'Clean visual layout editing combined with instant responsive code saved us days.',
          },
          {
            title: 'Marcus Chen',
            subtitle: 'Founder, Gridcraft',
            body: 'Our brand team and engineers finally share one source of truth.',
          },
        ],
        visible: true,
        styles: {
          padding: '56px 40px',
          backgroundColor: '#D8F878',
          color: '#171717',
          gridColumns: 2,
          gap: '20px',
          borderWidth: '2px 0px',
          borderColor: '#171717',
        },
        responsive: {
          mobile: { gridColumns: 1, padding: '36px 18px' },
        },
      }
    case 'pricing-cards':
      return {
        id,
        type,
        name: 'Pricing Section',
        tag: 'section',
        anchorId: 'pricing',
        content: 'Transparent plans',
        items: [
          {
            title: 'Starter',
            subtitle: '$0 / month',
            body: 'Visual website builder, responsive breakpoints, and full HTML/CSS export.',
            meta: 'Choose Starter',
          },
          {
            title: 'Studio Pro',
            subtitle: '$24 / month',
            body: 'Unlimited multi-page sites, shared brand kits, and live team collaboration.',
            meta: 'Start Pro',
          },
        ],
        visible: true,
        styles: {
          padding: '64px 40px',
          backgroundColor: '#F7F5EF',
          color: '#171717',
          gridColumns: 2,
          gap: '24px',
        },
        responsive: {
          mobile: { gridColumns: 1, padding: '36px 18px' },
        },
      }
    case 'faq':
      return {
        id,
        type,
        name: 'FAQ Section',
        tag: 'section',
        content: 'Frequently asked questions',
        items: [
          {
            title: 'How do responsive breakpoints work?',
            body: 'Desktop sets your base style. Switching to Tablet or Mobile overrides only the selected properties.',
          },
          {
            title: 'Can I export clean code?',
            body: 'Yes. Export HTML5 with embedded @media queries, standalone CSS, or React TSX.',
          },
        ],
        visible: true,
        styles: {
          padding: '56px 40px',
          backgroundColor: '#FFFEFA',
          color: '#171717',
        },
        responsive: {
          mobile: { padding: '36px 18px' },
        },
      }
    case 'form':
    case 'contact':
      return {
        id,
        type,
        name: type === 'contact' ? 'Contact Form' : 'Lead Form',
        tag: 'section',
        anchorId: 'contact',
        content: 'Get in touch',
        subContent: 'Share your project requirements and our team will respond promptly.',
        buttonText: 'Send Inquiry',
        visible: true,
        styles: {
          padding: '56px 40px',
          backgroundColor: '#5267FF',
          color: '#FFFEFA',
        },
        responsive: {
          mobile: { padding: '36px 18px' },
        },
      }
    case 'footer':
      return {
        id,
        type,
        name: 'Footer',
        tag: 'footer',
        content: '© 2026 Studio Brand. All rights reserved.',
        items: [
          { title: 'Home', href: '/' },
          { title: 'Work', href: '#features' },
          { title: 'Contact', href: '#contact' },
        ],
        visible: true,
        styles: {
          padding: '32px 40px',
          backgroundColor: '#171717',
          color: '#FFFEFA',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        responsive: {
          mobile: { flexDirection: 'column', gap: '14px', padding: '24px 18px', textAlign: 'center' },
        },
      }
    case 'heading':
      return {
        id,
        type,
        name: 'Heading',
        tag: 'h2',
        content: 'Section Headline',
        visible: true,
        styles: {
          padding: '16px 32px',
          fontSize: '36px',
          fontWeight: '700',
          fontFamily: 'Space Grotesk',
          lineHeight: '1.15',
          letterSpacing: '-0.5px',
          color: '#171717',
        },
        responsive: {
          mobile: { fontSize: '26px', padding: '12px 18px' },
        },
      }
    case 'paragraph':
    case 'rich-text':
    case 'text-block':
      return {
        id,
        type,
        name: type === 'rich-text' ? 'Rich Text' : type === 'paragraph' ? 'Paragraph' : 'Text Block',
        tag: 'p',
        content:
          'Structured editorial copy designed for optimal reading measure, clear visual contrast, and smooth responsiveness across screens.',
        visible: true,
        styles: {
          padding: '12px 32px',
          fontSize: '16px',
          fontFamily: 'DM Sans',
          fontWeight: '400',
          lineHeight: '1.6',
          letterSpacing: '0px',
          color: '#4A4742',
        },
        responsive: {
          mobile: { fontSize: '15px', padding: '10px 18px' },
        },
      }
    case 'button':
      return {
        id,
        type,
        name: 'Button',
        tag: 'a',
        buttonText: 'Get Started →',
        href: '#hero',
        visible: true,
        styles: {
          padding: '13px 22px',
          margin: '12px 32px',
          backgroundColor: '#D8F878',
          hoverBackgroundColor: '#5267FF',
          color: '#171717',
          hoverColor: '#FFFEFA',
          borderWidth: '2px',
          borderColor: '#171717',
          borderRadius: '6px',
          fontFamily: 'Space Grotesk',
          fontWeight: '700',
          fontSize: '14px',
          width: 'fit-content',
        },
      }
    case 'image':
      return {
        id,
        type,
        name: 'Image',
        src: '/assets/branding/characters/character-website-builder.png',
        alt: 'Studio Showcase Visual',
        visible: true,
        styles: {
          width: '100%',
          maxWidth: '640px',
          height: '320px',
          margin: '16px auto',
          borderRadius: '10px',
          borderWidth: '2px',
          borderColor: '#171717',
          objectFit: 'contain',
          objectPosition: 'center center',
          backgroundColor: '#F7F5EF',
          opacity: 1,
        },
        responsive: {
          mobile: { height: '220px' },
        },
      }
    case 'video':
      return {
        id,
        type,
        name: 'Video',
        content: 'Embedded Video Player (16:9)',
        src: '',
        visible: true,
        styles: {
          width: '100%',
          maxWidth: '720px',
          height: '360px',
          margin: '16px auto',
          backgroundColor: '#171717',
          color: '#D8F878',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        responsive: {
          mobile: { height: '210px' },
        },
      }
    case 'columns':
    case 'grid':
    case 'flex':
    case 'container':
    case 'section':
      return {
        id,
        type,
        name: `${type[0].toUpperCase() + type.slice(1)}`,
        tag: 'div',
        visible: true,
        styles: {
          width: '100%',
          maxWidth: type === 'container' ? '1140px' : 'none',
          padding: '28px 32px',
          margin: '0 auto',
          backgroundColor: '#FFFEFA',
          borderWidth: '1.5px',
          borderColor: '#DEDAD0',
          borderRadius: '0px',
          display: type === 'grid' || type === 'columns' ? 'grid' : 'flex',
          flexDirection: type === 'flex' ? 'row' : 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          gridColumns: type === 'grid' ? 3 : type === 'columns' ? 2 : undefined,
          gap: '16px',
        },
        responsive: {
          mobile: { gridColumns: 1, flexDirection: 'column', padding: '18px' },
        },
        children: [
          {
            id: makeId(),
            type: 'text-block',
            name: 'Column A',
            content: 'Column item — click to edit typography or drop elements.',
            visible: true,
            styles: {
              padding: '20px',
              backgroundColor: '#F7F5EF',
              borderWidth: '1.5px',
              borderColor: '#171717',
              borderRadius: '8px',
            },
          },
          {
            id: makeId(),
            type: 'text-block',
            name: 'Column B',
            content: 'Responsive sibling block — automatically adapts on mobile.',
            visible: true,
            styles: {
              padding: '20px',
              backgroundColor: '#D8F878',
              borderWidth: '1.5px',
              borderColor: '#171717',
              borderRadius: '8px',
            },
          },
        ],
      }
    case 'icon':
      return {
        id,
        type,
        name: 'Icon',
        content: '✦',
        visible: true,
        styles: {
          padding: '12px',
          margin: '12px 32px',
          width: '48px',
          height: '48px',
          backgroundColor: '#5267FF',
          color: '#D8F878',
          borderRadius: '8px',
          borderWidth: '2px',
          borderColor: '#171717',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '22px',
        },
      }
    case 'divider':
      return {
        id,
        type,
        name: 'Divider',
        visible: true,
        styles: { height: '2px', width: '100%', margin: '16px 0', backgroundColor: '#171717' },
      }
    case 'spacer':
      return {
        id,
        type,
        name: 'Spacer',
        visible: true,
        styles: { height: '48px', width: '100%' },
      }
    case 'logo':
      return {
        id,
        type,
        name: 'Logo',
        content: 'canvas studio',
        visible: true,
        styles: { padding: '12px 32px', fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: '20px' },
      }
    case 'social-links':
      return {
        id,
        type,
        name: 'Social Links',
        items: [
          { title: 'X', href: 'https://x.com' },
          { title: 'GitHub', href: 'https://github.com' },
          { title: 'Dribbble', href: 'https://dribbble.com' },
        ],
        visible: true,
        styles: { padding: '16px 32px', display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '700' },
      }
    default:
      return {
        id,
        type,
        name: 'Block',
        content: 'Editable block',
        visible: true,
        styles: { padding: '24px', backgroundColor: '#FFFEFA' },
      }
  }
}

export function makeStarterWebsite(
  title: string,
  heroHeading: string,
  heroSub: string,
  heroBg = '#F7F5EF',
  heroColor = '#171717'
): WebsiteDocument {
  const nav = createWebNode('navbar')
  nav.content = title.toLowerCase().split(' ')[0] + '.'
  const hero = createWebNode('hero')
  hero.content = heroHeading
  hero.subContent = heroSub
  hero.styles = { ...hero.styles, backgroundColor: heroBg, color: heroColor }
  return {
    activePageId: 'web-home',
    pages: [
      {
        id: 'web-home',
        name: 'Home',
        slug: '/',
        title,
        nodes: [
          nav,
          hero,
          createWebNode('feature-cards'),
          createWebNode('testimonials'),
          createWebNode('pricing-cards'),
          createWebNode('contact'),
          createWebNode('footer'),
        ],
      },
    ],
  }
}

function makeGraphicPage(
  name: string,
  width: number,
  height: number,
  background: string,
  elements: CanvasElement[]
): Page[] {
  return [{ id: makeId(), name, width, height, unit: 'px', dpi: 72, background, elements }]
}

function makeBoardPage(name: string, elements: CanvasElement[]): Page[] {
  return [{ id: makeId(), name, width: 2400, height: 1600, unit: 'px', dpi: 72, background: '#F7F5EF', elements }]
}

/* ================================================================
   1. WEBSITE TEMPLATES (10)
   ================================================================ */
export const WEBSITE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'web-business',
    title: 'Modern Business Advisory',
    category: 'Business website',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Trustworthy B2B services landing page with feature grid, testimonials & inquiry form.',
    accent: '#5267FF',
    website: makeStarterWebsite(
      'Apex Advisory',
      'Strategic guidance for growing businesses.',
      'We help leadership teams streamline operations and scale sustainably.'
    ),
  },
  {
    id: 'web-portfolio',
    title: 'Visual Designer Portfolio',
    category: 'Portfolio',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Clean showcase layout with bold headline, two-column case study grid, and contact.',
    accent: '#FF987C',
    website: makeStarterWebsite(
      'Maya Lin Portfolio',
      'Product & brand systems built with clarity.',
      'Selected identity, web, and interactive software design projects 2024–2026.',
      '#D8F878'
    ),
  },
  {
    id: 'web-agency',
    title: 'Digital Craft Agency',
    category: 'Agency website',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Full-service agency homepage highlighting capabilities, case cards, and pricing.',
    accent: '#D8F878',
    website: makeStarterWebsite(
      'Northstar Agency',
      'We design and ship digital flagship products.',
      'From brand identity to responsive web engineering under one creative roof.'
    ),
  },
  {
    id: 'web-restaurant',
    title: 'Bistro & Kitchen House',
    category: 'Restaurant website',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Warm editorial dining site with seasonal menu highlights and reservation form.',
    accent: '#F4C95D',
    website: makeStarterWebsite(
      'Saffron Table',
      'Seasonal wood-fired dining in the heart of the city.',
      'Explore tonight’s tasting menu, craft beverages, and private table bookings.',
      '#FFF6E5'
    ),
  },
  {
    id: 'web-saas',
    title: 'Cloud SaaS Platform',
    category: 'SaaS landing page',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'High-contrast SaaS landing page with value pillars, social proof, and pricing tiers.',
    accent: '#5267FF',
    website: makeStarterWebsite(
      'FlowSync Cloud',
      'Ship team workflows twice as fast.',
      'Automated pipelines, real-time analytics, and shared team workspaces.',
      '#EEF0FF'
    ),
  },
  {
    id: 'web-ecommerce',
    title: 'Curated Goods Storefront',
    category: 'E-commerce',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Boutique retail layout showcasing featured products, reviews, and bundle tiers.',
    accent: '#B8E0D2',
    website: makeStarterWebsite(
      'Kanso Objects',
      'Tactile objects for modern creative desks.',
      'Small-batch stationery, brass tools, and desk organizers crafted to last.'
    ),
  },
  {
    id: 'web-personal',
    title: 'Creator & Writer Hub',
    category: 'Personal brand',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Minimal personal homepage with bio hero, newsletter signup, and speaking FAQ.',
    accent: '#D9C8FF',
    website: makeStarterWebsite(
      'Jordan Park',
      'Writing, workshops & design engineering notes.',
      'Weekly essays on creative software, typography, and independent product building.'
    ),
  },
  {
    id: 'web-studio',
    title: 'Creative Design Studio',
    category: 'Creative studio',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Neo-brutalist studio homepage with bold cobalt hero, service columns, and client quotes.',
    accent: '#5267FF',
    website: makeStarterWebsite(
      'Forma Studio',
      'Distinctive visual identities & digital spaces.',
      'Partnering with ambitious founders to craft unforgettable products.',
      '#5267FF',
      '#FFFEFA'
    ),
  },
  {
    id: 'web-launch',
    title: 'Hardware / App Launch',
    category: 'Product launch',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Product release microsite focused on key specs, early-access waitlist & FAQ.',
    accent: '#D8F878',
    website: makeStarterWebsite(
      'Pulse Desk 2.0',
      'Meet the next generation creative console.',
      'Pre-order Batch 01 today with lifetime firmware updates included.'
    ),
  },
  {
    id: 'web-corporate',
    title: 'Enterprise Solutions Site',
    category: 'Corporate website',
    type: 'website',
    dimensions: '1280px · Responsive',
    description: 'Structured corporate portal with clear navigation, solutions grid, and contact.',
    accent: '#8BB8FF',
    website: makeStarterWebsite(
      'Vertex Systems',
      'Enterprise infrastructure engineered for reliability.',
      'Trusted across 40+ countries for mission-critical operational scale.'
    ),
  },
]

/* ================================================================
   2. GRAPHIC DESIGN TEMPLATES (12)
   ================================================================ */
export const GRAPHIC_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'gfx-ig-post',
    title: 'Instagram Editorial Post',
    category: 'Instagram post',
    type: 'graphic',
    dimensions: '1080 × 1080 px',
    description: '1:1 feed post with neo-brutalist card frame, lime orb accent, and bold headline.',
    accent: '#D8F878',
    pages: makeGraphicPage('Instagram Post', 1080, 1080, '#F7F5EF', [
      { id: makeId(), type: 'rect', name: 'Card Base', x: 90, y: 90, w: 900, h: 900, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 4, opacity: 1, radius: 18, visible: true, locked: false },
      { id: makeId(), type: 'circle', name: 'Accent Orb', x: 700, y: 150, w: 200, h: 200, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Headline', x: 160, y: 290, w: 660, h: 220, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'Design Boldly.\nShip Today.', fontSize: 80, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-ig-story',
    title: 'Instagram Story Drop',
    category: 'Instagram story',
    type: 'graphic',
    dimensions: '1080 × 1920 px',
    description: '9:16 vertical announcement story with high-contrast CTA pill.',
    accent: '#5267FF',
    pages: makeGraphicPage('Instagram Story', 1080, 1920, '#5267FF', [
      { id: makeId(), type: 'rect', name: 'Inner Card', x: 80, y: 180, w: 920, h: 1560, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 5, opacity: 1, radius: 28, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Story Headline', x: 140, y: 420, w: 800, h: 300, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'NEW STUDIO\nCOLLECTION', fontSize: 88, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'center', visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Swipe Pill', x: 260, y: 1440, w: 560, h: 110, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 4, opacity: 1, radius: 55, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-yt-thumb',
    title: 'YouTube Creator Thumbnail',
    category: 'YouTube thumbnail',
    type: 'graphic',
    dimensions: '1280 × 720 px',
    description: '16:9 video thumbnail with dark canvas contrast and highlighted badge.',
    accent: '#FF987C',
    pages: makeGraphicPage('YouTube 16:9', 1280, 720, '#171717', [
      { id: makeId(), type: 'rect', name: 'Split Card', x: 680, y: 60, w: 540, h: 600, rotation: 0, fill: '#D8F878', stroke: '#FFFEFA', strokeWidth: 4, opacity: 1, radius: 16, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Thumb Title', x: 80, y: 170, w: 540, h: 240, rotation: 0, fill: '#FFFEFA', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'PRO WORKFLOW\nSECRETS', fontSize: 72, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'star', name: 'Highlight Star', x: 850, y: 240, w: 190, h: 190, rotation: 10, fill: '#5267FF', stroke: '#171717', strokeWidth: 4, opacity: 1, radius: 0, starPoints: 5, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-tiktok',
    title: 'TikTok Cover Frame',
    category: 'TikTok cover',
    type: 'graphic',
    dimensions: '1080 × 1920 px',
    description: 'Vertical cover template balanced for TikTok feed text safe zones.',
    accent: '#D8F878',
    pages: makeGraphicPage('TikTok Cover', 1080, 1920, '#171717', [
      { id: makeId(), type: 'rect', name: 'Safe Zone Box', x: 120, y: 520, w: 840, h: 520, rotation: 0, fill: '#FF987C', stroke: '#FFFEFA', strokeWidth: 4, opacity: 1, radius: 24, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Cover Title', x: 160, y: 640, w: 760, h: 240, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: '3 DESIGN TIPS\nFOR 2026', fontSize: 78, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'center', visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-poster',
    title: 'Exhibition Poster',
    category: 'Promotional poster',
    type: 'graphic',
    dimensions: '1240 × 1754 px',
    description: 'Editorial A4 poster layout with geometric focal circle and crisp grid framing.',
    accent: '#FF987C',
    pages: makeGraphicPage('Promotional Poster', 1240, 1754, '#F4C95D', [
      { id: makeId(), type: 'rect', name: 'Poster Sheet', x: 80, y: 80, w: 1080, h: 1594, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 6, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'circle', name: 'Focal Sphere', x: 320, y: 540, w: 600, h: 600, rotation: 0, fill: '#FF987C', stroke: '#171717', strokeWidth: 5, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Poster Title', x: 140, y: 180, w: 960, h: 240, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'FORM &\nMOTION 26', fontSize: 120, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-flyer',
    title: 'Modern Business Flyer',
    category: 'Business flyer',
    type: 'graphic',
    dimensions: '1240 × 1754 px',
    description: 'Print-ready flyer highlighting services, key callouts, and contact details.',
    accent: '#5267FF',
    pages: makeGraphicPage('Business Flyer', 1240, 1754, '#FFFEFA', [
      { id: makeId(), type: 'rect', name: 'Header Band', x: 0, y: 0, w: 1240, h: 420, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 0, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Flyer Heading', x: 100, y: 140, w: 1040, h: 180, rotation: 0, fill: '#FFFEFA', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'CREATIVE STUDIO\nWORKSHOP', fontSize: 74, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Info Block', x: 100, y: 520, w: 1040, h: 520, rotation: 0, fill: '#F7F5EF', stroke: '#171717', strokeWidth: 4, opacity: 1, radius: 16, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-presentation',
    title: 'Keynote Pitch Deck Slide',
    category: 'Presentation',
    type: 'graphic',
    dimensions: '1920 × 1080 px',
    description: '16:9 widescreen presentation slide with title hierarchy and accent stat panel.',
    accent: '#5267FF',
    pages: makeGraphicPage('Slide 01', 1920, 1080, '#F7F5EF', [
      { id: makeId(), type: 'text', name: 'Slide Headline', x: 120, y: 220, w: 980, h: 240, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'Q4 Design\nPlatform Strategy', fontSize: 96, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Accent Block', x: 1240, y: 200, w: 540, h: 640, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 4, opacity: 1, radius: 18, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-logo',
    title: 'Vector Logo Grid',
    category: 'Logo canvas',
    type: 'graphic',
    dimensions: '1000 × 1000 px',
    description: '1000×1000 mark board with geometric polygon emblem and custom wordmark.',
    accent: '#5267FF',
    pages: makeGraphicPage('Logo Board', 1000, 1000, '#FFFEFA', [
      { id: makeId(), type: 'rect', name: 'Emblem Base', x: 310, y: 210, w: 380, h: 380, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 6, opacity: 1, radius: 64, visible: true, locked: false },
      { id: makeId(), type: 'polygon', name: 'Prism Core', x: 380, y: 280, w: 240, h: 240, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 5, opacity: 1, radius: 0, sides: 6, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Wordmark', x: 240, y: 680, w: 520, h: 90, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'PRISM LABS', fontSize: 64, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'center', visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-brand-board',
    title: 'Identity Brand Board',
    category: 'Brand board',
    type: 'graphic',
    dimensions: '1600 × 1100 px',
    description: 'Color palette swatches, primary typography specimen, and mark lockup board.',
    accent: '#D8F878',
    pages: makeGraphicPage('Brand Board', 1600, 1100, '#F7F5EF', [
      { id: makeId(), type: 'text', name: 'Board Title', x: 100, y: 100, w: 700, h: 80, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'BRAND IDENTITY SYSTEM', fontSize: 48, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Primary Swatch 1', x: 100, y: 240, w: 260, h: 260, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 14, visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Primary Swatch 2', x: 390, y: 240, w: 260, h: 260, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 14, visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Primary Swatch 3', x: 680, y: 240, w: 260, h: 260, rotation: 0, fill: '#FF987C', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 14, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-banner',
    title: 'Hero Campaign Banner',
    category: 'Banner',
    type: 'graphic',
    dimensions: '1440 × 540 px',
    description: 'Wide 1440×540 web/email promo banner with bold contrast and geometric badge.',
    accent: '#5267FF',
    pages: makeGraphicPage('Campaign Banner', 1440, 540, '#5267FF', [
      { id: makeId(), type: 'text', name: 'Offer Copy', x: 90, y: 140, w: 760, h: 160, rotation: 0, fill: '#FFFEFA', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'Canvas Studio\nEdition 2.0', fontSize: 64, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'circle', name: 'Orb Badge', x: 1080, y: 120, w: 260, h: 260, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 4, opacity: 1, radius: 0, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-ad',
    title: 'Digital Display Ad',
    category: 'Advertisement',
    type: 'graphic',
    dimensions: '1200 × 628 px',
    description: 'High-CTR social & display ad card with clear headline and CTA button.',
    accent: '#F4C95D',
    pages: makeGraphicPage('Display Ad', 1200, 628, '#D8F878', [
      { id: makeId(), type: 'text', name: 'Ad Headline', x: 80, y: 140, w: 680, h: 180, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'Build Better\nCampaigns Faster', fontSize: 64, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Ad CTA', x: 80, y: 420, w: 280, h: 80, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 12, visible: true, locked: false },
    ]),
  },
  {
    id: 'gfx-infographic',
    title: 'Metrics & Chart Infographic',
    category: 'Infographic',
    type: 'graphic',
    dimensions: '1200 × 1600 px',
    description: 'Vertical data storytelling layout with comparison bars and bold headings.',
    accent: '#B8E0D2',
    pages: makeGraphicPage('Infographic', 1200, 1600, '#F7F5EF', [
      { id: makeId(), type: 'text', name: 'Report Title', x: 100, y: 110, w: 800, h: 90, rotation: 0, fill: '#171717', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: '2026 CREATIVE REPORT', fontSize: 48, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Bar A', x: 100, y: 310, w: 840, h: 76, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Bar B', x: 100, y: 420, w: 620, h: 76, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 8, visible: true, locked: false },
    ]),
  },
]

/* ================================================================
   3. WHITEBOARD TEMPLATES (10)
   ================================================================ */
export const WHITEBOARD_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'wb-mindmap',
    title: 'Central Concept Mind Map',
    category: 'Mind map',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Central idea hub branching outward with sticky nodes and connectors.',
    accent: '#D9C8FF',
    pages: makeBoardPage('Mind Map', [
      { id: makeId(), type: 'circle', name: 'Core Node', x: 760, y: 440, w: 220, h: 140, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'text', name: 'Core Text', x: 785, y: 495, w: 170, h: 40, rotation: 0, fill: '#FFFEFA', stroke: 'none', strokeWidth: 0, opacity: 1, radius: 0, text: 'CORE VISION', fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 700, textAlign: 'center', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Branch 1', x: 380, y: 260, w: 220, h: 130, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, text: 'Audience & Brand', fontSize: 18, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'center', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Branch 2', x: 1120, y: 260, w: 220, h: 130, rotation: 0, fill: '#FF987C', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, text: 'Product Roadmap', fontSize: 18, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'center', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-brainstorming',
    title: 'Team Brainstorming Wall',
    category: 'Brainstorming',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Open ideation wall with color-coded sticky clusters for fast team capture.',
    accent: '#D8F878',
    pages: makeBoardPage('Brainstorming', [
      { id: makeId(), type: 'sticky', name: 'Prompt 1', x: 240, y: 220, w: 230, h: 170, rotation: -2, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'How might we\nsimplify onboarding?', fontSize: 18, fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Idea A', x: 520, y: 230, w: 230, h: 170, rotation: 2, fill: '#FF987C', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'Add 1-click\ntemplate preview', fontSize: 18, fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Idea B', x: 800, y: 220, w: 230, h: 170, rotation: -1, fill: '#F4C95D', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'Interactive\nblank canvas bar', fontSize: 18, fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-swot',
    title: 'SWOT Matrix Board',
    category: 'SWOT analysis',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: '2×2 strategic grid for Strengths, Weaknesses, Opportunities, and Threats.',
    accent: '#F4C95D',
    pages: makeBoardPage('SWOT Analysis', [
      { id: makeId(), type: 'frame', name: 'Strengths', x: 220, y: 160, w: 500, h: 360, rotation: 0, fill: '#EEF0FF', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'frame', name: 'Weaknesses', x: 760, y: 160, w: 500, h: 360, rotation: 0, fill: '#FFF0EC', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'frame', name: 'Opportunities', x: 220, y: 560, w: 500, h: 360, rotation: 0, fill: '#F2FCE0', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'frame', name: 'Threats', x: 760, y: 560, w: 500, h: 360, rotation: 0, fill: '#FFF6E5', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'S1', x: 260, y: 220, w: 200, h: 130, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'STRENGTHS:\nUnified design + web', fontSize: 16, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-flowchart',
    title: 'System Process Flowchart',
    category: 'Flowchart',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Sequential process blocks connected with directional flow arrows.',
    accent: '#8BB8FF',
    pages: makeBoardPage('Flowchart', [
      { id: makeId(), type: 'rect', name: 'Start', x: 220, y: 420, w: 220, h: 96, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 2.5, opacity: 1, radius: 12, visible: true, locked: false },
      { id: makeId(), type: 'arrow', name: 'Link 1', x: 450, y: 458, w: 120, h: 20, rotation: 0, fill: 'none', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Process', x: 580, y: 420, w: 240, h: 96, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2.5, opacity: 1, radius: 12, visible: true, locked: false },
      { id: makeId(), type: 'arrow', name: 'Link 2', x: 830, y: 458, w: 120, h: 20, rotation: 0, fill: 'none', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'rect', name: 'Outcome', x: 960, y: 420, w: 220, h: 96, rotation: 0, fill: '#5267FF', stroke: '#171717', strokeWidth: 2.5, opacity: 1, radius: 12, visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-journey',
    title: 'Customer User Journey',
    category: 'User journey',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Discovery, Onboarding, Adoption & Advocacy stages mapped horizontally.',
    accent: '#B8E0D2',
    pages: makeBoardPage('User Journey', [
      { id: makeId(), type: 'sticky', name: 'Stage 1', x: 200, y: 240, w: 240, h: 160, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: '1. DISCOVER\nVisits landing page', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Stage 2', x: 500, y: 240, w: 240, h: 160, rotation: 0, fill: '#FF987C', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: '2. CREATE\nPicks blank or template', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Stage 3', x: 800, y: 240, w: 240, h: 160, rotation: 0, fill: '#8BB8FF', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: '3. COLLABORATE\nInvites teammates live', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-kanban',
    title: 'Sprint Kanban Board',
    category: 'Kanban',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'To Do, In Progress, and Shipped columns for agile task tracking.',
    accent: '#5267FF',
    pages: makeBoardPage('Kanban Board', [
      { id: makeId(), type: 'frame', name: 'To Do', x: 180, y: 160, w: 360, h: 720, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'frame', name: 'In Progress', x: 580, y: 160, w: 360, h: 720, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'frame', name: 'Shipped', x: 980, y: 160, w: 360, h: 720, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Task 1', x: 220, y: 220, w: 280, h: 120, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'TO DO:\nDraft hero copy', fontSize: 16, fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-planning',
    title: 'Quarterly Project Roadmap',
    category: 'Project planning',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Milestone timeline with phase frames and action sticky notes.',
    accent: '#F4C95D',
    pages: makeBoardPage('Project Planning', [
      { id: makeId(), type: 'sticky', name: 'Phase 1', x: 220, y: 280, w: 250, h: 160, rotation: 0, fill: '#F4C95D', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'WEEK 1–2:\nResearch & Brand Kit', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'arrow', name: 'Arrow 1', x: 490, y: 350, w: 100, h: 20, rotation: 0, fill: 'none', stroke: '#171717', strokeWidth: 3, opacity: 1, radius: 0, visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Phase 2', x: 610, y: 280, w: 250, h: 160, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'WEEK 3–4:\nWebsite & Assets Build', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-meeting',
    title: 'Team Meeting Notes',
    category: 'Meeting notes',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Agenda, key decisions, and owner action items arranged clearly.',
    accent: '#FF987C',
    pages: makeBoardPage('Meeting Notes', [
      { id: makeId(), type: 'sticky', name: 'Agenda', x: 220, y: 220, w: 280, h: 200, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'AGENDA:\n1. Design audit\n2. Release timeline', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'Decisions', x: 540, y: 220, w: 280, h: 200, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'DECISIONS:\nShip 3 separate editors', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-bmc',
    title: 'Business Model Canvas',
    category: 'Business model canvas',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Structured value proposition, channels, revenue streams & partner blocks.',
    accent: '#D8F878',
    pages: makeBoardPage('Business Model Canvas', [
      { id: makeId(), type: 'frame', name: 'Value Propositions', x: 520, y: 180, w: 320, h: 520, rotation: 0, fill: '#FFFEFA', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 8, visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'VP Note', x: 550, y: 230, w: 260, h: 150, rotation: 0, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'VALUE PROPOSITION:\nAll-in-one visual design', fontSize: 16, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
  {
    id: 'wb-retro',
    title: 'Team Sprint Retrospective',
    category: 'Team retrospective',
    type: 'whiteboard',
    dimensions: 'Infinite Board',
    description: 'Went Well, Improve Next, and Action Items columns for collaborative retros.',
    accent: '#D9C8FF',
    pages: makeBoardPage('Retrospective', [
      { id: makeId(), type: 'sticky', name: 'Went Well', x: 220, y: 220, w: 260, h: 180, rotation: -1, fill: '#D8F878', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'WENT WELL:\nFast WebSocket sync', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
      { id: makeId(), type: 'sticky', name: 'To Improve', x: 540, y: 220, w: 260, h: 180, rotation: 1, fill: '#FF987C', stroke: '#171717', strokeWidth: 2, opacity: 1, radius: 6, text: 'IMPROVE:\nMore mobile testing', fontSize: 17, fontFamily: 'DM Sans', fontWeight: 700, textAlign: 'left', visible: true, locked: false },
    ]),
  },
]

export const PLATFORM_TEMPLATES: TemplateDefinition[] = [
  ...WEBSITE_TEMPLATES,
  ...GRAPHIC_TEMPLATES,
  ...WHITEBOARD_TEMPLATES,
]
