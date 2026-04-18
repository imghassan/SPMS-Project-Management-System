const crypto = require('crypto')
const { readDb, writeDb, generateId } = require('./dataStore')
let mongo = null
try {
  mongo = require('../db/mongo')
} catch (err) {
  mongo = null
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

function verifyPassword(password, salt, hash) {
  const h = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hash, 'hex'))
}

async function createSession(userId, ttlMs = 7 * 24 * 3600 * 1000) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + ttlMs
  if (mongo && mongo.db && mongo.db.connected && mongo.db.models && mongo.db.models.Session) {
    const s = await mongo.db.models.Session.create({ token, userId, expiresAt })
    return { token: s.token, userId: s.userId, createdAt: s.createdAt, expiresAt: s.expiresAt }
  }

  const db = readDb()
  const session = { id: generateId('s_'), token, userId, createdAt: Date.now(), expiresAt }
  db.sessions = db.sessions || []
  db.sessions.push(session)
  writeDb(db)
  return session
}

async function getSessionByToken(token) {
  if (mongo && mongo.db && mongo.db.connected && mongo.db.models && mongo.db.models.Session) {
    const s = await mongo.db.models.Session.findOne({ token }).lean()
    if (!s) return null
    if (s.expiresAt && s.expiresAt.getTime && s.expiresAt.getTime() < Date.now()) return null
    return { token: s.token, userId: s.userId, createdAt: s.createdAt, expiresAt: s.expiresAt }
  }
  const db = readDb()
  const s = (db.sessions || []).find((x) => x.token === token)
  if (!s) return null
  if (s.expiresAt && s.expiresAt < Date.now()) return null
  return s
}

async function revokeSession(token) {
  if (mongo && mongo.db && mongo.db.connected && mongo.db.models && mongo.db.models.Session) {
    await mongo.db.models.Session.deleteOne({ token })
    return
  }
  const db = readDb()
  db.sessions = (db.sessions || []).filter((s) => s.token !== token)
  writeDb(db)
}

module.exports = { hashPassword, verifyPassword, createSession, getSessionByToken, revokeSession }
