import React, { useMemo, useState } from 'react'
import {
  ArrowRight,
  Clock,
  FolderOpen,
  Globe,
  Grid,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  List,
  Palette,
  PenTool,
  Plus,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import type {
  AppView,
  AssetItem,
  BrandKit,
  ProjectDocument,
  ProjectType,
  TemplateCategory,
  TemplateDefinition,
  UserProfile,
} from '../../types/platform'
import {
  GRAPHIC_TEMPLATE_CATEGORIES,
  WEBSITE_TEMPLATE_CATEGORIES,
  WHITEBOARD_TEMPLATE_CATEGORIES,
} from '../../data/presets'
import {
  BrandLogo,
  CharacterIllustration,
  EmptyStateVisual,
  ProductIllustration,
} from '../../components/branding/BrandAssets'
import { IconButton } from '../../components/ui/IconButton'
import { BrandKitPanel } from '../brand-kit/BrandKitPanel'

type DashSection =
  | 'recent'
  | 'website'
  | 'graphic'
  | 'whiteboard'
  | 'shared'
  | 'team'
  | 'templates'
  | 'brandkit'
  | 'assets'
  | 'favorites'
  | 'trash'

export function DashboardView({
  user,
  projects,
  templates,
  brandKit,
  onUpdateBrandKit,
  assets,
  onAddAsset,
  onRemoveAsset,
  onOpenProject,
  onToggleFavorite,
  onTrashProject,
  onRestoreProject,
  onDeleteForever,
  onOpenNewProjectModal,
  onInstantiateTemplate,
  onDuplicateTemplate,
  onNavigate,
  onShowToast,
}: {
  user: UserProfile
  projects: ProjectDocument[]
  templates: TemplateDefinition[]
  brandKit: BrandKit
  onUpdateBrandKit: (b: BrandKit) => void
  assets: AssetItem[]
  onAddAsset: (item: Omit<AssetItem, 'id' | 'createdAt'>) => void
  onRemoveAsset: (id: string) => void
  onOpenProject: (project: ProjectDocument) => void
  onToggleFavorite: (id: string) => void
  onTrashProject: (id: string) => void
  onRestoreProject: (id: string) => void
  onDeleteForever: (id: string) => void
  onOpenNewProjectModal: (type: ProjectType) => void
  onInstantiateTemplate: (tpl: TemplateDefinition) => void
  onDuplicateTemplate: (tpl: TemplateDefinition) => void
  onNavigate: (view: AppView) => void
  onShowToast: (msg: string) => void
}) {
  const [section, setSection] = useState<DashSection>('recent')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'updated' | 'name'>('updated')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [tplTypeTab, setTplTypeTab] = useState<ProjectType>('website')
  const [tplCategory, setTplCategory] = useState<'All' | TemplateCategory>('All')

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => (section === 'trash' ? p.trashed : !p.trashed))
    if (section === 'website') list = list.filter((p) => p.type === 'website')
    if (section === 'graphic') list = list.filter((p) => p.type === 'graphic')
    if (section === 'whiteboard') list = list.filter((p) => p.type === 'whiteboard')
    if (section === 'shared') list = list.filter((p) => p.sharedWithMe)
    if (section === 'team') list = list.filter((p) => p.teamWorkspace)
    if (section === 'favorites') list = list.filter((p) => p.favorite)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.roomCode.toLowerCase().includes(q))
    }

    return [...list].sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt
    )
  }, [projects, section, search, sortBy])

  const tplCategories =
    tplTypeTab === 'website'
      ? WEBSITE_TEMPLATE_CATEGORIES
      : tplTypeTab === 'graphic'
        ? GRAPHIC_TEMPLATE_CATEGORIES
        : WHITEBOARD_TEMPLATE_CATEGORIES

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (t.type !== tplTypeTab) return false
      const matchCat = tplCategory === 'All' || t.category === tplCategory
      const matchQuery =
        !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchQuery
    })
  }, [templates, tplTypeTab, tplCategory, search])

  const uploadAssetFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onAddAsset({
        name: file.name,
        category: file.type.includes('svg') ? 'svg' : 'image',
        dataUrl: String(reader.result),
      })
      onShowToast(`Uploaded ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  const navItems: { id: DashSection; label: string; icon: React.ComponentType<{ size?: number | string }> }[] = [
    { id: 'recent', label: 'Recent Projects', icon: Clock },
    { id: 'website', label: 'Website Builder', icon: Globe },
    { id: 'graphic', label: 'Graphic Studio', icon: PenTool },
    { id: 'whiteboard', label: 'Whiteboards', icon: Sparkles },
    { id: 'shared', label: 'Shared with me', icon: Share2 },
    { id: 'team', label: 'Team Workspace', icon: Users },
    { id: 'templates', label: 'Template Library', icon: LayoutTemplate },
    { id: 'brandkit', label: 'Brand Kit', icon: Palette },
    { id: 'assets', label: 'Uploads & Assets', icon: ImageIcon },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const emptyVariant = search.trim()
    ? 'no-search-results'
    : section === 'shared' || section === 'team'
      ? 'no-collaborators'
      : section === 'website'
        ? 'empty-website'
        : section === 'graphic'
          ? 'empty-graphic'
          : section === 'whiteboard'
            ? 'empty-whiteboard'
            : 'no-projects'

  return (
    <div className="dashboard-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <button onClick={() => onNavigate('landing')} title="Landing Page" aria-label="Canvas Studio Home">
            <BrandLogo variant="compact" height={34} />
          </button>
        </div>

        <div className="dash-create-wrap">
          <button className="primary-button full-button" onClick={() => onOpenNewProjectModal('website')}>
            <Plus size={16} strokeWidth={1.85} /> New Project
          </button>
        </div>

        <nav className="dash-nav" aria-label="Dashboard sections">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-btn ${section === item.id ? 'active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-user-pill">
            <span className="avatar avatar-you">{user.name.slice(0, 1).toUpperCase()}</span>
            <div style={{ minWidth: 0 }}>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
          </div>
          <IconButton
            icon={Home}
            label="Public Landing Page"
            tooltip="Landing Page"
            size="sm"
            onClick={() => onNavigate('landing')}
          />
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div className="search-box" style={{ marginBottom: 0, width: 300 }}>
            <Search size={16} strokeWidth={1.85} />
            <input
              placeholder="Search projects, rooms, or templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search projects, rooms, or templates"
            />
          </div>

          <div className="dash-top-actions">
            <select
              className="dash-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'name')}
              aria-label="Sort projects"
            >
              <option value="updated">Sort: Last Modified</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              <IconButton
                icon={LayoutGrid}
                label="Grid view"
                tooltip="Grid view"
                size="sm"
                selected={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
              />
              <IconButton
                icon={List}
                label="List view"
                tooltip="List view"
                size="sm"
                selected={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              />
            </div>
            <button className="secondary-button" style={{ height: 36 }} onClick={() => onOpenNewProjectModal('whiteboard')}>
              <Sparkles size={16} strokeWidth={1.85} /> New Board
            </button>
            <button className="lime-button" style={{ height: 36 }} onClick={() => onOpenNewProjectModal('graphic')}>
              <PenTool size={16} strokeWidth={1.85} /> New Graphic
            </button>
            <button className="primary-button" style={{ height: 36 }} onClick={() => onOpenNewProjectModal('website')}>
              <Globe size={16} strokeWidth={1.85} /> New Website
            </button>
          </div>
        </header>

        <div className="dash-scroll">
          {section === 'recent' && (
            <section className="dash-welcome-banner">
              <div style={{ minWidth: 0 }}>
                <div className="type-label" style={{ marginBottom: 6 }}>CREATIVE PLATFORM</div>
                <h1 className="type-h2" style={{ marginBottom: 8 }}>Welcome back, {user.name}</h1>
                <p className="type-body-sm" style={{ maxWidth: 560, marginBottom: 14 }}>
                  Choose a dedicated editing workspace—start with a clean blank canvas or browse
                  separated Website, Graphic, and Whiteboard templates.
                </p>
                <div className="dash-quick-buttons">
                  <button className="primary-button" onClick={() => onOpenNewProjectModal('website')}>
                    <Globe size={16} /> Website Builder
                  </button>
                  <button className="lime-button" onClick={() => onOpenNewProjectModal('graphic')}>
                    <PenTool size={16} /> Graphic Studio
                  </button>
                  <button className="secondary-button" onClick={() => onOpenNewProjectModal('whiteboard')}>
                    <Sparkles size={16} /> Whiteboard
                  </button>
                  <button className="secondary-button" onClick={() => setSection('templates')}>
                    <LayoutTemplate size={16} /> Template Library
                  </button>
                </div>
              </div>
              <div className="dash-welcome-visuals dash-welcome-illus">
                <CharacterIllustration variant="laptop" maxWidth={210} alt="Creator working at laptop" />
                <ProductIllustration variant="project-management" maxWidth={250} alt="Dashboard workspaces" />
              </div>
            </section>
          )}

          {section === 'brandkit' ? (
            <BrandKitPanel brandKit={brandKit} onChange={onUpdateBrandKit} onShowToast={onShowToast} />
          ) : section === 'templates' ? (
            <div>
              <div className="dash-section-head">
                <h2 className="type-h3">Organized Template Library ({filteredTemplates.length})</h2>
                <div className="mode-switch" style={{ height: 36 }}>
                  <button
                    className={tplTypeTab === 'website' ? 'mode-active' : ''}
                    onClick={() => { setTplTypeTab('website'); setTplCategory('All') }}
                  >
                    Website ({templates.filter((t) => t.type === 'website').length})
                  </button>
                  <button
                    className={tplTypeTab === 'graphic' ? 'mode-active' : ''}
                    onClick={() => { setTplTypeTab('graphic'); setTplCategory('All') }}
                  >
                    Graphic ({templates.filter((t) => t.type === 'graphic').length})
                  </button>
                  <button
                    className={tplTypeTab === 'whiteboard' ? 'mode-active' : ''}
                    onClick={() => { setTplTypeTab('whiteboard'); setTplCategory('All') }}
                  >
                    Whiteboard ({templates.filter((t) => t.type === 'whiteboard').length})
                  </button>
                </div>
              </div>

              <div className="category-pills-row" style={{ marginBottom: 18 }}>
                <button className={`cat-pill ${tplCategory === 'All' ? 'active' : ''}`} onClick={() => setTplCategory('All')}>
                  All {tplTypeTab}
                </button>
                {tplCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill ${tplCategory === cat ? 'active' : ''}`}
                    onClick={() => setTplCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="dash-empty-state">
                  <EmptyStateVisual variant={search.trim() ? 'no-search-results' : 'no-templates'} maxWidth={300} />
                  <h3 className="type-h4">No matching templates</h3>
                  <p className="type-body-sm">Reset your category filter or search query to view all templates.</p>
                  <button
                    className="secondary-button"
                    onClick={() => { setTplCategory('All'); setSearch('') }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
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
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="secondary-button"
                            onClick={() => {
                              onDuplicateTemplate(tpl)
                              onShowToast(`Duplicated template "${tpl.title}"`)
                            }}
                            title="Duplicate template"
                          >
                            Duplicate
                          </button>
                          <button
                            className="primary-button"
                            style={{ flex: 1 }}
                            onClick={() => onInstantiateTemplate(tpl)}
                          >
                            Use Template <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : section === 'assets' ? (
            <div>
              <div className="dash-section-head">
                <h2 className="type-h3">Uploaded Assets ({assets.length})</h2>
                <button className="primary-button" onClick={() => document.getElementById('dash-asset-upload')?.click()}>
                  <Upload size={16} strokeWidth={1.85} /> Upload Image / SVG
                </button>
                <input id="dash-asset-upload" type="file" accept="image/*,.svg" hidden onChange={(e) => uploadAssetFile(e.target.files?.[0])} />
              </div>
              {assets.length === 0 ? (
                <div className="dash-empty-state">
                  <EmptyStateVisual variant="no-assets" maxWidth={300} />
                  <h3 className="type-h4">No uploaded assets yet</h3>
                  <p className="type-body-sm">Upload PNG, WebP, JPG, or crisp SVG vector graphics for reuse across projects.</p>
                  <button className="primary-button" onClick={() => document.getElementById('dash-asset-upload')?.click()}>
                    <Upload size={16} /> Upload First Asset
                  </button>
                </div>
              ) : (
                <div className="assets-library-grid">
                  {assets.map((asset) => (
                    <div key={asset.id} className="asset-library-card">
                      <div className="asset-lib-preview">
                        <img src={asset.dataUrl} alt={asset.name} loading="lazy" />
                      </div>
                      <div className="asset-lib-meta">
                        <div>
                          <strong>{asset.name}</strong>
                          <small>{asset.category.toUpperCase()}</small>
                        </div>
                        <IconButton
                          icon={Trash2}
                          label={`Delete ${asset.name}`}
                          tooltip="Remove asset"
                          size="sm"
                          variant="danger"
                          onClick={() => onRemoveAsset(asset.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="dash-section-head">
                <h2 className="type-h3">{navItems.find((n) => n.id === section)?.label} ({filteredProjects.length})</h2>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="dash-empty-state">
                  <EmptyStateVisual variant={emptyVariant} maxWidth={300} />
                  <h3 className="type-h4">
                    {search.trim()
                      ? 'No matching projects found'
                      : section === 'shared' || section === 'team'
                        ? 'No shared team projects yet'
                        : 'No projects here yet'}
                  </h3>
                  <p className="type-body-sm">
                    {search.trim()
                      ? 'Clear your search filter or start a fresh canvas.'
                      : 'Start with a clean blank canvas or instantiate an editable template.'}
                  </p>
                  {section !== 'trash' && (
                    <button
                      className="primary-button"
                      onClick={() =>
                        search.trim()
                          ? setSearch('')
                          : onOpenNewProjectModal(
                              section === 'website'
                                ? 'website'
                                : section === 'whiteboard'
                                  ? 'whiteboard'
                                  : 'graphic'
                            )
                      }
                    >
                      <Plus size={16} /> {search.trim() ? 'Clear Search' : 'Create Project'}
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'projects-grid' : 'projects-list'}>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`project-card ${viewMode === 'list' ? 'list-row' : ''}`}
                      onClick={() => !project.trashed && onOpenProject(project)}
                    >
                      <div className={`project-preview ${project.type}`}>
                        <span className="project-type-pill">
                          {project.type === 'website' ? (
                            <><Globe size={13} /> WEBSITE</>
                          ) : project.type === 'whiteboard' ? (
                            <><Sparkles size={13} /> WHITEBOARD</>
                          ) : (
                            <><Grid size={13} /> GRAPHIC</>
                          )}
                        </span>
                        <div className="project-preview-art"><span /><b /><i /></div>
                      </div>
                      <div className="project-card-body">
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong>{project.name}</strong>
                          <small>
                            Room {project.roomCode} · {project.type === 'website' ? `${project.website?.pages.length || 1} web pages` : `${project.pages.length} artboard(s)`}
                          </small>
                        </div>
                        <div className="project-card-actions" onClick={(e) => e.stopPropagation()}>
                          {!project.trashed ? (
                            <>
                              <IconButton
                                icon={Star}
                                label={project.favorite ? 'Remove favorite' : 'Mark favorite'}
                                tooltip={project.favorite ? 'Favorited' : 'Favorite'}
                                size="sm"
                                className={project.favorite ? 'fav-active' : ''}
                                onClick={() => onToggleFavorite(project.id)}
                              />
                              <IconButton
                                icon={Trash2}
                                label={`Move ${project.name} to trash`}
                                tooltip="Move to Trash"
                                size="sm"
                                variant="danger"
                                onClick={() => onTrashProject(project.id)}
                              />
                              <button className="secondary-button" style={{ height: 30, padding: '0 10px', fontSize: 11 }} onClick={() => onOpenProject(project)}>
                                <FolderOpen size={14} /> Open
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="secondary-button" style={{ height: 30, padding: '0 10px', fontSize: 11 }} onClick={() => onRestoreProject(project.id)}>
                                <RotateCcw size={14} /> Restore
                              </button>
                              <IconButton
                                icon={Trash2}
                                label={`Delete ${project.name} permanently`}
                                tooltip="Delete Permanently"
                                size="sm"
                                variant="danger"
                                onClick={() => onDeleteForever(project.id)}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
