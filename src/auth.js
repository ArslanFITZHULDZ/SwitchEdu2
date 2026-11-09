const ITERATIONS = 600000
const encoder = new TextEncoder()

export const normalizeLogin = value => value.trim().toLocaleLowerCase('ru-RU')
export const validLogin = value => /^[\p{L}\p{N}._-]{3,32}$/u.test(value)
export const validPassword = value => value.length >= 12 && value.length <= 128

const toHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
const fromHex = hex => new Uint8Array(hex.match(/.{2}/g).map(part => parseInt(part, 16)))

async function derivePassword(password, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(salt), iterations, hash: 'SHA-256' }, key, 256)
  return toHex(new Uint8Array(bits))
}

export async function passwordRecord(password) {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  return { passwordSalt: salt, passwordHash: await derivePassword(password, salt), passwordIterations: ITERATIONS }
}

export async function createAccount({ login, name, password, role }) {
  return {
    id: crypto.randomUUID(), login: normalizeLogin(login), name: name.trim(), role,
    ...await passwordRecord(password), createdAt: new Date().toISOString()
  }
}

export async function verifyPassword(account, password) {
  if (!account?.passwordSalt || !account?.passwordHash) return false
  const actual = await derivePassword(password, account.passwordSalt, account.passwordIterations || ITERATIONS)
  if (actual.length !== account.passwordHash.length) return false
  let difference = 0
  for (let index = 0; index < actual.length; index++) difference |= actual.charCodeAt(index) ^ account.passwordHash.charCodeAt(index)
  return difference === 0
}

const legacyKeys = {
  'eduagent-results': 'results', 'eduagent-completed-topics': 'completed-topics',
  'eduagent-exam-session': 'exam-session', 'eduagent-chat-history': 'chat-history',
  'eduagent-chat-subject': 'chat-subject'
}

export function migrateLegacyStudentData(id) {
  if (localStorage.getItem('eduagent-legacy-migrated')) return
  for (const [oldKey, suffix] of Object.entries(legacyKeys)) {
    const value = localStorage.getItem(oldKey)
    if (value !== null) localStorage.setItem(`eduagent-user-${id}-${suffix}`, value)
  }
  localStorage.setItem('eduagent-legacy-migrated', 'true')
}

export function removeStudentData(id) {
  const prefix = `eduagent-user-${id}-`
  for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key)
}

export function clearTopicProgress(accounts, subjectId, topicId = null) {
  for (const account of accounts.filter(item => item.role === 'student')) {
    const key = `eduagent-user-${account.id}-completed-topics`
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}')
      const filtered = Object.fromEntries(Object.entries(data).filter(([topic]) => topicId ? topic !== `${subjectId}:${topicId}` : !topic.startsWith(`${subjectId}:`)))
      localStorage.setItem(key, JSON.stringify(filtered))
    } catch { /* Corrupt local state is handled when that account opens. */ }
  }
}
