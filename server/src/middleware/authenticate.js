const { getSessionByToken } = require('../utils/auth')
const { readDb } = require('../utils/dataStore')

function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  const parts = h.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'missing token' })
  const token = parts[1]
  const session = getSessionByToken(token)
  if (!session) return res.status(401).json({ error: 'invalid or expired token' })
  const db = readDb()
  const user = (db.users || []).find((u) => u.id === session.userId)
  if (!user) return res.status(401).json({ error: 'invalid session user' })
  req.user = { id: user.id, name: user.name, email: user.email }
  next()
}

module.exports = { requireAuth }
