import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CheckCheck } from 'lucide-react'
import './styles.css'
import type {
  AppView,
  CommentItem,
  Cursor,
  Op,
  PermissionRole,
  ProjectDocument,
  ProjectType,
  TemplateDefinition,
  WebsiteDocument,
} from './types/platform'
import { USER_COLORS } from './data/presets'
import { makeId } from './data/templates'
import { usePlatformStore } from './store/usePlatformStore'
import {
  exportGraphicPdf,
  exportGraphicPng,
  exportGraphicSvg,
  exportProjectJson,
  exportWebsiteCss,
  exportWebsiteHtml,
  exportWebsiteReact,
} from './services/exportService'
import { LandingPage } from './features/landing/LandingPage'
import { AuthViews } from './features/auth/AuthViews'
import { DashboardView } from './features/dashboard/DashboardView'
import { WebsiteBuilder } from './features/website-builder/WebsiteBuilder'
import { GraphicStudio } from './features/graphic-editor/GraphicStudio'
import { WhiteboardWorkspace } from './features/whiteboard/WhiteboardWorkspace'
import {
  ExportModal,
  HelpShortcutsModal,
  NewProjectModal,
  PublishModal,
  ShareModal,
  TemplateGalleryModal,
} from './components/dialogs/Modals'

type RemoteMessage = { type: string; [key: string]: any }

function readUrlParams(): { room: string | null; perm: PermissionRole } {
  const params = new URLSearchParams(window.location.search)
  const r = params.get('room')
  const p = params.get('perm')
  const perm: PermissionRole = p === 'view' || p === 'comment' ? p : 'edit'
  return { room: r ? r.toUpperCase() : null, perm }
}

function viewForProjectType(t: ProjectType): AppView {
  if (t === 'website') return 'website-editor'
  if (t === 'whiteboard') return 'whiteboard-editor'
  return 'graphic-editor'
}

function App() {
  const store = usePlatformStore()
  const {
    projects,
    setProjects,
    activeProject,
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
  } = store

  const urlInit = readUrlParams()
  const [view, setView] = useState<AppView>(() =>
    urlInit.room && activeProject ? viewForProjectType(activeProject.type) : 'landing'
  )
  const [permission, setPermission] = useState<PermissionRole>(urlInit.perm)
  const [myColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)])
  const [remoteCursors, setRemoteCursors] = useState<Record<string, Cursor>>({})
  const [members, setMembers] = useState<{ id: string; name: string; color: string; permission?: PermissionRole }[]>([])
  const [conn, setConn] = useState<'connecting' | 'connected' | 'local' | 'offline'>('connecting')
  const [toast, setToast] = useState('')

  // Modals
  const [shareOpen, setShareOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [newProjectType, setNewProjectType] = useState<ProjectType>('graphic')
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false)
  const [helpModal, setHelpModal] = useState<'help' | 'shortcuts' | null>(null)
  const [inviteCopied, setInviteCopied] = useState(false)

  const graphicSvgRef = useRef<SVGSVGElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const bcRef = useRef<BroadcastChannel | null>(null)

  const activeRoom = urlInit.room || activeProject?.roomCode || 'CS-MAIN'
  const [room, setRoom] = useState(activeRoom)

  const projectRef = useRef(activeProject)
  projectRef.current = activeProject
  const userRef = useRef(user)
  userRef.current = user
  const colorRef = useRef(myColor)
  colorRef.current = myColor
  const permRef = useRef(permission)
  permRef.current = permission

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => {
    if (!sessionStorage.getItem('canvas-studio-client-id')) {
      sessionStorage.setItem('canvas-studio-client-id', makeId())
    }
  }, [])

  const applyRemoteOp = useCallback(
    (op: Op) => {
      const proj = projectRef.current
      if (!proj) return
      updateProject(proj.id, (p) => {
        switch (op.kind) {
          case 'upsertElement':
            return {
              ...p,
              pages: p.pages.map((pg) =>
                pg.id !== op.pageId
                  ? pg
                  : { ...pg, elements: [...pg.elements.filter((e) => e.id !== op.element.id), op.element] }
              ),
            }
          case 'deleteElement':
            return {
              ...p,
              pages: p.pages.map((pg) =>
                pg.id !== op.pageId
                  ? pg
                  : { ...pg, elements: pg.elements.filter((e) => e.id !== op.elementId) }
              ),
            }
          case 'upsertPage':
            return {
              ...p,
              pages: p.pages.some((pg) => pg.id === op.page.id)
                ? p.pages.map((pg) => (pg.id === op.page.id ? op.page : pg))
                : [...p.pages, op.page],
            }
          case 'deletePage':
            return { ...p, pages: p.pages.filter((pg) => pg.id !== op.pageId) }
          case 'renamePage':
            return {
              ...p,
              pages: p.pages.map((pg) => (pg.id === op.pageId ? { ...pg, name: op.name } : pg)),
            }
          case 'setBackground':
            return {
              ...p,
              pages: p.pages.map((pg) =>
                pg.id === op.pageId ? { ...pg, background: op.background } : pg
              ),
            }
          case 'syncWebsite':
            return { ...p, website: op.website }
          case 'upsertComment':
            return {
              ...p,
              comments: [...p.comments.filter((c) => c.id !== op.comment.id), op.comment],
            }
          default:
            return p
        }
      })
    },
    [updateProject]
  )

  const sendMessage = useCallback((message: RemoteMessage) => {
    const payload = { ...message, senderId: sessionStorage.getItem('canvas-studio-client-id') || '' }
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(payload))
    } catch {}
    try {
      bcRef.current?.postMessage(payload)
    } catch {}
  }, [])

  useEffect(() => {
    const clientId = sessionStorage.getItem('canvas-studio-client-id') || makeId()
    const wsUrl = (import.meta as any).env?.VITE_COLLAB_WS_URL || 'ws://localhost:8787'
    let alive = true
    setConn('connecting')
    let ws: WebSocket | null = null
    const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`canvas-studio-${room}`) : null
    bcRef.current = bc

    if (bc) {
      bc.onmessage = (event) => {
        const msg = event.data as RemoteMessage
        if (msg.senderId === clientId) return
        if (msg.type === 'op' && msg.op) applyRemoteOp(msg.op as Op)
        if (msg.type === 'cursor' && msg.cursor) {
          setRemoteCursors((prev) => ({ ...prev, [msg.cursor.id]: msg.cursor }))
        }
        if (msg.type === 'presence-local') {
          setMembers((prev) => [...prev.filter((m) => m.id !== msg.member.id), msg.member])
        }
        if (msg.type === 'presence-left-local' && msg.id) {
          setMembers((prev) => prev.filter((m) => m.id !== msg.id))
        }
      }
    }

    try {
      ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onopen = () => {
        if (!alive) return
        setConn('connected')
        ws?.send(
          JSON.stringify({
            type: 'join',
            room,
            user: {
              id: clientId,
              name: userRef.current.name,
              color: colorRef.current,
              permission: permRef.current,
            },
          })
        )
      }
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as RemoteMessage
          if (msg.type === 'sync') {
            const p = projectRef.current
            if (msg.doc?.pages?.length && p) {
              updateProject(p.id, (cur) => ({
                ...cur,
                pages: msg.doc.pages,
                activePageId: msg.doc.activePageId || msg.doc.pages[0].id,
                website: msg.doc.website || cur.website,
                comments: msg.doc.comments || cur.comments,
              }))
            } else if (p && permRef.current === 'edit') {
              ws?.send(
                JSON.stringify({
                  type: 'init',
                  doc: {
                    pages: p.pages,
                    activePageId: p.activePageId,
                    website: p.website || null,
                    comments: p.comments,
                  },
                })
              )
            }
            setMembers(msg.members || [])
          }
          if (msg.type === 'op' && msg.op) applyRemoteOp(msg.op as Op)
          if (msg.type === 'presence') setMembers(msg.members || [])
          if (msg.type === 'cursor' && msg.cursor) {
            setRemoteCursors((prev) => ({ ...prev, [msg.cursor.id]: msg.cursor }))
          }
          if (msg.type === 'user-left' && msg.id) {
            setRemoteCursors((prev) => {
              const next = { ...prev }
              delete next[msg.id]
              return next
            })
          }
          if (msg.type === 'permission-denied') {
            showToast(msg.message || 'Permission denied by server')
          }
          if (msg.type === 'room-full') {
            setConn('offline')
            showToast('Room full: maximum 10 active editors.')
          }
        } catch {}
      }
      ws.onerror = () => { if (alive) setConn('local') }
      ws.onclose = () => { if (alive) setConn('local') }
    } catch {
      setConn('local')
    }

    bc?.postMessage({
      type: 'presence-local',
      senderId: clientId,
      member: { id: clientId, name: userRef.current.name, color: colorRef.current, permission: permRef.current },
    })

    return () => {
      alive = false
      try { bc?.postMessage({ type: 'presence-left-local', senderId: clientId, id: clientId }) } catch {}
      try { ws?.close() } catch {}
      bc?.close()
      wsRef.current = null
      bcRef.current = null
    }
  }, [room, applyRemoteOp, updateProject, showToast])

  useEffect(() => {
    const expire = window.setInterval(() => {
      setRemoteCursors((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([, c]) => Date.now() - c.updatedAt < 7000))
      )
    }, 3000)
    return () => window.clearInterval(expire)
  }, [])

  const openProjectInEditor = (proj: ProjectDocument) => {
    setActiveProjectId(proj.id)
    setRoom(proj.roomCode)
    setView(viewForProjectType(proj.type))
  }

  const handleUseTemplate = (tpl: TemplateDefinition) => {
    const proj = instantiateTemplate(tpl)
    setRoom(proj.roomCode)
    setView(viewForProjectType(proj.type))
    showToast(`Created new project from template: ${tpl.title}`)
  }

  const handleQuickStart = (mode: ProjectType) => {
    const existing = projects.find((p) => !p.trashed && p.type === mode)
    if (existing) {
      openProjectInEditor(existing)
    } else {
      const created = createProject({
        name: mode === 'website' ? 'Untitled Website' : mode === 'whiteboard' ? 'Untitled Whiteboard' : 'Untitled Graphic',
        type: mode,
      })
      openProjectInEditor(created)
    }
  }

  const handleSendComment = (c: CommentItem) => {
    if (!activeProject) return
    updateProject(activeProject.id, (p) => ({ ...p, comments: [...p.comments, c] }))
    sendMessage({ type: 'op', op: { kind: 'upsertComment', comment: c } })
  }

  const handleApplyRoom = (roomCode: string, nextName: string, perm: PermissionRole) => {
    const cleanRoom = roomCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24)
    if (!cleanRoom) return
    setUser((u) => ({ ...u, name: nextName || u.name }))
    setPermission(perm)
    if (activeProject) updateProject(activeProject.id, (p) => ({ ...p, roomCode: cleanRoom }))
    localStorage.setItem('canvas-studio-room', cleanRoom)
    const url = new URL(window.location.href)
    url.searchParams.set('room', cleanRoom)
    url.searchParams.set('perm', perm)
    window.history.replaceState({}, '', url.toString())
    setRoom(cleanRoom)
    sendMessage({ type: 'profile', user: { name: nextName, permission: perm } })
    setShareOpen(false)
    showToast(`Joined room ${cleanRoom} (${perm})`)
  }

  const handleCopyInvite = async (perm: PermissionRole) => {
    const url = new URL(window.location.href)
    url.searchParams.set('room', room)
    url.searchParams.set('perm', perm)
    try {
      await navigator.clipboard.writeText(url.toString())
      setInviteCopied(true)
      showToast('Invite link copied')
      window.setTimeout(() => setInviteCopied(false), 1800)
    } catch {
      showToast(`Room code: ${room}`)
    }
  }

  const handleImportJson = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed.pages) || !parsed.pages.length) {
          showToast('Invalid project JSON format')
          return
        }
        const t: ProjectType =
          parsed.type === 'website' ? 'website' : parsed.type === 'whiteboard' ? 'whiteboard' : 'graphic'
        const imported: ProjectDocument = {
          id: `proj-${makeId()}`,
          name: parsed.project || file.name.replace('.json', ''),
          type: t,
          roomCode: `CS-${makeId().slice(0, 5).toUpperCase()}`,
          favorite: false,
          trashed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          pages: parsed.pages,
          activePageId: parsed.activePageId || parsed.pages[0].id,
          website: parsed.website,
          comments: [],
        }
        setProjects((prev) => [imported, ...prev])
        openProjectInEditor(imported)
        setExportOpen(false)
        showToast('Project imported')
      } catch {
        showToast('Could not parse JSON file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      {view === 'landing' && (
        <LandingPage
          onNavigate={setView}
          onUseTemplate={handleUseTemplate}
          onQuickStart={handleQuickStart}
        />
      )}

      {(view === 'login' || view === 'register' || view === 'recover' || view === 'onboarding') && (
        <AuthViews
          view={view}
          user={user}
          onUpdateUser={(patch) => setUser((u) => ({ ...u, ...patch }))}
          onNavigate={setView}
          onApplyBrandAccent={(color) =>
            setBrandKit((b) => ({ ...b, primaryColors: [color, ...b.primaryColors.slice(1)] }))
          }
        />
      )}

      {view === 'dashboard' && (
        <DashboardView
          user={user}
          projects={projects}
          templates={allTemplates}
          brandKit={brandKit}
          onUpdateBrandKit={setBrandKit}
          assets={assets}
          onAddAsset={addAsset}
          onRemoveAsset={(id) => setAssets((prev) => prev.filter((a) => a.id !== id))}
          onOpenProject={openProjectInEditor}
          onToggleFavorite={(id) => updateProject(id, (p) => ({ ...p, favorite: !p.favorite }))}
          onTrashProject={(id) => updateProject(id, (p) => ({ ...p, trashed: true }))}
          onRestoreProject={(id) => updateProject(id, (p) => ({ ...p, trashed: false }))}
          onDeleteForever={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
          onOpenNewProjectModal={(type) => {
            setNewProjectType(type)
            setNewProjectOpen(true)
          }}
          onInstantiateTemplate={handleUseTemplate}
          onDuplicateTemplate={duplicateTemplate}
          onNavigate={setView}
          onShowToast={showToast}
        />
      )}

      {view === 'website-editor' && activeProject && (
        <WebsiteBuilder
          project={activeProject}
          brandKit={brandKit}
          assets={assets}
          templates={allTemplates}
          webComponents={webComponents}
          onSaveComponent={(comp) => setWebComponents((prev) => [comp, ...prev])}
          onDeleteComponent={(id) => setWebComponents((prev) => prev.filter((c) => c.id !== id))}
          onUpdateProject={(updater) => updateProject(activeProject.id, updater)}
          onBackToDashboard={() => setView('dashboard')}
          onOpenTemplates={() => setTemplateGalleryOpen(true)}
          onApplyWebsiteTemplate={handleUseTemplate}
          onOpenShare={() => setShareOpen(true)}
          onOpenExport={() => setExportOpen(true)}
          onOpenPublish={() => setPublishOpen(true)}
          onSyncWebsite={(website: WebsiteDocument) =>
            sendMessage({ type: 'op', op: { kind: 'syncWebsite', website } })
          }
          onSendComment={handleSendComment}
          conn={conn}
          members={members}
          permission={permission}
          userName={user.name}
          onShowToast={showToast}
        />
      )}

      {view === 'graphic-editor' && activeProject && (
        <GraphicStudio
          project={activeProject}
          brandKit={brandKit}
          assets={assets}
          templates={allTemplates}
          onAddAsset={addAsset}
          onUpdateProject={(updater) => updateProject(activeProject.id, updater)}
          onBackToDashboard={() => setView('dashboard')}
          onOpenTemplates={() => setTemplateGalleryOpen(true)}
          onApplyTemplate={handleUseTemplate}
          onOpenShare={() => setShareOpen(true)}
          onOpenExport={() => setExportOpen(true)}
          onOpenHelp={() => setHelpModal('help')}
          onOpenShortcuts={() => setHelpModal('shortcuts')}
          onSendOp={(op) => sendMessage({ type: 'op', op })}
          onSendCursor={(cursor) => sendMessage({ type: 'cursor', cursor })}
          onSendComment={handleSendComment}
          remoteCursors={remoteCursors}
          members={members}
          conn={conn}
          permission={permission}
          userName={user.name}
          userColor={myColor}
          svgRef={graphicSvgRef}
          onShowToast={showToast}
        />
      )}

      {view === 'whiteboard-editor' && activeProject && (
        <WhiteboardWorkspace
          project={activeProject}
          onUpdateProject={(updater) => updateProject(activeProject.id, updater)}
          onBackToDashboard={() => setView('dashboard')}
          onOpenTemplates={() => setTemplateGalleryOpen(true)}
          onOpenShare={() => setShareOpen(true)}
          onOpenExport={() => setExportOpen(true)}
          onSendOp={(op) => sendMessage({ type: 'op', op })}
          onSendCursor={(cursor) => sendMessage({ type: 'cursor', cursor })}
          remoteCursors={remoteCursors}
          members={members}
          conn={conn}
          permission={permission}
          userName={user.name}
          userColor={myColor}
          svgRef={graphicSvgRef}
          onShowToast={showToast}
        />
      )}

      {activeProject && (
        <TemplateGalleryModal
          open={templateGalleryOpen}
          onClose={() => setTemplateGalleryOpen(false)}
          projectType={
            view === 'website-editor' ? 'website' : view === 'whiteboard-editor' ? 'whiteboard' : 'graphic'
          }
          templates={allTemplates}
          onApplyTemplate={handleUseTemplate}
          onDuplicateTemplate={(tpl) => {
            duplicateTemplate(tpl)
            showToast(`Duplicated template "${tpl.title}"`)
          }}
        />
      )}

      {activeProject && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          projectName={activeProject.name}
          pageName={
            view === 'website-editor'
              ? activeProject.website?.pages.find((p) => p.id === activeProject.website?.activePageId)?.name || 'Home'
              : activeProject.pages.find((p) => p.id === activeProject.activePageId)?.name || 'Page 1'
          }
          room={room}
          memberName={user.name}
          setMemberName={(n) => setUser((u) => ({ ...u, name: n }))}
          permission={permission}
          setPermission={setPermission}
          conn={conn}
          members={members}
          onApplyRoom={handleApplyRoom}
          onCopyInvite={handleCopyInvite}
          inviteCopied={inviteCopied}
        />
      )}

      {activeProject && (
        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          mode={view === 'website-editor' ? 'website' : 'graphic'}
          onExportHtml={() => {
            exportWebsiteHtml(activeProject)
            setExportOpen(false)
            showToast('Exported HTML5 + responsive CSS')
          }}
          onExportCss={() => {
            exportWebsiteCss(activeProject)
            setExportOpen(false)
            showToast('Exported CSS stylesheet')
          }}
          onExportReact={() => {
            exportWebsiteReact(activeProject)
            setExportOpen(false)
            showToast('Exported React TSX component')
          }}
          onExportPng={() => {
            const page = activeProject.pages.find((p) => p.id === activeProject.activePageId) || activeProject.pages[0]
            exportGraphicPng(graphicSvgRef.current, activeProject.name, page, () => showToast('Could not rasterize PNG'))
            setExportOpen(false)
            showToast('Preparing PNG export…')
          }}
          onExportSvg={() => {
            const page = activeProject.pages.find((p) => p.id === activeProject.activePageId) || activeProject.pages[0]
            exportGraphicSvg(graphicSvgRef.current, activeProject.name, page)
            setExportOpen(false)
            showToast('SVG exported')
          }}
          onExportPdf={() => {
            const page = activeProject.pages.find((p) => p.id === activeProject.activePageId) || activeProject.pages[0]
            const ok = exportGraphicPdf(graphicSvgRef.current, activeProject.name, page)
            if (!ok) showToast('Allow popups to open Print/PDF')
            setExportOpen(false)
          }}
          onExportJson={() => {
            exportProjectJson(activeProject)
            setExportOpen(false)
            showToast('Project JSON downloaded')
          }}
          onImportJson={handleImportJson}
        />
      )}

      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        initialType={newProjectType}
        templates={allTemplates}
        onCreateBlank={(opts) => {
          const proj = createProject(opts)
          openProjectInEditor(proj)
          showToast(`Created clean ${opts.type} workspace`)
        }}
        onUseTemplate={handleUseTemplate}
      />

      {activeProject && (
        <PublishModal
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          project={activeProject}
          onExportHtml={() => {
            exportWebsiteHtml(activeProject)
            showToast('Downloaded deployable HTML bundle')
          }}
          onOpenPreview={() => showToast('Use Preview button in toolbar')}
        />
      )}

      <HelpShortcutsModal mode={helpModal || 'help'} open={helpModal !== null} onClose={() => setHelpModal(null)} />

      {toast && (
        <div className="toast-message">
          <CheckCheck size={16} />
          {toast}
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
