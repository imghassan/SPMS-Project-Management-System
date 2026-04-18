const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json')

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    return { projects: [], tasks: [], users: [], sessions: [] }
  }
}

function writeDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000)
}

module.exports = {
  readDb,
  writeDb,
  generateId,
}
