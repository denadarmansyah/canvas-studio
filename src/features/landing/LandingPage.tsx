import React, { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe,
  Layers,
  LayoutTemplate,
  Palette,
  PenTool,
  Sparkles,
  Users,
} from 'lucide-react'
import type { AppView, ProjectType, TemplateCategory, TemplateDefinition } from '../../types/platform'
import { PLATFORM_TEMPLATES } from '../../data/templates'
import {
  GRAPHIC_TEMPLATE_CATEGORIES,
  WEBSITE_TEMPLATE_CATEGORIES,
  WHITEBOARD_TEMPLATE_CATEGORIES,
} from '../../data/presets'
import {
  BrandLogo,
  CharacterIllustration,
  MarketingVisual,
  ProductIllustration,
} from '../../components/branding/BrandAssets'

export function LandingPage({
  onNavigate,
  onUseTemplate,
  onQuickStart,
}: {
  onNavigate: (view: AppView) => void
  onUseTemplate: (tpl: TemplateDefinition) => void
  onQuickStart: (mode: ProjectType) => void
}) {
  const [tplTab, setTplTab] = useState<ProjectType>('website')
  const [activeCategory, setActiveCategory] = useState<'All' | TemplateCategory>('All')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const categoriesForTab =
    tplTab === 'website'
      ? WEBSITE_TEMPLATE_CATEGORIES
      : tplTab === 'graphic'
        ? GRAPHIC_TEMPLATE_CATEGORIES
        : WHITEBOARD_TEMPLATE_CATEGORIES

  const filteredTemplates = PLATFORM_TEMPLATES.filter((t) => {
    if (t.type !== tplTab) return false
    if (activeCategory !== 'All' && t.category !== activeCategory) return false
    return true
  }).slice(0, 6)

  const faqs = [
    {
      q: 'Why does Canvas Studio provide three distinct editor environments?',
      a: 'Websites, Graphic Artboards, and Whiteboards have fundamentally different workflows. Website Builder provides responsive breakpoints and container box-models; Graphic Studio provides artboards, rulers, Bezier nodes, and nondestructive photo filters; Whiteboard offers an infinite planning canvas with stickies and mind maps.',
    },
    {
      q: 'Do new blank projects start clean?',
      a: 'Yes. Choosing "Blank Canvas" opens a completely clean workspace with zero clutter. You can open the Template Browser whenever you want, or close it to stay blank.',
    },
    {
      q: 'Does the Website Builder export real HTML and CSS?',
      a: 'Yes. Every website page exports semantic HTML5 with Desktop, Tablet, and Mobile @media breakpoints, standalone CSS, and React TSX components.',
    },
    {
      q: 'How do collaboration permissions work?',
      a: 'Room invite links carry Viewer, Commenter, or Editor roles that are enforced on the WebSocket server so read-only viewers cannot mutate documents.',
    },
  ]

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-container nav-inner">
          <button
            className="nav-brand-btn"
            onClick={() => onNavigate('landing')}
            aria-label="Canvas Studio Home"
          >
            <BrandLogo variant="horizontal" height={38} />
          </button>
          <nav className="landing-links" aria-label="Primary navigation">
            <a href="#workspaces">Workspaces</a>
            <a href="#web-builder">Websites</a>
            <a href="#graphic-studio">Graphics</a>
            <a href="#collaboration">Collab</a>
            <a href="#templates">Templates</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="landing-nav-actions">
            <button className="secondary-button" onClick={() => onNavigate('login')}>
              Log in
            </button>
            <button className="secondary-button" onClick={() => onNavigate('dashboard')}>
              Dashboard
            </button>
            <button className="primary-button" onClick={() => onNavigate('register')}>
              Start Creating <ArrowRight size={16} strokeWidth={1.85} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <div className="hero-pill">
              <Sparkles size={16} strokeWidth={1.85} /> THREE DEDICATED CREATIVE WORKSPACES
            </div>
            <h1 className="type-display">
              Websites. Graphics.
              <br />
              Team Whiteboards.
              <br />
              <span>One cohesive studio.</span>
            </h1>
            <p className="type-body-lg">
              Start from a crisp blank canvas or pick from 32 organized templates across dedicated
              Website Builder, Graphic Design Studio, and Infinite Whiteboard environments—all
              synced in real time.
            </p>
            <div className="hero-cta-row">
              <button className="primary-button big" onClick={() => onQuickStart('website')}>
                <Globe size={18} strokeWidth={1.85} /> Website Builder
              </button>
              <button className="lime-button big" onClick={() => onQuickStart('graphic')}>
                <PenTool size={18} strokeWidth={1.85} /> Graphic Studio
              </button>
              <button className="secondary-button big" onClick={() => onQuickStart('whiteboard')}>
                <Sparkles size={18} strokeWidth={1.85} /> Whiteboard
              </button>
            </div>
            <div className="hero-meta-notes">
              <span><Check size={16} strokeWidth={2} /> Clean initial canvas</span>
              <span><Check size={16} strokeWidth={2} /> Real HTML/CSS/SVG/PNG/PDF export</span>
              <span><Check size={16} strokeWidth={2} /> Server-enforced collaboration</span>
            </div>
          </div>

          <div className="hero-visual-stack">
            <div className="hero-character-card">
              <div className="split-subvisual-grid" style={{ width: '100%', alignItems: 'center' }}>
                <CharacterIllustration
                  variant="main"
                  maxWidth={270}
                  eager
                  alt="Canvas Studio primary creative designer character"
                />
                <MarketingVisual
                  variant="hero-showcase"
                  maxWidth={340}
                  eager
                  alt="Canvas Studio Website Builder, Graphic Studio, and Whiteboard overview"
                />
              </div>
            </div>
            <div className="hero-preview-strip">
              <div className="preview-chip">
                <Globe size={18} strokeWidth={1.85} />
                <div>
                  <strong>Website Builder</strong>
                  <small>Desktop · Tablet · Mobile</small>
                </div>
              </div>
              <div className="preview-chip">
                <Layers size={18} strokeWidth={1.85} />
                <div>
                  <strong>Graphic Studio</strong>
                  <small>Rulers, Bezier &amp; Crop</small>
                </div>
              </div>
              <div className="preview-chip">
                <Users size={18} strokeWidth={1.85} />
                <div>
                  <strong>Whiteboard</strong>
                  <small>Mind Maps &amp; Stickies</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE WORKSPACES OVERVIEW */}
      <section id="workspaces" className="landing-section">
        <div className="landing-container">
          <div className="section-heading">
            <div className="type-label" style={{ marginBottom: 8 }}>THREE PURPOSE-BUILT ENVIRONMENTS</div>
            <h2 className="type-h2">Tailored toolbars, inspectors, and canvases for each workflow</h2>
            <p className="type-body">
              No cramped single-mode compromises—every creative task opens its own optimized workspace.
            </p>
          </div>

          <div className="showcase-grid">
            <article className="showcase-card">
              <div className="showcase-illus">
                <ProductIllustration
                  variant="website-builder"
                  maxWidth={440}
                  alt="Website Builder interface preview"
                />
              </div>
              <div className="showcase-tag cobalt">01 · WEBSITE BUILDER</div>
              <h3 className="type-h4">Responsive Web Design</h3>
              <p className="type-body-sm">
                Compose 22 modular sections, containers, grids, buttons, and forms with Desktop,
                Tablet, and Mobile breakpoint overrides.
              </p>
              <button className="secondary-button" onClick={() => onQuickStart('website')}>
                Launch Website Builder <ArrowRight size={16} strokeWidth={1.85} />
              </button>
            </article>

            <article className="showcase-card">
              <div className="showcase-illus">
                <ProductIllustration
                  variant="graphic-studio"
                  maxWidth={440}
                  alt="Graphic Design Studio artboard and toolstrip preview"
                />
              </div>
              <div className="showcase-tag lime">02 · GRAPHIC DESIGN STUDIO</div>
              <h3 className="type-h4">Artboards, Vectors &amp; Photo Editing</h3>
              <p className="type-body-sm">
                Work with pixel rulers, cyan guides, 16 tools, Bezier nodes, eyedropper color
                sampling, image crop, masks, and filters.
              </p>
              <button className="secondary-button" onClick={() => onQuickStart('graphic')}>
                Open Graphic Studio <ArrowRight size={16} strokeWidth={1.85} />
              </button>
            </article>

            <article className="showcase-card">
              <div className="showcase-illus">
                <ProductIllustration
                  variant="whiteboard"
                  maxWidth={440}
                  alt="Collaborative infinite whiteboard workspace preview"
                />
              </div>
              <div className="showcase-tag coral">03 · COLLABORATIVE WHITEBOARD</div>
              <h3 className="type-h4">Infinite Planning &amp; Mind Maps</h3>
              <p className="type-body-sm">
                Brainstorm on an open infinite canvas with sticky notes, curved connectors, SWOT
                boards, Kanban columns, and 1-click branches.
              </p>
              <button className="secondary-button" onClick={() => onQuickStart('whiteboard')}>
                Open Whiteboard <ArrowRight size={16} strokeWidth={1.85} />
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* WEBSITE BUILDER DEEP-DIVE SHOWCASE */}
      <section id="web-builder" className="landing-section alt-bg">
        <div className="landing-container split-showcase">
          <div className="split-copy">
            <div className="type-label">WEBSITE BUILDER SHOWCASE</div>
            <h2 className="type-h2">Visual layout meets semantic HTML5 &amp; responsive CSS export</h2>
            <p className="type-body">
              Edit headings, containers, flexbox rows, buttons with custom hover states, and
              images inline—without losing control of responsive breakpoints.
            </p>
            <ul className="feature-bullets">
              <li><Check size={16} /> 8 left sidebar tabs and 22 structure, copy &amp; marketing blocks</li>
              <li><Check size={16} /> Independent Desktop, Laptop, Tablet &amp; Mobile style overrides</li>
              <li><Check size={16} /> Clean HTML5, standalone @media CSS &amp; React TSX code export</li>
            </ul>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="primary-button" onClick={() => onQuickStart('website')}>
                Start Website Project <ArrowRight size={16} />
              </button>
              <button className="secondary-button" onClick={() => { setTplTab('website'); setActiveCategory('All') }}>
                <a href="#templates" style={{ textDecoration: 'none', color: 'inherit' }}>Browse 10 Web Templates</a>
              </button>
            </div>
          </div>

          <div className="split-media">
            <div className="cs-visual-card">
              <MarketingVisual
                variant="website-showcase"
                maxWidth={620}
                alt="Website Builder responsive desktop and mobile showcase"
              />
            </div>
            <div className="split-subvisual-grid">
              <div className="cs-visual-card">
                <ProductIllustration
                  variant="responsive-preview"
                  maxWidth={300}
                  alt="Synchronized Desktop, Tablet, and Mobile preview frames"
                />
              </div>
              <div className="cs-visual-card">
                <CharacterIllustration
                  variant="website-builder"
                  maxWidth={220}
                  alt="Designer building responsive website in Canvas Studio"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRAPHIC DESIGN STUDIO DEEP-DIVE SHOWCASE */}
      <section id="graphic-studio" className="landing-section">
        <div className="landing-container split-showcase reversed">
          <div className="split-copy">
            <div className="type-label">GRAPHIC DESIGN STUDIO SHOWCASE</div>
            <h2 className="type-h2">Precision artboards crafted for social kits, posters &amp; vector brand marks</h2>
            <p className="type-body">
              A dedicated 16-tool vertical strip, snap guides, nondestructive photo filters, and a
              contextual property inspector built strictly for print &amp; digital graphics.
            </p>
            <ul className="feature-bullets">
              <li><Check size={16} /> Pixel rulers, cyan alignment guides &amp; multi-artboard pages</li>
              <li><Check size={16} /> Bezier pen paths, freehand brush, crop masks &amp; eyedropper</li>
              <li><Check size={16} /> 2x transparent PNG, clean SVG, JPG, PDF &amp; JSON export</li>
            </ul>
            <div>
              <button className="lime-button" onClick={() => onQuickStart('graphic')}>
                Open Graphic Studio <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="split-media">
            <div className="cs-visual-card">
              <MarketingVisual
                variant="graphic-showcase"
                maxWidth={620}
                alt="Graphic Design Studio poster artboard and bezier tools showcase"
              />
            </div>
            <div className="split-subvisual-grid">
              <div className="cs-visual-card">
                <CharacterIllustration
                  variant="graphic-design"
                  maxWidth={300}
                  alt="Character editing graphic poster with brand swatches"
                />
              </div>
              <div className="cs-visual-card">
                <CharacterIllustration
                  variant="reviewing"
                  maxWidth={300}
                  alt="Art director reviewing printed and digital proofs"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE COLLABORATION & TEAMWORK SHOWCASE */}
      <section id="collaboration" className="landing-section alt-bg">
        <div className="landing-container split-showcase">
          <div className="split-copy">
            <div className="type-label">REAL-TIME COLLABORATION SHOWCASE</div>
            <h2 className="type-h2">Create together on websites, artboards, and team whiteboards</h2>
            <p className="type-body">
              Share any room code with granular Editor, Commenter, or Viewer permissions enforced
              directly on our Node WebSocket collaboration server.
            </p>
            <ul className="feature-bullets">
              <li><Check size={16} /> Live named peer cursors &amp; selection highlights</li>
              <li><Check size={16} /> Contextual pinned comment threads &amp; resolution status</li>
              <li><Check size={16} /> Server-side enforcement preventing unauthorized mutations</li>
            </ul>
            <div>
              <button className="primary-button" onClick={() => onQuickStart('whiteboard')}>
                Launch Collaborative Whiteboard <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="split-media">
            <div className="cs-visual-card">
              <MarketingVisual
                variant="collaboration-showcase"
                maxWidth={620}
                alt="Real-time multiplayer collaboration roles showcase"
              />
            </div>
            <div className="split-subvisual-grid">
              <div className="cs-visual-card">
                <CharacterIllustration
                  variant="collaboration"
                  maxWidth={300}
                  alt="Two designers collaborating simultaneously"
                />
              </div>
              <div className="cs-visual-card">
                <ProductIllustration
                  variant="live-collaboration"
                  maxWidth={300}
                  alt="Multiplayer cursor sync and live comments UI"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND KIT, ASSET LIBRARY & EXPORT SYSTEM */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-heading">
            <div className="type-label" style={{ marginBottom: 8 }}>UNIFIED CREATIVE INFRASTRUCTURE</div>
            <h2 className="type-h2">Shared Brand Kits, Asset Vault &amp; Production Export</h2>
            <p className="type-body">
              Define your visual identity once and deploy across every website, poster, and presentation.
            </p>
          </div>

          <div className="brand-assets-showcase">
            <article className="showcase-card">
              <div className="showcase-illus">
                <ProductIllustration variant="brand-kit" maxWidth={400} alt="Brand Kit tokens showcase" />
              </div>
              <div className="showcase-tag cobalt"><Palette size={12} /> BRAND KIT SYSTEM</div>
              <h3 className="type-h4">Logos, Type &amp; Swatches</h3>
              <p className="type-body-sm">
                Centralize custom SVGs, Space Grotesk / DM Sans font pairings, and color tokens.
              </p>
            </article>

            <article className="showcase-card">
              <div className="showcase-illus">
                <ProductIllustration variant="asset-management" maxWidth={400} alt="Asset Vault library preview" />
              </div>
              <div className="showcase-tag lime">MEDIA VAULT</div>
              <h3 className="type-h4">Reusable SVG &amp; Raster Uploads</h3>
              <p className="type-body-sm">
                Drop PNG, WebP, JPG, or crisp SVG vector graphics onto any active artboard or webpage.
              </p>
            </article>

            <article className="showcase-card">
              <div className="showcase-illus">
                <ProductIllustration variant="export-workflow" maxWidth={400} alt="Multi-format export pipeline preview" />
              </div>
              <div className="showcase-tag coral">EXPORT MATRIX</div>
              <h3 className="type-h4">7 Clean Production Formats</h3>
              <p className="type-body-sm">
                Download semantic HTML5, @media CSS, React TSX, SVG, transparent PNG, PDF, or JSON.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* TEMPLATE LIBRARY SHOWCASE */}
      <section id="templates" className="landing-section alt-bg">
        <div className="landing-container">
          <div className="template-showcase-banner">
            <div>
              <div className="type-label" style={{ marginBottom: 8 }}>ORGANIZED BY PROJECT TYPE</div>
              <h2 className="type-h2" style={{ marginBottom: 10 }}>32 Dedicated Editable Templates</h2>
              <p className="type-body-sm" style={{ marginBottom: 16 }}>
                Website, Graphic Design, and Whiteboard templates stay strictly separated—start
                from a clean blank canvas or load a template in one click.
              </p>
              <button className="primary-button" onClick={() => onNavigate('dashboard')}>
                <LayoutTemplate size={16} strokeWidth={1.85} /> Open Full Template Library
              </button>
            </div>
            <ProductIllustration
              variant="template-library"
              maxWidth={540}
              alt="Categorized Website, Graphic, and Whiteboard template showcase"
            />
          </div>

          <div className="mode-switch" style={{ width: 'fit-content', marginBottom: 16 }}>
            <button
              className={tplTab === 'website' ? 'mode-active' : ''}
              onClick={() => { setTplTab('website'); setActiveCategory('All') }}
            >
              Website Templates (10)
            </button>
            <button
              className={tplTab === 'graphic' ? 'mode-active' : ''}
              onClick={() => { setTplTab('graphic'); setActiveCategory('All') }}
            >
              Graphic Templates (12)
            </button>
            <button
              className={tplTab === 'whiteboard' ? 'mode-active' : ''}
              onClick={() => { setTplTab('whiteboard'); setActiveCategory('All') }}
            >
              Whiteboard Templates (10)
            </button>
          </div>

          <div className="category-pills-row">
            <button
              className={`cat-pill ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All {tplTab}s
            </button>
            {categoriesForTab.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="template-gallery-grid">
            {filteredTemplates.map((tpl) => (
              <div key={tpl.id} className="template-card">
                <div className="template-thumb" style={{ background: tpl.accent }}>
                  <span className="tpl-type-badge">{tpl.dimensions}</span>
                  <div className="tpl-mini-wireframe">
                    <span />
                    <b />
                    <i />
                  </div>
                </div>
                <div className="template-body">
                  <div className="template-cat">{tpl.category}</div>
                  <h3>{tpl.title}</h3>
                  <p>{tpl.description}</p>
                  <button className="secondary-button full-width" onClick={() => onUseTemplate(tpl)}>
                    Use Template <ArrowRight size={15} strokeWidth={1.85} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GETTING STARTED WORKFLOW */}
      <section className="landing-section">
        <div className="landing-container steps-showcase-grid">
          <div className="cs-visual-card">
            <MarketingVisual
              variant="getting-started"
              maxWidth={640}
              alt="Three steps to start creating in Canvas Studio"
            />
          </div>
          <div className="split-copy">
            <div className="type-label">GETTING STARTED</div>
            <h2 className="type-h2">From clean desk to exported site or campaign in minutes</h2>
            <p className="type-body-sm">
              Choose your studio role during onboarding, start on a distraction-free artboard,
              collaborate live, and export production-ready assets.
            </p>
            <CharacterIllustration
              variant="celebrating"
              maxWidth={320}
              alt="Designer celebrating completed and exported Canvas Studio project"
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="primary-button" onClick={() => onNavigate('onboarding')}>
                Preview Onboarding <ArrowRight size={16} />
              </button>
              <button className="secondary-button" onClick={() => onNavigate('dashboard')}>
                Open Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="landing-section alt-bg">
        <div className="landing-container">
          <div className="section-heading">
            <div className="type-label" style={{ marginBottom: 8 }}>PLANS &amp; ACCESS</div>
            <h2 className="type-h2">Simple pricing for solo creators and studios</h2>
          </div>

          <div className="pricing-banner-wrap cs-visual-card">
            <MarketingVisual
              variant="pricing-value"
              maxWidth={1180}
              alt="Canvas Studio plans value summary: 32 templates, 7 exports, 10 live peers"
            />
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">STARTER</div>
              <div className="pricing-price">$0 <span>/ forever</span></div>
              <p>Solo Website Builder, Graphic Studio, and Whiteboard workspace.</p>
              <ul>
                <li><Check size={16} /> All 3 Editor Environments</li>
                <li><Check size={16} /> 32 Editable Templates</li>
                <li><Check size={16} /> HTML, CSS, React, SVG, PNG, PDF &amp; JSON Exports</li>
              </ul>
              <button className="secondary-button full-width" onClick={() => onNavigate('dashboard')}>
                Start Free Workspace
              </button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">MOST POPULAR</div>
              <div className="pricing-tier">PRO STUDIO</div>
              <div className="pricing-price">$18 <span>/ editor / mo</span></div>
              <p>For creative professionals shipping client sites and brand systems.</p>
              <ul>
                <li><Check size={16} /> Unlimited Projects &amp; Custom Components</li>
                <li><Check size={16} /> Shared Brand Kits across Web &amp; Graphics</li>
                <li><Check size={16} /> Rulers, Guides, Cropping &amp; Nondestructive Filters</li>
              </ul>
              <button className="primary-button full-width" onClick={() => onNavigate('register')}>
                Create Studio Account <ArrowRight size={16} />
              </button>
            </div>
            <div className="pricing-card">
              <div className="pricing-tier">TEAM WORKSPACE</div>
              <div className="pricing-price">$42 <span>/ team / mo</span></div>
              <p>Real-time multiplayer collaboration across websites, artboards, and boards.</p>
              <ul>
                <li><Check size={16} /> 5–10 Concurrent Live Editors per Room</li>
                <li><Check size={16} /> Server-Enforced Viewer / Commenter / Editor Roles</li>
                <li><Check size={16} /> Self-Hostable Node WebSocket Server</li>
              </ul>
              <button className="secondary-button full-width" onClick={() => onNavigate('dashboard')}>
                Open Team Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-heading">
            <div className="type-label" style={{ marginBottom: 8 }}>SHOWCASE TESTIMONIALS · SAMPLE CONTENT</div>
            <h2 className="type-h2">Designed for creative momentum</h2>
          </div>
          <div className="testimonial-grid">
            {[
              {
                quote: 'Having a clean blank canvas option alongside dedicated Website and Graphic editors keeps our team focused.',
                author: 'Hannah Lin',
                role: 'Sample Role · Brand Director',
              },
              {
                quote: 'Mobile breakpoint overrides never break our desktop layout, and the exported CSS works out of the box.',
                author: 'David Okafor',
                role: 'Sample Role · Frontend Architect',
              },
              {
                quote: 'Our sprint retrospectives live on the Whiteboard while campaign assets live in Graphic Studio.',
                author: 'Sofia Morales',
                role: 'Sample Role · Product Designer',
              },
            ].map((item) => (
              <div key={item.author} className="testimonial-card">
                <span className="sample-pill">SAMPLE SHOWCASE</span>
                <p>“{item.quote}”</p>
                <div>
                  <strong>{item.author}</strong>
                  <small>{item.role}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section alt-bg">
        <div className="landing-container faq-container">
          <div className="section-heading">
            <div className="type-label" style={{ marginBottom: 8 }}>QUESTIONS &amp; ANSWERS</div>
            <h2 className="type-h2">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item, idx) => (
              <div key={item.q} className="faq-item">
                <button className="faq-trigger" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.85}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s',
                    }}
                  />
                </button>
                {openFaq === idx && <div className="faq-body">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div>
            <BrandLogo variant="dark" height={38} />
            <p className="footer-desc">
              Canvas Studio — Website Builder, Graphic Design Studio &amp; Real-Time Team Whiteboard.
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <strong>Workspaces</strong>
              <button onClick={() => onQuickStart('website')}>Website Builder</button>
              <button onClick={() => onQuickStart('graphic')}>Graphic Studio</button>
              <button onClick={() => onQuickStart('whiteboard')}>Whiteboard</button>
              <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
            </div>
            <div>
              <strong>Account</strong>
              <button onClick={() => onNavigate('login')}>Log in</button>
              <button onClick={() => onNavigate('register')}>Create account</button>
              <button onClick={() => onNavigate('onboarding')}>Onboarding</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
