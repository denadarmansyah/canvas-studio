import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Bold,
  BringToFront,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Circle,
  CircleHelp,
  Component,
  Copy,
  Crop,
  Eraser,
  Eye,
  EyeOff,
  FileText,
  FlipHorizontal2,
  FlipVertical2,
  Frame,
  Grid2X2,
  Group,
  Hand,
  Hash,
  Hexagon,
  Image as ImageIcon,
  Italic,
  Layers,
  LayoutTemplate,
  Lock,
  Maximize2,
  MessageSquare,
  Minus,
  MousePointer,
  MousePointer2,
  Move,
  Paintbrush,
  Palette,
  Pencil,
  PenTool,
  Pipette,
  Plus,
  Redo2,
  RotateCcw,
  Ruler,
  Scissors,
  Search,
  Send,
  Shapes,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo2,
  Ungroup,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react'
import type {
  AssetItem,
  BezierNode,
  BrandKit,
  CanvasElement,
  CommentItem,
  Cursor,
  ElementType,
  GraphicTool,
  MaskShape,
  Op,
  Page,
  PermissionRole,
  ProjectDocument,
  TemplateDefinition,
  UnitType,
} from '../../types/platform'
import {
  COLOR_SWATCHES,
  DEFAULT_IMAGE_FILTERS,
  DOCUMENT_PRESETS,
  FONT_FAMILIES,
} from '../../data/presets'
import { makeId } from '../../data/templates'
import { BrandLogo, EmptyStateVisual } from '../../components/branding/BrandAssets'

function buildPolygonPoints(x: number, y: number, w: number, h: number, sides: number): string {
  const cx = x + w / 2
  const cy = y + h / 2
  const rx = w / 2
  const ry = h / 2
  const pts: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
    pts.push(`${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

function buildStarPoints(x: number, y: number, w: number, h: number, pointsCount: number): string {
  const cx = x + w / 2
  const cy = y + h / 2
  const outerRx = w / 2
  const outerRy = h / 2
  const innerRx = outerRx * 0.44
  const innerRy = outerRy * 0.44
  const pts: string[] = []
  for (let i = 0; i < pointsCount * 2; i++) {
    const angle = (Math.PI * i) / pointsCount - Math.PI / 2
    const rx = i % 2 === 0 ? outerRx : innerRx
    const ry = i % 2 === 0 ? outerRy : innerRy
    pts.push(`${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

function bezierNodesToPath(nodes: BezierNode[]): string {
  if (!nodes.length) return ''
  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]
    const curr = nodes[i]
    const c1x = prev.cp2x ?? prev.x
    const c1y = prev.cp2y ?? prev.y
    const c2x = curr.cp1x ?? curr.x
    const c2y = curr.cp1y ?? curr.y
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${curr.x} ${curr.y}`
  }
  return d
}

export function GraphicStudio({
  project,
  brandKit,
  assets,
  templates,
  onAddAsset,
  onUpdateProject,
  onBackToDashboard,
  onOpenTemplates,
  onApplyTemplate,
  onOpenShare,
  onOpenExport,
  onOpenHelp,
  onOpenShortcuts,
  onSendOp,
  onSendCursor,
  onSendComment,
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
  brandKit: BrandKit
  assets: AssetItem[]
  templates: TemplateDefinition[]
  onAddAsset: (item: Omit<AssetItem, 'id' | 'createdAt'>) => void
  onUpdateProject: (updater: (p: ProjectDocument) => ProjectDocument) => void
  onBackToDashboard: () => void
  onOpenTemplates: () => void
  onApplyTemplate: (tpl: TemplateDefinition) => void
  onOpenShare: () => void
  onOpenExport: () => void
  onOpenHelp: () => void
  onOpenShortcuts: () => void
  onSendOp: (op: Op) => void
  onSendCursor: (cursor: Cursor) => void
  onSendComment: (c: CommentItem) => void
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
  const docW = currentPage?.width || 1600
  const docH = currentPage?.height || 1100

  const [tool, setTool] = useState<GraphicTool>('select')
  const [shapeKind, setShapeKind] = useState<'rect' | 'rounded-rect' | 'circle' | 'triangle' | 'polygon' | 'star'>('rect')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [leftTab, setLeftTab] = useState<
    'layers' | 'pages' | 'assets' | 'uploads' | 'components' | 'templates' | 'brandkit'
  >('layers')
  const [rightTab, setRightTab] = useState<'inspector' | 'comments'>('inspector')
  const [zoom, setZoom] = useState(0.68)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [snap, setSnap] = useState(true)
  const [layerSearch, setLayerSearch] = useState('')
  const [history, setHistory] = useState<Page[][]>([])
  const [redoHistory, setRedoHistory] = useState<Page[][]>([])
  const [spacePressed, setSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [bezierDraftId, setBezierDraftId] = useState<string | null>(null)
  const [sampledColor, setSampledColor] = useState('#5267FF')
  const [savedComponents, setSavedComponents] = useState<CanvasElement[]>([])
  const [savedIndicator, setSavedIndicator] = useState(true)

  const interactionRef = useRef<any>(null)
  const penDraftRef = useRef<CanvasElement | null>(null)
  const clipboardRef = useRef<CanvasElement[]>([])
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
        onShowToast('Read-only role: editing disabled')
        return
      }
      if (recordHistory) {
        setHistory((prev) => [
          ...prev.slice(-39),
          pagesRef.current.map((p) => ({
            ...p,
            elements: p.elements.map((e) => ({
              ...e,
              points: e.points?.map((pt) => ({ ...pt })),
              bezierNodes: e.bezierNodes?.map((b) => ({ ...b })),
            })),
          })),
        ])
        setRedoHistory([])
      }
      setSavedIndicator(false)
      onUpdateProject((proj) => {
        let nextPages = proj.pages
        let nextActiveId = proj.activePageId
        switch (op.kind) {
          case 'upsertElement':
            nextPages = proj.pages.map((p) =>
              p.id !== op.pageId
                ? p
                : { ...p, elements: [...p.elements.filter((e) => e.id !== op.element.id), op.element] }
            )
            break
          case 'deleteElement':
            nextPages = proj.pages.map((p) =>
              p.id !== op.pageId
                ? p
                : { ...p, elements: p.elements.filter((e) => e.id !== op.elementId) }
            )
            break
          case 'upsertPage':
            nextPages = proj.pages.some((p) => p.id === op.page.id)
              ? proj.pages.map((p) => (p.id === op.page.id ? op.page : p))
              : [...proj.pages, op.page]
            break
          case 'deletePage':
            nextPages = proj.pages.filter((p) => p.id !== op.pageId)
            if (nextActiveId === op.pageId && nextPages.length) nextActiveId = nextPages[0].id
            break
          case 'renamePage':
            nextPages = proj.pages.map((p) => (p.id === op.pageId ? { ...p, name: op.name } : p))
            break
          case 'setBackground':
            nextPages = proj.pages.map((p) =>
              p.id === op.pageId ? { ...p, background: op.background } : p
            )
            break
          default:
            break
        }
        return { ...proj, pages: nextPages, activePageId: nextActiveId }
      })
      onSendOp(op)
      window.setTimeout(() => setSavedIndicator(true), 450)
    },
    [onUpdateProject, onSendOp, readOnly, onShowToast]
  )

  const updateElement = useCallback(
    (element: CanvasElement, recordHistory = true) =>
      applyLocalOp({ kind: 'upsertElement', pageId: activePageId, element }, recordHistory),
    [applyLocalOp, activePageId]
  )

  const updateSelected = (patch: Partial<CanvasElement>) => {
    if (!selected) return
    updateElement({ ...selected, ...patch }, true)
  }

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return
    selectedIds.forEach((id) =>
      applyLocalOp({ kind: 'deleteElement', pageId: activePageId, elementId: id }, false)
    )
    setSelectedIds([])
    onShowToast('Deleted selection')
  }, [selectedIds, activePageId, applyLocalOp, onShowToast])

  const copySelected = useCallback(() => {
    if (!selectedElements.length) return
    clipboardRef.current = selectedElements
    onShowToast(`Copied ${selectedElements.length} layer(s)`)
  }, [selectedElements, onShowToast])

  const cutSelected = useCallback(() => {
    if (!selectedElements.length) return
    clipboardRef.current = selectedElements
    deleteSelected()
    onShowToast(`Cut ${selectedElements.length} layer(s)`)
  }, [selectedElements, deleteSelected, onShowToast])

  const pasteClipboard = useCallback(() => {
    if (!clipboardRef.current.length) return
    const pasted = clipboardRef.current.map((el) => ({
      ...el,
      id: makeId(),
      name: `${el.name} copy`,
      x: el.x + 24,
      y: el.y + 24,
      points: el.points?.map((p) => ({ x: p.x + 24, y: p.y + 24 })),
    }))
    pasted.forEach((item) => updateElement(item, false))
    setSelectedIds(pasted.map((p) => p.id))
    clipboardRef.current = pasted
    onShowToast(`Pasted ${pasted.length} layer(s)`)
  }, [updateElement, onShowToast])

  const duplicateSelected = useCallback(() => {
    if (!selectedElements.length) return
    const cloned = selectedElements.map((el) => ({
      ...el,
      id: makeId(),
      name: `${el.name} copy`,
      x: el.x + 28,
      y: el.y + 28,
      points: el.points?.map((p) => ({ ...p, x: p.x + 28, y: p.y + 28 })),
    }))
    cloned.forEach((c) => updateElement(c, false))
    setSelectedIds(cloned.map((c) => c.id))
    onShowToast(`Duplicated ${cloned.length} layer(s)`)
  }, [selectedElements, updateElement, onShowToast])

  const groupSelected = useCallback(() => {
    if (selectedElements.length < 2) {
      onShowToast('Select 2+ layers to group')
      return
    }
    const minX = Math.min(...selectedElements.map((e) => e.x)) - 20
    const minY = Math.min(...selectedElements.map((e) => e.y)) - 20
    const maxX = Math.max(...selectedElements.map((e) => e.x + e.w)) + 20
    const maxY = Math.max(...selectedElements.map((e) => e.y + e.h)) + 20
    const gid = `grp-${makeId()}`
    const frame: CanvasElement = {
      id: makeId(),
      type: 'frame',
      name: 'Group Frame',
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
      rotation: 0,
      fill: '#FFFDF7',
      stroke: '#171717',
      strokeWidth: 1.5,
      opacity: 1,
      radius: 8,
      visible: true,
      locked: false,
      groupId: gid,
    }
    const idx = Math.max(0, currentPage.elements.findIndex((e) => selectedIds.includes(e.id)))
    const updated = currentPage.elements.map((e) =>
      selectedIds.includes(e.id) ? { ...e, groupId: gid } : e
    )
    updated.splice(idx, 0, frame)
    applyLocalOp({ kind: 'upsertPage', page: { ...currentPage, elements: updated } }, true)
    setSelectedIds([frame.id])
    onShowToast('Grouped layers')
  }, [selectedElements, selectedIds, currentPage, applyLocalOp, onShowToast])

  const ungroupSelected = useCallback(() => {
    if (!selected || selected.type !== 'frame') return
    applyLocalOp({ kind: 'deleteElement', pageId: activePageId, elementId: selected.id }, true)
    setSelectedIds([])
    onShowToast('Ungrouped')
  }, [selected, activePageId, applyLocalOp, onShowToast])

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return
      const mod = e.metaKey || e.ctrlKey
      if (e.code === 'Space') setSpacePressed(true)
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return }
      if (mod && e.key.toLowerCase() === 'x') { e.preventDefault(); cutSelected(); return }
      if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); copySelected(); return }
      if (mod && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteClipboard(); return }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return }
      if (mod && e.key.toLowerCase() === 'g') { e.preventDefault(); e.shiftKey ? ungroupSelected() : groupSelected(); return }
      if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); setSelectedIds(currentPage.elements.map((el) => el.id)); return }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedIds.length) { e.preventDefault(); deleteSelected() } return }
      if (e.key === 'Escape' || e.key === 'Enter') {
        if (bezierDraftId) { setBezierDraftId(null); setTool('select'); return }
        if (e.key === 'Escape') { setSelectedIds([]); setTool('select') }
        return
      }
      const keyMap: Record<string, GraphicTool> = {
        v: 'select', a: 'direct-select', h: 'hand', t: 'text', r: 'rect', o: 'circle',
        l: 'line', p: 'pencil', b: 'bezier', i: 'eyedropper', c: 'crop',
      }
      if (keyMap[e.key.toLowerCase()]) setTool(keyMap[e.key.toLowerCase()])
      if (e.key === '?') onOpenShortcuts()
    }
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setSpacePressed(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp) }
  }, [selectedIds, bezierDraftId, cutSelected, copySelected, pasteClipboard, duplicateSelected, deleteSelected, groupSelected, ungroupSelected, undo, redo, currentPage, onOpenShortcuts])

  const worldPoint = (e: React.PointerEvent<SVGSVGElement | SVGGElement>) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(svg.getScreenCTM()?.inverse())
    return { x: (local.x - pan.x) / zoom, y: (local.y - pan.y) / zoom }
  }

  const addElement = (type: ElementType, x = docW / 2 - 120, y = docH / 2 - 90) => {
    const base: CanvasElement = {
      id: makeId(),
      type,
      name: type[0].toUpperCase() + type.slice(1),
      x,
      y,
      w: type === 'text' ? 360 : type === 'frame' ? 680 : 180,
      h: type === 'text' ? 96 : type === 'frame' ? 460 : 140,
      rotation: 0,
      fill:
        type === 'triangle' || type === 'star'
          ? '#F4C95D'
          : type === 'polygon'
            ? '#B8E0D2'
            : type === 'text'
              ? '#171717'
              : type === 'comment'
                ? '#FF987C'
                : type === 'line' || type === 'arrow' || type === 'pen' || type === 'bezier'
                  ? 'none'
                  : '#FFFFFF',
      stroke: '#171717',
      strokeWidth: type === 'text' ? 0 : 2,
      opacity: 1,
      radius: tool === 'rounded-rect' ? 24 : 8,
      text: type === 'text' ? 'Headline Text' : type === 'comment' ? 'Design note...' : undefined,
      fontSize: type === 'text' ? 44 : 15,
      fontFamily: 'Space Grotesk',
      fontWeight: 600,
      textAlign: 'left',
      sides: 6,
      starPoints: 5,
      visible: true,
      locked: false,
    }
    if (type === 'circle') { base.w = 150; base.h = 150; base.fill = '#D8F878' }
    if (type === 'line' || type === 'arrow') { base.w = 180; base.h = 0; base.strokeWidth = 3 }
    if (type === 'image') {
      base.w = 280
      base.h = 200
      base.filters = { ...DEFAULT_IMAGE_FILTERS }
      base.crop = { x: 0, y: 0, w: 100, h: 100 }
    }
    updateElement(base, true)
    setSelectedIds([base.id])
    setTool('select')
    return base
  }

  const onCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = worldPoint(e)
    if (tool === 'hand' || spacePressed || e.button === 1 || (e.button === 0 && e.altKey)) {
      interactionRef.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }
      setIsPanning(true)
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    if (e.button !== 0 || readOnly) return

    if (tool === 'eyedropper') {
      const col = currentPage?.background || '#F4F1E9'
      setSampledColor(col)
      if (selected) updateSelected({ fill: col })
      onShowToast(`Sampled canvas color: ${col}`)
      setTool('select')
      return
    }

    if (tool === 'bezier' || tool === 'pen') {
      if (!bezierDraftId) {
        const draft: CanvasElement = {
          id: makeId(),
          type: 'bezier',
          name: 'Vector Path',
          x: pt.x,
          y: pt.y,
          w: 20,
          h: 20,
          rotation: 0,
          fill: 'none',
          stroke: '#5267FF',
          strokeWidth: 3,
          opacity: 1,
          radius: 0,
          bezierNodes: [{ x: pt.x, y: pt.y, cp1x: pt.x - 30, cp1y: pt.y, cp2x: pt.x + 30, cp2y: pt.y }],
          visible: true,
          locked: false,
        }
        updateElement(draft, true)
        setBezierDraftId(draft.id)
        setSelectedIds([draft.id])
      } else {
        const activeDraft = currentPage.elements.find((el) => el.id === bezierDraftId)
        if (activeDraft) {
          const nodes = [...(activeDraft.bezierNodes || [])]
          nodes.push({ x: pt.x, y: pt.y, cp1x: pt.x - 35, cp1y: pt.y - 20, cp2x: pt.x + 35, cp2y: pt.y + 20 })
          const xs = nodes.map((n) => n.x)
          const ys = nodes.map((n) => n.y)
          updateElement(
            {
              ...activeDraft,
              x: Math.min(...xs),
              y: Math.min(...ys),
              w: Math.max(20, Math.max(...xs) - Math.min(...xs)),
              h: Math.max(20, Math.max(...ys) - Math.min(...ys)),
              bezierNodes: nodes,
            },
            false
          )
        }
      }
      return
    }

    if (tool === 'pencil' || tool === 'brush') {
      const draft: CanvasElement = {
        id: makeId(),
        type: 'pen',
        name: tool === 'brush' ? 'Brush Stroke' : 'Pencil Path',
        x: pt.x,
        y: pt.y,
        w: 1,
        h: 1,
        rotation: 0,
        fill: 'none',
        stroke: '#171717',
        strokeWidth: tool === 'brush' ? 12 : 2.5,
        opacity: tool === 'brush' ? 0.85 : 1,
        radius: 0,
        points: [pt],
        visible: true,
        locked: false,
      }
      penDraftRef.current = draft
      interactionRef.current = { kind: 'pen', id: draft.id }
      updateElement(draft, true)
      setSelectedIds([draft.id])
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }

    if (['text', 'rect', 'rounded-rect', 'circle', 'triangle', 'polygon', 'star', 'frame', 'comment', 'line', 'arrow'].includes(tool)) {
      const elType: ElementType = tool === 'rounded-rect' ? 'rect' : (tool as ElementType)
      addElement(elType, pt.x, pt.y)
      return
    }

    setSelectedIds([])
  }

  const onCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
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

    const interaction = interactionRef.current
    if (!interaction) return

    if (interaction.kind === 'pan') {
      setPan({ x: interaction.px + (e.clientX - interaction.sx), y: interaction.py + (e.clientY - interaction.sy) })
      return
    }
    if (interaction.kind === 'pen' && penDraftRef.current) {
      const draft = { ...penDraftRef.current, points: [...(penDraftRef.current.points || []), pt] }
      penDraftRef.current = draft
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) =>
          p.id === activePageId
            ? { ...p, elements: p.elements.map((el) => (el.id === draft.id ? draft : el)) }
            : p
        ),
      }))
      return
    }
    if (interaction.kind === 'node-drag') {
      const el: CanvasElement = interaction.element
      const nodes = [...(el.bezierNodes || [])]
      const targetNode = { ...nodes[interaction.nodeIdx] }
      if (interaction.handleType === 'anchor') {
        const dx = pt.x - targetNode.x
        const dy = pt.y - targetNode.y
        targetNode.x = pt.x
        targetNode.y = pt.y
        if (targetNode.cp1x !== undefined) targetNode.cp1x += dx
        if (targetNode.cp1y !== undefined) targetNode.cp1y += dy
        if (targetNode.cp2x !== undefined) targetNode.cp2x += dx
        if (targetNode.cp2y !== undefined) targetNode.cp2y += dy
      } else if (interaction.handleType === 'cp1') {
        targetNode.cp1x = pt.x
        targetNode.cp1y = pt.y
      } else if (interaction.handleType === 'cp2') {
        targetNode.cp2x = pt.x
        targetNode.cp2y = pt.y
      }
      nodes[interaction.nodeIdx] = targetNode
      const xs = nodes.map((n) => n.x)
      const ys = nodes.map((n) => n.y)
      const nextEl: CanvasElement = {
        ...el,
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(20, Math.max(...xs) - Math.min(...xs)),
        h: Math.max(20, Math.max(...ys) - Math.min(...ys)),
        bezierNodes: nodes,
      }
      interaction.latest = nextEl
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) =>
          p.id === activePageId ? { ...p, elements: p.elements.map((item) => (item.id === nextEl.id ? nextEl : item)) } : p
        ),
      }))
      return
    }
    if (interaction.kind === 'move') {
      const dx = pt.x - interaction.start.x
      const dy = pt.y - interaction.start.y
      const primary = interaction.primary
      const snappedX = snap ? Math.round((primary.x + dx) / 24) * 24 : primary.x + dx
      const snappedY = snap ? Math.round((primary.y + dy) / 24) * 24 : primary.y + dy
      const offX = snappedX - primary.x
      const offY = snappedY - primary.y
      const updatedElements = interaction.elements.map((orig: CanvasElement) => ({
        ...orig,
        x: orig.x + offX,
        y: orig.y + offY,
        points: orig.points?.map((p) => ({ x: p.x + offX, y: p.y + offY })),
        bezierNodes: orig.bezierNodes?.map((b) => ({
          x: b.x + offX,
          y: b.y + offY,
          cp1x: b.cp1x !== undefined ? b.cp1x + offX : undefined,
          cp1y: b.cp1y !== undefined ? b.cp1y + offY : undefined,
          cp2x: b.cp2x !== undefined ? b.cp2x + offX : undefined,
          cp2y: b.cp2y !== undefined ? b.cp2y + offY : undefined,
        })),
      }))
      const idMap = new Map(updatedElements.map((el: CanvasElement) => [el.id, el]))
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) =>
          p.id !== activePageId ? p : { ...p, elements: p.elements.map((el) => (idMap.get(el.id) as CanvasElement) || el) }
        ),
      }))
      interaction.latestElements = updatedElements
      if (Date.now() - (interaction.lastSent || 0) > 90) {
        updatedElements.forEach((el: CanvasElement) => onSendOp({ kind: 'upsertElement', pageId: activePageId, element: el }))
        interaction.lastSent = Date.now()
      }
      return
    }
    if (interaction.kind === 'resize') {
      const dx = pt.x - interaction.start.x
      const dy = pt.y - interaction.start.y
      const element = { ...interaction.element, w: Math.max(20, interaction.element.w + dx), h: Math.max(20, interaction.element.h + dy) }
      interaction.latest = element
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) =>
          p.id === activePageId ? { ...p, elements: p.elements.map((el) => (el.id === element.id ? element : el)) } : p
        ),
      }))
      return
    }
    if (interaction.kind === 'rotate') {
      const cx = interaction.element.x + interaction.element.w / 2
      const cy = interaction.element.y + interaction.element.h / 2
      const a = (Math.atan2(pt.y - cy, pt.x - cx) * 180) / Math.PI
      const element = { ...interaction.element, rotation: a - interaction.startAngle + interaction.element.rotation }
      interaction.latest = element
      onUpdateProject((proj) => ({
        ...proj,
        pages: proj.pages.map((p) =>
          p.id === activePageId ? { ...p, elements: p.elements.map((el) => (el.id === element.id ? element : el)) } : p
        ),
      }))
    }
  }

  const onCanvasPointerUp = () => {
    const interaction = interactionRef.current
    setIsPanning(false)
    if (interaction?.kind === 'move' && interaction.latestElements) {
      setHistory((prev) => [...prev.slice(-39), interaction.before])
      setRedoHistory([])
      interaction.latestElements.forEach((el: CanvasElement) => onSendOp({ kind: 'upsertElement', pageId: activePageId, element: el }))
    }
    if ((interaction?.kind === 'resize' || interaction?.kind === 'rotate' || interaction?.kind === 'node-drag') && interaction.latest) {
      setHistory((prev) => [...prev.slice(-39), interaction.before])
      setRedoHistory([])
      onSendOp({ kind: 'upsertElement', pageId: activePageId, element: interaction.latest })
    }
    if (interaction?.kind === 'pen' && penDraftRef.current) {
      const pts = penDraftRef.current.points || []
      if (pts.length > 1) {
        const xs = pts.map((p) => p.x)
        const ys = pts.map((p) => p.y)
        updateElement(
          {
            ...penDraftRef.current,
            x: Math.min(...xs),
            y: Math.min(...ys),
            w: Math.max(16, Math.max(...xs) - Math.min(...xs)),
            h: Math.max(16, Math.max(...ys) - Math.min(...ys)),
          },
          false
        )
      }
      penDraftRef.current = null
    }
    interactionRef.current = null
  }

  const startMove = (e: React.PointerEvent<SVGGElement>, element: CanvasElement) => {
    e.stopPropagation()
    if (tool === 'eyedropper') {
      const sampled = element.fill !== 'none' ? element.fill : element.stroke
      setSampledColor(sampled)
      onShowToast(`Sampled color ${sampled}`)
      setTool('select')
      return
    }
    if (tool === 'eraser') {
      applyLocalOp({ kind: 'deleteElement', pageId: activePageId, elementId: element.id }, true)
      return
    }
    if (tool !== 'select' && tool !== 'direct-select' && tool !== 'hand' && tool !== 'crop') return
    if (e.shiftKey) {
      setSelectedIds((prev) => (prev.includes(element.id) ? prev.filter((id) => id !== element.id) : [...prev, element.id]))
    } else if (!selectedIds.includes(element.id)) {
      setSelectedIds([element.id])
    }
    if (element.locked || readOnly || tool === 'direct-select') return
    const pt = worldPoint(e)
    const toMove = selectedIds.includes(element.id) && selectedElements.length > 1 ? selectedElements : [element]
    interactionRef.current = { kind: 'move', primary: element, elements: toMove, start: pt, before: pages }
    ;(e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId)
  }

  const uploadImage = (file?: File, replaceTarget?: CanvasElement) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      onAddAsset({ name: file.name, category: file.type.includes('svg') ? 'svg' : 'image', dataUrl: url })
      if (replaceTarget) {
        updateElement({ ...replaceTarget, imageData: url, name: file.name }, true)
        onShowToast('Image replaced')
      } else {
        const el = addElement('image', docW / 2 - 140, docH / 2 - 100)
        updateElement({ ...el, imageData: url, name: file.name }, true)
      }
    }
    reader.readAsDataURL(file)
  }

  const moveLayer = (id: string, dir: -1 | 1 | -999 | 999) => {
    const idx = currentPage.elements.findIndex((e) => e.id === id)
    if (idx < 0) return
    const arr = [...currentPage.elements]
    const [item] = arr.splice(idx, 1)
    let target = dir === 999 ? arr.length : dir === -999 ? 0 : Math.max(0, Math.min(arr.length, idx + dir))
    arr.splice(target, 0, item)
    applyLocalOp({ kind: 'upsertPage', page: { ...currentPage, elements: arr } }, true)
  }

  const alignSelected = (dir: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selected) return
    const patch: Partial<CanvasElement> =
      dir === 'left'
        ? { x: 40 }
        : dir === 'center'
          ? { x: docW / 2 - selected.w / 2 }
          : dir === 'right'
            ? { x: docW - selected.w - 40 }
            : dir === 'top'
              ? { y: 40 }
              : dir === 'middle'
                ? { y: docH / 2 - selected.h / 2 }
                : { y: docH - selected.h - 40 }
    updateSelected(patch)
  }

  const distributeSelected = (axis: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) {
      onShowToast('Select 3+ objects to distribute')
      return
    }
    const sorted = [...selectedElements].sort((a, b) => (axis === 'horizontal' ? a.x - b.x : a.y - b.y))
    const startVal = axis === 'horizontal' ? sorted[0].x : sorted[0].y
    const endVal = axis === 'horizontal' ? sorted[sorted.length - 1].x : sorted[sorted.length - 1].y
    const step = (endVal - startVal) / (sorted.length - 1)
    sorted.forEach((el, idx) => {
      updateElement(axis === 'horizontal' ? { ...el, x: startVal + step * idx } : { ...el, y: startVal + step * idx }, false)
    })
  }

  const addPage = () => {
    const page: Page = {
      id: makeId(),
      name: `Artboard ${pages.length + 1}`,
      width: docW,
      height: docH,
      unit: currentPage?.unit || 'px',
      dpi: currentPage?.dpi || 72,
      background: '#FFFEFA',
      elements: [],
    }
    applyLocalOp({ kind: 'upsertPage', page }, true)
    onUpdateProject((p) => ({ ...p, activePageId: page.id }))
    setSelectedIds([])
  }

  const addComment = () => {
    if (!commentText.trim() || permission === 'view') return
    const mentions = (commentText.match(/@[\w-]+/g) || []).map((m) => m.slice(1))
    onSendComment({
      id: makeId(),
      author: userName,
      color: userColor,
      text: commentText.trim(),
      mentions,
      targetId: selectedId || undefined,
      pageId: activePageId,
      createdAt: Date.now(),
    })
    setCommentText('')
  }

  const artboardElements = currentPage?.elements || []
  const filteredLayers = [...artboardElements]
    .reverse()
    .filter((el) => !layerSearch.trim() || el.name.toLowerCase().includes(layerSearch.toLowerCase()))

  const graphicTemplates = templates.filter((t) => t.type === 'graphic')
  const isTextSelected = selected && ['text', 'comment'].includes(selected.type)
  const isImageSelected = selected?.type === 'image'
  const isVectorSelected = selected && ['bezier', 'pen', 'line', 'arrow'].includes(selected.type)
  const isShapeSelected = selected && !isTextSelected && !isImageSelected && !isVectorSelected

  const canvasCursor = isPanning
    ? 'grabbing'
    : spacePressed || tool === 'hand'
      ? 'grab'
      : tool === 'text'
        ? 'text'
        : tool === 'eraser'
          ? 'cell'
          : tool === 'select' || tool === 'direct-select'
            ? 'default'
            : 'crosshair'

  return (
    <div className="app-shell">
      {/* Graphic Studio Topbar */}
      <header className="topbar">
        <button className="icon-button" onClick={onBackToDashboard} title="Back to Dashboard">
          <ArrowLeft size={18} />
        </button>
        <BrandLogo variant="compact" height={32} />
        <div className="top-divider" />

        <div className="project-meta" style={{ minWidth: 160 }}>
          <input
            className="project-title"
            style={{ width: 190 }}
            value={project.name}
            onChange={(e) => onUpdateProject((p) => ({ ...p, name: e.target.value }))}
            aria-label="Graphic project name"
          />
          <div className="save-state">
            <span className={`save-dot ${savedIndicator ? 'is-saved' : ''}`} />
            {savedIndicator ? 'Saved' : 'Saving…'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          <button className="icon-button small" onClick={undo} disabled={!history.length} title="Undo"><Undo2 size={15} /></button>
          <button className="icon-button small" onClick={redo} disabled={!redoHistory.length} title="Redo"><Redo2 size={15} /></button>
        </div>

        <select
          className="dash-select"
          value=""
          onChange={(e) => {
            const pr = DOCUMENT_PRESETS.find((d) => d.id === e.target.value)
            if (!pr) return
            applyLocalOp({ kind: 'upsertPage', page: { ...currentPage, width: pr.width, height: pr.height, unit: pr.unit, dpi: pr.dpi } }, true)
            onShowToast(`Resized artboard to ${pr.width}×${pr.height} ${pr.unit}`)
          }}
          aria-label="Document dimensions preset"
        >
          <option value="">{docW} × {docH} {currentPage?.unit || 'px'} ({currentPage?.dpi || 72} DPI)</option>
          {DOCUMENT_PRESETS.map((pr) => (
            <option key={pr.id} value={pr.id}>{pr.name} — {pr.width}×{pr.height} {pr.unit}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button className="icon-button small" onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))} title="Zoom out"><ZoomOut size={14} /></button>
          <button className="zoom-value" style={{ width: 42, fontFamily: 'DM Mono', fontSize: 10 }} onClick={() => { setZoom(0.68); setPan({ x: 0, y: 0 }) }}>{Math.round(zoom * 100)}%</button>
          <button className="icon-button small" onClick={() => setZoom((z) => Math.min(2.2, z + 0.1))} title="Zoom in"><ZoomIn size={14} /></button>
        </div>

        <div className="mode-switch" style={{ height: 34 }}>
          <button className={showGrid ? 'mode-active' : ''} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
            <Grid2X2 size={13} /> Grid
          </button>
          <button className={showRulers ? 'mode-active' : ''} onClick={() => setShowRulers(!showRulers)} title="Toggle Rulers">
            <Ruler size={13} /> Rulers
          </button>
          <button className={showGuides ? 'mode-active' : ''} onClick={() => setShowGuides(!showGuides)} title="Toggle Guides">
            Guides
          </button>
        </div>

        <div className="top-spacer" />

        <button className="secondary-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenTemplates}>
          <LayoutTemplate size={14} /> Templates
        </button>
        <button className="share-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenShare}>
          <Share2 size={14} /> Share
        </button>
        <button className="export-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenExport}>
          <Download size={14} /> Export
        </button>
      </header>

      <div className="gfx-workspace-shell">
        {/* Dedicated Left Vertical 16-Tool Strip */}
        <nav className="gfx-left-toolstrip" aria-label="Graphic Tools">
          {[
            { id: 'select' as GraphicTool, icon: MousePointer2, label: 'Selection (V)' },
            { id: 'direct-select' as GraphicTool, icon: MousePointer, label: 'Direct Selection (A)' },
            { id: 'hand' as GraphicTool, icon: Hand, label: 'Hand / Pan (H)' },
            { id: 'frame' as GraphicTool, icon: Frame, label: 'Artboard Frame (F)' },
            { id: 'text' as GraphicTool, icon: Type, label: 'Text (T)' },
            { id: 'bezier' as GraphicTool, icon: PenTool, label: 'Pen / Bezier (B)' },
            { id: 'pencil' as GraphicTool, icon: Pencil, label: 'Pencil (P)' },
            { id: 'brush' as GraphicTool, icon: Paintbrush, label: 'Brush' },
            { id: 'eraser' as GraphicTool, icon: Eraser, label: 'Eraser' },
            { id: shapeKind as GraphicTool, icon: Shapes, label: `Shape: ${shapeKind}` },
            { id: 'line' as GraphicTool, icon: Minus, label: 'Line (L)' },
            { id: 'arrow' as GraphicTool, icon: ArrowUpRight, label: 'Arrow' },
          ].map((t) => (
            <button
              key={t.label}
              className={tool === t.id ? 'active' : ''}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <t.icon size={16} />
            </button>
          ))}
          <button
            onClick={() => document.getElementById('gs-image-upload')?.click()}
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            className={tool === 'crop' ? 'active' : ''}
            onClick={() => {
              setTool('crop')
              if (!selected || selected.type !== 'image') onShowToast('Select an image to adjust crop')
            }}
            title="Crop Image (C)"
          >
            <Crop size={16} />
          </button>
          <button
            className={tool === 'eyedropper' ? 'active' : ''}
            onClick={() => setTool('eyedropper')}
            title={`Eyedropper (I) · Sampled: ${sampledColor}`}
          >
            <Pipette size={16} />
          </button>
          <button
            className={tool === 'comment' ? 'active' : ''}
            onClick={() => setTool('comment')}
            title="Comment"
          >
            <MessageSquare size={16} />
          </button>
          <input id="gs-image-upload" type="file" accept="image/*,.svg" hidden onChange={(e) => uploadImage(e.target.files?.[0])} />
        </nav>

        {/* Left Panel (7 Graphic Studio tabs) */}
        <aside className="left-panel">
          <div className="left-tabs-grid">
            {[
              { id: 'layers', label: 'Layers', icon: Layers },
              { id: 'pages', label: 'Pages', icon: FileText },
              { id: 'assets', label: 'Assets', icon: Shapes },
              { id: 'uploads', label: 'Uploads', icon: Upload },
              { id: 'components', label: 'Comp.', icon: Component },
              { id: 'templates', label: 'Templates', icon: LayoutTemplate },
              { id: 'brandkit', label: 'Brand', icon: Palette },
            ].map((t) => (
              <button key={t.id} className={leftTab === t.id ? 'tab-active' : ''} onClick={() => setLeftTab(t.id as any)}>
                <t.icon size={14} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="left-content">
            {leftTab === 'layers' && (
              <div>
                <div className="search-box" style={{ marginBottom: 10 }}>
                  <Search size={14} />
                  <input placeholder="Filter layers..." value={layerSearch} onChange={(e) => setLayerSearch(e.target.value)} />
                </div>
                <div className="layer-toolbar">
                  <span>{artboardElements.length} layers</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-button small" onClick={cutSelected} title="Cut (Ctrl+X)"><Scissors size={13} /></button>
                    <button className="icon-button small" onClick={() => addElement('rect')} title="Add shape"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="layer-list">
                  {filteredLayers.map((el) => (
                    <div className={`layer-row ${selectedIds.includes(el.id) ? 'layer-active' : ''}`} key={el.id}>
                      <button
                        className="layer-main"
                        onClick={(e) => {
                          if (e.shiftKey) setSelectedIds((prev) => prev.includes(el.id) ? prev.filter((id) => id !== el.id) : [...prev, el.id])
                          else setSelectedIds([el.id])
                        }}
                        onDoubleClick={() => setEditingLayerId(el.id)}
                      >
                        <span className="layer-type-icon">{el.type === 'text' ? <Type size={12} /> : el.type === 'image' ? <ImageIcon size={12} /> : <Shapes size={12} />}</span>
                        {editingLayerId === el.id ? (
                          <input autoFocus className="object-name-input" value={el.name} onChange={(e) => updateElement({ ...el, name: e.target.value })} onBlur={() => setEditingLayerId(null)} />
                        ) : (
                          <span className="layer-name">{el.name}</span>
                        )}
                      </button>
                      <button className="layer-visibility" onClick={() => updateElement({ ...el, visible: !el.visible })}>{el.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                      <button className="layer-visibility" onClick={() => updateElement({ ...el, locked: !el.locked })}>{el.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
                    </div>
                  ))}
                </div>
                <div className="layer-footer">
                  <button onClick={() => selected && moveLayer(selected.id, 1)}><ChevronsUp size={13} /> Forward</button>
                  <button onClick={() => selected && moveLayer(selected.id, -1)}><ChevronsDown size={13} /> Backward</button>
                  <button onClick={() => selected && moveLayer(selected.id, 999)}><BringToFront size={13} /> Front</button>
                  <button onClick={() => selected && moveLayer(selected.id, -999)}><ArrowDown size={13} /> Back</button>
                </div>
              </div>
            )}

            {leftTab === 'pages' && (
              <div>
                <div className="pages-head">
                  <span>{pages.length} Artboards</span>
                  <button className="new-page" onClick={addPage}><Plus size={12} /> New</button>
                </div>
                {pages.map((pg, i) => (
                  <div
                    key={pg.id}
                    className={`page-card ${pg.id === activePageId ? 'page-active' : ''}`}
                    onClick={() => { onUpdateProject((p) => ({ ...p, activePageId: pg.id })); setSelectedIds([]) }}
                  >
                    <div className="page-card-meta">
                      <span>{String(i + 1).padStart(2, '0')} · {pg.name}</span>
                      <div className="page-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="page-action-btn danger-hover"
                          onClick={() => pages.length > 1 ? applyLocalOp({ kind: 'deletePage', pageId: pg.id }, true) : onShowToast('Keep at least 1 artboard')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'assets' && (
              <div>
                <div className="asset-category-title">SHAPE PRIMITIVES</div>
                <div className="tool-grid" style={{ marginBottom: 14 }}>
                  {[
                    { id: 'rect' as const, label: 'Rect', icon: Square },
                    { id: 'rounded-rect' as const, label: 'Rounded', icon: Square },
                    { id: 'circle' as const, label: 'Circle', icon: Circle },
                    { id: 'triangle' as const, label: 'Triangle', icon: Triangle },
                    { id: 'polygon' as const, label: 'Polygon', icon: Hexagon },
                    { id: 'star' as const, label: 'Star', icon: Star },
                  ].map((s) => (
                    <button
                      key={s.id}
                      className={`tool-tile ${shapeKind === s.id ? 'tool-selected' : ''}`}
                      onClick={() => {
                        setShapeKind(s.id)
                        setTool(s.id)
                      }}
                    >
                      <s.icon size={15} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
                <div className="asset-category-title">SWATCHES</div>
                <div className="asset-colors">
                  {COLOR_SWATCHES.map((c) => (
                    <button key={c} style={{ background: c }} onClick={() => (selected ? updateSelected({ fill: c }) : onShowToast('Select an object first'))} />
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'uploads' && (
              <div>
                <button className="upload-wide" style={{ marginTop: 0, marginBottom: 14 }} onClick={() => document.getElementById('gs-image-upload')?.click()}>
                  <Upload size={15} /> Upload Photo / SVG
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {assets.map((a) => (
                    <button
                      key={a.id}
                      className="asset-card"
                      style={{ height: 76, padding: 6 }}
                      onClick={() => {
                        const img = addElement('image', docW / 2 - 120, docH / 2 - 90)
                        updateElement({ ...img, imageData: a.dataUrl, name: a.name }, true)
                      }}
                    >
                      <img src={a.dataUrl} alt={a.name} style={{ width: '100%', height: 42, objectFit: 'contain' }} />
                      <small style={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'components' && (
              <div>
                <button
                  className="secondary-button full-button"
                  style={{ marginBottom: 10 }}
                  disabled={!selected}
                  onClick={() => {
                    if (!selected) return
                    setSavedComponents((prev) => [{ ...JSON.parse(JSON.stringify(selected)), id: makeId() }, ...prev])
                    onShowToast(`Saved "${selected.name}" as Component`)
                  }}
                >
                  <Plus size={14} /> Save Selected as Component
                </button>
                <div className="layer-list">
                  {savedComponents.map((c) => (
                    <div key={c.id} className="layer-row">
                      <button
                        className="layer-main"
                        onClick={() => {
                          const clone = { ...JSON.parse(JSON.stringify(c)), id: makeId(), x: docW / 2 - c.w / 2, y: docH / 2 - c.h / 2 }
                          updateElement(clone, true)
                          setSelectedIds([clone.id])
                        }}
                      >
                        <span className="layer-type-icon"><Component size={12} /></span>
                        <span className="layer-name">{c.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'templates' && (
              <div style={{ display: 'grid', gap: 10 }}>
                <button className="primary-button full-button" onClick={onOpenTemplates}>
                  <LayoutTemplate size={14} /> Browse All 12 Graphic Templates
                </button>
                {graphicTemplates.map((tpl) => (
                  <div key={tpl.id} className="page-card" onClick={() => onApplyTemplate(tpl)}>
                    <div className="template-cat">{tpl.category}</div>
                    <strong style={{ fontSize: 12 }}>{tpl.title}</strong>
                    <div style={{ fontSize: 10, color: '#6E6A62', marginTop: 3 }}>{tpl.dimensions}</div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'brandkit' && (
              <div>
                <div className="asset-category-title">{brandKit.brandName.toUpperCase()} COLORS</div>
                <div className="asset-colors">
                  {[...brandKit.primaryColors, ...brandKit.secondaryColors, ...brandKit.customColors].map((c) => (
                    <button key={c} style={{ background: c }} onClick={() => (selected ? updateSelected({ fill: c }) : onShowToast('Select an object first'))} />
                  ))}
                </div>
                <div className="asset-category-title" style={{ marginTop: 16 }}>BRAND FONTS</div>
                <button className="secondary-button full-button" onClick={() => selected && updateSelected({ fontFamily: brandKit.headingFont })}>
                  Apply {brandKit.headingFont}
                </button>
              </div>
            )}
          </div>

          <div className="left-panel-bottom">
            <button onClick={onOpenHelp}><CircleHelp size={14} /> Help & tour</button>
            <button onClick={onOpenShortcuts}><Hash size={14} /> Shortcuts <kbd>?</kbd></button>
          </div>
        </aside>

        {/* Center Artboard Workspace with Rulers & Guides */}
        <section className="canvas-column" style={{ background: '#E5E2D9' }}>
          {showRulers && (
            <div className="gfx-ruler-top">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i}>{i * 100}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
            {showRulers && (
              <div className="gfx-ruler-left">
                {Array.from({ length: 11 }).map((_, i) => (
                  <span key={i}>{i * 100}</span>
                ))}
              </div>
            )}

            <div className="canvas-stage" style={{ background: '#E5E2D9' }}>
              <svg
                ref={svgRef}
                className="canvas-svg"
                style={{ cursor: canvasCursor }}
                viewBox={`0 0 ${docW} ${docH}`}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onWheel={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    setZoom((z) => Math.max(0.2, Math.min(2.2, z + (e.deltaY < 0 ? 0.04 : -0.04))))
                  } else {
                    setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
                  }
                }}
              >
                <defs>
                  <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1.1" fill="#B9B5AB" opacity="0.65" />
                  </pattern>
                  <pattern id="checker-bg" width="24" height="24" patternUnits="userSpaceOnUse">
                    <rect width="12" height="12" fill="#EAE7DE" />
                    <rect x="12" y="12" width="12" height="12" fill="#EAE7DE" />
                    <rect x="12" width="12" height="12" fill="#FFFEFA" />
                    <rect y="12" width="12" height="12" fill="#FFFEFA" />
                  </pattern>
                  <marker id="arrow-head" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#171717" />
                  </marker>
                  {artboardElements.map((el) => (
                    <React.Fragment key={`defs-${el.id}`}>
                      {el.gradient?.enabled && (
                        <linearGradient id={`grad-${el.id}`} gradientTransform={`rotate(${el.gradient.angle || 45}, 0.5, 0.5)`}>
                          <stop offset="0%" stopColor={el.gradient.from} />
                          <stop offset="100%" stopColor={el.gradient.to} />
                        </linearGradient>
                      )}
                      {(el.shadow?.enabled || el.glow?.enabled || el.blur) && (
                        <filter id={`fx-${el.id}`} x="-40%" y="-40%" width="180%" height="180%">
                          {el.blur ? <feGaussianBlur stdDeviation={el.blur} /> : null}
                          {el.shadow?.enabled ? <feDropShadow dx={el.shadow.x} dy={el.shadow.y} stdDeviation={el.shadow.blur} floodColor={el.shadow.color} /> : null}
                          {el.glow?.enabled ? <feDropShadow dx="0" dy="0" stdDeviation={el.glow.blur} floodColor={el.glow.color} /> : null}
                        </filter>
                      )}
                      {el.type === 'image' && el.mask && el.mask !== 'none' && (
                        <clipPath id={`mask-${el.id}`}>
                          {el.mask === 'circle' && <ellipse cx={el.x + el.w / 2} cy={el.y + el.h / 2} rx={el.w / 2} ry={el.h / 2} />}
                          {el.mask === 'rounded' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={24} />}
                          {el.mask === 'pill' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={Math.min(el.w, el.h) / 2} />}
                          {el.mask === 'diamond' && <polygon points={buildPolygonPoints(el.x, el.y, el.w, el.h, 4)} />}
                          {el.mask === 'star' && <polygon points={buildStarPoints(el.x, el.y, el.w, el.h, 5)} />}
                        </clipPath>
                      )}
                    </React.Fragment>
                  ))}
                </defs>

                <g className="world-group" transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                  {/* Artboard Boundary */}
                  <rect
                    x={0}
                    y={0}
                    width={docW}
                    height={docH}
                    fill={currentPage?.transparentBg ? 'url(#checker-bg)' : currentPage?.background || '#FFFEFA'}
                    stroke="#171717"
                    strokeWidth="2"
                  />
                  {showGrid && <rect width={docW} height={docH} fill="url(#dot-grid)" pointerEvents="none" />}

                  {/* Cyan Margin & Center Guides */}
                  {showGuides && (
                    <g className="canvas-ui" pointerEvents="none" opacity="0.55">
                      <line x1={docW / 2} y1={0} x2={docW / 2} y2={docH} stroke="#00A8E8" strokeWidth="1.5" strokeDasharray="6 4" />
                      <line x1={0} y1={docH / 2} x2={docW} y2={docH / 2} stroke="#00A8E8" strokeWidth="1.5" strokeDasharray="6 4" />
                      <rect x={48} y={48} width={docW - 96} height={docH - 96} fill="none" stroke="#00A8E8" strokeWidth="1" strokeDasharray="4 4" />
                    </g>
                  )}

                  {artboardElements
                    .filter((el) => el.visible)
                    .map((el) => {
                      const fillPaint = el.gradient?.enabled ? `url(#grad-${el.id})` : el.fill
                      const filterAttr = el.shadow?.enabled || el.glow?.enabled || el.blur ? `url(#fx-${el.id})` : undefined
                      const cssImgFilter =
                        el.type === 'image' && el.filters
                          ? `brightness(${el.filters.brightness}%) contrast(${el.filters.contrast}%) saturate(${el.filters.saturation}%) hue-rotate(${el.filters.hue}deg) grayscale(${el.filters.grayscale}%) blur(${el.filters.blur}px)`
                          : undefined
                      return (
                        <g
                          key={el.id}
                          transform={`translate(${el.x + el.w / 2} ${el.y + el.h / 2}) rotate(${el.rotation}) translate(${-el.x - el.w / 2} ${-el.y - el.h / 2})`}
                          onPointerDown={(e) => startMove(e, el)}
                          style={{ cursor: el.locked ? 'not-allowed' : tool === 'select' ? 'move' : 'pointer' }}
                          opacity={el.opacity}
                          filter={filterAttr}
                        >
                          {el.type === 'frame' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.radius} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                          {el.type === 'rect' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.radius} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                          {el.type === 'circle' && <ellipse cx={el.x + el.w / 2} cy={el.y + el.h / 2} rx={el.w / 2} ry={el.h / 2} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                          {el.type === 'triangle' && <polygon points={buildPolygonPoints(el.x, el.y, el.w, el.h, 3)} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinejoin="round" />}
                          {el.type === 'polygon' && <polygon points={buildPolygonPoints(el.x, el.y, el.w, el.h, el.sides || 6)} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinejoin="round" />}
                          {el.type === 'star' && <polygon points={buildStarPoints(el.x, el.y, el.w, el.h, el.starPoints || 5)} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinejoin="round" />}
                          {(el.type === 'text' || el.type === 'comment') && (
                            <>
                              {el.type === 'comment' && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.radius} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} />}
                              <text
                                x={el.x + (el.type === 'comment' ? 14 : 0)}
                                y={el.y + (el.type === 'comment' ? 28 : el.fontSize || 24)}
                                fill={el.type === 'comment' ? '#171717' : el.fill}
                                fontSize={el.fontSize || 24}
                                fontFamily={el.fontFamily || 'Space Grotesk'}
                                fontWeight={el.fontWeight || 500}
                                fontStyle={el.fontStyle || 'normal'}
                                textDecoration={el.textDecoration || 'none'}
                                letterSpacing={el.letterSpacing || 0}
                                textAnchor={el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'}
                              >
                                {(el.text || '').split('\n').map((line, i) => (
                                  <tspan
                                    key={i}
                                    x={el.x + (el.type === 'comment' ? 14 : 0) + (el.textAlign === 'center' ? el.w / 2 : el.textAlign === 'right' ? el.w : 0)}
                                    dy={i === 0 ? 0 : (el.fontSize || 24) * (el.lineHeight || 1.18)}
                                  >
                                    {line}
                                  </tspan>
                                ))}
                              </text>
                            </>
                          )}
                          {(el.type === 'line' || el.type === 'arrow') && (
                            <line x1={el.x} y1={el.y + el.h / 2} x2={el.x + el.w} y2={el.y + el.h / 2} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" markerEnd={el.type === 'arrow' ? 'url(#arrow-head)' : undefined} />
                          )}
                          {el.type === 'pen' && <polyline points={(el.points || []).map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />}
                          {el.type === 'bezier' && el.bezierNodes && <path d={bezierNodesToPath(el.bezierNodes)} fill={fillPaint} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" />}
                          {el.type === 'image' &&
                            (el.imageData ? (
                              <g clipPath={el.mask && el.mask !== 'none' ? `url(#mask-${el.id})` : undefined}>
                                <image
                                  href={el.imageData}
                                  x={el.x}
                                  y={el.y}
                                  width={el.w}
                                  height={el.h}
                                  preserveAspectRatio="xMidYMid slice"
                                  style={{ filter: cssImgFilter }}
                                  transform={el.flipX || el.flipY ? `translate(${el.flipX ? 2 * el.x + el.w : 0}, ${el.flipY ? 2 * el.y + el.h : 0}) scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})` : undefined}
                                />
                              </g>
                            ) : (
                              <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={8} fill="#E4E2DA" stroke="#171717" strokeWidth={2} />
                            ))}

                          {selectedIds.includes(el.id) && (
                            <g className="selection-ui" pointerEvents="none">
                              <rect x={el.x - 4} y={el.y - 4} width={el.w + 8} height={el.h + 8} fill="none" stroke="#5267FF" strokeWidth="2" strokeDasharray="6 3" />
                              {tool === 'direct-select' && el.bezierNodes && (
                                <g pointerEvents="all">
                                  {el.bezierNodes.map((node, nIdx) => (
                                    <React.Fragment key={nIdx}>
                                      {node.cp1x !== undefined && node.cp1y !== undefined && (
                                        <>
                                          <line x1={node.x} y1={node.y} x2={node.cp1x} y2={node.cp1y} stroke="#FF987C" strokeWidth="1.5" />
                                          <circle cx={node.cp1x} cy={node.cp1y} r="4.5" fill="#FF987C" stroke="#171717" strokeWidth="1.5" onPointerDown={(e) => { e.stopPropagation(); interactionRef.current = { kind: 'node-drag', element: el, nodeIdx: nIdx, handleType: 'cp1', before: pages }; (e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId) }} />
                                        </>
                                      )}
                                      {node.cp2x !== undefined && node.cp2y !== undefined && (
                                        <>
                                          <line x1={node.x} y1={node.y} x2={node.cp2x} y2={node.cp2y} stroke="#5267FF" strokeWidth="1.5" />
                                          <circle cx={node.cp2x} cy={node.cp2y} r="4.5" fill="#D8F878" stroke="#171717" strokeWidth="1.5" onPointerDown={(e) => { e.stopPropagation(); interactionRef.current = { kind: 'node-drag', element: el, nodeIdx: nIdx, handleType: 'cp2', before: pages }; (e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId) }} />
                                        </>
                                      )}
                                      <rect x={node.x - 5} y={node.y - 5} width={10} height={10} fill="#FFFEFA" stroke="#5267FF" strokeWidth="2" onPointerDown={(e) => { e.stopPropagation(); interactionRef.current = { kind: 'node-drag', element: el, nodeIdx: nIdx, handleType: 'anchor', before: pages }; (e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId) }} />
                                    </React.Fragment>
                                  ))}
                                </g>
                              )}
                              {selectedId === el.id && tool !== 'direct-select' && (
                                <>
                                  <circle cx={el.x + el.w + 4} cy={el.y + el.h + 4} r="7" fill="#FFFFFF" stroke="#5267FF" strokeWidth="2.5" pointerEvents="all" className="resize-handle" onPointerDown={(e) => { e.stopPropagation(); interactionRef.current = { kind: 'resize', element: el, start: worldPoint(e as any), before: pages }; (e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId) }} />
                                  <line x1={el.x + el.w / 2} y1={el.y - 4} x2={el.x + el.w / 2} y2={el.y - 26} stroke="#5267FF" strokeWidth="1.5" />
                                  <circle cx={el.x + el.w / 2} cy={el.y - 30} r="6" fill="#FFFFFF" stroke="#5267FF" strokeWidth="2.5" pointerEvents="all" className="rotate-handle" onPointerDown={(e) => { e.stopPropagation(); const pt = worldPoint(e as any); const cx = el.x + el.w / 2; const cy = el.y + el.h / 2; interactionRef.current = { kind: 'rotate', element: el, startAngle: (Math.atan2(pt.y - cy, pt.x - cx) * 180) / Math.PI, before: pages }; (e.currentTarget.ownerSVGElement as SVGSVGElement)?.setPointerCapture(e.pointerId) }} />
                                </>
                              )}
                            </g>
                          )}
                        </g>
                      )
                    })}

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

              {artboardElements.length === 0 && (
                <div className="clean-canvas-floating-banner">
                  <EmptyStateVisual variant="empty-graphic" maxWidth={78} alt="Clean graphic artboard" />
                  <span>Clean Artboard ({docW}×{docH}) — Choose a tool on the left or start with a template</span>
                  <button className="primary-button" style={{ height: 32, fontSize: 11 }} onClick={onOpenTemplates}>
                    <LayoutTemplate size={14} /> Browse Graphic Templates
                  </button>
                </div>
              )}

              <div className="bottom-canvas-status">
                <span><span className="status-green" /> {conn === 'connected' ? 'Live sync' : 'Local artboard'}</span>
                <span>{docW} × {docH} {currentPage?.unit || 'px'}</span>
                <span>{artboardElements.length} layers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Graphic Inspector */}
        <aside className="right-panel">
          <div className="right-panel-head">
            <div>
              <div className="panel-eyebrow">CONTEXTUAL INSPECTOR</div>
              <h2>
                {isTextSelected ? 'Text Properties' : isImageSelected ? 'Image Properties' : isVectorSelected ? 'Vector Path' : isShapeSelected ? 'Shape Properties' : 'Artboard'}
              </h2>
            </div>
          </div>

          <div className="right-tabs">
            <button className={rightTab === 'inspector' ? 'right-tab-active' : ''} onClick={() => setRightTab('inspector')}>
              <SlidersHorizontal size={13} /> Properties
            </button>
            <button className={rightTab === 'comments' ? 'right-tab-active' : ''} onClick={() => setRightTab('comments')}>
              <MessageSquare size={13} /> Comments <span className="tab-count">{project.comments.length}</span>
            </button>
          </div>

          {rightTab === 'inspector' && selected && (
            <div className="inspector-scroll">
              <div className="inspector-object">
                <div>
                  <input className="object-name-input" value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} />
                  <small>{selected.type.toUpperCase()}</small>
                </div>
                <button className="icon-button small" onClick={duplicateSelected} title="Duplicate"><Copy size={14} /></button>
                <button className="icon-button small danger-hover" onClick={deleteSelected} title="Delete"><Trash2 size={14} /></button>
              </div>

              {/* Dimensions & Position */}
              <div className="inspector-section">
                <div className="inspector-title">DIMENSIONS & POSITION</div>
                <div className="field-grid four">
                  <label className="field"><span>X</span><input type="number" value={Math.round(selected.x)} onChange={(e) => updateSelected({ x: Number(e.target.value) })} /></label>
                  <label className="field"><span>Y</span><input type="number" value={Math.round(selected.y)} onChange={(e) => updateSelected({ y: Number(e.target.value) })} /></label>
                  <label className="field"><span>W</span><input type="number" value={Math.round(selected.w)} onChange={(e) => updateSelected({ w: Math.max(10, Number(e.target.value)) })} /></label>
                  <label className="field"><span>H</span><input type="number" value={Math.round(selected.h)} onChange={(e) => updateSelected({ h: Math.max(10, Number(e.target.value)) })} /></label>
                </div>
                <div className="field-row">
                  <label className="field full"><span>Rotation</span><input type="number" value={Math.round(selected.rotation)} onChange={(e) => updateSelected({ rotation: Number(e.target.value) })} /></label>
                  <div className="quick-align">
                    <button onClick={() => alignSelected('left')} title="Align Left"><AlignLeft size={14} /></button>
                    <button onClick={() => alignSelected('center')} title="Center"><AlignCenter size={14} /></button>
                    <button onClick={() => alignSelected('right')} title="Align Right"><AlignRight size={14} /></button>
                  </div>
                </div>
                {selectedElements.length >= 3 && (
                  <div className="arrange-buttons" style={{ marginTop: 8 }}>
                    <button onClick={() => distributeSelected('horizontal')}><AlignHorizontalDistributeCenter size={13} /> Distribute H</button>
                    <button onClick={() => distributeSelected('vertical')}><AlignVerticalDistributeCenter size={13} /> Distribute V</button>
                  </div>
                )}
              </div>

              {/* TEXT INSPECTOR */}
              {isTextSelected && (
                <div className="inspector-section">
                  <div className="inspector-title">TYPOGRAPHY</div>
                  <label className="field stacked">
                    <span>Content</span>
                    <textarea rows={2} value={selected.text || ''} onChange={(e) => updateSelected({ text: e.target.value })} />
                  </label>
                  <label className="field stacked">
                    <span>Font Family</span>
                    <select value={selected.fontFamily || 'Space Grotesk'} onChange={(e) => updateSelected({ fontFamily: e.target.value })}>
                      {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </label>
                  <div className="field-grid four">
                    <label className="field"><span>Size</span><input type="number" value={selected.fontSize || 24} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} /></label>
                    <label className="field"><span>Weight</span><input type="number" step={100} min={400} max={700} value={selected.fontWeight || 600} onChange={(e) => updateSelected({ fontWeight: Number(e.target.value) })} /></label>
                    <label className="field"><span>Spacing</span><input type="number" value={selected.letterSpacing || 0} onChange={(e) => updateSelected({ letterSpacing: Number(e.target.value) })} /></label>
                    <label className="field"><span>Line H</span><input type="number" step={0.1} value={selected.lineHeight || 1.2} onChange={(e) => updateSelected({ lineHeight: Number(e.target.value) })} /></label>
                  </div>
                  <div className="color-field" style={{ marginTop: 10 }}>
                    <span>Color</span>
                    <div className="color-input">
                      <input type="color" value={selected.fill === 'none' ? '#171717' : selected.fill} onChange={(e) => updateSelected({ fill: e.target.value })} />
                      <input value={selected.fill} onChange={(e) => updateSelected({ fill: e.target.value })} />
                    </div>
                  </div>
                  <div className="alignment-buttons">
                    <button className={selected.fontWeight === 700 ? 'active' : ''} onClick={() => updateSelected({ fontWeight: selected.fontWeight === 700 ? 500 : 700 })}><Bold size={14} /></button>
                    <button className={selected.fontStyle === 'italic' ? 'active' : ''} onClick={() => updateSelected({ fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic size={14} /></button>
                    <button className={selected.textDecoration === 'underline' ? 'active' : ''} onClick={() => updateSelected({ textDecoration: selected.textDecoration === 'underline' ? 'none' : 'underline' })}><Underline size={14} /></button>
                    <button className={selected.textAlign === 'left' ? 'active' : ''} onClick={() => updateSelected({ textAlign: 'left' })}><AlignLeft size={14} /></button>
                    <button className={selected.textAlign === 'center' ? 'active' : ''} onClick={() => updateSelected({ textAlign: 'center' })}><AlignCenter size={14} /></button>
                    <button className={selected.textAlign === 'right' ? 'active' : ''} onClick={() => updateSelected({ textAlign: 'right' })}><AlignRight size={14} /></button>
                  </div>
                </div>
              )}

              {/* IMAGE INSPECTOR */}
              {isImageSelected && (
                <div className="inspector-section">
                  <div className="inspector-title">IMAGE & CROP</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <button className="secondary-button" style={{ flex: 1, height: 32 }} onClick={() => document.getElementById('gs-replace-img')?.click()}>
                      <Upload size={13} /> Replace
                    </button>
                    <button className="secondary-button" style={{ height: 32 }} onClick={() => updateSelected({ flipX: !selected.flipX })}><FlipHorizontal2 size={14} /></button>
                    <button className="secondary-button" style={{ height: 32 }} onClick={() => updateSelected({ flipY: !selected.flipY })}><FlipVertical2 size={14} /></button>
                    <input id="gs-replace-img" type="file" accept="image/*,.svg" hidden onChange={(e) => uploadImage(e.target.files?.[0], selected)} />
                  </div>
                  <label className="field stacked">
                    <span>Shape Mask</span>
                    <select value={selected.mask || 'none'} onChange={(e) => updateSelected({ mask: e.target.value as MaskShape })}>
                      <option value="none">None</option>
                      <option value="circle">Circle</option>
                      <option value="rounded">Rounded</option>
                      <option value="pill">Pill</option>
                      <option value="diamond">Diamond</option>
                      <option value="star">Star</option>
                    </select>
                  </label>
                  <label className="range-field">
                    <span>Brightness <strong>{selected.filters?.brightness ?? 100}%</strong></span>
                    <input type="range" min={30} max={200} value={selected.filters?.brightness ?? 100} onChange={(e) => updateSelected({ filters: { ...(selected.filters || DEFAULT_IMAGE_FILTERS), brightness: Number(e.target.value) } })} />
                  </label>
                  <label className="range-field">
                    <span>Contrast <strong>{selected.filters?.contrast ?? 100}%</strong></span>
                    <input type="range" min={30} max={200} value={selected.filters?.contrast ?? 100} onChange={(e) => updateSelected({ filters: { ...(selected.filters || DEFAULT_IMAGE_FILTERS), contrast: Number(e.target.value) } })} />
                  </label>
                  <label className="range-field">
                    <span>Saturation <strong>{selected.filters?.saturation ?? 100}%</strong></span>
                    <input type="range" min={0} max={200} value={selected.filters?.saturation ?? 100} onChange={(e) => updateSelected({ filters: { ...(selected.filters || DEFAULT_IMAGE_FILTERS), saturation: Number(e.target.value) } })} />
                  </label>
                </div>
              )}

              {/* VECTOR PATH INSPECTOR */}
              {isVectorSelected && (
                <div className="inspector-section">
                  <div className="inspector-title">VECTOR & PATH</div>
                  <div className="room-note" style={{ marginTop: 0, marginBottom: 10 }}>
                    <Sparkles size={14} />
                    <span>
                      {selected.bezierNodes
                        ? `${selected.bezierNodes.length} Bezier anchor points. Switch to Direct Selection (A) to drag handles.`
                        : 'Stroke vector path. Adjust stroke color and width below.'}
                    </span>
                  </div>
                  <div className="color-field">
                    <span>Fill</span>
                    <div className="color-input">
                      <input type="color" value={selected.fill === 'none' ? '#ffffff' : selected.fill} onChange={(e) => updateSelected({ fill: e.target.value })} />
                      <input value={selected.fill} onChange={(e) => updateSelected({ fill: e.target.value })} />
                    </div>
                  </div>
                  <div className="color-field">
                    <span>Stroke</span>
                    <div className="color-input">
                      <input type="color" value={selected.stroke === 'none' ? '#171717' : selected.stroke} onChange={(e) => updateSelected({ stroke: e.target.value })} />
                      <input value={selected.stroke} onChange={(e) => updateSelected({ stroke: e.target.value })} />
                    </div>
                  </div>
                  <label className="field"><span>Stroke Width</span><input type="number" min={0} max={40} value={selected.strokeWidth} onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })} /></label>
                </div>
              )}

              {/* SHAPE INSPECTOR */}
              {isShapeSelected && (
                <div className="inspector-section">
                  <div className="inspector-title">SHAPE APPEARANCE</div>
                  <div className="color-field">
                    <span>Fill</span>
                    <div className="color-input">
                      <input type="color" value={selected.fill === 'none' ? '#ffffff' : selected.fill} onChange={(e) => updateSelected({ fill: e.target.value })} />
                      <input value={selected.fill} onChange={(e) => updateSelected({ fill: e.target.value })} />
                    </div>
                  </div>
                  <div className="color-field">
                    <span>Stroke</span>
                    <div className="color-input">
                      <input type="color" value={selected.stroke === 'none' ? '#171717' : selected.stroke} onChange={(e) => updateSelected({ stroke: e.target.value })} />
                      <input value={selected.stroke} onChange={(e) => updateSelected({ stroke: e.target.value })} />
                    </div>
                  </div>
                  <div className="field-row">
                    <label className="field full"><span>Stroke W</span><input type="number" min={0} max={40} value={selected.strokeWidth} onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })} /></label>
                    <label className="field full"><span>Radius</span><input type="number" min={0} max={100} value={selected.radius} onChange={(e) => updateSelected({ radius: Number(e.target.value) })} /></label>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, marginTop: 10 }}>
                    <input type="checkbox" checked={!!selected.gradient?.enabled} onChange={(e) => updateSelected({ gradient: { enabled: e.target.checked, type: 'linear', angle: 45, from: selected.gradient?.from || '#5267FF', to: selected.gradient?.to || '#D8F878' } })} />
                    Gradient Fill
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, marginTop: 8 }}>
                    <input type="checkbox" checked={!!selected.shadow?.enabled} onChange={(e) => updateSelected({ shadow: { enabled: e.target.checked, x: 6, y: 6, blur: 0, color: '#171717' } })} />
                    Drop Shadow
                  </label>
                </div>
              )}

              <div className="inspector-section">
                <label className="range-field" style={{ marginTop: 0 }}>
                  <span>Opacity <strong>{Math.round(selected.opacity * 100)}%</strong></span>
                  <input type="range" min={5} max={100} value={Math.round(selected.opacity * 100)} onChange={(e) => updateSelected({ opacity: Number(e.target.value) / 100 })} />
                </label>
                <div className="arrange-buttons" style={{ marginTop: 10 }}>
                  {selectedElements.length >= 2 && <button className="full-width" onClick={groupSelected}><Group size={14} /> Group</button>}
                  {selected.type === 'frame' && <button className="full-width" onClick={ungroupSelected}><Ungroup size={14} /> Ungroup</button>}
                  <button className="full-width" onClick={() => updateSelected({ locked: !selected.locked })}>
                    {selected.locked ? <Unlock size={14} /> : <Lock size={14} />} {selected.locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {rightTab === 'inspector' && !selected && (
            <div className="inspector-scroll">
              <div className="empty-selection">
                <strong>Clean Selection</strong>
                <span>Select any object on the artboard to inspect typography, shape, image, or vector controls.</span>
              </div>
              <div className="inspector-section">
                <div className="inspector-title">ARTBOARD BACKGROUND</div>
                <div className="color-field">
                  <span>Color</span>
                  <div className="color-input">
                    <input type="color" value={currentPage?.background || '#FFFEFA'} onChange={(e) => applyLocalOp({ kind: 'setBackground', pageId: activePageId, background: e.target.value }, false)} />
                    <input value={currentPage?.background || '#FFFEFA'} onChange={(e) => applyLocalOp({ kind: 'setBackground', pageId: activePageId, background: e.target.value }, false)} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600 }}>
                  <input type="checkbox" checked={!!currentPage?.transparentBg} onChange={(e) => applyLocalOp({ kind: 'upsertPage', page: { ...currentPage, transparentBg: e.target.checked } }, true)} />
                  Transparent Background
                </label>
              </div>
            </div>
          )}

          {rightTab === 'comments' && (
            <div className="comments-panel">
              <div className="layer-list" style={{ overflowY: 'auto', flex: 1 }}>
                {project.comments.map((c) => (
                  <div key={c.id} className="comment-card-item">
                    <strong>{c.author}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 11 }}>{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="comment-composer">
                <textarea rows={3} placeholder="Leave feedback..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                <div>
                  <span>Room comments</span>
                  <button onClick={addComment} disabled={!commentText.trim() || permission === 'view'}><Send size={14} /></button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
