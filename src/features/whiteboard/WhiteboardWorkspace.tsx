import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Circle,
  Copy,
  Download,
  Eraser,
  Frame,
  GitBranch,
  Grid2X2,
  Group,
  Hand,
  LayoutTemplate,
  Maximize2,
  MessageSquare,
  MousePointer2,
  Move,
  Pencil,
  Plus,
  Redo2,
  Share2,
  Sparkles,
  Spline,
  Square,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  Ungroup,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type {
  CanvasElement,
  Cursor,
  ElementType,
  GraphicTool,
  Op,
  Page,
  PermissionRole,
  ProjectDocument,
} from '../../types/platform'
import { makeId } from '../../data/templates'
import { BrandLogo, EmptyStateVisual } from '../../components/branding/BrandAssets'

export function WhiteboardWorkspace({
  project,
  onUpdateProject,
  onBackToDashboard,
  onOpenTemplates,
  onOpenShare,
  onOpenExport,
  onSendOp,
  onSendCursor,
  remoteCursors,
  members,
  conn,
  permission,
  userName,
  userColor,
  svgRef,
  onShowToast,
}: {
  project: ProjectDocument
  onUpdateProject: (updater: (p: ProjectDocument) => ProjectDocument) => void
  onBackToDashboard: () => void
  onOpenTemplates: () => void
  onOpenShare: () => void
  onOpenExport: () => void
  onSendOp: (op: Op) => void
  onSendCursor: (cursor: Cursor) => void
  remoteCursors: Record<string, Cursor>
  members: { id: string; name: string; color: string }[]
  conn: string
  permission: PermissionRole
  userName: string
  userColor: string
  svgRef: React.RefObject<SVGSVGElement>
  onShowToast: (msg: string) => void
}) {
  const pages = project.pages
  const activePageId = project.activePageId
  const currentPage = pages.find((p) => p.id === activePageId) || pages[0]
  const boardW = currentPage?.width || 2400
  const boardH = currentPage?.height || 1600

  const [tool, setTool] = useState<GraphicTool>('select')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [zoom, setZoom] = useState(0.75)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [snap, setSnap] = useState(true)
  const [spacePressed, setSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [history, setHistory] = useState<Page[][]>([])
  const [redoHistory, setRedoHistory] = useState<Page[][]>([])

  const interactionRef = useRef<any>(null)
  const penDraftRef = useRef<CanvasElement | null>(null)
  const lastCursorRef = useRef(0)
  const pagesRef = useRef(pages)
  pagesRef.current = pages

  const readOnly = permission !== 'edit'
  const selectedId = selectedIds[0] || null
  const selected = currentPage?.elements.find((e) => e.id === selectedId) || null
  const selectedElements = useMemo(
    () => currentPage?.elements.filter((e) => selectedIds.includes(e.id)) || [],
    [currentPage, selectedIds]
  )

  const applyLocalOp = useCallback(
    (op: Op, recordHistory = true) => {
      if (readOnly && op.kind !== 'upsertComment') {
        onShowToast('Read-only permission')
        return
      }
      if (recordHistory) {
        setHistory((prev) => [...prev.slice(-39), JSON.parse(JSON.stringify(pagesRef.current))])
        setRedoHistory([])
      }
      onUpdateProject((proj) => {
        let nextPages = proj.pages
        if (op.kind === 'upsertElement') {
          nextPages = proj.pages.map((p) =>
            p.id !== op.pageId
              ? p
              : { ...p, elements: [...p.elements.filter((e) => e.id !== op.element.id), op.element] }
          )
        } else if (op.kind === 'deleteElement') {
          nextPages = proj.pages.map((p) =>
            p.id !== op.pageId
              ? p
              : { ...p, elements: p.elements.filter((e) => e.id !== op.elementId) }
          )
        } else if (op.kind === 'upsertPage') {
          nextPages = proj.pages.map((p) => (p.id === op.page.id ? op.page : p))
        }
        return { ...proj, pages: nextPages }
      })
      onSendOp(op)
    },
    [onUpdateProject, onSendOp, readOnly, onShowToast]
  )

  const undo = useCallback(() => {
    if (!history.length) return
    const prev = history[history.length - 1]
    setRedoHistory((r) => [...r, pages])
    setHistory((h) => h.slice(0, -1))
    onUpdateProject((p) => ({ ...p, pages: prev }))
    prev.forEach((pg) => onSendOp({ kind: 'upsertPage', page: pg }))
  }, [history, pages, onUpdateProject, onSendOp])

  const redo = useCallback(() => {
    if (!redoHistory.length) return
    const next = redoHistory[redoHistory.length - 1]
    setHistory((h) => [...h, pages])
    setRedoHistory((r) => r.slice(0, -1))
    onUpdateProject((p) => ({ ...p, pages: next }))
    next.forEach((pg) => onSendOp({ kind: 'upsertPage', page: pg }))
  }, [redoHistory, pages, onUpdateProject, onSendOp])

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return
    selectedIds.forEach((id) =>
      applyLocalOp({ kind: 'deleteElement', pageId: activePageId, elementId: id }, false)
    )
    setSelectedIds([])
  }, [selectedIds, activePageId, applyLocalOp])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return
      const mod = e.metaKey || e.ctrlKey
      if (e.code === 'Space') setSpacePressed(true)
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedIds.length) { e.preventDefault(); deleteSelected() } }
    }
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setSpacePressed(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp) }
  }, [selectedIds, deleteSelected, undo, redo])

  const worldPoint = (e: React.PointerEvent<SVGSVGElement | SVGGElement>) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(svg.getScreenCTM()?.inverse())
    return { x: (local.x - pan.x) / zoom, y: (local.y - pan.y) / zoom }
  }

  const spawnMindMapNode = (x: number, y: number, parent?: CanvasElement) => {
    const node: CanvasElement = {
      id: makeId(),
      type: 'sticky',
      name: parent ? 'Mind Map Branch' : 'Mind Map Topic',
      x: parent ? parent.x + 280 : x,
      y: parent ? parent.y + (Math.random() > 0.5 ? 110 : -110) : y,
      w: 210,
      h: 110,
      rotation: 0,
      fill: parent ? '#D8F878' : '#5267FF',
      stroke: '#171717',
      strokeWidth: 2,
      opacity: 1,
      radius: 12,
      text: parent ? 'New Idea Branch' : 'Central Topic',
      fontSize: 18,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      textAlign: 'center',
      visible: true,
      locked: false,
    }
    applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element: node }, true)
    if (parent) {
      const connEl: CanvasElement = {
        id: makeId(),
        type: 'connector',
        name: 'Branch Connector',
        x: parent.x + parent.w,
        y: parent.y + parent.h / 2,
        w: node.x - (parent.x + parent.w),
        h: node.y + node.h / 2 - (parent.y + parent.h / 2),
        rotation: 0,
        fill: 'none',
        stroke: '#171717',
        strokeWidth: 2.5,
        opacity: 1,
        radius: 0,
        visible: true,
        locked: false,
      }
      applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element: connEl }, false)
    }
    setSelectedIds([node.id])
    setTool('select')
  }

  const addBoardElement = (type: ElementType, x = 800, y = 480) => {
    const base: CanvasElement = {
      id: makeId(),
      type,
      name: type === 'sticky' ? 'Sticky Note' : type[0].toUpperCase() + type.slice(1),
      x,
      y,
      w: type === 'sticky' ? 220 : type === 'frame' ? 560 : type === 'connector' || type === 'arrow' ? 180 : 180,
      h: type === 'sticky' ? 170 : type === 'frame' ? 400 : type === 'connector' ? 80 : type === 'arrow' ? 20 : 130,
      rotation: 0,
      fill: type === 'sticky' ? '#D8F878' : type === 'comment' ? '#FF987C' : type === 'frame' ? '#FFFEFA' : type === 'circle' ? '#F4C95D' : '#FFFFFF',
      stroke: '#171717',
      strokeWidth: type === 'text' ? 0 : 2,
      opacity: 1,
      radius: type === 'sticky' ? 6 : 10,
      text: type === 'sticky' ? 'Sticky idea...' : type === 'text' ? 'Board Label' : type === 'comment' ? 'Comment...' : undefined,
      fontSize: type === 'text' ? 28 : 18,
      fontFamily: 'DM Sans',
      fontWeight: 600,
      textAlign: 'left',
      visible: true,
      locked: false,
    }
    applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element: base }, true)
    setSelectedIds([base.id])
    setTool('select')
  }

  const groupSelected = () => {
    if (selectedElements.length < 2) {
      onShowToast('Select 2+ items to group into a Frame')
      return
    }
    const minX = Math.min(...selectedElements.map((e) => e.x)) - 24
    const minY = Math.min(...selectedElements.map((e) => e.y)) - 24
    const maxX = Math.max(...selectedElements.map((e) => e.x + e.w)) + 24
    const maxY = Math.max(...selectedElements.map((e) => e.y + e.h)) + 24
    const frame: CanvasElement = {
      id: makeId(),
      type: 'frame',
      name: 'Board Section Frame',
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
      rotation: 0,
      fill: '#FFFEFA',
      stroke: '#171717',
      strokeWidth: 2,
      opacity: 1,
      radius: 12,
      visible: true,
      locked: false,
    }
    applyLocalOp({ kind: 'upsertPage', page: { ...currentPage, elements: [frame, ...currentPage.elements] } }, true)
    setSelectedIds([frame.id])
  }

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = worldPoint(e)
    if (tool === 'hand' || spacePressed || e.button === 1 || (e.button === 0 && e.altKey)) {
      interactionRef.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }
      setIsPanning(true)
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    if (e.button !== 0 || readOnly) return
    if (tool === 'mindmap') { spawnMindMapNode(pt.x, pt.y); return }
    if (tool === 'pen') {
      const draft: CanvasElement = {
        id: makeId(),
        type: 'pen',
        name: 'Sketch',
        x: pt.x,
        y: pt.y,
        w: 1,
        h: 1,
        rotation: 0,
        fill: 'none',
        stroke: '#171717',
        strokeWidth: 3.5,
        opacity: 1,
        radius: 0,
        points: [pt],
        visible: true,
        locked: false,
      }
      penDraftRef.current = draft
      interactionRef.current = { kind: 'pen', id: draft.id }
      applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element: draft }, true)
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    if (['sticky', 'text', 'rect', 'circle', 'connector', 'arrow', 'comment', 'frame'].includes(tool)) {
      addBoardElement(tool as ElementType, pt.x, pt.y)
      return
    }
    setSelectedIds([])
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = worldPoint(e)
    const now = Date.now()
    if (now - lastCursorRef.current > 45) {
      lastCursorRef.current = now
      onSendCursor({
        id: sessionStorage.getItem('canvas-studio-client-id') || 'local',
        name: userName,
        color: userColor,
        x: pt.x,
        y: pt.y,
        pageId: activePageId,
        selectedId,
        updatedAt: now,
      })
    }
    const inter = interactionRef.current
    if (!inter) return
    if (inter.kind === 'pan') {
      setPan({ x: inter.px + (e.clientX - inter.sx), y: inter.py + (e.clientY - inter.sy) })
      return
    }
    if (inter.kind === 'pen' && penDraftRef.current) {
      const draft = { ...penDraftRef.current, points: [...(penDraftRef.current.points || []), pt] }
      penDraftRef.current = draft
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) => p.id === activePageId ? { ...p, elements: p.elements.map((el) => el.id === draft.id ? draft : el) } : p),
      }))
      return
    }
    if (inter.kind === 'move') {
      const dx = pt.x - inter.start.x
      const dy = pt.y - inter.start.y
      const snappedX = snap ? Math.round((inter.primary.x + dx) / 24) * 24 : inter.primary.x + dx
      const snappedY = snap ? Math.round((inter.primary.y + dy) / 24) * 24 : inter.primary.y + dy
      const offX = snappedX - inter.primary.x
      const offY = snappedY - inter.primary.y
      const updated = inter.elements.map((orig: CanvasElement) => ({
        ...orig,
        x: orig.x + offX,
        y: orig.y + offY,
        points: orig.points?.map((p) => ({ x: p.x + offX, y: p.y + offY })),
      }))
      const map = new Map(updated.map((el: CanvasElement) => [el.id, el]))
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) => p.id !== activePageId ? p : { ...p, elements: p.elements.map((el) => (map.get(el.id) as CanvasElement) || el) }),
      }))
      inter.latestElements = updated
    }
  }

  const onPointerUp = () => {
    const inter = interactionRef.current
    setIsPanning(false)
    if (inter?.kind === 'move' && inter.latestElements) {
      setHistory((prev) => [...prev.slice(-39), inter.before])
      inter.latestElements.forEach((el: CanvasElement) => onSendOp({ kind: 'upsertElement', pageId: activePageId, element: el }))
    }
    if (inter?.kind === 'pen' && penDraftRef.current) {
      const pts = penDraftRef.current.points || []
      if (pts.length > 1) {
        const xs = pts.map((p) => p.x)
        const ys = pts.map((p) => p.y)
        applyLocalOp({
          kind: 'upsertElement',
          pageId: activePageId,
          element: { ...penDraftRef.current, x: Math.min(...xs), y: Math.min(...ys), w: Math.max(16, Math.max(...xs) - Math.min(...xs)), h: Math.max(16, Math.max(...ys) - Math.min(...ys)) },
        }, false)
      }
      penDraftRef.current = null
    }
    interactionRef.current = null
  }

  const boardElements = currentPage?.elements || []

  return (
    <div className="app-shell">
      {/* Whiteboard Topbar */}
      <header className="topbar">
        <button className="icon-button" onClick={onBackToDashboard} title="Back to Dashboard">
          <ArrowLeft size={18} />
        </button>
        <BrandLogo variant="compact" height={32} />
        <div className="top-divider" />
        <div className="project-meta">
          <input
            className="project-title"
            value={project.name}
            onChange={(e) => onUpdateProject((p) => ({ ...p, name: e.target.value }))}
            aria-label="Board title"
          />
          <div className="save-state">
            <span className="save-dot is-saved" /> Infinite Whiteboard · {permission.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          <button className="icon-button small" onClick={undo} disabled={!history.length} title="Undo"><Undo2 size={15} /></button>
          <button className="icon-button small" onClick={redo} disabled={!redoHistory.length} title="Redo"><Redo2 size={15} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="icon-button small" onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}><ZoomOut size={14} /></button>
          <button className="zoom-value" style={{ width: 42, fontFamily: 'DM Mono', fontSize: 10 }} onClick={() => { setZoom(0.75); setPan({ x: 0, y: 0 }) }}>{Math.round(zoom * 100)}%</button>
          <button className="icon-button small" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}><ZoomIn size={14} /></button>
          <button className="icon-button small" onClick={() => { setZoom(0.75); setPan({ x: 0, y: 0 }) }} title="Reset View"><Maximize2 size={14} /></button>
        </div>

        <div className="mode-switch" style={{ height: 34 }}>
          <button className={showGrid ? 'mode-active' : ''} onClick={() => setShowGrid(!showGrid)}><Grid2X2 size={13} /> Grid</button>
          <button className={snap ? 'mode-active' : ''} onClick={() => setSnap(!snap)}><Move size={13} /> Snap</button>
        </div>

        <div className="top-spacer" />

        <button className="secondary-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenTemplates}>
          <LayoutTemplate size={14} /> Templates
        </button>
        <div className="presence-stack" title={`${Math.max(1, members.length)} collaborators`}>
          <span className="avatar avatar-you">{userName.slice(0, 1).toUpperCase()}</span>
          {members.slice(0, 3).map((m) => (
            <span key={m.id} className="avatar" style={{ background: m.color }}>{m.name.slice(0, 1).toUpperCase()}</span>
          ))}
        </div>
        <div className={`connection-pill ${conn}`}><span /> {conn === 'connected' ? 'Live' : 'Local'}</div>
        <button className="share-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenShare}><Share2 size={14} /> Share</button>
        <button className="export-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenExport}><Download size={14} /> Export</button>
      </header>

      {/* Infinite Board Canvas */}
      <div className="canvas-stage whiteboard-stage" style={{ flex: 1, position: 'relative' }}>
        {/* Dedicated Whiteboard Floating Toolbar (11 tools) */}
        <div className="wb-board-dock">
          {[
            { id: 'select' as GraphicTool, icon: MousePointer2, label: 'Select' },
            { id: 'hand' as GraphicTool, icon: Hand, label: 'Pan' },
            { id: 'sticky' as GraphicTool, icon: StickyNote, label: 'Sticky Note' },
            { id: 'text' as GraphicTool, icon: Type, label: 'Text' },
            { id: 'pen' as GraphicTool, icon: Pencil, label: 'Freehand' },
            { id: 'rect' as GraphicTool, icon: Square, label: 'Shape' },
            { id: 'circle' as GraphicTool, icon: Circle, label: 'Circle' },
            { id: 'connector' as GraphicTool, icon: Spline, label: 'Connector' },
            { id: 'arrow' as GraphicTool, icon: ArrowUpRight, label: 'Arrow' },
            { id: 'comment' as GraphicTool, icon: MessageSquare, label: 'Comment' },
            { id: 'frame' as GraphicTool, icon: Frame, label: 'Frame' },
            { id: 'mindmap' as GraphicTool, icon: GitBranch, label: 'Mind Map' },
          ].map((t) => (
            <button
              key={t.label}
              className={tool === t.id ? 'rail-active' : ''}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <t.icon size={16} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Sticky / Node Contextual Quick Bar */}
        {selected && (
          <div className="wb-selection-popover">
            {['#D8F878', '#FF987C', '#F4C95D', '#8BB8FF', '#FFFEFA'].map((col) => (
              <button
                key={col}
                style={{ width: 20, height: 20, borderRadius: 4, background: col, border: '1.5px solid #171717' }}
                onClick={() => applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element: { ...selected, fill: col } }, true)}
                title="Change note color"
              />
            ))}
            {selected.text !== undefined && (
              <input
                className="wb-quick-text-input"
                value={selected.text}
                onChange={(e) => applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element: { ...selected, text: e.target.value } }, false)}
                placeholder="Edit text..."
              />
            )}
            <button className="secondary-button" style={{ height: 28, padding: '0 8px', fontSize: 10 }} onClick={() => spawnMindMapNode(selected.x, selected.y, selected)}>
              <GitBranch size={12} /> + Branch
            </button>
            {selectedElements.length >= 2 && (
              <button className="secondary-button" style={{ height: 28, padding: '0 8px', fontSize: 10 }} onClick={groupSelected}>
                <Group size={12} /> Group
              </button>
            )}
            <button className="icon-button small danger-hover" onClick={deleteSelected} title="Delete"><Trash2 size={14} /></button>
          </div>
        )}

        <svg
          ref={svgRef}
          className="canvas-svg"
          style={{ cursor: isPanning ? 'grabbing' : spacePressed || tool === 'hand' ? 'grab' : tool === 'select' ? 'default' : 'crosshair' }}
          viewBox={`0 0 ${boardW} ${boardH}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault()
              setZoom((z) => Math.max(0.25, Math.min(2, z + (e.deltaY < 0 ? 0.04 : -0.04))))
            } else {
              setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
            }
          }}
        >
          <defs>
            <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" fill="#B9B5AB" opacity="0.7" />
            </pattern>
            <marker id="arrow-head" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#171717" />
            </marker>
          </defs>
          <rect width={boardW} height={boardH} fill="#F7F5EF" />
          {showGrid && <rect width={boardW} height={boardH} fill="url(#dot-grid)" pointerEvents="none" />}

          <g className="world-group" transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {boardElements.map((el) => (
              <g
                key={el.id}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  if (e.shiftKey) setSelectedIds((p) => p.includes(el.id) ? p.filter((x) => x !== el.id) : [...p, el.id])
                  else if (!selectedIds.includes(el.id)) setSelectedIds([el.id])
                  if (el.locked || readOnly) return
                  const pt = worldPoint(e)
                  const toMove = selectedIds.includes(el.id) && selectedElements.length > 1 ? selectedElements : [el]
                  interactionRef.current = { kind: 'move', primary: el, elements: toMove, start: pt, before: pages }
                  ;(e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId)
                }}
                style={{ cursor: 'move' }}
              >
                {el.type === 'frame' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.radius} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                {el.type === 'rect' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.radius} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                {el.type === 'circle' && <ellipse cx={el.x + el.w / 2} cy={el.y + el.h / 2} rx={el.w / 2} ry={el.h / 2} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                {(el.type === 'sticky' || el.type === 'comment' || el.type === 'text') && (
                  <>
                    {(el.type === 'sticky' || el.type === 'comment') && (
                      <>
                        <rect x={el.x + 4} y={el.y + 6} width={el.w} height={el.h} rx={el.radius} fill="#171717" opacity="0.14" />
                        <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.radius} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />
                      </>
                    )}
                    <text
                      x={el.x + (el.type === 'text' ? 0 : el.textAlign === 'center' ? el.w / 2 : 16)}
                      y={el.y + (el.type === 'text' ? el.fontSize || 28 : 34)}
                      fill={el.fill === '#5267FF' ? '#FFFEFA' : '#171717'}
                      fontSize={el.fontSize || 18}
                      fontFamily={el.fontFamily || 'DM Sans'}
                      fontWeight={el.fontWeight || 600}
                      textAnchor={el.textAlign === 'center' ? 'middle' : 'start'}
                    >
                      {(el.text || '').split('\n').map((line, i) => (
                        <tspan key={i} x={el.x + (el.type === 'text' ? 0 : el.textAlign === 'center' ? el.w / 2 : 16)} dy={i === 0 ? 0 : (el.fontSize || 18) * 1.22}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </>
                )}
                {el.type === 'arrow' && (
                  <line x1={el.x} y1={el.y + el.h / 2} x2={el.x + el.w} y2={el.y + el.h / 2} stroke={el.stroke} strokeWidth={el.strokeWidth} markerEnd="url(#arrow-head)" />
                )}
                {el.type === 'connector' && (
                  <path d={`M ${el.x} ${el.y} C ${el.x + el.w / 2} ${el.y}, ${el.x + el.w / 2} ${el.y + el.h}, ${el.x + el.w} ${el.y + el.h}`} fill="none" stroke={el.stroke} strokeWidth={el.strokeWidth} markerEnd="url(#arrow-head)" />
                )}
                {el.type === 'pen' && <polyline points={(el.points || []).map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" />}
                {selectedIds.includes(el.id) && (
                  <rect x={el.x - 4} y={el.y - 4} width={el.w + 8} height={el.h + 8} fill="none" stroke="#5267FF" strokeWidth="2.5" strokeDasharray="6 3" pointerEvents="none" />
                )}
              </g>
            ))}

            {Object.values(remoteCursors)
              .filter((c) => c.pageId === activePageId)
              .map((cursor) => (
                <g key={cursor.id} className="remote-cursor" transform={`translate(${cursor.x} ${cursor.y})`} pointerEvents="none">
                  <path d="M0 0 L0 18 L5 13 L10 23 L14 21 L9 11 L17 10 Z" fill={cursor.color} stroke="#FFFFFF" strokeWidth="1.5" />
                  <rect x="13" y="18" width={Math.max(60, cursor.name.length * 7 + 18)} height="22" rx="5" fill={cursor.color} />
                  <text x="21" y="33" fill="#FFFFFF" fontSize="12" fontFamily="DM Sans" fontWeight="700">{cursor.name}</text>
                </g>
              ))}
          </g>
        </svg>

        {boardElements.length === 0 && (
          <div className="clean-canvas-floating-banner">
            <EmptyStateVisual variant="empty-whiteboard" maxWidth={78} alt="Clean infinite whiteboard" />
            <span>Clean Whiteboard — Click a tool below or open a Whiteboard Template</span>
            <button className="primary-button" style={{ height: 32, fontSize: 11 }} onClick={onOpenTemplates}>
              <LayoutTemplate size={14} /> Browse Whiteboard Templates
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
