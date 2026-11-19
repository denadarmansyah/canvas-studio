import React, { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookmarkPlus,
  Box,
  Columns,
  Component,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Grid,
  Heading1,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  Mail,
  MessageSquare,
  Minus,
  Monitor,
  Navigation,
  Palette,
  PanelTop,
  Plus,
  Redo2,
  RotateCcw,
  Send,
  Share2,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  Trash2,
  Type,
  Undo2,
  Upload,
  Video,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type {
  AssetItem,
  BrandKit,
  CommentItem,
  PermissionRole,
  ProjectDocument,
  TemplateDefinition,
  WebBreakpoint,
  WebComponentDef,
  WebElementType,
  WebNode,
  WebNodeStyles,
  WebPage,
  WebsiteDocument,
} from '../../types/platform'
import { createWebNode, makeBlankWebsiteDoc, makeId } from '../../data/templates'
import { FONT_FAMILIES } from '../../data/presets'
import { BrandLogo, EmptyStateVisual } from '../../components/branding/BrandAssets'

const BREAKPOINT_WIDTHS: Record<WebBreakpoint, number> = {
  desktop: 1280,
  laptop: 1024,
  tablet: 768,
  mobile: 390,
}

const ELEMENT_CATALOG: {
  group: string
  items: { type: WebElementType; label: string; icon: React.ComponentType<{ size?: number | string }> }[]
}[] = [
  {
    group: 'Layout & Containers',
    items: [
      { type: 'section', label: 'Section', icon: PanelTop },
      { type: 'container', label: 'Container', icon: Box },
      { type: 'grid', label: 'Grid', icon: Grid },
      { type: 'flex', label: 'Flex Layout', icon: LayoutGrid },
      { type: 'columns', label: 'Columns', icon: Columns },
    ],
  },
  {
    group: 'Content & Media',
    items: [
      { type: 'heading', label: 'Heading', icon: Heading1 },
      { type: 'paragraph', label: 'Paragraph', icon: Type },
      { type: 'rich-text', label: 'Rich Text', icon: FileText },
      { type: 'button', label: 'Button', icon: Square },
      { type: 'image', label: 'Image', icon: ImageIcon },
      { type: 'video', label: 'Video', icon: Video },
      { type: 'icon', label: 'Icon', icon: Sparkles },
      { type: 'divider', label: 'Divider', icon: Minus },
      { type: 'spacer', label: 'Spacer', icon: Layers },
    ],
  },
  {
    group: 'Page Sections',
    items: [
      { type: 'navbar', label: 'Nav Bar', icon: PanelTop },
      { type: 'hero', label: 'Hero', icon: LayoutTemplate },
      { type: 'feature-cards', label: 'Features', icon: LayoutGrid },
      { type: 'testimonials', label: 'Testimonials', icon: MessageSquare },
      { type: 'pricing-cards', label: 'Pricing', icon: Layers },
      { type: 'faq', label: 'FAQ', icon: HelpCircle },
      { type: 'contact', label: 'Contact Form', icon: Mail },
      { type: 'footer', label: 'Footer', icon: PanelTop },
    ],
  },
]

function getEffectiveStyles(node: WebNode, bp: WebBreakpoint): WebNodeStyles {
  if (bp === 'desktop') return node.styles
  return { ...node.styles, ...(node.responsive?.[bp] || {}) }
}

function findNodeById(nodes: WebNode[], id: string | null): WebNode | null {
  if (!id) return null
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return null
}

function updateNodeTree(nodes: WebNode[], id: string, updater: (n: WebNode) => WebNode): WebNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n)
    if (n.children?.length) return { ...n, children: updateNodeTree(n.children, id, updater) }
    return n
  })
}

function removeNodeFromTree(nodes: WebNode[], id: string): WebNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children?.length ? { ...n, children: removeNodeFromTree(n.children, id) } : n))
}

function cloneNodeWithIds(node: WebNode): WebNode {
  return {
    ...JSON.parse(JSON.stringify(node)),
    id: makeId(),
    children: node.children?.map(cloneNodeWithIds),
  }
}

export function WebsiteBuilder({
  project,
  brandKit,
  assets,
  templates,
  webComponents,
  onSaveComponent,
  onDeleteComponent,
  onUpdateProject,
  onBackToDashboard,
  onOpenTemplates,
  onApplyWebsiteTemplate,
  onOpenShare,
  onOpenExport,
  onOpenPublish,
  onSyncWebsite,
  onSendComment,
  conn,
  members,
  permission,
  userName,
  onShowToast,
}: {
  project: ProjectDocument
  brandKit: BrandKit
  assets: AssetItem[]
  templates: TemplateDefinition[]
  webComponents: WebComponentDef[]
  onSaveComponent: (comp: WebComponentDef) => void
  onDeleteComponent: (id: string) => void
  onUpdateProject: (updater: (p: ProjectDocument) => ProjectDocument) => void
  onBackToDashboard: () => void
  onOpenTemplates: () => void
  onApplyWebsiteTemplate: (tpl: TemplateDefinition) => void
  onOpenShare: () => void
  onOpenExport: () => void
  onOpenPublish: () => void
  onSyncWebsite: (website: WebsiteDocument) => void
  onSendComment: (c: CommentItem) => void
  conn: string
  members: { id: string; name: string; color: string }[]
  permission: PermissionRole
  userName: string
  onShowToast: (msg: string) => void
}) {
  const website = project.website || makeBlankWebsiteDoc(project.name)
  const activePage = website.pages.find((p) => p.id === website.activePageId) || website.pages[0]

  const [leftTab, setLeftTab] = useState<
    'add' | 'sections' | 'pages' | 'layers' | 'components' | 'assets' | 'templates' | 'navigation'
  >('add')
  const [rightTab, setRightTab] = useState<'design' | 'comments'>('design')
  const [breakpoint, setBreakpoint] = useState<WebBreakpoint>('desktop')
  const [customWidth, setCustomWidth] = useState<number>(1280)
  const [zoom, setZoom] = useState(0.85)
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(activePage?.nodes[0]?.id || null)
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const [history, setHistory] = useState<WebsiteDocument[]>([])
  const [redoHistory, setRedoHistory] = useState<WebsiteDocument[]>([])
  const [dragType, setDragType] = useState<WebElementType | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [savedIndicator, setSavedIndicator] = useState(true)

  const readOnly = permission !== 'edit'

  const selectedNode = useMemo(
    () => findNodeById(activePage?.nodes || [], selectedNodeId),
    [activePage, selectedNodeId]
  )

  const commitWebsite = (nextWebsite: WebsiteDocument, recordHistory = true) => {
    if (readOnly) {
      onShowToast('Read-only permission: editing disabled')
      return
    }
    if (recordHistory) {
      setHistory((prev) => [...prev.slice(-29), JSON.parse(JSON.stringify(website))])
      setRedoHistory([])
    }
    setSavedIndicator(false)
    onUpdateProject((p) => ({ ...p, website: nextWebsite }))
    onSyncWebsite(nextWebsite)
    window.setTimeout(() => setSavedIndicator(true), 450)
  }

  const updateActivePageNodes = (updater: (nodes: WebNode[]) => WebNode[]) => {
    const nextPages = website.pages.map((pg) =>
      pg.id === activePage.id ? { ...pg, nodes: updater(pg.nodes) } : pg
    )
    commitWebsite({ ...website, pages: nextPages })
  }

  const handleBreakpointChange = (bp: WebBreakpoint) => {
    setBreakpoint(bp)
    setCustomWidth(BREAKPOINT_WIDTHS[bp])
  }

  const insertElement = (type: WebElementType, targetIndex?: number, parentId?: string) => {
    const newNode = createWebNode(type)
    if (parentId) {
      updateActivePageNodes((nodes) =>
        updateNodeTree(nodes, parentId, (parent) => ({
          ...parent,
          children: [...(parent.children || []), newNode],
        }))
      )
    } else {
      updateActivePageNodes((nodes) => {
        const next = [...nodes]
        if (typeof targetIndex === 'number') next.splice(targetIndex, 0, newNode)
        else next.push(newNode)
        return next
      })
    }
    setSelectedNodeId(newNode.id)
    onShowToast(`Inserted ${newNode.name}`)
  }

  const updateSelectedNode = (updater: (n: WebNode) => WebNode) => {
    if (!selectedNode) return
    updateActivePageNodes((nodes) => updateNodeTree(nodes, selectedNode.id, updater))
  }

  const updateSelectedStyle = (patch: Partial<WebNodeStyles>) => {
    if (!selectedNode) return
    updateSelectedNode((node) => {
      if (breakpoint === 'desktop') {
        return { ...node, styles: { ...node.styles, ...patch } }
      }
      return {
        ...node,
        responsive: {
          ...(node.responsive || {}),
          [breakpoint]: {
            ...(node.responsive?.[breakpoint] || {}),
            ...patch,
          },
        },
      }
    })
  }

  const resetBreakpointOverrides = () => {
    if (!selectedNode || breakpoint === 'desktop') return
    updateSelectedNode((node) => {
      const nextResp = { ...(node.responsive || {}) }
      delete nextResp[breakpoint]
      return { ...node, responsive: nextResp }
    })
    onShowToast(`Reset ${breakpoint} overrides`)
  }

  const moveTopNode = (id: string, dir: -1 | 1) => {
    const idx = activePage.nodes.findIndex((n) => n.id === id)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= activePage.nodes.length) return
    const arr = [...activePage.nodes]
    const [item] = arr.splice(idx, 1)
    arr.splice(target, 0, item)
    updateActivePageNodes(() => arr)
  }

  const duplicateNode = (node: WebNode) => {
    const copy = cloneNodeWithIds(node)
    copy.name = `${node.name} Copy`
    const idx = activePage.nodes.findIndex((n) => n.id === node.id)
    updateActivePageNodes((nodes) => {
      if (idx >= 0) {
        const next = [...nodes]
        next.splice(idx + 1, 0, copy)
        return next
      }
      return [...nodes, copy]
    })
    setSelectedNodeId(copy.id)
  }

  const deleteNode = (id: string) => {
    updateActivePageNodes((nodes) => removeNodeFromTree(nodes, id))
    if (selectedNodeId === id) setSelectedNodeId(null)
  }

  const saveAsComponent = (node: WebNode) => {
    const def: WebComponentDef = {
      id: `comp-${makeId()}`,
      name: node.name,
      category: 'Saved Components',
      node: cloneNodeWithIds(node),
      createdAt: Date.now(),
    }
    onSaveComponent(def)
    onShowToast(`Saved "${node.name}" as Component`)
  }

  const addWebPage = () => {
    const id = `web-${makeId()}`
    const num = website.pages.length + 1
    const newPage: WebPage = {
      id,
      name: `Page ${num}`,
      slug: `/page-${num}`,
      title: `Page ${num} — ${project.name}`,
      nodes: [],
    }
    commitWebsite({ ...website, pages: [...website.pages, newPage], activePageId: id })
    setSelectedNodeId(null)
  }

  const undo = () => {
    if (!history.length) return
    const prev = history[history.length - 1]
    setRedoHistory((r) => [...r, JSON.parse(JSON.stringify(website))])
    setHistory((h) => h.slice(0, -1))
    onUpdateProject((p) => ({ ...p, website: prev }))
    onSyncWebsite(prev)
  }

  const redo = () => {
    if (!redoHistory.length) return
    const next = redoHistory[redoHistory.length - 1]
    setHistory((h) => [...h, JSON.parse(JSON.stringify(website))])
    setRedoHistory((r) => r.slice(0, -1))
    onUpdateProject((p) => ({ ...p, website: next }))
    onSyncWebsite(next)
  }

  const handleLinkClick = (node: WebNode, e: React.MouseEvent) => {
    if (!previewMode) return
    e.preventDefault()
    if (node.targetPageId) {
      const target = website.pages.find((p) => p.id === node.targetPageId)
      if (target) {
        commitWebsite({ ...website, activePageId: target.id }, false)
        onShowToast(`Navigated to ${target.name}`)
        return
      }
    }
    if (node.href?.startsWith('#')) {
      document.getElementById(`preview-anchor-${node.href.slice(1)}`)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleUploadImageForNode = (file?: File) => {
    if (!file || !selectedNode) return
    const reader = new FileReader()
    reader.onload = () => {
      updateSelectedNode((n) => ({ ...n, src: String(reader.result) }))
      onShowToast('Image updated')
    }
    reader.readAsDataURL(file)
  }

  const addWebComment = () => {
    if (!commentText.trim() || permission === 'view') return
    const mentions = (commentText.match(/@[\w-]+/g) || []).map((m) => m.slice(1))
    onSendComment({
      id: makeId(),
      author: userName,
      color: '#5267FF',
      text: commentText.trim(),
      mentions,
      targetId: selectedNode?.id,
      pageId: activePage.id,
      createdAt: Date.now(),
    })
    setCommentText('')
  }

  const effective = selectedNode ? getEffectiveStyles(selectedNode, breakpoint) : null
  const isTextNode = selectedNode && ['heading', 'paragraph', 'rich-text', 'text-block'].includes(selectedNode.type)
  const isImageNode = selectedNode?.type === 'image'
  const isButtonNode = selectedNode?.type === 'button'
  const isContainerNode =
    selectedNode && !isTextNode && !isImageNode && !isButtonNode

  const navBarNode = activePage.nodes.find((n) => n.type === 'navbar')
  const websiteTemplates = templates.filter((t) => t.type === 'website')

  const renderWebNode = (node: WebNode, index?: number) => {
    if (node.visible === false && previewMode) return null
    const s = getEffectiveStyles(node, breakpoint)
    const isSelected = !previewMode && selectedNodeId === node.id
    const isHiddenOnBp = s.display === 'none' || node.visible === false

    const inlineStyle: React.CSSProperties = {
      width: s.width,
      maxWidth: s.maxWidth,
      minWidth: s.minWidth,
      height: s.height,
      padding: s.padding,
      margin: s.margin,
      backgroundColor: s.backgroundColor,
      color: s.color,
      fontSize: s.fontSize,
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight as any,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      textAlign: s.textAlign,
      display: isHiddenOnBp && previewMode ? 'none' : s.display,
      flexDirection: s.flexDirection,
      justifyContent: s.justifyContent,
      alignItems: s.alignItems,
      gap: s.gap,
      borderStyle: s.borderWidth ? 'solid' : undefined,
      borderWidth: s.borderWidth,
      borderColor: s.borderColor,
      borderRadius: s.borderRadius,
      boxShadow: s.boxShadow,
      opacity: isHiddenOnBp && !previewMode ? 0.35 : s.opacity,
      position: 'relative',
    }

    return (
      <div
        key={node.id}
        id={node.anchorId ? `preview-anchor-${node.anchorId}` : undefined}
        className={`wb-node-wrap ${isSelected ? 'is-selected' : ''} ${dragOverId === node.id ? 'is-drop-target' : ''}`}
        style={inlineStyle}
        onClick={(e) => {
          if (previewMode) return
          e.stopPropagation()
          setSelectedNodeId(node.id)
        }}
        onDoubleClick={(e) => {
          if (previewMode) return
          e.stopPropagation()
          if (node.content !== undefined) setInlineEditId(node.id)
        }}
        onDragOver={(e) => {
          if (previewMode) return
          e.preventDefault()
          setDragOverId(node.id)
        }}
        onDragLeave={() => setDragOverId(null)}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOverId(null)
          if (!dragType) return
          if (['section', 'container', 'columns', 'grid', 'flex'].includes(node.type)) {
            insertElement(dragType, undefined, node.id)
          } else if (typeof index === 'number') {
            insertElement(dragType, index + 1)
          }
          setDragType(null)
        }}
      >
        {isSelected && (
          <div className="wb-node-bar" onClick={(e) => e.stopPropagation()}>
            <span>{node.name}</span>
            {typeof index === 'number' && (
              <>
                <button onClick={() => moveTopNode(node.id, -1)} title="Move up"><ArrowUp size={12} /></button>
                <button onClick={() => moveTopNode(node.id, 1)} title="Move down"><ArrowDown size={12} /></button>
              </>
            )}
            <button onClick={() => saveAsComponent(node)} title="Save as Component"><BookmarkPlus size={12} /></button>
            <button onClick={() => duplicateNode(node)} title="Duplicate"><Copy size={12} /></button>
            <button onClick={() => deleteNode(node.id)} title="Delete"><Trash2 size={12} /></button>
          </div>
        )}

        {inlineEditId === node.id ? (
          <textarea
            autoFocus
            className="wb-inline-editor"
            rows={2}
            value={node.content || ''}
            onChange={(e) =>
              updateActivePageNodes((nodes) =>
                updateNodeTree(nodes, node.id, (n) => ({ ...n, content: e.target.value }))
              )
            }
            onBlur={() => setInlineEditId(null)}
          />
        ) : (
          <>
            {node.type === 'navbar' && (
              <>
                <strong style={{ fontFamily: 'Space Grotesk', fontSize: 19 }}>{node.content || 'brand.'}</strong>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(node.items || []).map((it, idx) => (
                    <a key={idx} href={it.href || '#'} onClick={(e) => handleLinkClick(node, e)} style={{ fontSize: 13, fontWeight: 700 }}>
                      {it.title}
                    </a>
                  ))}
                </div>
                {node.buttonText && (
                  <a href={node.href || '#'} className="wb-btn-inline" onClick={(e) => handleLinkClick(node, e)}>
                    {node.buttonText}
                  </a>
                )}
              </>
            )}

            {node.type === 'hero' && (
              <div style={{ maxWidth: 740, margin: s.textAlign === 'center' ? '0 auto' : undefined }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: breakpoint === 'mobile' ? 30 : 46, lineHeight: 1.08, margin: '0 0 14px' }}>
                  {node.content}
                </h1>
                {node.subContent && <p style={{ fontSize: breakpoint === 'mobile' ? 15 : 18, opacity: 0.85, margin: '0 0 22px' }}>{node.subContent}</p>}
                {node.buttonText && (
                  <a href={node.href || '#'} className="wb-btn-inline primary" onClick={(e) => handleLinkClick(node, e)}>
                    {node.buttonText}
                  </a>
                )}
              </div>
            )}

            {(node.type === 'feature-cards' || node.type === 'testimonials' || node.type === 'pricing-cards') && (
              <div>
                {node.content && <h2 style={{ fontFamily: 'Space Grotesk', fontSize: breakpoint === 'mobile' ? 24 : 30, margin: '0 0 22px' }}>{node.content}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.gridColumns || (breakpoint === 'mobile' ? 1 : 3)}, minmax(0, 1fr))`, gap: s.gap || '18px' }}>
                  {(node.items || []).map((card, i) => (
                    <div key={i} className="wb-card-preview">
                      {card.subtitle && <span className="wb-card-kicker">{card.subtitle}</span>}
                      <h3>{card.title}</h3>
                      {card.body && <p>{card.body}</p>}
                      {card.meta && <span className="wb-btn-inline">{card.meta}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {node.type === 'faq' && (
              <div style={{ maxWidth: 740 }}>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 28, margin: '0 0 18px' }}>{node.content}</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {(node.items || []).map((q, i) => (
                    <div key={i} className="wb-faq-box">
                      <strong>{q.title}</strong>
                      <p>{q.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(node.type === 'form' || node.type === 'contact') && (
              <div style={{ maxWidth: 480 }}>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 28, margin: '0 0 8px' }}>{node.content}</h2>
                {node.subContent && <p style={{ margin: '0 0 16px', opacity: 0.9 }}>{node.subContent}</p>}
                <div style={{ display: 'grid', gap: 10 }}>
                  <input className="wb-form-input" placeholder="Your name" readOnly={!previewMode} />
                  <input className="wb-form-input" placeholder="you@studio.com" readOnly={!previewMode} />
                  <button className="wb-btn-inline" onClick={(e) => { e.preventDefault(); if (previewMode) onShowToast('Preview form submitted') }}>
                    {node.buttonText || 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {node.type === 'footer' && (
              <>
                <span style={{ fontSize: 13 }}>{node.content}</span>
                <div style={{ display: 'flex', gap: 18 }}>
                  {(node.items || []).map((it, idx) => (
                    <a key={idx} href={it.href || '#'} style={{ fontSize: 12, fontWeight: 600 }}>{it.title}</a>
                  ))}
                </div>
              </>
            )}

            {node.type === 'heading' && <h2 style={{ margin: 0 }}>{node.content}</h2>}
            {(node.type === 'paragraph' || node.type === 'rich-text' || node.type === 'text-block') && (
              <p style={{ margin: 0 }}>{node.content}</p>
            )}
            {node.type === 'button' && (
              <a href={node.href || '#'} onClick={(e) => handleLinkClick(node, e)} style={{ fontWeight: 700, textDecoration: 'none' }}>
                {node.buttonText || 'Button'}
              </a>
            )}
            {node.type === 'image' && (
              <img
                src={node.src || '/assets/branding/characters/character-website-builder.png'}
                alt={node.alt || node.name}
                style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'contain', objectPosition: s.objectPosition || 'center center', display: 'block' }}
              />
            )}
            {node.type === 'video' && <span>{node.content || 'Video Embed'}</span>}
            {node.type === 'icon' && <span>{node.content || '✦'}</span>}
            {['section', 'container', 'columns', 'grid', 'flex'].includes(node.type) && (
              <div
                style={{
                  display: s.gridColumns ? 'grid' : 'flex',
                  gridTemplateColumns: s.gridColumns ? `repeat(${s.gridColumns}, minmax(0, 1fr))` : undefined,
                  flexDirection: s.flexDirection || 'column',
                  justifyContent: s.justifyContent,
                  alignItems: s.alignItems,
                  gap: s.gap || '16px',
                  width: '100%',
                }}
              >
                {node.children?.length
                  ? node.children.map((ch) => renderWebNode(ch))
                  : <div className="wb-empty-drop">Drop elements into {node.name}</div>}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="app-shell">
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
            aria-label="Website name"
          />
          <div className="save-state">
            <span className={`save-dot ${savedIndicator ? 'is-saved' : ''}`} />
            {savedIndicator ? 'Saved' : 'Saving…'}
          </div>
        </div>

        <select
          className="dash-select"
          value={activePage.id}
          onChange={(e) => {
            commitWebsite({ ...website, activePageId: e.target.value }, false)
            setSelectedNodeId(null)
          }}
          aria-label="Website page selector"
        >
          {website.pages.map((pg) => (
            <option key={pg.id} value={pg.id}>{pg.name} ({pg.slug})</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 2 }}>
          <button className="icon-button small" onClick={undo} disabled={!history.length} title="Undo"><Undo2 size={15} /></button>
          <button className="icon-button small" onClick={redo} disabled={!redoHistory.length} title="Redo"><Redo2 size={15} /></button>
        </div>

        <div className="mode-switch" style={{ height: 34 }}>
          <button className={breakpoint === 'desktop' ? 'mode-active' : ''} onClick={() => handleBreakpointChange('desktop')} title="Desktop 1280px">
            <Monitor size={14} /> Desktop
          </button>
          <button className={breakpoint === 'tablet' ? 'mode-active' : ''} onClick={() => handleBreakpointChange('tablet')} title="Tablet 768px">
            <Tablet size={14} /> Tablet
          </button>
          <button className={breakpoint === 'mobile' ? 'mode-active' : ''} onClick={() => handleBreakpointChange('mobile')} title="Mobile 390px">
            <Smartphone size={14} /> Mobile
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="icon-button small" onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))} title="Zoom out"><ZoomOut size={14} /></button>
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, minWidth: 36, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button className="icon-button small" onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} title="Zoom in"><ZoomIn size={14} /></button>
        </div>

        <div className="top-spacer" />

        <button className="secondary-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenTemplates}>
          <LayoutTemplate size={14} /> Templates
        </button>
        <button
          className="secondary-button"
          style={{ height: 34, padding: '0 10px', background: previewMode ? '#D8F878' : undefined }}
          onClick={() => setPreviewMode(!previewMode)}
        >
          <Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
        </button>

        <div className="presence-stack" title={`${Math.max(1, members.length)} connected`}>
          <span className="avatar avatar-you">{userName.slice(0, 1).toUpperCase()}</span>
          {members.slice(0, 2).map((m) => (
            <span key={m.id} className="avatar" style={{ background: m.color }}>{m.name.slice(0, 1).toUpperCase()}</span>
          ))}
        </div>

        <button className="share-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenShare}>
          <Share2 size={14} /> Share
        </button>
        <button className="export-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenExport}>
          <Download size={14} /> Export
        </button>
        <button className="primary-button" style={{ height: 34, padding: '0 10px' }} onClick={onOpenPublish}>
          <Globe size={14} /> Publish
        </button>
      </header>

      <main className="editor-layout">
        {/* Left Sidebar (8 dedicated tabs) */}
        <aside className="left-panel">
          <div className="left-tabs-grid">
            {[
              { id: 'add', label: 'Add', icon: Plus },
              { id: 'sections', label: 'Sections', icon: LayoutTemplate },
              { id: 'pages', label: 'Pages', icon: FileText },
              { id: 'layers', label: 'Layers', icon: Layers },
              { id: 'components', label: 'Comp.', icon: Component },
              { id: 'assets', label: 'Assets', icon: Palette },
              { id: 'templates', label: 'Templates', icon: Globe },
              { id: 'navigation', label: 'Nav', icon: Navigation },
            ].map((t) => (
              <button
                key={t.id}
                className={leftTab === t.id ? 'tab-active' : ''}
                onClick={() => setLeftTab(t.id as any)}
              >
                <t.icon size={14} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="left-content">
            {leftTab === 'add' &&
              ELEMENT_CATALOG.map((cat) => (
                <div className="tool-section" key={cat.group}>
                  <div className="section-toggle static">{cat.group}</div>
                  <div className="tool-grid">
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        className="tool-tile"
                        draggable
                        onDragStart={() => setDragType(item.type)}
                        onClick={() => insertElement(item.type)}
                      >
                        <item.icon size={15} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {leftTab === 'sections' && (
              <div style={{ display: 'grid', gap: 8 }}>
                {(['navbar', 'hero', 'feature-cards', 'testimonials', 'pricing-cards', 'faq', 'contact', 'footer'] as WebElementType[]).map((sec) => (
                  <button
                    key={sec}
                    className="quick-insert"
                    style={{ border: '1.5px solid #DEDAD0', padding: '10px 12px', background: '#FFFEFA' }}
                    onClick={() => insertElement(sec)}
                  >
                    <LayoutTemplate size={15} />
                    <div><strong style={{ textTransform: 'capitalize' }}>{sec.replace('-', ' ')}</strong></div>
                    <Plus size={14} />
                  </button>
                ))}
              </div>
            )}

            {leftTab === 'pages' && (
              <div>
                <div className="pages-head">
                  <span>{website.pages.length} Pages</span>
                  <button className="new-page" onClick={addWebPage}><Plus size={12} /> New</button>
                </div>
                {website.pages.map((pg) => (
                  <div
                    key={pg.id}
                    className={`page-card ${activePage.id === pg.id ? 'page-active' : ''}`}
                    onClick={() => commitWebsite({ ...website, activePageId: pg.id }, false)}
                  >
                    <div className="page-card-meta">
                      <div>
                        <strong>{pg.name}</strong>
                        <div style={{ fontSize: 9, color: '#6E6A62', fontFamily: 'DM Mono' }}>{pg.slug}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'layers' && (
              <div className="layer-list">
                {activePage.nodes.length === 0 ? (
                  <div className="empty-selection" style={{ margin: 0 }}>
                    <strong>Empty Page</strong>
                    <span>Add elements or sections to see the DOM hierarchy.</span>
                  </div>
                ) : (
                  activePage.nodes.map((node, i) => (
                    <div key={node.id} className={`layer-row ${selectedNodeId === node.id ? 'layer-active' : ''}`}>
                      <button className="layer-main" onClick={() => setSelectedNodeId(node.id)}>
                        <span className="layer-type-icon"><Layers size={12} /></span>
                        <span className="layer-name">{node.name}</span>
                      </button>
                      <button className="layer-visibility" onClick={() => moveTopNode(node.id, -1)} disabled={i === 0}><ArrowUp size={12} /></button>
                      <button className="layer-visibility" onClick={() => moveTopNode(node.id, 1)} disabled={i === activePage.nodes.length - 1}><ArrowDown size={12} /></button>
                      <button
                        className="layer-visibility"
                        onClick={() =>
                          updateActivePageNodes((nodes) =>
                            updateNodeTree(nodes, node.id, (n) => ({ ...n, visible: n.visible === false }))
                          )
                        }
                      >
                        {node.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {leftTab === 'components' && (
              <div>
                {webComponents.length === 0 ? (
                  <div className="empty-selection" style={{ margin: 0 }}>
                    <strong>No Saved Components</strong>
                    <span>Select a section or element and click the Bookmark icon to save it.</span>
                  </div>
                ) : (
                  <div className="layer-list">
                    {webComponents.map((comp) => (
                      <div key={comp.id} className="layer-row">
                        <button
                          className="layer-main"
                          onClick={() => {
                            const inst = cloneNodeWithIds(comp.node)
                            updateActivePageNodes((nodes) => [...nodes, inst])
                            setSelectedNodeId(inst.id)
                          }}
                        >
                          <span className="layer-type-icon"><Component size={13} /></span>
                          <span className="layer-name">{comp.name}</span>
                        </button>
                        <button className="layer-visibility" onClick={() => onDeleteComponent(comp.id)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {leftTab === 'assets' && (
              <div>
                <div className="asset-category-title">BRAND COLORS</div>
                <div className="asset-colors">
                  {[...brandKit.primaryColors, ...brandKit.secondaryColors].map((c) => (
                    <button
                      key={c}
                      style={{ background: c }}
                      onClick={() => (selectedNode ? updateSelectedStyle({ backgroundColor: c }) : onShowToast('Select an element first'))}
                    />
                  ))}
                </div>
                <div className="asset-category-title" style={{ marginTop: 16 }}>MEDIA ASSETS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {assets.map((a) => (
                    <button
                      key={a.id}
                      className="asset-card"
                      style={{ height: 74, padding: 6 }}
                      onClick={() => {
                        const img = createWebNode('image')
                        img.src = a.dataUrl
                        img.name = a.name
                        updateActivePageNodes((nodes) => [...nodes, img])
                        setSelectedNodeId(img.id)
                      }}
                    >
                      <img src={a.dataUrl} alt={a.name} style={{ width: '100%', height: 42, objectFit: 'contain' }} />
                      <small style={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'templates' && (
              <div style={{ display: 'grid', gap: 10 }}>
                <button className="primary-button full-button" onClick={onOpenTemplates}>
                  <LayoutTemplate size={14} /> Open Full Website Library
                </button>
                {websiteTemplates.map((tpl) => (
                  <div key={tpl.id} className="page-card" onClick={() => onApplyWebsiteTemplate(tpl)}>
                    <div className="template-cat">{tpl.category}</div>
                    <strong style={{ fontSize: 12 }}>{tpl.title}</strong>
                    <div style={{ fontSize: 10, color: '#6E6A62', marginTop: 4 }}>{tpl.dimensions}</div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'navigation' && (
              <div>
                <div className="asset-category-title">SITE NAVIGATION LINKS</div>
                {!navBarNode ? (
                  <button className="primary-button full-button" onClick={() => insertElement('navbar', 0)}>
                    <Plus size={14} /> Insert Navigation Bar
                  </button>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(navBarNode.items || []).map((item, idx) => (
                      <div key={idx} className="field-row" style={{ marginTop: 0 }}>
                        <label className="field full">
                          <span>Label</span>
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const nextItems = [...(navBarNode.items || [])]
                              nextItems[idx] = { ...item, title: e.target.value }
                              updateActivePageNodes((nodes) =>
                                updateNodeTree(nodes, navBarNode.id, (n) => ({ ...n, items: nextItems }))
                              )
                            }}
                          />
                        </label>
                        <label className="field full">
                          <span>Target</span>
                          <input
                            value={item.href || ''}
                            onChange={(e) => {
                              const nextItems = [...(navBarNode.items || [])]
                              nextItems[idx] = { ...item, href: e.target.value }
                              updateActivePageNodes((nodes) =>
                                updateNodeTree(nodes, navBarNode.id, (n) => ({ ...n, items: nextItems }))
                              )
                            }}
                          />
                        </label>
                      </div>
                    ))}
                    <button
                      className="secondary-button full-button"
                      onClick={() => {
                        const nextItems = [...(navBarNode.items || []), { title: 'New Link', href: '#hero' }]
                        updateActivePageNodes((nodes) =>
                          updateNodeTree(nodes, navBarNode.id, (n) => ({ ...n, items: nextItems }))
                        )
                      }}
                    >
                      <Plus size={14} /> Add Nav Item
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Center Responsive Canvas */}
        <section className="canvas-column">
          <div
            className="wb-stage-scroll"
            onClick={() => setSelectedNodeId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragType) {
                insertElement(dragType)
                setDragType(null)
              }
            }}
          >
            <div
              className="wb-viewport-frame"
              style={{
                width: customWidth,
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              <div className="wb-browser-chrome">
                <div className="wb-dots"><span /><span /><span /></div>
                <div className="wb-url-bar">
                  https://canvas-studio.site{activePage.slug} — {breakpoint.toUpperCase()} ({customWidth}px)
                </div>
              </div>
              <div className="wb-page-canvas">
                {activePage.nodes.length === 0 ? (
                  <div className="wb-clean-empty">
                    <div style={{ marginBottom: 14 }}>
                      <EmptyStateVisual variant="empty-website" maxWidth={250} alt="Clean empty website canvas" />
                    </div>
                    <div className="modal-eyebrow">CLEAN WEBSITE CANVAS</div>
                    <h3>Start building {activePage.name}</h3>
                    <p>Add a Section from the left sidebar or start from one of 10 responsive Website Templates.</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                      <button className="primary-button" onClick={() => insertElement('hero')}>
                        <Plus size={16} /> Add Hero Section
                      </button>
                      <button className="secondary-button" onClick={onOpenTemplates}>
                        <LayoutTemplate size={16} /> Browse Website Templates
                      </button>
                    </div>
                  </div>
                ) : (
                  activePage.nodes.map((node, idx) => renderWebNode(node, idx))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Right Inspector */}
        <aside className="right-panel">
          <div className="right-panel-head">
            <div>
              <div className="panel-eyebrow">CONTEXTUAL INSPECTOR</div>
              <h2>{selectedNode ? selectedNode.name : 'Page Settings'}</h2>
            </div>
          </div>

          <div className="right-tabs">
            <button className={rightTab === 'design' ? 'right-tab-active' : ''} onClick={() => setRightTab('design')}>
              Inspector
            </button>
            <button className={rightTab === 'comments' ? 'right-tab-active' : ''} onClick={() => setRightTab('comments')}>
              Comments <span className="tab-count">{project.comments.length}</span>
            </button>
          </div>

          {rightTab === 'design' && selectedNode && effective ? (
            <div className="inspector-scroll">
              <div className="inspector-section" style={{ background: breakpoint === 'desktop' ? '#F7F5EF' : '#EEF0FF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 11 }}>
                    {breakpoint === 'desktop' ? 'Desktop (Base Styles)' : `${breakpoint.toUpperCase()} Override`}
                  </strong>
                  {breakpoint !== 'desktop' && (
                    <button className="secondary-button" style={{ height: 26, padding: '0 8px', fontSize: 10 }} onClick={resetBreakpointOverrides}>
                      <RotateCcw size={11} /> Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Contextual: TEXT */}
              {isTextNode && (
                <div className="inspector-section">
                  <div className="inspector-title">TEXT PROPERTIES</div>
                  <label className="field stacked">
                    <span>Content</span>
                    <textarea rows={3} value={selectedNode.content || ''} onChange={(e) => updateSelectedNode((n) => ({ ...n, content: e.target.value }))} />
                  </label>
                  <div className="field-row">
                    <label className="field full">
                      <span>Font</span>
                      <select value={effective.fontFamily || 'DM Sans'} onChange={(e) => updateSelectedStyle({ fontFamily: e.target.value })}>
                        {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </label>
                    <label className="field full">
                      <span>Weight</span>
                      <select value={effective.fontWeight || '400'} onChange={(e) => updateSelectedStyle({ fontWeight: e.target.value })}>
                        <option value="400">400 Regular</option>
                        <option value="500">500 Medium</option>
                        <option value="600">600 SemiBold</option>
                        <option value="700">700 Bold</option>
                      </select>
                    </label>
                  </div>
                  <div className="field-grid four" style={{ marginTop: 8 }}>
                    <label className="field"><span>Size</span><input value={effective.fontSize || '16px'} onChange={(e) => updateSelectedStyle({ fontSize: e.target.value })} /></label>
                    <label className="field"><span>Line H</span><input value={effective.lineHeight || '1.5'} onChange={(e) => updateSelectedStyle({ lineHeight: e.target.value })} /></label>
                    <label className="field"><span>Track</span><input value={effective.letterSpacing || '0px'} onChange={(e) => updateSelectedStyle({ letterSpacing: e.target.value })} /></label>
                    <label className="field">
                      <span>Align</span>
                      <select value={effective.textAlign || 'left'} onChange={(e) => updateSelectedStyle({ textAlign: e.target.value as any })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                  </div>
                  <div className="color-field" style={{ marginTop: 10 }}>
                    <span>Color</span>
                    <div className="color-input">
                      <input type="color" value={effective.color || '#171717'} onChange={(e) => updateSelectedStyle({ color: e.target.value })} />
                      <input value={effective.color || '#171717'} onChange={(e) => updateSelectedStyle({ color: e.target.value })} />
                    </div>
                  </div>
                  <div className="field-grid four">
                    <label className="field"><span>Width</span><input value={effective.width || 'auto'} onChange={(e) => updateSelectedStyle({ width: e.target.value })} /></label>
                    <label className="field"><span>Height</span><input value={effective.height || 'auto'} onChange={(e) => updateSelectedStyle({ height: e.target.value })} /></label>
                    <label className="field"><span>Pad</span><input value={effective.padding || '12px'} onChange={(e) => updateSelectedStyle({ padding: e.target.value })} /></label>
                    <label className="field"><span>Marg</span><input value={effective.margin || '0px'} onChange={(e) => updateSelectedStyle({ margin: e.target.value })} /></label>
                  </div>
                </div>
              )}

              {/* Contextual: IMAGE */}
              {isImageNode && (
                <div className="inspector-section">
                  <div className="inspector-title">IMAGE PROPERTIES</div>
                  <label className="field stacked">
                    <span>Image source URL</span>
                    <input value={selectedNode.src || ''} onChange={(e) => updateSelectedNode((n) => ({ ...n, src: e.target.value }))} />
                  </label>
                  <button className="secondary-button full-button" style={{ marginBottom: 10 }} onClick={() => document.getElementById('wb-node-img')?.click()}>
                    <Upload size={14} /> Upload Image
                  </button>
                  <input id="wb-node-img" type="file" accept="image/*,.svg" hidden onChange={(e) => handleUploadImageForNode(e.target.files?.[0])} />
                  <div className="field-row">
                    <label className="field full">
                      <span>Fit</span>
                      <select value={effective.objectFit || 'contain'} onChange={(e) => updateSelectedStyle({ objectFit: e.target.value as any })}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </label>
                    <label className="field full">
                      <span>Position</span>
                      <select value={effective.objectPosition || 'center center'} onChange={(e) => updateSelectedStyle({ objectPosition: e.target.value })}>
                        <option value="center center">Center</option>
                        <option value="top center">Top</option>
                        <option value="bottom center">Bottom</option>
                        <option value="left center">Left</option>
                        <option value="right center">Right</option>
                      </select>
                    </label>
                  </div>
                  <div className="field-grid four" style={{ marginTop: 8 }}>
                    <label className="field"><span>Width</span><input value={effective.width || '100%'} onChange={(e) => updateSelectedStyle({ width: e.target.value })} /></label>
                    <label className="field"><span>Height</span><input value={effective.height || '320px'} onChange={(e) => updateSelectedStyle({ height: e.target.value })} /></label>
                    <label className="field"><span>Radius</span><input value={effective.borderRadius || '10px'} onChange={(e) => updateSelectedStyle({ borderRadius: e.target.value })} /></label>
                    <label className="field"><span>Border</span><input value={effective.borderWidth || '2px'} onChange={(e) => updateSelectedStyle({ borderWidth: e.target.value })} /></label>
                  </div>
                  <label className="range-field">
                    <span>Opacity <strong>{Math.round((effective.opacity ?? 1) * 100)}%</strong></span>
                    <input type="range" min={10} max={100} value={Math.round((effective.opacity ?? 1) * 100)} onChange={(e) => updateSelectedStyle({ opacity: Number(e.target.value) / 100 })} />
                  </label>
                </div>
              )}

              {/* Contextual: BUTTON */}
              {isButtonNode && (
                <div className="inspector-section">
                  <div className="inspector-title">BUTTON PROPERTIES</div>
                  <label className="field stacked">
                    <span>Button Label</span>
                    <input value={selectedNode.buttonText || ''} onChange={(e) => updateSelectedNode((n) => ({ ...n, buttonText: e.target.value }))} />
                  </label>
                  <label className="field stacked">
                    <span>Link URL / #section</span>
                    <input value={selectedNode.href || ''} onChange={(e) => updateSelectedNode((n) => ({ ...n, href: e.target.value }))} />
                  </label>
                  <div className="color-field">
                    <span>Background</span>
                    <div className="color-input">
                      <input type="color" value={effective.backgroundColor || '#D8F878'} onChange={(e) => updateSelectedStyle({ backgroundColor: e.target.value })} />
                      <input value={effective.backgroundColor || '#D8F878'} onChange={(e) => updateSelectedStyle({ backgroundColor: e.target.value })} />
                    </div>
                  </div>
                  <div className="color-field">
                    <span>Text Color</span>
                    <div className="color-input">
                      <input type="color" value={effective.color || '#171717'} onChange={(e) => updateSelectedStyle({ color: e.target.value })} />
                      <input value={effective.color || '#171717'} onChange={(e) => updateSelectedStyle({ color: e.target.value })} />
                    </div>
                  </div>
                  <div className="color-field">
                    <span>Hover BG</span>
                    <div className="color-input">
                      <input type="color" value={effective.hoverBackgroundColor || '#5267FF'} onChange={(e) => updateSelectedStyle({ hoverBackgroundColor: e.target.value })} />
                      <input value={effective.hoverBackgroundColor || '#5267FF'} onChange={(e) => updateSelectedStyle({ hoverBackgroundColor: e.target.value })} />
                    </div>
                  </div>
                  <div className="color-field">
                    <span>Hover Text</span>
                    <div className="color-input">
                      <input type="color" value={effective.hoverColor || '#FFFEFA'} onChange={(e) => updateSelectedStyle({ hoverColor: e.target.value })} />
                      <input value={effective.hoverColor || '#FFFEFA'} onChange={(e) => updateSelectedStyle({ hoverColor: e.target.value })} />
                    </div>
                  </div>
                  <div className="field-grid four">
                    <label className="field"><span>Pad</span><input value={effective.padding || '12px 20px'} onChange={(e) => updateSelectedStyle({ padding: e.target.value })} /></label>
                    <label className="field"><span>Radius</span><input value={effective.borderRadius || '6px'} onChange={(e) => updateSelectedStyle({ borderRadius: e.target.value })} /></label>
                    <label className="field"><span>Border</span><input value={effective.borderWidth || '2px'} onChange={(e) => updateSelectedStyle({ borderWidth: e.target.value })} /></label>
                    <label className="field"><span>Size</span><input value={effective.fontSize || '14px'} onChange={(e) => updateSelectedStyle({ fontSize: e.target.value })} /></label>
                  </div>
                </div>
              )}

              {/* Contextual: CONTAINER / SECTION */}
              {isContainerNode && (
                <div className="inspector-section">
                  <div className="inspector-title">CONTAINER & SECTION</div>
                  {selectedNode.content !== undefined && (
                    <label className="field stacked">
                      <span>Heading / Title</span>
                      <textarea rows={2} value={selectedNode.content || ''} onChange={(e) => updateSelectedNode((n) => ({ ...n, content: e.target.value }))} />
                    </label>
                  )}
                  <div className="field-grid four">
                    <label className="field"><span>Width</span><input value={effective.width || '100%'} onChange={(e) => updateSelectedStyle({ width: e.target.value })} /></label>
                    <label className="field"><span>Max W</span><input value={effective.maxWidth || 'none'} onChange={(e) => updateSelectedStyle({ maxWidth: e.target.value })} /></label>
                    <label className="field"><span>Min W</span><input value={effective.minWidth || '0px'} onChange={(e) => updateSelectedStyle({ minWidth: e.target.value })} /></label>
                    <label className="field"><span>Height</span><input value={effective.height || 'auto'} onChange={(e) => updateSelectedStyle({ height: e.target.value })} /></label>
                  </div>
                  <div className="field-row">
                    <label className="field full">
                      <span>Direction</span>
                      <select value={effective.flexDirection || 'column'} onChange={(e) => updateSelectedStyle({ flexDirection: e.target.value as any })}>
                        <option value="row">Row</option>
                        <option value="column">Column</option>
                      </select>
                    </label>
                    <label className="field full"><span>Gap</span><input value={effective.gap || '16px'} onChange={(e) => updateSelectedStyle({ gap: e.target.value })} /></label>
                  </div>
                  <div className="field-row">
                    <label className="field full">
                      <span>Align</span>
                      <select value={effective.alignItems || 'stretch'} onChange={(e) => updateSelectedStyle({ alignItems: e.target.value as any })}>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </label>
                    <label className="field full">
                      <span>Justify</span>
                      <select value={effective.justifyContent || 'flex-start'} onChange={(e) => updateSelectedStyle({ justifyContent: e.target.value as any })}>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space Between</option>
                      </select>
                    </label>
                  </div>
                  <div className="field-row">
                    <label className="field full"><span>Padding</span><input value={effective.padding || '32px'} onChange={(e) => updateSelectedStyle({ padding: e.target.value })} /></label>
                    <label className="field full"><span>Margin</span><input value={effective.margin || '0px'} onChange={(e) => updateSelectedStyle({ margin: e.target.value })} /></label>
                  </div>
                  <div className="color-field" style={{ marginTop: 10 }}>
                    <span>Background</span>
                    <div className="color-input">
                      <input type="color" value={effective.backgroundColor || '#FFFEFA'} onChange={(e) => updateSelectedStyle({ backgroundColor: e.target.value })} />
                      <input value={effective.backgroundColor || ''} onChange={(e) => updateSelectedStyle({ backgroundColor: e.target.value })} />
                    </div>
                  </div>
                  <div className="field-grid four">
                    <label className="field"><span>Border</span><input value={effective.borderWidth || '0px'} onChange={(e) => updateSelectedStyle({ borderWidth: e.target.value })} /></label>
                    <label className="field"><span>Radius</span><input value={effective.borderRadius || '0px'} onChange={(e) => updateSelectedStyle({ borderRadius: e.target.value })} /></label>
                    <label className="field" style={{ gridColumn: 'span 2' }}><span>Shadow</span><input value={effective.boxShadow || 'none'} onChange={(e) => updateSelectedStyle({ boxShadow: e.target.value })} /></label>
                  </div>
                </div>
              )}
            </div>
          ) : rightTab === 'design' ? (
            <div className="inspector-scroll">
              <div className="inspector-section">
                <div className="inspector-title">PAGE SETTINGS</div>
                <label className="field stacked">
                  <span>Page Name</span>
                  <input value={activePage.name} onChange={(e) => {
                    const pages = website.pages.map((p) => p.id === activePage.id ? { ...p, name: e.target.value } : p)
                    commitWebsite({ ...website, pages }, false)
                  }} />
                </label>
                <label className="field stacked">
                  <span>Route Slug</span>
                  <input value={activePage.slug} onChange={(e) => {
                    const pages = website.pages.map((p) => p.id === activePage.id ? { ...p, slug: e.target.value } : p)
                    commitWebsite({ ...website, pages }, false)
                  }} />
                </label>
              </div>
            </div>
          ) : (
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
                  <span>Visible to team</span>
                  <button onClick={addWebComment} disabled={!commentText.trim() || permission === 'view'}><Send size={14} /></button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
