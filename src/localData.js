const legacySuffixes = {
  'eduagent-results': 'results', 'eduagent-completed-topics': 'completed-topics',
  'eduagent-exam-session': 'exam-session', 'eduagent-chat-history': 'chat-history',
  'eduagent-chat-subject': 'chat-subject'
}

const DB_NAME = 'eduagent-local-files'
const STORE_NAME = 'materials'

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('Этот браузер не поддерживает локальное хранение файлов.'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function fileTransaction(mode, operation) {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode)
      const request = operation(transaction.objectStore(STORE_NAME))
      let result
      request.onsuccess = () => { result = request.result }
      request.onerror = () => reject(request.error)
      transaction.onabort = () => reject(transaction.error)
      transaction.oncomplete = () => resolve(result)
    })
  } finally {
    db.close()
  }
}

export const saveMaterialFile = (id, file) => fileTransaction('readwrite', store => store.put(file, String(id)))
export const getMaterialFile = id => fileTransaction('readonly', store => store.get(String(id)))
export const removeMaterialFile = id => fileTransaction('readwrite', store => store.delete(String(id)))

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function dataUrlToBlob(value) {
  if (typeof value !== 'string' || !value.startsWith('data:')) throw new Error('Файл в резервной копии повреждён.')
  const [header, encoded] = value.split(',', 2)
  const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0))
  return new Blob([bytes], { type: header.slice(5).split(';')[0] || 'application/octet-stream' })
}

export async function exportBackup(materials) {
  const data = Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith('eduagent-')).map(key => [key, localStorage.getItem(key)]))
  const files = {}
  for (const material of materials) {
    if (!material.fileName || !material.fileStored) continue
    const blob = await getMaterialFile(material.id)
    if (blob) files[material.id] = await blobToDataUrl(blob)
  }
  const backup = { format: 'eduagent-local', version: 2, exportedAt: new Date().toISOString(), data, files }
  downloadBlob(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }), `eduagent-backup-${new Date().toISOString().slice(0, 10)}.json`)
}

export async function importBackup(file) {
  const backup = JSON.parse(await file.text())
  if (backup?.format !== 'eduagent-local' || ![1, 2].includes(backup.version) || !backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data) || !backup.files || typeof backup.files !== 'object' || Array.isArray(backup.files)) {
    throw new Error('Это не резервная копия EduAgent.')
  }
  for (const [key, value] of Object.entries(backup.data)) {
    if (!key.startsWith('eduagent-')) throw new Error('Данные в резервной копии повреждены.')
    if (value === null || value === undefined) continue
    if (typeof value !== 'string') throw new Error('Данные в резервной копии повреждены.')
    const parsed = JSON.parse(value)
    if ((['eduagent-subjects', 'eduagent-topics', 'eduagent-materials', 'eduagent-sessions', 'eduagent-accounts'].includes(key) || /(?:-results|-chat-history)$/.test(key)) && !Array.isArray(parsed)) throw new Error(`Неверный формат поля ${key}.`)
    if (/(?:-completed-topics|-exam-session)$/.test(key) && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) throw new Error(`Неверный формат поля ${key}.`)
    if (key === 'eduagent-role' && parsed !== null && parsed !== 'student' && parsed !== 'teacher') throw new Error('Неверная роль в резервной копии.')
    if (key.endsWith('-chat-subject') && typeof parsed !== 'string') throw new Error('Неверный предмет чата в резервной копии.')
  }
  if (backup.version === 2) {
    const accounts = JSON.parse(backup.data['eduagent-accounts'] || 'null')
    if (!Array.isArray(accounts) || !accounts.some(item => item.role === 'teacher') || accounts.some(item => !item.id || !item.login || !item.passwordHash || !item.passwordSalt)) throw new Error('Учётные записи в резервной копии повреждены.')
  }
  const files = Object.entries(backup.files).map(([id, value]) => [id, dataUrlToBlob(value)])
  for (const [id, blob] of files) await saveMaterialFile(id, blob)
  if (backup.version === 2) {
    for (const key of Object.keys(localStorage)) if (key.startsWith('eduagent-')) localStorage.removeItem(key)
    for (const [key, value] of Object.entries(backup.data)) if (value !== null && value !== undefined) localStorage.setItem(key, value)
  } else {
    for (const [key, value] of Object.entries(backup.data)) if (value !== null && value !== undefined) localStorage.setItem(key, value)
    const currentAccounts = JSON.parse(localStorage.getItem('eduagent-accounts') || '[]')
    const firstStudent = currentAccounts.find(item => item.role === 'student')
    if (firstStudent) {
      for (const [legacyKey, suffix] of Object.entries(legacySuffixes)) {
        const value = backup.data[legacyKey]
        if (value !== null && value !== undefined) localStorage.setItem(`eduagent-user-${firstStudent.id}-${suffix}`, value)
      }
      localStorage.setItem('eduagent-legacy-migrated', 'true')
    }
  }
  window.location.reload()
}
