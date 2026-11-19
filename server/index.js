import { WebSocketServer } from 'ws'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const PORT = Number(process.env.PORT || 8787)
const DATA_FILE = resolve(process.env.CANVAS_DATA_FILE || './server/data/rooms.json')
const MAX_ROOM_USERS = Number(process.env.MAX_ROOM_USERS || 10)
const VALID_PERMISSIONS = new Set(['edit', 'comment', 'view'])
const rooms = new Map()

async function loadRooms() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    for (const [room, doc] of Object.entries(parsed)) {
      rooms.set(room, {
        doc: {
          pages: doc.pages || [],
          activePageId: doc.activePageId || null,
          website: doc.website || null,
          comments: doc.comments || [],
          permissionPolicy: doc.permissionPolicy || 'edit',
        },
        clients: new Map(),
      })
    }
    console.log(`Loaded ${rooms.size} saved collaboration room(s).`)
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('Could not read room storage:', error.message)
  }
}

let persistTimer
async function persistRooms() {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(async () => {
    try {
      await mkdir(dirname(DATA_FILE), { recursive: true })
      const snapshot = Object.fromEntries([...rooms.entries()].map(([id, room]) => [id, room.doc]))
      await writeFile(DATA_FILE, JSON.stringify(snapshot), 'utf8')
    } catch (error) {
      console.error('Could not persist collaboration rooms:', error.message)
    }
  }, 300)
}

function getRoom(id) {
  if (!rooms.has(id)) {
    rooms.set(id, {
      doc: { pages: [], activePageId: null, website: null, comments: [], permissionPolicy: 'edit' },
      clients: new Map(),
    })
  }
  return rooms.get(id)
}

function send(ws, message) {
  if (ws.readyState === 1) ws.send(JSON.stringify(message))
}

function members(room) {
  return [...room.clients.values()].map((client) => client.user)
}

function broadcast(room, message, except) {
  for (const [socket] of room.clients.entries()) {
    if (socket !== except) send(socket, message)
  }
}

function applyOp(doc, op) {
  const pages = Array.isArray(doc.pages) ? doc.pages : []
  switch (op?.kind) {
    case 'upsertElement': {
      const page = pages.find((p) => p.id === op.pageId)
      if (page && op.element?.id) {
        page.elements = Array.isArray(page.elements) ? page.elements : []
        const index = page.elements.findIndex((e) => e.id === op.element.id)
        if (index >= 0) page.elements[index] = op.element
        else page.elements.push(op.element)
      }
      break
    }
    case 'deleteElement': {
      const page = pages.find((p) => p.id === op.pageId)
      if (page) page.elements = (page.elements || []).filter((e) => e.id !== op.elementId)
      break
    }
    case 'upsertPage': {
      if (op.page?.id) {
        const index = pages.findIndex((p) => p.id === op.page.id)
        if (index >= 0) pages[index] = op.page
        else pages.push(op.page)
      }
      break
    }
    case 'deletePage':
      doc.pages = pages.filter((p) => p.id !== op.pageId)
      break
    case 'renamePage': {
      const page = pages.find((p) => p.id === op.pageId)
      if (page) page.name = String(op.name || 'Untitled page').slice(0, 80)
      break
    }
    case 'setBackground': {
      const page = pages.find((p) => p.id === op.pageId)
      if (page) page.background = String(op.background || '#F4F1E9')
      break
    }
    case 'syncWebsite': {
      if (op.website && Array.isArray(op.website.pages)) {
        doc.website = op.website
      }
      break
    }
    case 'upsertComment': {
      if (op.comment?.id) {
        doc.comments = Array.isArray(doc.comments) ? doc.comments : []
        const idx = doc.comments.findIndex((c) => c.id === op.comment.id)
        if (idx >= 0) doc.comments[idx] = op.comment
        else doc.comments.push(op.comment)
      }
      break
    }
    default:
      break
  }
  if (op?.kind !== 'deletePage') doc.pages = pages
  return doc
}

await loadRooms()
const wss = new WebSocketServer({ port: PORT, maxPayload: 20 * 1024 * 1024 })

wss.on('connection', (ws) => {
  let roomId = null
  let clientId = null

  ws.on('message', (raw) => {
    let message
    try {
      message = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (message.type === 'join') {
      const requestedRoom = String(message.room || '')
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 24)
      const user = message.user || {}
      if (!requestedRoom || !user.id) {
        return send(ws, { type: 'error', message: 'A room code and user id are required.' })
      }
      const room = getRoom(requestedRoom)
      if (room.clients.size >= MAX_ROOM_USERS && !room.clients.has(ws)) {
        return send(ws, { type: 'room-full' })
      }
      roomId = requestedRoom
      clientId = String(user.id).slice(0, 64)
      const requestedPerm = VALID_PERMISSIONS.has(user.permission) ? user.permission : 'edit'
      const cleanUser = {
        id: clientId,
        name: String(user.name || 'Guest').slice(0, 32),
        color: /^#[0-9A-Fa-f]{6}$/.test(user.color) ? user.color : '#5267FF',
        permission: requestedPerm,
      }
      room.clients.set(ws, { user: cleanUser })
      send(ws, { type: 'sync', doc: room.doc, members: members(room) })
      broadcast(room, { type: 'presence', members: members(room) }, ws)
      console.log(`${cleanUser.name} (${cleanUser.permission}) joined ${requestedRoom} (${room.clients.size}/${MAX_ROOM_USERS})`)
      return
    }

    if (!roomId) return
    const room = getRoom(roomId)
    const client = room.clients.get(ws)
    if (!client) return

    if (message.type === 'init' && Array.isArray(message.doc?.pages)) {
      if (client.user.permission !== 'edit') return
      if (!room.doc.pages?.length) {
        room.doc = {
          pages: message.doc.pages,
          activePageId: message.doc.activePageId || message.doc.pages[0]?.id || null,
          website: message.doc.website || null,
          comments: message.doc.comments || [],
          permissionPolicy: room.doc.permissionPolicy || 'edit',
        }
        persistRooms()
        broadcast(room, { type: 'sync', doc: room.doc, members: members(room) }, ws)
      }
      return
    }

    if (message.type === 'profile' && message.user) {
      client.user.name = String(message.user.name || 'Guest').slice(0, 32)
      if (VALID_PERMISSIONS.has(message.user.permission)) {
        client.user.permission = message.user.permission
      }
      broadcast(room, { type: 'presence', members: members(room) })
      return
    }

    if (message.type === 'op' && message.op) {
      const opKind = message.op.kind
      if (client.user.permission === 'view') {
        return send(ws, { type: 'permission-denied', message: 'Viewer permission is read-only.' })
      }
      if (client.user.permission === 'comment' && opKind !== 'upsertComment') {
        return send(ws, { type: 'permission-denied', message: 'Commenter permission cannot edit document objects.' })
      }
      applyOp(room.doc, message.op)
      persistRooms()
      broadcast(room, { type: 'op', op: message.op }, ws)
      return
    }

    if (message.type === 'cursor' && message.cursor) {
      const cursor = message.cursor
      if (typeof cursor.x !== 'number' || typeof cursor.y !== 'number') return
      broadcast(
        room,
        {
          type: 'cursor',
          cursor: {
            id: client.user.id,
            name: client.user.name,
            color: client.user.color,
            x: Math.max(-100000, Math.min(100000, cursor.x)),
            y: Math.max(-100000, Math.min(100000, cursor.y)),
            pageId: String(cursor.pageId || '').slice(0, 64),
            selectedId: cursor.selectedId ? String(cursor.selectedId).slice(0, 64) : null,
            updatedAt: Date.now(),
          },
        },
        ws
      )
    }
  })

  ws.on('close', () => {
    if (!roomId) return
    const room = getRoom(roomId)
    room.clients.delete(ws)
    broadcast(room, { type: 'user-left', id: clientId })
    broadcast(room, { type: 'presence', members: members(room) })
    console.log(`${clientId || 'A user'} left ${roomId} (${room.clients.size}/${MAX_ROOM_USERS})`)
  })
})

wss.on('listening', () => console.log(`Canvas Studio collaboration server listening on ws://0.0.0.0:${PORT}`))
process.on('SIGINT', () => {
  clearTimeout(persistTimer)
  wss.close(() => process.exit(0))
})
process.on('SIGTERM', () => {
  clearTimeout(persistTimer)
  wss.close(() => process.exit(0))
})
