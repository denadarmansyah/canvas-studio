import React, { useState } from 'react'

export type LogoVariant = 'full' | 'icon' | 'horizontal' | 'compact' | 'light' | 'dark' | 'favicon'

export type CharacterVariant =
  | 'main'
  | 'laptop'
  | 'website-builder'
  | 'graphic-design'
  | 'collaboration'
  | 'reviewing'
  | 'celebrating'
  | 'welcome'
  | 'empty-state'
  | 'onboarding'

export type ProductIllustrationVariant =
  | 'website-builder'
  | 'graphic-studio'
  | 'whiteboard'
  | 'live-collaboration'
  | 'template-library'
  | 'brand-kit'
  | 'asset-management'
  | 'responsive-preview'
  | 'project-management'
  | 'export-workflow'

export type MarketingVisualVariant =
  | 'hero-showcase'
  | 'feature-overview'
  | 'website-showcase'
  | 'graphic-showcase'
  | 'collaboration-showcase'
  | 'pricing-value'
  | 'getting-started'
  | 'customer-onboarding'

export type EmptyStateVariant =
  | 'no-projects'
  | 'no-templates'
  | 'no-assets'
  | 'no-collaborators'
  | 'no-search-results'
  | 'empty-website'
  | 'empty-graphic'
  | 'empty-whiteboard'

const LOGO_SRC: Record<LogoVariant, string> = {
  full: '/branding/logo.svg',
  icon: '/branding/logo-icon.svg',
  horizontal: '/branding/logo-horizontal.svg',
  compact: '/branding/logo-compact.svg',
  light: '/branding/logo-light.svg',
  dark: '/branding/logo-dark.svg',
  favicon: '/branding/favicon.svg',
}

const CHAR_SRC: Record<CharacterVariant, string> = {
  main: '/assets/branding/characters/character-main.png',
  'website-builder': '/assets/branding/characters/character-website-builder.png',
  laptop: '/assets/branding/characters/character-laptop.svg',
  'graphic-design': '/assets/branding/characters/character-graphic-design.svg',
  collaboration: '/assets/branding/characters/character-collaboration.svg',
  reviewing: '/assets/branding/characters/character-reviewing.svg',
  celebrating: '/assets/branding/characters/character-celebrating.svg',
  welcome: '/assets/branding/characters/character-welcome.svg',
  'empty-state': '/assets/branding/characters/character-empty-state.svg',
  onboarding: '/assets/branding/characters/character-onboarding.svg',
}

const CHAR_FALLBACK: Record<CharacterVariant, string> = {
  main: '/assets/branding/characters/character-main.png',
  'website-builder': '/assets/branding/characters/character-website-builder.png',
  laptop: '/assets/branding/characters/character-website-builder.png',
  'graphic-design': '/assets/branding/characters/character-main.png',
  collaboration: '/assets/branding/characters/character-main.png',
  reviewing: '/assets/branding/characters/character-main.png',
  celebrating: '/assets/branding/characters/character-website-builder.png',
  welcome: '/assets/branding/characters/character-main.png',
  'empty-state': '/assets/branding/characters/character-main.png',
  onboarding: '/assets/branding/characters/character-website-builder.png',
}

const PRODUCT_SRC: Record<ProductIllustrationVariant, string> = {
  'website-builder': '/assets/illustrations/product/product-website-builder.svg',
  'graphic-studio': '/assets/illustrations/product/product-graphic-studio.svg',
  whiteboard: '/assets/illustrations/product/product-whiteboard.svg',
  'live-collaboration': '/assets/illustrations/product/product-live-collaboration.svg',
  'template-library': '/assets/illustrations/product/product-template-library.svg',
  'brand-kit': '/assets/illustrations/product/product-brand-kit.svg',
  'asset-management': '/assets/illustrations/product/product-asset-management.svg',
  'responsive-preview': '/assets/illustrations/product/product-responsive-preview.svg',
  'project-management': '/assets/illustrations/product/product-project-management.svg',
  'export-workflow': '/assets/illustrations/product/product-export-workflow.svg',
}

const MARKETING_SRC: Record<MarketingVisualVariant, string> = {
  'hero-showcase': '/assets/illustrations/marketing/marketing-hero-showcase.svg',
  'feature-overview': '/assets/illustrations/marketing/marketing-feature-overview.svg',
  'website-showcase': '/assets/illustrations/marketing/marketing-website-showcase.svg',
  'graphic-showcase': '/assets/illustrations/marketing/marketing-graphic-showcase.svg',
  'collaboration-showcase': '/assets/illustrations/marketing/marketing-collaboration-showcase.svg',
  'pricing-value': '/assets/illustrations/marketing/marketing-pricing-value.svg',
  'getting-started': '/assets/illustrations/marketing/marketing-getting-started.svg',
  'customer-onboarding': '/assets/illustrations/marketing/marketing-customer-onboarding.svg',
}

const EMPTY_SRC: Record<EmptyStateVariant, string> = {
  'no-projects': '/assets/illustrations/empty-states/empty-no-projects.svg',
  'no-templates': '/assets/illustrations/empty-states/empty-no-templates.svg',
  'no-assets': '/assets/illustrations/empty-states/empty-no-assets.svg',
  'no-collaborators': '/assets/illustrations/empty-states/empty-no-collaborators.svg',
  'no-search-results': '/assets/illustrations/empty-states/empty-no-search-results.svg',
  'empty-website': '/assets/illustrations/empty-states/empty-website-project.svg',
  'empty-graphic': '/assets/illustrations/empty-states/empty-graphic-project.svg',
  'empty-whiteboard': '/assets/illustrations/empty-states/empty-whiteboard-project.svg',
}

function ResponsiveArtwork({
  src,
  fallbackSrc,
  alt,
  aspectRatio,
  maxWidth,
  eager = false,
  className = '',
}: {
  src: string
  fallbackSrc: string
  alt: string
  aspectRatio: string
  maxWidth?: number
  eager?: boolean
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const activeSrc = failedSrc === src ? fallbackSrc : src

  return (
    <div
      className={`cs-visual-frame ${className}`}
      style={{
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        aspectRatio,
      }}
    >
      <img
        src={activeSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => {
          if (activeSrc !== fallbackSrc) setFailedSrc(src)
        }}
        className="cs-visual-img"
      />
    </div>
  )
}

export function BrandLogo({
  variant = 'full',
  height = 38,
  className = '',
}: {
  variant?: LogoVariant
  height?: number
  className?: string
}) {
  return (
    <img
      src={LOGO_SRC[variant]}
      alt="Canvas Studio"
      decoding="async"
      style={{ height, width: 'auto', display: 'block', flexShrink: 0, objectFit: 'contain' }}
      className={className}
    />
  )
}

export function CharacterIllustration({
  variant = 'main',
  alt = 'Canvas Studio brand illustrator character',
  className = '',
  maxWidth = 380,
  eager = false,
}: {
  variant?: CharacterVariant
  alt?: string
  className?: string
  maxWidth?: number
  eager?: boolean
}) {
  const isSquarePng = variant === 'main' || variant === 'website-builder'
  return (
    <ResponsiveArtwork
      src={CHAR_SRC[variant]}
      fallbackSrc={CHAR_FALLBACK[variant]}
      alt={alt}
      aspectRatio={isSquarePng ? '1 / 1' : '13 / 10'}
      maxWidth={maxWidth}
      eager={eager}
      className={className}
    />
  )
}

export function ProductIllustration({
  variant,
  alt = 'Canvas Studio product workspace preview',
  className = '',
  maxWidth = 560,
  eager = false,
}: {
  variant: ProductIllustrationVariant
  alt?: string
  className?: string
  maxWidth?: number
  eager?: boolean
}) {
  return (
    <ResponsiveArtwork
      src={PRODUCT_SRC[variant]}
      fallbackSrc="/assets/illustrations/product/product-website-builder.svg"
      alt={alt}
      aspectRatio="14 / 9"
      maxWidth={maxWidth}
      eager={eager}
      className={className}
    />
  )
}

export function MarketingVisual({
  variant,
  alt = 'Canvas Studio feature visual',
  className = '',
  maxWidth = 640,
  eager = false,
}: {
  variant: MarketingVisualVariant
  alt?: string
  className?: string
  maxWidth?: number
  eager?: boolean
}) {
  const ratio =
    variant === 'pricing-value'
      ? '32 / 13'
      : variant === 'getting-started' || variant === 'customer-onboarding'
        ? '2 / 1'
        : '32 / 21'
  return (
    <ResponsiveArtwork
      src={MARKETING_SRC[variant]}
      fallbackSrc="/assets/illustrations/marketing/marketing-hero-showcase.svg"
      alt={alt}
      aspectRatio={ratio}
      maxWidth={maxWidth}
      eager={eager}
      className={className}
    />
  )
}

export function EmptyStateVisual({
  variant,
  alt = 'Workspace state illustration',
  className = '',
  maxWidth = 320,
}: {
  variant: EmptyStateVariant
  alt?: string
  className?: string
  maxWidth?: number
}) {
  return (
    <ResponsiveArtwork
      src={EMPTY_SRC[variant]}
      fallbackSrc="/assets/illustrations/empty-states/empty-no-projects.svg"
      alt={alt}
      aspectRatio="3 / 2"
      maxWidth={maxWidth}
      className={className}
    />
  )
}
