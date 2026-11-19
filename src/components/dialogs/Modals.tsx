import React, { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Eye,
  FileCode2,
  FileImage,
  FileJson,
  FileText,
  FolderOpen,
  Globe,
  Info,
  LayoutTemplate,
  Link2,
  MessageSquare,
  Pencil,
  RefreshCw,
  Search,
  Shapes,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import type {
  DocumentPreset,
  PermissionRole,
  ProjectDocument,
  ProjectType,
  TemplateCategory,
  TemplateDefinition,
  UnitType,
} from '../../types/platform'
import {
  DOCUMENT_PRESETS,
  GRAPHIC_TEMPLATE_CATEGORIES,
  WEBSITE_TEMPLATE_CATEGORIES,
  WHITEBOARD_TEMPLATE_CATEGORIES,
} from '../../data/presets'
import { CharacterIllustration, EmptyStateVisual } from '../branding/BrandAssets'
import { IconButton } from '../ui/IconButton'

export function ShareModal({
  open,
  onClose,
  projectName,
  pageName,
  room,
  memberName,
  setMemberName,
  permission,
  setPermission,
  conn,
  members,
  onApplyRoom,
  onCopyInvite,
  inviteCopied,
}: {
  open: boolean
  onClose: () => void
  projectName: string
  pageName: string
  room: string
  memberName: string
  setMemberName: (name: string) => void
  permission: PermissionRole
  setPermission: (p: PermissionRole) => void
  conn: string
  members: { id: string; name: string; color: string; permission?: PermissionRole }[]
  onApplyRoom: (roomCode: string, name: string, perm: PermissionRole) => void
  onCopyInvite: (perm: PermissionRole) => void
  inviteCopied: boolean
}) {
  const [roomInput, setRoomInput] = useState(room)
  const [localName, setLocalName] = useState(memberName)
  if (!open) return null

  const genCode = () => `CS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal">
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">REAL-TIME COLLABORATION</div>
            <h2>Share this workspace</h2>
            <p>Collaborate with live cursors, selection badges, and role permissions.</p>
          </div>
          <IconButton icon={X} label="Close share dialog" tooltip="Close" size="md" onClick={onClose} />
        </div>

        <div className="share-preview">
          <div className="share-preview-canvas">
            <span />
            <b />
            <i />
          </div>
          <div>
            <strong>{projectName}</strong>
            <small>
              {pageName} · {conn === 'connected' ? 'WebSocket live' : 'Local preview room'} ·{' '}
              {members.length} active
            </small>
          </div>
          <span className="share-live-dot" />
        </div>

        <label className="field stacked">
          <span>Your display name</span>
          <input
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value)
              setMemberName(e.target.value)
            }}
          />
        </label>

        <label className="field stacked">
          <span>Workspace room code</span>
          <div className="room-input-row">
            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            />
            <button className="secondary-button" onClick={() => setRoomInput(genCode())}>
              <RefreshCw size={14} /> New code
            </button>
          </div>
        </label>

        <div className="permission-label">INVITE LINK & SERVER PERMISSION</div>
        <div className="permission-options">
          <button
            className={permission === 'edit' ? 'permission-active' : ''}
            onClick={() => setPermission('edit')}
          >
            <Pencil size={16} />
            <strong>Can edit</strong>
            <small>Full editing access</small>
            {permission === 'edit' && <Check size={14} />}
          </button>
          <button
            className={permission === 'comment' ? 'permission-active' : ''}
            onClick={() => setPermission('comment')}
          >
            <MessageSquare size={16} />
            <strong>Can comment</strong>
            <small>Post notes & mentions</small>
            {permission === 'comment' && <Check size={14} />}
          </button>
          <button
            className={permission === 'view' ? 'permission-active' : ''}
            onClick={() => setPermission('view')}
          >
            <Eye size={16} />
            <strong>Can view</strong>
            <small>Read-only access</small>
            {permission === 'view' && <Check size={14} />}
          </button>
        </div>

        <div className="room-note">
          <Users size={15} />
          <span>
            Supports 5–10 concurrent team members. Server enforces <strong>Can view</strong> and{' '}
            <strong>Can comment</strong> restrictions.
          </span>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={() => onCopyInvite(permission)}>
            <Link2 size={15} /> {inviteCopied ? 'Copied!' : 'Copy invite link'}
          </button>
          <button
            className="primary-button"
            onClick={() => onApplyRoom(roomInput, localName, permission)}
          >
            Save & join room <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExportModal({
  open,
  onClose,
  mode,
  onExportPng,
  onExportSvg,
  onExportPdf,
  onExportJson,
  onExportHtml,
  onExportCss,
  onExportReact,
  onImportJson,
}: {
  open: boolean
  onClose: () => void
  mode: 'website' | 'graphic'
  onExportPng?: () => void
  onExportSvg?: () => void
  onExportPdf?: () => void
  onExportJson: () => void
  onExportHtml?: () => void
  onExportCss?: () => void
  onExportReact?: () => void
  onImportJson: (file?: File) => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal export-modal">
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">EXPORT & CODE OUTPUT</div>
            <h2>{mode === 'website' ? 'Export Website Code' : 'Export & Backup'}</h2>
            <p>Generate clean production-structured files directly in your browser.</p>
          </div>
          <IconButton icon={X} label="Close export dialog" tooltip="Close" size="md" onClick={onClose} />
        </div>

        <div className="export-options">
          {mode === 'website' ? (
            <>
              <button onClick={onExportHtml}>
                <div className="export-icon svg">
                  <FileCode2 size={21} />
                </div>
                <span>
                  <strong>Complete HTML5 + Responsive CSS</strong>
                  <small>Single-file webpage with Desktop, Tablet & Mobile @media rules</small>
                </span>
                <ArrowRight size={16} />
              </button>
              <button onClick={onExportCss}>
                <div className="export-icon png">
                  <Code2 size={21} />
                </div>
                <span>
                  <strong>Standalone Stylesheet (.css)</strong>
                  <small>Extracted layout, typography, hover states & breakpoint rules</small>
                </span>
                <ArrowRight size={16} />
              </button>
              <button onClick={onExportReact}>
                <div className="export-icon pdf">
                  <Globe size={21} />
                </div>
                <span>
                  <strong>React Component (.tsx)</strong>
                  <small>Structured JSX component ready for Vite or Next.js</small>
                </span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={onExportPng}>
                <div className="export-icon png">
                  <FileImage size={21} />
                </div>
                <span>
                  <strong>PNG Raster Image</strong>
                  <small>High-resolution raster export</small>
                </span>
                <ArrowRight size={16} />
              </button>
              <button onClick={onExportSvg}>
                <div className="export-icon svg">
                  <Shapes size={21} />
                </div>
                <span>
                  <strong>SVG Vector Artwork</strong>
                  <small>Clean scalable vector markup</small>
                </span>
                <ArrowRight size={16} />
              </button>
              <button onClick={onExportPdf}>
                <div className="export-icon pdf">
                  <FileText size={21} />
                </div>
                <span>
                  <strong>Print / Save as PDF</strong>
                  <small>Print-ready document layout</small>
                </span>
                <ArrowRight size={16} />
              </button>
            </>
          )}

          <button onClick={onExportJson}>
            <div className="export-icon json">
              <FileJson size={21} />
            </div>
            <span>
              <strong>Canvas Studio JSON</strong>
              <small>Full editable project backup</small>
            </span>
            <ArrowRight size={16} />
          </button>

          <button onClick={() => document.getElementById('platform-json-import')?.click()}>
            <div className="export-icon json">
              <FolderOpen size={21} />
            </div>
            <span>
              <strong>Import Project JSON</strong>
              <small>Restore a saved project file</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <input
            id="platform-json-import"
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => onImportJson(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  )
}

export function NewProjectModal({
  open,
  onClose,
  initialType = 'graphic',
  templates,
  onCreateBlank,
  onUseTemplate,
}: {
  open: boolean
  onClose: () => void
  initialType?: ProjectType
  templates: TemplateDefinition[]
  onCreateBlank: (opts: {
    name: string
    type: ProjectType
    preset?: DocumentPreset
    width: number
    height: number
    unit: UnitType
    dpi: number
    background: string
    transparentBg: boolean
  }) => void
  onUseTemplate: (tpl: TemplateDefinition) => void
}) {
  const [name, setName] = useState('Untitled Project')
  const [type, setType] = useState<ProjectType>(initialType)
  const [startMode, setStartMode] = useState<'blank' | 'template'>('blank')
  const [preset, setPreset] = useState<DocumentPreset>(DOCUMENT_PRESETS[0])
  const [width, setWidth] = useState(1600)
  const [height, setHeight] = useState(1100)
  const [unit, setUnit] = useState<UnitType>('px')
  const [dpi, setDpi] = useState(72)
  const [background, setBackground] = useState('#FFFEFA')
  const [transparentBg, setTransparentBg] = useState(false)

  if (!open) return null

  const typeTemplates = templates.filter((t) => t.type === type)

  const selectPreset = (p: DocumentPreset) => {
    setPreset(p)
    setWidth(p.width)
    setHeight(p.height)
    setUnit(p.unit)
    setDpi(p.dpi)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(760px, calc(100vw - 32px))' }}>
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">NEW PROJECT SETUP</div>
            <h2>Start a clean canvas or pick a template</h2>
            <p>Choose your creative environment, then start blank or instantiate a dedicated template.</p>
          </div>
          <IconButton icon={X} label="Close new project dialog" tooltip="Close" size="md" onClick={onClose} />
        </div>

        <div className="permission-label" style={{ marginTop: 0 }}>1. SELECT WORKSPACE ENVIRONMENT</div>
        <div className="permission-options">
          <button
            className={type === 'website' ? 'permission-active' : ''}
            onClick={() => setType('website')}
          >
            <Globe size={17} />
            <strong>Website Builder</strong>
            <small>Responsive pages & HTML/CSS</small>
            {type === 'website' && <Check size={14} />}
          </button>
          <button
            className={type === 'graphic' ? 'permission-active' : ''}
            onClick={() => setType('graphic')}
          >
            <Shapes size={17} />
            <strong>Graphic Design Studio</strong>
            <small>Artboard, vectors & photo filters</small>
            {type === 'graphic' && <Check size={14} />}
          </button>
          <button
            className={type === 'whiteboard' ? 'permission-active' : ''}
            onClick={() => setType('whiteboard')}
          >
            <Sparkles size={17} />
            <strong>Team Whiteboard</strong>
            <small>Infinite board, stickies & mind maps</small>
            {type === 'whiteboard' && <Check size={14} />}
          </button>
        </div>

        <div className="permission-label">2. STARTING STATE</div>
        <div className="mode-switch" style={{ width: 'fit-content', marginBottom: 14 }}>
          <button
            className={startMode === 'blank' ? 'mode-active' : ''}
            onClick={() => setStartMode('blank')}
          >
            A. Start with Blank Canvas
          </button>
          <button
            className={startMode === 'template' ? 'mode-active' : ''}
            onClick={() => setStartMode('template')}
          >
            <LayoutTemplate size={14} /> B. Choose from {type.toUpperCase()} Templates ({typeTemplates.length})
          </button>
        </div>

        {startMode === 'blank' ? (
          <>
            <label className="field stacked">
              <span>Project name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            {type === 'graphic' && (
              <>
                <div className="permission-label">ARTBOARD PRESETS</div>
                <div className="preset-grid-scroll">
                  {DOCUMENT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      className={`preset-pill ${preset.id === p.id ? 'active' : ''}`}
                      onClick={() => selectPreset(p)}
                    >
                      <strong>{p.name}</strong>
                      <small>
                        {p.width}×{p.height} {p.unit}
                      </small>
                    </button>
                  ))}
                </div>
                <div className="field-grid four" style={{ marginTop: 10 }}>
                  <label className="field">
                    <span>Width</span>
                    <input type="number" min={100} value={width} onChange={(e) => setWidth(Math.max(100, Number(e.target.value)))} />
                  </label>
                  <label className="field">
                    <span>Height</span>
                    <input type="number" min={100} value={height} onChange={(e) => setHeight(Math.max(100, Number(e.target.value)))} />
                  </label>
                  <label className="field">
                    <span>Units</span>
                    <select value={unit} onChange={(e) => setUnit(e.target.value as UnitType)}>
                      <option value="px">px</option>
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>DPI</span>
                    <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))}>
                      <option value={72}>72 DPI</option>
                      <option value={150}>150 DPI</option>
                      <option value={300}>300 DPI</option>
                    </select>
                  </label>
                </div>
                <div className="field-row" style={{ marginTop: 10, alignItems: 'center' }}>
                  <label className="color-input" style={{ width: 'auto' }}>
                    <input type="color" value={background} disabled={transparentBg} onChange={(e) => setBackground(e.target.value)} />
                    <span style={{ fontSize: 11 }}>{transparentBg ? 'Transparent' : background}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
                    <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} />
                    Transparent Background
                  </label>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button className="secondary-button" onClick={onClose}>Cancel</button>
              <button
                className="primary-button"
                onClick={() => {
                  onCreateBlank({ name, type, preset, width, height, unit, dpi, background, transparentBg })
                  onClose()
                }}
              >
                Open Blank Canvas <ArrowRight size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="preset-grid-scroll" style={{ maxHeight: 300, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {typeTemplates.map((tpl) => (
              <div key={tpl.id} className="preset-pill" style={{ gap: 6, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="template-cat">{tpl.category}</span>
                  <small>{tpl.dimensions}</small>
                </div>
                <strong>{tpl.title}</strong>
                <small style={{ fontFamily: 'DM Sans', fontSize: 11 }}>{tpl.description}</small>
                <button
                  className="primary-button"
                  style={{ height: 32, marginTop: 4 }}
                  onClick={() => {
                    onUseTemplate(tpl)
                    onClose()
                  }}
                >
                  Use Template <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TemplateGalleryModal({
  open,
  onClose,
  projectType,
  templates,
  onApplyTemplate,
  onDuplicateTemplate,
}: {
  open: boolean
  onClose: () => void
  projectType: ProjectType
  templates: TemplateDefinition[]
  onApplyTemplate: (tpl: TemplateDefinition) => void
  onDuplicateTemplate: (tpl: TemplateDefinition) => void
}) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<'All' | TemplateCategory>('All')
  const [previewTpl, setPreviewTpl] = useState<TemplateDefinition | null>(null)

  const categories =
    projectType === 'website'
      ? WEBSITE_TEMPLATE_CATEGORIES
      : projectType === 'whiteboard'
        ? WHITEBOARD_TEMPLATE_CATEGORIES
        : GRAPHIC_TEMPLATE_CATEGORIES

  const list = useMemo(
    () =>
      templates.filter((t) => {
        if (t.type !== projectType) return false
        if (cat !== 'All' && t.category !== cat) return false
        if (
          query.trim() &&
          !`${t.title} ${t.category} ${t.description}`.toLowerCase().includes(query.toLowerCase())
        ) {
          return false
        }
        return true
      }),
    [templates, projectType, cat, query]
  )

  if (!open) return null

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(920px, calc(100vw - 32px))' }}>
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">{projectType.toUpperCase()} TEMPLATE LIBRARY</div>
            <h2>{previewTpl ? previewTpl.title : `Choose a ${projectType} template`}</h2>
            <p>
              {previewTpl
                ? `${previewTpl.category} · ${previewTpl.dimensions}`
                : 'Templates create editable documents. Close anytime to return to your clean canvas.'}
            </p>
          </div>
          <IconButton
            icon={X}
            label="Close templates"
            tooltip="Close"
            size="md"
            onClick={onClose}
          />
        </div>

        {previewTpl ? (
          <div>
            <div className="template-thumb" style={{ background: previewTpl.accent, height: 210, borderRadius: 8, border: '2px solid #171717' }}>
              <span className="tpl-type-badge">{previewTpl.dimensions}</span>
              <div className="tpl-mini-wireframe" style={{ width: 240, height: 140 }}>
                <span />
                <b />
                <i />
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#4A4742', margin: '14px 0' }}>{previewTpl.description}</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setPreviewTpl(null)}>
                Back to Library
              </button>
              <button className="secondary-button" onClick={() => onDuplicateTemplate(previewTpl)}>
                <Copy size={14} /> Duplicate Template
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  onApplyTemplate(previewTpl)
                  onClose()
                }}
              >
                Use This Template <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="search-box" style={{ marginBottom: 12 }}>
              <Search size={15} />
              <input
                placeholder={`Search ${projectType} templates...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="category-pills-row" style={{ marginBottom: 14 }}>
              <button className={`cat-pill ${cat === 'All' ? 'active' : ''}`} onClick={() => setCat('All')}>
                All ({templates.filter((t) => t.type === projectType).length})
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`cat-pill ${cat === c ? 'active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {list.length === 0 ? (
              <div className="dash-empty-state" style={{ padding: '24px 16px' }}>
                <EmptyStateVisual variant="no-templates" maxWidth={240} />
                <h3 className="type-h4">No matching {projectType} templates</h3>
                <p className="type-body-sm">Reset filters or close this gallery to stay on a clean blank canvas.</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setCat('All')
                    setQuery('')
                  }}
                >
                  Reset Template Filters
                </button>
              </div>
            ) : (
            <div className="preset-grid-scroll" style={{ maxHeight: 360, gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {list.map((tpl) => (
                <div key={tpl.id} className="template-card">
                  <div className="template-thumb" style={{ background: tpl.accent, height: 100 }}>
                    <span className="tpl-type-badge">{tpl.dimensions}</span>
                  </div>
                  <div className="template-body" style={{ padding: 12 }}>
                    <div className="template-cat">{tpl.category}</div>
                    <h3 style={{ fontSize: 14 }}>{tpl.title}</h3>
                    <p style={{ fontSize: 11 }}>{tpl.description}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="secondary-button"
                        style={{ height: 30, padding: '0 8px' }}
                        onClick={() => setPreviewTpl(tpl)}
                        title="Preview"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="secondary-button"
                        style={{ height: 30, padding: '0 8px' }}
                        onClick={() => onDuplicateTemplate(tpl)}
                        title="Duplicate template"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        className="primary-button"
                        style={{ height: 30, flex: 1, fontSize: 10 }}
                        onClick={() => {
                          onApplyTemplate(tpl)
                          onClose()
                        }}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function PublishModal({
  open,
  onClose,
  project,
  onExportHtml,
  onOpenPreview,
}: {
  open: boolean
  onClose: () => void
  project: ProjectDocument
  onExportHtml: () => void
  onOpenPreview: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">DEPLOYMENT STATUS</div>
            <h2>Publish {project.name}</h2>
            <p>Static export ready; live hosting requires connecting an external host.</p>
          </div>
          <IconButton icon={X} label="Close dialog" tooltip="Close" size="md" onClick={onClose} />
        </div>

        <div className="room-note" style={{ marginTop: 0, marginBottom: 16 }}>
          <Info size={16} />
          <span>
            <strong>Honest Deployment Status:</strong> Direct cloud publishing is not enabled without
            a connected host (Netlify, Vercel, Cloudflare Pages). Download the deployable HTML5 + CSS
            bundle below to host anywhere.
          </span>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={() => { onClose(); onOpenPreview() }}>
            <Eye size={15} /> Preview Site
          </button>
          <button className="primary-button" onClick={() => { onExportHtml(); onClose() }}>
            Download Deployable HTML <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function HelpShortcutsModal({
  mode,
  open,
  onClose,
}: {
  mode: 'help' | 'shortcuts'
  open: boolean
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal shortcuts-modal" style={{ width: 'min(540px, calc(100vw - 32px))' }}>
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">{mode === 'help' ? 'STUDIO GUIDE' : 'KEYBOARD SHORTCUTS'}</div>
            <h2>{mode === 'help' ? 'Canvas Studio Guide' : 'Work at full speed'}</h2>
          </div>
          <IconButton icon={X} label="Close dialog" tooltip="Close" size="md" onClick={onClose} />
        </div>

        {mode === 'help' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <CharacterIllustration variant="onboarding" maxWidth={230} />
            </div>
            <div className="help-cards">
              <div>
                <span className="help-number">01</span>
                <strong>Website Builder</strong>
                <p>Design responsive pages with Desktop, Tablet & Mobile rules and export clean HTML/CSS.</p>
              </div>
              <div>
                <span className="help-number">02</span>
                <strong>Graphic Design Studio</strong>
                <p>Precision artboards with rulers, guides, Bezier nodes, eyedropper, crop, and photo filters.</p>
              </div>
              <div>
                <span className="help-number">03</span>
                <strong>Team Whiteboard</strong>
                <p>Infinite canvas for sticky notes, connectors, flowcharts, and mind maps.</p>
              </div>
            </div>
            <button className="primary-button full-button" onClick={onClose}>
              Back to Workspace <ArrowRight size={15} />
            </button>
          </>
        ) : (
          <div className="shortcut-list">
            {[
              ['Select', 'V'],
              ['Direct Node', 'A'],
              ['Hand / Pan', 'H / Space'],
              ['Text', 'T'],
              ['Rectangle', 'R'],
              ['Ellipse', 'O'],
              ['Pen / Bezier', 'P / B'],
              ['Sticky Note', 'N'],
              ['Eyedropper', 'I'],
              ['Crop Image', 'C'],
              ['Cut / Copy / Paste', 'Ctrl+X / C / V'],
              ['Duplicate', 'Ctrl+D'],
              ['Group / Ungroup', 'Ctrl+G'],
              ['Undo / Redo', 'Ctrl+Z / Y'],
              ['Delete', 'Backspace'],
            ].map(([label, key]) => (
              <div key={label}>
                <span>{label}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
