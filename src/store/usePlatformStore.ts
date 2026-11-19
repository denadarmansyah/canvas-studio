import { useCallback, useEffect, useState } from 'react'
import type {
  AssetItem,
  BrandKit,
  DocumentPreset,
  Page,
  ProjectDocument,
  ProjectType,
  TemplateDefinition,
  UserProfile,
  WebComponentDef,
} from '../types/platform'
import { DEFAULT_BRAND_KIT } from '../data/presets'
import {
  makeBlankGraphicPage,
  makeBlankWebsiteDoc,
  makeBlankWhiteboardPage,
  makeId,
  PLATFORM_TEMPLATES,
} from '../data/templates'

const PROJECTS_KEY = 'canvas-studio-v2-projects'
const ACTIVE_PROJECT_KEY = 'canvas-studio-v2-active-project'
const BRAND_KEY = 'canvas-studio-v2-brand-kit'
const ASSETS_KEY = 'canvas-studio-v2-assets'
const COMPONENTS_KEY = 'canvas-studio-v2-components'
const USER_KEY = 'canvas-studio-v2-user'
const USER_TEMPLATES_KEY = 'canvas-studio-v2-user-templates'

const defaultRoom = () => `CS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

function readLegacyOrBlankProject(): ProjectDocument {
  const now = Date.now()
  let pages: Page[] = [makeBlankGraphicPage('Artboard 1', 1600, 1100, '#FFFEFA')]
  try {
    const raw = localStorage.getItem('canvas-studio-draft')
    if (raw) {
      const parsed = JSON.parse(raw) as Page[]
      if (Array.isArray(parsed) && parsed.length && parsed.every((p) => p && typeof p.id === 'string')) {
        pages = parsed
      }
    }
  } catch {}
  const activePageId = localStorage.getItem('canvas-studio-active-page') || pages[0].id
  const name = localStorage.getItem('canvas-studio-project-name') || 'Untitled Graphic Design'
  const room = localStorage.getItem('canvas-studio-room') || defaultRoom()
  return {
    id: 'proj-default-graphic',
    name,
    type: 'graphic',
    roomCode: room,
    favorite: false,
    trashed: false,
    teamWorkspace: true,
    updatedAt: now,
    createdAt: now,
    pages,
    activePageId,
    comments: [],
  }
}

function makeCleanStarterWebsiteProject(): ProjectDocument {
  const now = Date.now()
  return {
    id: 'proj-default-website',
    name: 'Untitled Website',
    type: 'website',
    roomCode: defaultRoom(),
    favorite: false,
    trashed: false,
    teamWorkspace: true,
    updatedAt: now - 1000,
    createdAt: now - 1000,
    pages: [makeBlankGraphicPage()],
    activePageId: 'web-home',
    website: makeBlankWebsiteDoc('Untitled Website'),
    comments: [],
  }
}

function loadInitialProjects(): ProjectDocument[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectDocument[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  return [readLegacyOrBlankProject(), makeCleanStarterWebsiteProject()]
}

function loadInitialUser(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch {}
  return {
    name: localStorage.getItem('canvas-studio-name') || `Designer ${Math.floor(Math.random() * 80 + 10)}`,
    email: 'designer@canvasstudio.local',
    role: 'Product & Brand Designer',
    preferredMode: 'website',
    authenticated: false,
    onboarded: false,
  }
}

export function usePlatformStore() {
  const [projects, setProjects] = useState<ProjectDocument[]>(loadInitialProjects)
  const [activeProjectId, setActiveProjectId] = useState<string>(
    () => localStorage.getItem(ACTIVE_PROJECT_KEY) || projects[0]?.id || 'proj-default-graphic'
  )
  const [brandKit, setBrandKit] = useState<BrandKit>(() => {
    try {
      const raw = localStorage.getItem(BRAND_KEY)
      if (raw) return JSON.parse(raw) as BrandKit
    } catch {}
    return DEFAULT_BRAND_KIT
  })
  const [assets, setAssets] = useState<AssetItem[]>(() => {
    try {
      const raw = localStorage.getItem(ASSETS_KEY)
      if (raw) return JSON.parse(raw) as AssetItem[]
    } catch {}
    return [
      {
        id: 'asset-logo',
        name: 'Canvas Studio Logo',
        category: 'brand',
        dataUrl: '/branding/logo.svg',
        createdAt: Date.now(),
      },
      {
        id: 'asset-logo-icon',
        name: 'Canvas Studio Mark',
        category: 'brand',
        dataUrl: '/branding/logo-icon.svg',
        createdAt: Date.now(),
      },
    ]
  })
  const [webComponents, setWebComponents] = useState<WebComponentDef[]>(() => {
    try {
      const raw = localStorage.getItem(COMPONENTS_KEY)
      if (raw) return JSON.parse(raw) as WebComponentDef[]
    } catch {}
    return []
  })
  const [userTemplates, setUserTemplates] = useState<TemplateDefinition[]>(() => {
    try {
      const raw = localStorage.getItem(USER_TEMPLATES_KEY)
      if (raw) return JSON.parse(raw) as TemplateDefinition[]
    } catch {}
    return []
  })
  const [user, setUser] = useState<UserProfile>(loadInitialUser)

  const allTemplates = [...userTemplates, ...PLATFORM_TEMPLATES]
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0]

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId)
      if (activeProject && activeProject.type !== 'website') {
        localStorage.setItem('canvas-studio-draft', JSON.stringify(activeProject.pages))
        localStorage.setItem('canvas-studio-active-page', activeProject.activePageId)
        localStorage.setItem('canvas-studio-project-name', activeProject.name)
      }
    } catch {}
  }, [projects, activeProjectId, activeProject])

  useEffect(() => {
    try {
      localStorage.setItem(BRAND_KEY, JSON.stringify(brandKit))
    } catch {}
  }, [brandKit])

  useEffect(() => {
    try {
      localStorage.setItem(ASSETS_KEY, JSON.stringify(assets))
    } catch {}
  }, [assets])

  useEffect(() => {
    try {
      localStorage.setItem(COMPONENTS_KEY, JSON.stringify(webComponents))
    } catch {}
  }, [webComponents])

  useEffect(() => {
    try {
      localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(userTemplates))
    } catch {}
  }, [userTemplates])

  useEffect(() => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem('canvas-studio-name', user.name)
    } catch {}
  }, [user])

  const updateProject = useCallback((projectId: string, updater: (p: ProjectDocument) => ProjectDocument) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...updater(p), updatedAt: Date.now() } : p))
    )
  }, [])

  const createProject = useCallback(
    (opts: {
      name: string
      type: ProjectType
      preset?: DocumentPreset
      width?: number
      height?: number
      unit?: 'px' | 'mm' | 'in'
      dpi?: number
      background?: string
      transparentBg?: boolean
    }): ProjectDocument => {
      const now = Date.now()
      const w = opts.width || opts.preset?.width || 1600
      const h = opts.height || opts.preset?.height || 1100
      const page: Page =
        opts.type === 'whiteboard'
          ? makeBlankWhiteboardPage('Board 1')
          : {
              ...makeBlankGraphicPage(
                opts.preset?.name || 'Artboard 1',
                w,
                h,
                opts.background || '#FFFEFA',
                opts.transparentBg || false
              ),
              unit: opts.unit || opts.preset?.unit || 'px',
              dpi: opts.dpi || opts.preset?.dpi || 72,
            }

      const project: ProjectDocument = {
        id: `proj-${makeId()}`,
        name: opts.name.trim() || `Untitled ${opts.type}`,
        type: opts.type,
        roomCode: defaultRoom(),
        favorite: false,
        trashed: false,
        teamWorkspace: true,
        createdAt: now,
        updatedAt: now,
        activePageId: page.id,
        pages: [page],
        website: opts.type === 'website' ? makeBlankWebsiteDoc(opts.name) : undefined,
        comments: [],
      }
      setProjects((prev) => [project, ...prev])
      setActiveProjectId(project.id)
      return project
    },
    []
  )

  const instantiateTemplate = useCallback((template: TemplateDefinition): ProjectDocument => {
    const now = Date.now()
    const clonedPages: Page[] = (
      template.pages || [makeBlankGraphicPage('Artboard 1', 1600, 1100, '#FFFEFA')]
    ).map((pg) => ({
      ...pg,
      id: makeId(),
      elements: pg.elements.map((el) => ({
        ...el,
        id: makeId(),
        points: el.points?.map((pt) => ({ ...pt })),
      })),
    }))
    const project: ProjectDocument = {
      id: `proj-${makeId()}`,
      name: template.title,
      type: template.type,
      roomCode: defaultRoom(),
      favorite: false,
      trashed: false,
      teamWorkspace: true,
      createdAt: now,
      updatedAt: now,
      pages: clonedPages,
      activePageId: clonedPages[0].id,
      website: template.website ? JSON.parse(JSON.stringify(template.website)) : undefined,
      comments: [],
    }
    setProjects((prev) => [project, ...prev])
    setActiveProjectId(project.id)
    return project
  }, [])

  const duplicateTemplate = useCallback((template: TemplateDefinition): TemplateDefinition => {
    const copy: TemplateDefinition = {
      ...JSON.parse(JSON.stringify(template)),
      id: `utpl-${makeId()}`,
      title: `${template.title} (Copy)`,
    }
    setUserTemplates((prev) => [copy, ...prev])
    return copy
  }, [])

  const addAsset = useCallback((item: Omit<AssetItem, 'id' | 'createdAt'>) => {
    const asset: AssetItem = { ...item, id: `asset-${makeId()}`, createdAt: Date.now() }
    setAssets((prev) => [asset, ...prev])
    return asset
  }, [])

  return {
    projects,
    setProjects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    updateProject,
    createProject,
    instantiateTemplate,
    duplicateTemplate,
    allTemplates,
    brandKit,
    setBrandKit,
    assets,
    addAsset,
    setAssets,
    webComponents,
    setWebComponents,
    user,
    setUser,
  }
}
