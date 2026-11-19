export type AppView =
  | 'landing'
  | 'login'
  | 'register'
  | 'recover'
  | 'onboarding'
  | 'dashboard'
  | 'website-editor'
  | 'graphic-editor'
  | 'whiteboard-editor'

export type ProjectType = 'website' | 'graphic' | 'whiteboard'
export type PermissionRole = 'edit' | 'comment' | 'view'
export type UnitType = 'px' | 'mm' | 'in'

export type DocumentPresetId =
  | 'custom'
  | 'instagram-post'
  | 'instagram-story'
  | 'youtube-thumb'
  | 'tiktok-cover'
  | 'facebook-post'
  | 'banner'
  | 'poster'
  | 'business-card'
  | 'presentation'
  | 'logo-canvas'
  | 'print-a4'

export interface DocumentPreset {
  id: DocumentPresetId
  name: string
  category: string
  width: number
  height: number
  unit: UnitType
  dpi: number
  orientation: 'landscape' | 'portrait' | 'square'
  description: string
}

export interface BezierNode {
  x: number
  y: number
  cp1x?: number
  cp1y?: number
  cp2x?: number
  cp2y?: number
}

export interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  grayscale: number
  blur: number
  sharpen: number
  removeBg: boolean
  bgTolerance: number
}

export interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

export type MaskShape = 'none' | 'circle' | 'rounded' | 'pill' | 'diamond' | 'star'

export interface ShadowEffect {
  enabled: boolean
  x: number
  y: number
  blur: number
  color: string
  inner?: boolean
}

export interface GlowEffect {
  enabled: boolean
  blur: number
  color: string
}

export interface GradientFill {
  enabled: boolean
  type: 'linear' | 'radial'
  angle: number
  from: string
  to: string
}

export type BooleanMode = 'none' | 'union' | 'subtract' | 'intersect'

export type GraphicTool =
  | 'select'
  | 'direct-select'
  | 'hand'
  | 'frame'
  | 'text'
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'line'
  | 'arrow'
  | 'connector'
  | 'pen'
  | 'pencil'
  | 'brush'
  | 'bezier'
  | 'sticky'
  | 'comment'
  | 'image'
  | 'crop'
  | 'eyedropper'
  | 'mindmap'
  | 'eraser'

export type ElementType =
  | 'frame'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'text'
  | 'sticky'
  | 'line'
  | 'arrow'
  | 'connector'
  | 'pen'
  | 'bezier'
  | 'image'
  | 'comment'

export interface CanvasElement {
  id: string
  type: ElementType
  name: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  radius: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
  letterSpacing?: number
  lineHeight?: number
  textAlign?: 'left' | 'center' | 'right'
  textStroke?: string
  textBg?: string
  points?: { x: number; y: number }[]
  bezierNodes?: BezierNode[]
  sides?: number
  starPoints?: number
  innerRadius?: number
  imageData?: string
  flipX?: boolean
  flipY?: boolean
  crop?: CropRect
  mask?: MaskShape
  filters?: ImageFilters
  shadow?: ShadowEffect
  glow?: GlowEffect
  gradient?: GradientFill
  blur?: number
  booleanMode?: BooleanMode
  clipToId?: string
  visible: boolean
  locked: boolean
  groupId?: string
}

export interface Page {
  id: string
  name: string
  elements: CanvasElement[]
  background: string
  width?: number
  height?: number
  unit?: UnitType
  dpi?: number
  transparentBg?: boolean
}

/* Website Builder Types */

export type WebBreakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile'

export type WebElementType =
  | 'section'
  | 'container'
  | 'columns'
  | 'grid'
  | 'flex'
  | 'navbar'
  | 'hero'
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  | 'text-block'
  | 'button'
  | 'image'
  | 'video'
  | 'icon'
  | 'divider'
  | 'spacer'
  | 'feature-cards'
  | 'testimonials'
  | 'pricing-cards'
  | 'faq'
  | 'form'
  | 'contact'
  | 'footer'
  | 'logo'
  | 'social-links'

export interface WebNodeStyles {
  width?: string
  maxWidth?: string
  minWidth?: string
  height?: string
  padding?: string
  margin?: string
  backgroundColor?: string
  hoverBackgroundColor?: string
  color?: string
  hoverColor?: string
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  textAlign?: 'left' | 'center' | 'right'
  display?: 'block' | 'flex' | 'grid' | 'none'
  flexDirection?: 'row' | 'column'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  gridColumns?: number
  gap?: string
  borderWidth?: string
  borderColor?: string
  borderRadius?: string
  boxShadow?: string
  opacity?: number
  objectFit?: 'cover' | 'contain' | 'fill'
  objectPosition?: string
}

export interface WebNode {
  id: string
  type: WebElementType
  name: string
  tag?: 'header' | 'section' | 'div' | 'nav' | 'footer' | 'h1' | 'h2' | 'p' | 'a' | 'button'
  content?: string
  subContent?: string
  buttonText?: string
  href?: string
  targetPageId?: string
  src?: string
  alt?: string
  iconName?: string
  anchorId?: string
  items?: Array<{ title: string; subtitle?: string; body?: string; meta?: string; href?: string }>
  visible?: boolean
  componentId?: string
  styles: WebNodeStyles
  responsive?: Partial<Record<Exclude<WebBreakpoint, 'desktop'>, Partial<WebNodeStyles>>>
  children?: WebNode[]
}

export interface WebPage {
  id: string
  name: string
  slug: string
  title: string
  nodes: WebNode[]
}

export interface WebComponentDef {
  id: string
  name: string
  category: string
  node: WebNode
  createdAt: number
}

export interface WebsiteDocument {
  pages: WebPage[]
  activePageId: string
  globalCss?: string
}

/* Platform, Brand Kit, Assets, Templates & Collaboration */

export interface BrandKit {
  id: string
  brandName: string
  tagline: string
  primaryColors: string[]
  secondaryColors: string[]
  customColors: string[]
  headingFont: string
  bodyFont: string
  monoFont: string
  logoSvg?: string
  guidelines: string
}

export interface AssetItem {
  id: string
  name: string
  category: 'image' | 'svg' | 'icon' | 'brand' | 'graphic'
  dataUrl: string
  createdAt: number
}

export interface CommentItem {
  id: string
  author: string
  color: string
  text: string
  mentions: string[]
  targetId?: string
  pageId: string
  createdAt: number
  resolved?: boolean
}

export type WebsiteTemplateCategory =
  | 'Business website'
  | 'Portfolio'
  | 'Agency website'
  | 'Restaurant website'
  | 'SaaS landing page'
  | 'E-commerce'
  | 'Personal brand'
  | 'Creative studio'
  | 'Product launch'
  | 'Corporate website'

export type GraphicTemplateCategory =
  | 'Instagram post'
  | 'Instagram story'
  | 'YouTube thumbnail'
  | 'TikTok cover'
  | 'Promotional poster'
  | 'Business flyer'
  | 'Presentation'
  | 'Logo canvas'
  | 'Brand board'
  | 'Banner'
  | 'Advertisement'
  | 'Infographic'

export type WhiteboardTemplateCategory =
  | 'Mind map'
  | 'Brainstorming'
  | 'SWOT analysis'
  | 'Flowchart'
  | 'User journey'
  | 'Kanban'
  | 'Project planning'
  | 'Meeting notes'
  | 'Business model canvas'
  | 'Team retrospective'

export type TemplateCategory =
  | WebsiteTemplateCategory
  | GraphicTemplateCategory
  | WhiteboardTemplateCategory

export interface TemplateDefinition {
  id: string
  title: string
  category: TemplateCategory
  type: ProjectType
  dimensions: string
  description: string
  accent: string
  pages?: Page[]
  website?: WebsiteDocument
}

export interface ProjectDocument {
  id: string
  name: string
  type: ProjectType
  roomCode: string
  favorite: boolean
  trashed: boolean
  sharedWithMe?: boolean
  teamWorkspace?: boolean
  updatedAt: number
  createdAt: number
  pages: Page[]
  activePageId: string
  website?: WebsiteDocument
  comments: CommentItem[]
}

export interface Cursor {
  id: string
  name: string
  color: string
  x: number
  y: number
  pageId: string
  selectedId?: string | null
  updatedAt: number
}

export type Op =
  | { kind: 'upsertElement'; pageId: string; element: CanvasElement }
  | { kind: 'deleteElement'; pageId: string; elementId: string }
  | { kind: 'upsertPage'; page: Page }
  | { kind: 'deletePage'; pageId: string }
  | { kind: 'renamePage'; pageId: string; name: string }
  | { kind: 'setBackground'; pageId: string; background: string }
  | { kind: 'syncWebsite'; website: WebsiteDocument }
  | { kind: 'upsertComment'; comment: CommentItem }

export interface UserProfile {
  name: string
  email: string
  role: string
  preferredMode: ProjectType
  authenticated: boolean
  onboarded: boolean
}
