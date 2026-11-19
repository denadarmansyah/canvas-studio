import React, { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Info,
  Loader2,
  Palette,
  PenTool,
  Sparkles,
} from 'lucide-react'
import type { AppView, ProjectType, UserProfile } from '../../types/platform'
import {
  BrandLogo,
  CharacterIllustration,
  MarketingVisual,
  ProductIllustration,
} from '../../components/branding/BrandAssets'
import { IconButton } from '../../components/ui/IconButton'

export function AuthViews({
  view,
  user,
  onUpdateUser,
  onNavigate,
  onApplyBrandAccent,
}: {
  view: 'login' | 'register' | 'recover' | 'onboarding'
  user: UserProfile
  onUpdateUser: (patch: Partial<UserProfile>) => void
  onNavigate: (view: AppView) => void
  onApplyBrandAccent: (color: string) => void
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user.role || 'Product & Brand Designer')
  const [preferredMode, setPreferredMode] = useState<ProjectType>(user.preferredMode || 'website')
  const [accent, setAccent] = useState('#5267FF')
  const [onbStep, setOnbStep] = useState<1 | 2 | 3>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recoverSent, setRecoverSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (view !== 'recover' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (view === 'register' && !name.trim()) {
      setError('Please enter your display name.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      if (view === 'recover') {
        setRecoverSent(true)
        return
      }
      onUpdateUser({
        name: name.trim() || user.name,
        email: email.trim(),
        authenticated: true,
      })
      onNavigate(view === 'register' ? 'onboarding' : 'dashboard')
    }, 450)
  }

  if (view === 'onboarding') {
    const modeProductVariant =
      preferredMode === 'website'
        ? 'website-builder'
        : preferredMode === 'graphic'
          ? 'graphic-studio'
          : 'whiteboard'

    return (
      <div className="auth-shell">
        <div className="auth-card wide">
          <div className="auth-grid">
            <div className="auth-side-illus">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <BrandLogo variant="horizontal" height={34} />
                <IconButton
                  icon={ArrowLeft}
                  label="Back to landing"
                  tooltip="Back to home"
                  size="sm"
                  onClick={() => onNavigate('landing')}
                />
              </div>

              <div style={{ margin: '18px 0', display: 'grid', gap: 14 }}>
                <CharacterIllustration
                  variant={onbStep === 1 ? 'welcome' : onbStep === 2 ? 'onboarding' : 'celebrating'}
                  maxWidth={290}
                  eager
                  alt="Canvas Studio onboarding stage character"
                />
                {onbStep === 1 && (
                  <MarketingVisual
                    variant="customer-onboarding"
                    maxWidth={340}
                    alt="Personalized 3-step studio setup"
                  />
                )}
                {onbStep === 2 && (
                  <ProductIllustration
                    variant={modeProductVariant}
                    maxWidth={340}
                    alt="Selected Canvas Studio workspace preview"
                  />
                )}
                {onbStep === 3 && (
                  <ProductIllustration
                    variant="brand-kit"
                    maxWidth={340}
                    alt="Brand Kit color tokens and typography sync"
                  />
                )}
              </div>

              <p className="auth-side-caption">
                {onbStep === 1
                  ? 'Step 1: Tell us your creative role so presets match your craft.'
                  : onbStep === 2
                    ? 'Step 2: Pick your primary studio workspace (switchable anytime).'
                    : 'Step 3: Bind your starter Brand Kit accent across websites and artboards.'}
              </p>
            </div>

            <div className="auth-form-col">
              <div className="onboarding-stepper" role="tablist" aria-label="Onboarding steps">
                {[
                  { id: 1 as const, label: '01 · Profile' },
                  { id: 2 as const, label: '02 · Workspace' },
                  { id: 3 as const, label: '03 · Brand Kit' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`onb-step-pill ${onbStep === s.id ? 'active' : onbStep > s.id ? 'done' : ''}`}
                    onClick={() => setOnbStep(s.id)}
                  >
                    {onbStep > s.id && <Check size={12} />}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="modal-eyebrow">STEP {onbStep} OF 3 · WORKSPACE SETUP</div>
              <h1 className="type-h2" style={{ marginBottom: 8 }}>
                {onbStep === 1
                  ? 'Welcome to Canvas Studio'
                  : onbStep === 2
                    ? 'Select your primary studio'
                    : 'Lock in your Brand Accent'}
              </h1>
              <p className="auth-sub type-body-sm">
                {onbStep === 1
                  ? 'Confirm your display name and creative discipline.'
                  : onbStep === 2
                    ? 'Each mode launches its own purpose-built interface and templates.'
                    : 'This primary color powers new buttons, badges, and starter styles.'}
              </p>

              {onbStep === 1 && (
                <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
                  <label className="field stacked">
                    <span>Display name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                    />
                  </label>
                  <label className="field stacked">
                    <span>Your role</span>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option>Product &amp; Brand Designer</option>
                      <option>Web Designer / Developer</option>
                      <option>Marketing &amp; Social Creator</option>
                      <option>Creative Team Lead</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="primary-button full-button"
                    onClick={() => setOnbStep(2)}
                  >
                    Continue to Workspace Focus <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {onbStep === 2 && (
                <div style={{ marginTop: 12 }}>
                  <div className="permission-label">PRIMARY STUDIO FOCUS</div>
                  <div className="permission-options">
                    <button
                      type="button"
                      className={preferredMode === 'website' ? 'permission-active' : ''}
                      onClick={() => setPreferredMode('website')}
                    >
                      <Globe size={16} />
                      <strong>Websites</strong>
                      <small>Responsive builder</small>
                      {preferredMode === 'website' && <Check size={14} />}
                    </button>
                    <button
                      type="button"
                      className={preferredMode === 'graphic' ? 'permission-active' : ''}
                      onClick={() => setPreferredMode('graphic')}
                    >
                      <PenTool size={16} />
                      <strong>Graphics</strong>
                      <small>Vector &amp; photo</small>
                      {preferredMode === 'graphic' && <Check size={14} />}
                    </button>
                    <button
                      type="button"
                      className={preferredMode === 'whiteboard' ? 'permission-active' : ''}
                      onClick={() => setPreferredMode('whiteboard')}
                    >
                      <Sparkles size={16} />
                      <strong>Whiteboard</strong>
                      <small>Team ideation</small>
                      {preferredMode === 'whiteboard' && <Check size={14} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setOnbStep(1)}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ flex: 1 }}
                      onClick={() => setOnbStep(3)}
                    >
                      Continue to Brand Kit <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {onbStep === 3 && (
                <div style={{ marginTop: 12 }}>
                  <div className="permission-label">BRAND KIT PRIMARY ACCENT</div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
                    {['#5267FF', '#D8F878', '#FF987C', '#F4C95D', '#171717'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAccent(col)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: col,
                          border: accent === col ? '3px solid #171717' : '1.5px solid #DEDAD0',
                          boxShadow: accent === col ? '2px 2px 0 #171717' : 'none',
                        }}
                        aria-label={`Select color ${col}`}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setOnbStep(2)}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ flex: 1 }}
                      onClick={() => {
                        onUpdateUser({
                          name: name.trim() || user.name,
                          role,
                          preferredMode,
                          onboarded: true,
                          authenticated: true,
                        })
                        onApplyBrandAccent(accent)
                        onNavigate('dashboard')
                      }}
                    >
                      <Palette size={16} /> Enter Dashboard <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const authCharacterVariant =
    view === 'login' ? 'laptop' : view === 'register' ? 'welcome' : 'reviewing'

  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-grid">
          <div className="auth-side-illus">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <BrandLogo variant="compact" height={34} />
              <IconButton
                icon={ArrowLeft}
                label="Back to landing page"
                tooltip="Back to home"
                size="md"
                onClick={() => onNavigate('landing')}
              />
            </div>
            <div style={{ margin: '20px 0' }}>
              <CharacterIllustration
                variant={authCharacterVariant}
                maxWidth={340}
                eager
                alt="Canvas Studio account workspace illustration"
              />
            </div>
            <p className="auth-side-caption">
              {view === 'login'
                ? 'Resume your websites, graphic artboards, and collaborative whiteboards.'
                : view === 'register'
                  ? 'Unlock 3 specialized creative editors with real-time multiplayer rooms.'
                  : 'Local recovery instructions keep your workspace credentials organized.'}
            </p>
          </div>

          <div className="auth-form-col">
            <div className="auth-header">
              <h1 className="type-h2" style={{ marginBottom: 8 }}>
                {view === 'login'
                  ? 'Welcome back'
                  : view === 'register'
                    ? 'Create your studio account'
                    : 'Reset your password'}
              </h1>
              <p className="type-body-sm">
                {view === 'login'
                  ? 'Sign in to access your websites, designs, and brand kits.'
                  : view === 'register'
                    ? 'Start building websites and graphics with real-time collaboration.'
                    : 'Enter your email address to simulate a password reset flow.'}
              </p>
            </div>

            <div className="room-note" style={{ marginBottom: 16, marginTop: 12 }}>
              <Info size={16} />
              <span>
                Local workspace session mode: account credentials are validated in-browser for
                onboarding preview without an external auth database.
              </span>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {recoverSent ? (
              <div className="auth-success">
                <Check size={18} />
                <div>
                  <strong>Recovery instructions prepared</strong>
                  <p>If {email} is registered in a connected auth server, a reset link is dispatched.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                {view === 'register' && (
                  <label className="field stacked">
                    <span>Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                    />
                  </label>
                )}
                <label className="field stacked">
                  <span>Work email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com"
                  />
                </label>
                {view !== 'recover' && (
                  <label className="field stacked">
                    <span>Password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </label>
                )}

                <button type="submit" className="primary-button full-button" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Processing...
                    </>
                  ) : view === 'login' ? (
                    <>Log in to Workspace <ArrowRight size={16} /></>
                  ) : view === 'register' ? (
                    <>Create Account <ArrowRight size={16} /></>
                  ) : (
                    <>Send Reset Link <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            )}

            <div className="auth-links">
              {view === 'login' && (
                <>
                  <button type="button" onClick={() => onNavigate('recover')}>Forgot password?</button>
                  <button type="button" onClick={() => onNavigate('register')}>New here? Create account</button>
                </>
              )}
              {view === 'register' && (
                <button type="button" onClick={() => onNavigate('login')}>Already have an account? Log in</button>
              )}
              {view === 'recover' && (
                <button type="button" onClick={() => onNavigate('login')}>Back to sign in</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
