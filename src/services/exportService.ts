import type {
  Page,
  ProjectDocument,
  WebNode,
  WebNodeStyles,
  WebPage,
  WebsiteDocument,
} from '../types/platform'

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1200)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stylesToCssRules(s: Partial<WebNodeStyles>): string {
  const rules: string[] = []
  if (s.width) rules.push(`width:${s.width}`)
  if (s.maxWidth) rules.push(`max-width:${s.maxWidth}`)
  if (s.minWidth) rules.push(`min-width:${s.minWidth}`)
  if (s.height) rules.push(`height:${s.height}`)
  if (s.padding) rules.push(`padding:${s.padding}`)
  if (s.margin) rules.push(`margin:${s.margin}`)
  if (s.backgroundColor) rules.push(`background-color:${s.backgroundColor}`)
  if (s.color) rules.push(`color:${s.color}`)
  if (s.fontSize) rules.push(`font-size:${s.fontSize}`)
  if (s.fontFamily) rules.push(`font-family:${s.fontFamily},sans-serif`)
  if (s.fontWeight) rules.push(`font-weight:${s.fontWeight}`)
  if (s.lineHeight) rules.push(`line-height:${s.lineHeight}`)
  if (s.letterSpacing) rules.push(`letter-spacing:${s.letterSpacing}`)
  if (s.textAlign) rules.push(`text-align:${s.textAlign}`)
  if (s.display) rules.push(`display:${s.display}`)
  if (s.flexDirection) rules.push(`flex-direction:${s.flexDirection}`)
  if (s.justifyContent) rules.push(`justify-content:${s.justifyContent}`)
  if (s.alignItems) rules.push(`align-items:${s.alignItems}`)
  if (s.gridColumns) {
    rules.push(`display:grid`)
    rules.push(`grid-template-columns:repeat(${s.gridColumns},minmax(0,1fr))`)
  }
  if (s.gap) rules.push(`gap:${s.gap}`)
  if (s.borderWidth) rules.push(`border-style:solid;border-width:${s.borderWidth}`)
  if (s.borderColor) rules.push(`border-color:${s.borderColor}`)
  if (s.borderRadius) rules.push(`border-radius:${s.borderRadius}`)
  if (s.boxShadow) rules.push(`box-shadow:${s.boxShadow}`)
  if (typeof s.opacity === 'number') rules.push(`opacity:${s.opacity}`)
  if (s.objectFit) rules.push(`object-fit:${s.objectFit}`)
  if (s.objectPosition) rules.push(`object-position:${s.objectPosition}`)
  return rules.join(';')
}

function renderNodeHtml(node: WebNode): string {
  if (node.visible === false) return ''
  const cls = `cs-node cs-node-${node.id}`
  const anchorAttr = node.anchorId ? ` id="${escapeHtml(node.anchorId)}"` : ''

  switch (node.type) {
    case 'navbar': {
      const links = (node.items || [])
        .map((item) => `<a href="${escapeHtml(item.href || '#')}">${escapeHtml(item.title)}</a>`)
        .join('')
      return `<header class="${cls}"${anchorAttr}>
        <strong class="cs-brand">${escapeHtml(node.content || 'canvas studio')}</strong>
        <nav class="cs-nav-links">${links}</nav>
        ${node.buttonText ? `<a class="cs-btn" href="${escapeHtml(node.href || '#')}">${escapeHtml(node.buttonText)}</a>` : ''}
      </header>`
    }
    case 'hero':
      return `<section class="${cls}"${anchorAttr}>
        <div class="cs-hero-inner">
          <h1>${escapeHtml(node.content || '')}</h1>
          ${node.subContent ? `<p>${escapeHtml(node.subContent)}</p>` : ''}
          ${node.buttonText ? `<a class="cs-btn cs-btn-primary" href="${escapeHtml(node.href || '#')}">${escapeHtml(node.buttonText)}</a>` : ''}
        </div>
      </section>`
    case 'feature-cards':
    case 'testimonials':
    case 'pricing-cards': {
      const cards = (node.items || [])
        .map(
          (item) => `<article class="cs-card">
            ${item.subtitle ? `<span class="cs-kicker">${escapeHtml(item.subtitle)}</span>` : ''}
            <h3>${escapeHtml(item.title)}</h3>
            ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}
            ${item.meta ? `<a class="cs-btn" href="#">${escapeHtml(item.meta)}</a>` : ''}
          </article>`
        )
        .join('')
      return `<section class="${cls} cs-section-block"${anchorAttr}>
        ${node.content ? `<h2 class="cs-section-title">${escapeHtml(node.content)}</h2>` : ''}
        <div class="cs-cards-grid cs-grid-${node.id}">${cards}</div>
      </section>`
    }
    case 'faq': {
      const items = (node.items || [])
        .map(
          (item) => `<details class="cs-faq-item">
            <summary>${escapeHtml(item.title)}</summary>
            <p>${escapeHtml(item.body || '')}</p>
          </details>`
        )
        .join('')
      return `<section class="${cls}"${anchorAttr}>
        <h2>${escapeHtml(node.content || 'FAQ')}</h2>
        <div class="cs-faq-list">${items}</div>
      </section>`
    }
    case 'form':
    case 'contact':
      return `<section class="${cls}"${anchorAttr}>
        <h2>${escapeHtml(node.content || 'Contact Us')}</h2>
        ${node.subContent ? `<p>${escapeHtml(node.subContent)}</p>` : ''}
        <form class="cs-form" onsubmit="event.preventDefault();alert('Form preview submitted.')">
          <input type="text" placeholder="Your name" required />
          <input type="email" placeholder="you@company.com" required />
          <textarea rows="3" placeholder="Tell us about your project..."></textarea>
          <button type="submit" class="cs-btn">${escapeHtml(node.buttonText || 'Submit')}</button>
        </form>
      </section>`
    case 'footer': {
      const links = (node.items || [])
        .map((item) => `<a href="${escapeHtml(item.href || '#')}">${escapeHtml(item.title)}</a>`)
        .join('')
      return `<footer class="${cls}"${anchorAttr}>
        <span>${escapeHtml(node.content || '')}</span>
        <div class="cs-footer-links">${links}</div>
      </footer>`
    }
    case 'heading':
      return `<h2 class="${cls}"${anchorAttr}>${escapeHtml(node.content || '')}</h2>`
    case 'paragraph':
    case 'rich-text':
    case 'text-block':
      return `<p class="${cls}"${anchorAttr}>${escapeHtml(node.content || '')}</p>`
    case 'button':
      return `<a class="${cls} cs-btn" href="${escapeHtml(node.href || '#')}"${anchorAttr}>${escapeHtml(node.buttonText || 'Button')}</a>`
    case 'image':
      return `<img class="${cls}" src="${escapeHtml(node.src || '')}" alt="${escapeHtml(node.alt || node.name)}"${anchorAttr} />`
    case 'video':
      return `<div class="${cls}"${anchorAttr}>${node.src ? `<iframe src="${escapeHtml(node.src)}" title="${escapeHtml(node.name)}" allowfullscreen></iframe>` : `<span>${escapeHtml(node.content || 'Video Embed')}</span>`}</div>`
    case 'divider':
      return `<hr class="${cls}" />`
    case 'spacer':
      return `<div class="${cls}" aria-hidden="true"></div>`
    case 'social-links':
      return `<div class="${cls}"${anchorAttr}>${(node.items || []).map((i) => `<a href="${escapeHtml(i.href || '#')}">${escapeHtml(i.title)}</a>`).join('')}</div>`
    default: {
      const childrenHtml = (node.children || []).map(renderNodeHtml).join('\n')
      return `<div class="${cls}"${anchorAttr}>${node.content && !node.children?.length ? escapeHtml(node.content) : ''}${childrenHtml}</div>`
    }
  }
}

function collectCssForNodes(nodes: WebNode[]): {
  base: string[]
  laptop: string[]
  tablet: string[]
  mobile: string[]
} {
  const out = { base: [] as string[], laptop: [] as string[], tablet: [] as string[], mobile: [] as string[] }
  const walk = (list: WebNode[]) => {
    for (const node of list) {
      const baseRules = stylesToCssRules(node.styles)
      if (baseRules) out.base.push(`.cs-node-${node.id}{${baseRules}}`)
      if (node.styles.hoverBackgroundColor || node.styles.hoverColor) {
        const hv: string[] = []
        if (node.styles.hoverBackgroundColor) hv.push(`background-color:${node.styles.hoverBackgroundColor}`)
        if (node.styles.hoverColor) hv.push(`color:${node.styles.hoverColor}`)
        out.base.push(`.cs-node-${node.id}:hover{${hv.join(';')}}`)
      }
      if (node.styles.gridColumns) {
        out.base.push(
          `.cs-grid-${node.id}{display:grid;grid-template-columns:repeat(${node.styles.gridColumns},minmax(0,1fr));gap:${node.styles.gap || '20px'}}`
        )
      }
      if (node.responsive?.laptop) {
        const r = stylesToCssRules(node.responsive.laptop)
        if (r) out.laptop.push(`.cs-node-${node.id}{${r}}`)
        if (node.responsive.laptop.gridColumns) {
          out.laptop.push(`.cs-grid-${node.id}{grid-template-columns:repeat(${node.responsive.laptop.gridColumns},minmax(0,1fr))}`)
        }
      }
      if (node.responsive?.tablet) {
        const r = stylesToCssRules(node.responsive.tablet)
        if (r) out.tablet.push(`.cs-node-${node.id}{${r}}`)
        if (node.responsive.tablet.gridColumns) {
          out.tablet.push(`.cs-grid-${node.id}{grid-template-columns:repeat(${node.responsive.tablet.gridColumns},minmax(0,1fr))}`)
        }
      }
      if (node.responsive?.mobile) {
        const r = stylesToCssRules(node.responsive.mobile)
        if (r) out.mobile.push(`.cs-node-${node.id}{${r}}`)
        if (node.responsive.mobile.gridColumns) {
          out.mobile.push(`.cs-grid-${node.id}{grid-template-columns:repeat(${node.responsive.mobile.gridColumns},minmax(0,1fr))}`)
        }
      }
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return out
}

export function buildWebsiteCss(doc: WebsiteDocument, page?: WebPage): string {
  const targetPage = page || doc.pages.find((p) => p.id === doc.activePageId) || doc.pages[0]
  if (!targetPage) return ''
  const rules = collectCssForNodes(targetPage.nodes)
  return `/* Exported from Canvas Studio 2.0 */
*{box-sizing:border-box}
body{margin:0;font-family:'DM Sans',sans-serif;background:#F7F5EF;color:#171717;line-height:1.5}
a{color:inherit;text-decoration:none}
.cs-nav-links,.cs-footer-links{display:flex;gap:20px;align-items:center;font-weight:600;font-size:14px}
.cs-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;border:2px solid #171717;border-radius:6px;background:#D8F878;color:#171717;font-weight:700;box-shadow:2px 2px 0 #171717;cursor:pointer}
.cs-btn-primary{background:#5267FF;color:#FFFEFA}
.cs-hero-inner{max-width:760px}
.cs-hero-inner h1{font-family:'Space Grotesk',sans-serif;font-size:48px;line-height:1.08;margin:0 0 16px}
.cs-section-title{font-family:'Space Grotesk',sans-serif;font-size:32px;margin:0 0 24px}
.cs-card{background:#FFFEFA;border:2px solid #171717;border-radius:8px;padding:22px;box-shadow:3px 3px 0 #171717}
.cs-kicker{font-family:'DM Mono',monospace;font-size:11px;font-weight:600;color:#5267FF;display:block;margin-bottom:8px}
.cs-faq-list{display:grid;gap:12px;max-width:760px}
.cs-faq-item{background:#F7F5EF;border:1.5px solid #171717;border-radius:6px;padding:14px 18px}
.cs-faq-item summary{font-weight:700;cursor:pointer}
.cs-form{display:grid;gap:12px;max-width:460px;margin-top:16px}
.cs-form input,.cs-form textarea{padding:12px;border:2px solid #171717;border-radius:6px;font:inherit;background:#FFFEFA;color:#171717}
${rules.base.join('\n')}
@media(max-width:1024px){
${rules.laptop.join('\n')}
}
@media(max-width:768px){
${rules.tablet.join('\n')}
}
@media(max-width:480px){
  .cs-hero-inner h1{font-size:32px}
  .cs-nav-links{flex-wrap:wrap;justify-content:center}
${rules.mobile.join('\n')}
}
`
}

export function buildWebsiteHtml(project: ProjectDocument): string {
  const doc = project.website
  if (!doc) return ''
  const page = doc.pages.find((p) => p.id === doc.activePageId) || doc.pages[0]
  if (!page) return ''
  const css = buildWebsiteCss(doc, page)
  const body = page.nodes.map(renderNodeHtml).join('\n')
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title || project.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;600&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
  <style>
${css}
  </style>
</head>
<body>
${body}
</body>
</html>`
}

export function exportWebsiteHtml(project: ProjectDocument) {
  const html = buildWebsiteHtml(project)
  const slug = project.name.replace(/\s+/g, '-').toLowerCase() || 'website'
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${slug}.html`)
}

export function exportWebsiteCss(project: ProjectDocument) {
  if (!project.website) return
  const css = buildWebsiteCss(project.website)
  const slug = project.name.replace(/\s+/g, '-').toLowerCase() || 'website'
  downloadBlob(new Blob([css], { type: 'text/css;charset=utf-8' }), `${slug}.css`)
}

export function exportWebsiteReact(project: ProjectDocument) {
  const doc = project.website
  if (!doc) return
  const page = doc.pages.find((p) => p.id === doc.activePageId) || doc.pages[0]
  if (!page) return
  const htmlBody = page.nodes
    .map((n) => renderNodeHtml(n))
    .join('\n')
    .replace(/class="/g, 'className="')
    .replace(/<hr([^>]*)>/g, '<hr$1 />')
    .replace(/<img([^>]*[^/])>/g, '<img$1 />')
    .replace(/<input([^>]*[^/])>/g, '<input$1 />')

  const tsx = `import React from 'react'
import './${project.name.replace(/\s+/g, '-').toLowerCase() || 'website'}.css'

export function ExportedPage() {
  return (
    <div className="canvas-studio-site">
${htmlBody}
    </div>
  )
}
`
  const slug = project.name.replace(/\s+/g, '-').toLowerCase() || 'website'
  downloadBlob(new Blob([tsx], { type: 'text/typescript;charset=utf-8' }), `${slug}.tsx`)
}

function buildCleanSvgClone(source: SVGSVGElement, page?: Page): SVGSVGElement {
  const width = page?.width || 1600
  const height = page?.height || 1100
  const clone = source.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  clone.setAttribute('viewBox', `0 0 ${width} ${height}`)
  clone.querySelectorAll('.selection-ui,.remote-cursor,.canvas-ui').forEach((el) => el.remove())
  const group = clone.querySelector('.world-group') as SVGGElement | null
  if (group) group.setAttribute('transform', 'translate(0 0) scale(1)')
  return clone
}

export function exportGraphicSvg(source: SVGSVGElement | null, projectName: string, page?: Page) {
  if (!source) return false
  const clone = buildCleanSvgClone(source, page)
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
    type: 'image/svg+xml;charset=utf-8',
  })
  downloadBlob(blob, `${projectName.replace(/\s+/g, '-').toLowerCase() || 'design'}.svg`)
  return true
}

export function exportGraphicPng(
  source: SVGSVGElement | null,
  projectName: string,
  page?: Page,
  onError?: () => void
) {
  if (!source) return false
  const clone = buildCleanSvgClone(source, page)
  const w = page?.width || 1600
  const h = page?.height || 1100
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const image = new Image()
  image.onload = () => {
    const scale = w > 2400 ? 1 : 1.5
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      if (!page?.transparentBg) {
        ctx.fillStyle = page?.background || '#F4F1E9'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((out) => {
        if (out) downloadBlob(out, `${projectName.replace(/\s+/g, '-').toLowerCase() || 'design'}.png`)
        URL.revokeObjectURL(url)
      })
    }
  }
  image.onerror = () => {
    URL.revokeObjectURL(url)
    onError?.()
  }
  image.src = url
  return true
}

export function exportGraphicPdf(source: SVGSVGElement | null, projectName: string, page?: Page): boolean {
  if (!source) return false
  const clone = buildCleanSvgClone(source, page)
  const svgData = new XMLSerializer().serializeToString(clone)
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  const win = window.open('', '_blank')
  if (!win) return false
  const isPortrait = (page?.height || 1100) > (page?.width || 1600)
  win.document.write(
    `<html><head><title>${escapeHtml(projectName)}</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#fff}img{width:100%;max-width:1600px;height:auto}@page{size:${isPortrait ? 'portrait' : 'landscape'};margin:8mm}</style></head><body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),250)"></body></html>`
  )
  win.document.close()
  return true
}

export function exportProjectJson(project: ProjectDocument) {
  const payload = {
    schema: 'canvas-studio-v2',
    exportedAt: new Date().toISOString(),
    project: project.name,
    type: project.type,
    activePageId: project.activePageId,
    pages: project.pages,
    website: project.website,
  }
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `${project.name.replace(/\s+/g, '-').toLowerCase() || 'project'}.json`
  )
}
