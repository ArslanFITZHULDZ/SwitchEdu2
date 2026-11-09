import { useRef, useState } from 'react'
import { BookOpen, CalendarDays, CheckCircle2, Database, Download, FileText, Pencil, Plus, Trash2, Upload, Users, X } from 'lucide-react'
import { subjects } from './data'
import { clearTopicProgress, createAccount, migrateLegacyStudentData, normalizeLogin, passwordRecord, removeStudentData, validLogin, validPassword, verifyPassword } from './auth'
import { downloadBlob, exportBackup, getMaterialFile, importBackup, removeMaterialFile, saveMaterialFile } from './localData'

const newId = () => crypto.randomUUID()

function ListItem({ icon: Icon, title, subtitle, onEdit, onDelete, onDownload }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><Icon size={18} /></div>
    <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-800">{title}</div><div className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</div></div>
    {onDownload && <button className="icon-action" title="Скачать файл" aria-label={`Скачать ${title}`} onClick={onDownload}><Download size={16} /></button>}
    {onEdit && <button className="icon-action" title="Изменить" aria-label={`Изменить ${title}`} onClick={onEdit}><Pencil size={16} /></button>}
    {onDelete && <button className="icon-action icon-action-danger" title="Удалить" aria-label={`Удалить ${title}`} onClick={onDelete}><Trash2 size={16} /></button>}
  </div>
}

function EmptyList({ label }) {
  return <div className="rounded-xl bg-slate-50 p-6 text-center"><FileText size={22} className="mx-auto mb-3 text-slate-400" /><p className="text-xs leading-5 text-slate-500">{label}</p></div>
}

export default function TeacherPage({ allSubjects, customSubjects, setCustomSubjects, customTopics, setCustomTopics, customMaterials, setCustomMaterials, sessions, setSessions, accounts, setAccounts }) {
  const [tab, setTab] = useState('students')
  const [editingId, setEditingId] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [studentLogin, setStudentLogin] = useState('')
  const [studentPassword, setStudentPassword] = useState('')
  const [oldTeacherPassword, setOldTeacherPassword] = useState('')
  const [newTeacherPassword, setNewTeacherPassword] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [subjectDescription, setSubjectDescription] = useState('')
  const [topicSubject, setTopicSubject] = useState('math')
  const [topicTitle, setTopicTitle] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [sessionSubject, setSessionSubject] = useState('math')
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [materialSubject, setMaterialSubject] = useState('math')
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')
  const [file, setFile] = useState(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)
  const importInput = useRef(null)

  const flash = message => setNotice(message)
  const nameFor = id => allSubjects.find(subject => subject.id === id)?.name || 'Предмет удалён'
  const selector = (value, setter) => <select className="select-field" value={value} onChange={event => setter(event.target.value)} required>{allSubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
  const clearForm = () => {
    setEditingId(null); setSubjectName(''); setSubjectDescription(''); setTopicTitle(''); setTopicDescription('')
    setSessionTitle(''); setSessionDate(''); setMaterialTitle(''); setMaterialDescription(''); setFile(null)
    setStudentName(''); setStudentLogin(''); setStudentPassword('')
    if (fileInput.current) fileInput.current.value = ''
  }
  const changeTab = value => { clearForm(); setNotice(''); setTab(value) }

  const students = accounts.filter(item => item.role === 'student')
  const saveStudent = async event => {
    event.preventDefault()
    const login = normalizeLogin(studentLogin)
    if (!validLogin(login)) return flash('Логин: 3–32 буквы, цифры, точки, дефисы или подчёркивания.')
    if (!studentName.trim()) return flash('Укажите имя ученика.')
    if (accounts.some(item => item.login === login && item.id !== editingId)) return flash('Этот логин уже занят.')
    if ((!editingId || studentPassword) && !validPassword(studentPassword)) return flash('Пароль должен содержать от 12 до 128 символов.')
    setBusy(true)
    try {
      if (editingId) {
        const password = studentPassword ? await passwordRecord(studentPassword) : {}
        setAccounts(previous => previous.map(item => item.id === editingId ? { ...item, login, name: studentName.trim(), ...password } : item))
      } else {
        const account = await createAccount({ login, name: studentName, password: studentPassword, role: 'student' })
        if (!students.length) migrateLegacyStudentData(account.id)
        setAccounts(previous => [...previous, account])
      }
      clearForm(); flash('Учётная запись ученика сохранена.')
    } catch (error) { flash(`Не удалось сохранить ученика: ${error.message}`) }
    finally { setBusy(false) }
  }
  const editStudent = item => { setEditingId(item.id); setStudentName(item.name); setStudentLogin(item.login); setStudentPassword('') }
  const deleteStudent = item => {
    if (!window.confirm(`Удалить ученика «${item.name}» и все его локальные результаты?`)) return
    removeStudentData(item.id)
    setAccounts(previous => previous.filter(account => account.id !== item.id))
    if (editingId === item.id) clearForm()
    flash('Ученик и его результаты удалены.')
  }
  const changeTeacherPassword = async event => {
    event.preventDefault()
    const teacher = accounts.find(item => item.role === 'teacher')
    if (!validPassword(newTeacherPassword)) return flash('Новый пароль должен содержать от 12 до 128 символов.')
    setBusy(true)
    try {
      if (!(await verifyPassword(teacher, oldTeacherPassword))) return flash('Текущий пароль неверен.')
      const record = await passwordRecord(newTeacherPassword)
      setAccounts(previous => previous.map(item => item.id === teacher.id ? { ...item, ...record } : item))
      setOldTeacherPassword(''); setNewTeacherPassword(''); flash('Пароль преподавателя изменён.')
    } catch (error) { flash(`Не удалось изменить пароль: ${error.message}`) }
    finally { setBusy(false) }
  }

  const saveSubject = event => {
    event.preventDefault()
    const name = subjectName.trim()
    if (allSubjects.some(subject => subject.name.toLocaleLowerCase('ru') === name.toLocaleLowerCase('ru') && subject.id !== editingId)) return flash('Предмет с таким названием уже есть.')
    if (editingId) setCustomSubjects(previous => previous.map(subject => subject.id === editingId ? { ...subject, name, short: name, description: subjectDescription.trim() } : subject))
    else setCustomSubjects(previous => [...previous, { id: `custom-${newId()}`, name, short: name, icon: '✦', color: 'violet', description: subjectDescription.trim() || 'Новый учебный предмет', topics: [] }])
    clearForm(); flash('Предмет сохранён.')
  }
  const saveTopic = event => {
    event.preventDefault()
    const item = { subjectId: topicSubject, title: topicTitle.trim(), description: topicDescription.trim() }
    if (editingId) {
      const old = customTopics.find(topic => topic.id === editingId)
      if (old && old.subjectId !== topicSubject) clearTopicProgress(accounts, old.subjectId, old.id)
      setCustomTopics(previous => previous.map(topic => topic.id === editingId ? { ...topic, ...item } : topic))
    }
    else setCustomTopics(previous => [...previous, { id: newId(), ...item }])
    clearForm(); flash('Тема сохранена.')
  }
  const saveSession = event => {
    event.preventDefault()
    const item = { subjectId: sessionSubject, title: sessionTitle.trim(), date: sessionDate }
    if (editingId) setSessions(previous => previous.map(session => session.id === editingId ? { ...session, ...item } : session))
    else setSessions(previous => [...previous, { id: newId(), ...item }])
    clearForm(); flash('Занятие сохранено.')
  }
  const saveMaterial = async event => {
    event.preventDefault()
    if (file && file.size > 20 * 1024 * 1024) return flash('Максимальный размер файла — 20 МБ.')
    const id = editingId || newId()
    const old = customMaterials.find(material => material.id === id)
    setBusy(true)
    try {
      if (file) await saveMaterialFile(id, file)
      const item = { id, subjectId: materialSubject, title: materialTitle.trim(), description: materialDescription.trim(), fileName: file?.name ?? old?.fileName ?? null, fileSize: file?.size ?? old?.fileSize ?? null, fileType: file?.type ?? old?.fileType ?? null, fileStored: Boolean(file || old?.fileStored) }
      if (editingId) setCustomMaterials(previous => previous.map(material => material.id === id ? item : material))
      else setCustomMaterials(previous => [...previous, item])
      clearForm(); flash(file || old?.fileStored ? 'Материал и файл сохранены в этом браузере.' : 'Материал сохранён.')
    } catch (error) { flash(`Не удалось сохранить файл: ${error.message}`) }
    finally { setBusy(false) }
  }
  const downloadMaterial = async material => {
    try {
      const blob = await getMaterialFile(material.id)
      if (!blob) throw new Error('Файл отсутствует в этом браузере.')
      downloadBlob(blob, material.fileName)
    } catch (error) { flash(error.message) }
  }
  const deleteItem = async (kind, id, title) => {
    if (!window.confirm(`Удалить «${title}»?${kind === 'subjects' ? ' Связанные темы, занятия и материалы также будут удалены.' : ''}`)) return
    if (kind === 'subjects') {
      const materialIds = customMaterials.filter(item => item.subjectId === id).map(item => item.id)
      try { await Promise.all(materialIds.map(removeMaterialFile)) } catch { flash('Часть файлов не удалось удалить из браузера.') }
      setCustomSubjects(previous => previous.filter(item => item.id !== id))
      setCustomTopics(previous => previous.filter(item => item.subjectId !== id))
      setCustomMaterials(previous => previous.filter(item => item.subjectId !== id))
      setSessions(previous => previous.filter(item => item.subjectId !== id))
      clearTopicProgress(accounts, id)
    }
    if (kind === 'topics') {
      const topic = customTopics.find(item => item.id === id)
      setCustomTopics(previous => previous.filter(item => item.id !== id))
      if (topic) clearTopicProgress(accounts, topic.subjectId, topic.id)
    }
    if (kind === 'sessions') setSessions(previous => previous.filter(item => item.id !== id))
    if (kind === 'materials') {
      try { await removeMaterialFile(id) } catch { flash('Не удалось удалить файл из браузера.') }
      setCustomMaterials(previous => previous.filter(item => item.id !== id))
    }
    if (editingId === id) clearForm()
    flash('Запись удалена.')
  }
  const editSubject = item => { setEditingId(item.id); setSubjectName(item.name); setSubjectDescription(item.description || '') }
  const editTopic = item => { setEditingId(item.id); setTopicSubject(item.subjectId); setTopicTitle(item.title); setTopicDescription(item.description || '') }
  const editSession = item => { setEditingId(item.id); setSessionSubject(item.subjectId); setSessionTitle(item.title); setSessionDate(item.date) }
  const editMaterial = item => { setEditingId(item.id); setMaterialSubject(item.subjectId); setMaterialTitle(item.title); setMaterialDescription(item.description || ''); setFile(null); if (fileInput.current) fileInput.current.value = '' }
  const makeBackup = async () => { setBusy(true); try { await exportBackup(customMaterials); flash('Резервная копия скачана.') } catch (error) { flash(`Не удалось создать копию: ${error.message}`) } finally { setBusy(false) } }
  const restoreBackup = async event => {
    const selected = event.target.files?.[0]
    if (!selected) return
    if (!window.confirm('Заменить локальные данные содержимым резервной копии?')) { event.target.value = ''; return }
    setBusy(true)
    try { await importBackup(selected) } catch (error) { flash(`Не удалось восстановить данные: ${error.message}`); setBusy(false); event.target.value = '' }
  }
  const tabs = [['students', 'Ученики', Users], ['subjects', 'Предметы', BookOpen], ['topics', 'Темы', FileText], ['sessions', 'Занятия', CalendarDays], ['materials', 'Материалы', Upload], ['data', 'Мои данные', Database]]
  const studentsPanel = <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><div className="panel p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-extrabold text-slate-900">{editingId ? 'Изменить ученика' : 'Добавить ученика'}</h2><p className="mt-1 text-xs text-slate-500">Передайте ученику его логин и пароль лично</p></div>{editingId && <button className="icon-action" onClick={clearForm} title="Отменить редактирование"><X size={18} /></button>}</div><form className="form-stack" onSubmit={saveStudent}><label className="field-label">Имя ученика<input className="input-field" value={studentName} onChange={event => setStudentName(event.target.value)} maxLength={80} autoComplete="off" required /></label><label className="field-label">Логин<input className="input-field" value={studentLogin} onChange={event => setStudentLogin(event.target.value)} maxLength={32} autoComplete="off" required /></label><label className="field-label">{editingId ? 'Новый пароль (необязательно)' : 'Пароль'}<input className="input-field" type="password" value={studentPassword} onChange={event => setStudentPassword(event.target.value)} minLength={studentPassword || !editingId ? 12 : undefined} maxLength={128} autoComplete="new-password" required={!editingId} /></label>{editingId && <p className="text-xs leading-5 text-slate-500">Оставьте поле пароля пустым, чтобы сохранить прежний.</p>}<button className="primary-button justify-center" type="submit" disabled={busy}><Users size={17} /> {editingId ? 'Сохранить ученика' : 'Создать аккаунт'}</button></form></div><div className="panel p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-extrabold text-slate-900">Ученики</h2><span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">{students.length}</span></div><div className="max-h-[490px] space-y-2 overflow-y-auto pr-1">{students.length ? students.map(item => <ListItem key={item.id} icon={Users} title={item.name} subtitle={`Логин: ${item.login}`} onEdit={() => editStudent(item)} onDelete={() => deleteStudent(item)} />) : <EmptyList label="Добавьте первого ученика и выдайте ему логин и пароль." />}</div></div><div className="panel p-6 xl:col-span-2"><h2 className="font-extrabold text-slate-900">Пароль преподавателя</h2><p className="mt-1 text-xs text-slate-500">Чтобы сменить пароль, укажите текущий и новый пароль.</p><form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={changeTeacherPassword}><input className="input-field" type="password" value={oldTeacherPassword} onChange={event => setOldTeacherPassword(event.target.value)} placeholder="Текущий пароль" autoComplete="current-password" required /><input className="input-field" type="password" value={newTeacherPassword} onChange={event => setNewTeacherPassword(event.target.value)} placeholder="Новый пароль (12+ символов)" autoComplete="new-password" minLength={12} maxLength={128} required /><button className="secondary-button justify-center" type="submit" disabled={busy}>Сменить пароль</button></form></div></div>

  return <div className="page-enter"><div className="mb-8"><div className="eyebrow mb-1">УПРАВЛЕНИЕ ОБУЧЕНИЕМ</div><h1 className="page-title">Кабинет преподавателя</h1><p className="page-subtitle">Добавляйте и редактируйте темы, занятия и материалы для локального учебного кабинета.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><div className="stat-card"><div className="stat-icon bg-violet-50 text-violet-600"><BookOpen size={21} /></div><div><div className="stat-number">{allSubjects.length}</div><div className="stat-label">Предметов</div></div></div><div className="stat-card"><div className="stat-icon bg-blue-50 text-blue-600"><FileText size={21} /></div><div><div className="stat-number">{subjects.reduce((total, subject) => total + subject.topics.length, 0) + customTopics.length}</div><div className="stat-label">Учебных тем</div></div></div><div className="stat-card"><div className="stat-icon bg-amber-50 text-amber-600"><CalendarDays size={21} /></div><div><div className="stat-number">{sessions.length}</div><div className="stat-label">Занятий</div></div></div></div>
    <div className="mt-7 overflow-x-auto border-b border-slate-200"><div className="flex min-w-max gap-2">{tabs.map(([key, label, Icon]) => <button key={key} className={`teacher-tab ${tab === key ? 'teacher-tab-active' : ''}`} onClick={() => changeTab(key)}><Icon size={17} /> {label}</button>)}</div></div>
    {notice && <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800" role="status"><CheckCircle2 size={17} /> {notice}</div>}
    {tab === 'students' ? studentsPanel : tab === 'data' ? <div className="mt-6 grid gap-6 md:grid-cols-2"><div className="panel p-6"><h2 className="text-lg font-extrabold text-slate-900">Сохранить резервную копию</h2><p className="mt-2 text-sm leading-6 text-slate-500">Скачайте JSON со своими предметами, темами, расписанием, результатами и прикреплёнными файлами. Храните его в надёжном месте.</p><button className="primary-button mt-5" onClick={makeBackup} disabled={busy}><Download size={17} /> Скачать копию</button></div><div className="panel p-6"><h2 className="text-lg font-extrabold text-slate-900">Восстановить данные</h2><p className="mt-2 text-sm leading-6 text-slate-500">Выберите ранее сохранённый JSON. Текущие данные этого браузера будут заменены.</p><input ref={importInput} type="file" accept="application/json,.json" className="hidden" onChange={restoreBackup} /><button className="secondary-button mt-5" onClick={() => importInput.current?.click()} disabled={busy}><Upload size={17} /> Выбрать копию</button></div></div> : <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><div className="panel p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-slate-900">{editingId ? 'Изменить запись' : tab === 'subjects' ? 'Добавить предмет' : tab === 'topics' ? 'Добавить тему' : tab === 'sessions' ? 'Назначить занятие' : 'Добавить материал'}</h2><p className="mt-1 text-xs text-slate-500">Изменения сохраняются в этом браузере</p></div>{editingId && <button className="icon-action" onClick={clearForm} title="Отменить редактирование"><X size={18} /></button>}</div>
      {tab === 'subjects' && <form className="form-stack" onSubmit={saveSubject}><label className="field-label">Название предмета<input className="input-field" value={subjectName} onChange={event => setSubjectName(event.target.value)} maxLength={80} required /></label><label className="field-label">Краткое описание<textarea className="input-field min-h-24 resize-y" value={subjectDescription} onChange={event => setSubjectDescription(event.target.value)} maxLength={1000} /></label><button className="primary-button justify-center" type="submit"><Plus size={17} /> {editingId ? 'Сохранить изменения' : 'Добавить предмет'}</button></form>}
      {tab === 'topics' && <form className="form-stack" onSubmit={saveTopic}><label className="field-label">Предмет{selector(topicSubject, setTopicSubject)}</label><label className="field-label">Название темы<input className="input-field" value={topicTitle} onChange={event => setTopicTitle(event.target.value)} maxLength={120} required /></label><label className="field-label">Содержание<textarea className="input-field min-h-24 resize-y" value={topicDescription} onChange={event => setTopicDescription(event.target.value)} maxLength={5000} placeholder="Объяснение, которое увидит ученик" required /></label><button className="primary-button justify-center" type="submit"><Plus size={17} /> {editingId ? 'Сохранить изменения' : 'Добавить тему'}</button></form>}
      {tab === 'sessions' && <form className="form-stack" onSubmit={saveSession}><label className="field-label">Предмет{selector(sessionSubject, setSessionSubject)}</label><label className="field-label">Название занятия<input className="input-field" value={sessionTitle} onChange={event => setSessionTitle(event.target.value)} maxLength={120} required /></label><label className="field-label">Дата и время<input className="input-field" type="datetime-local" value={sessionDate} onChange={event => setSessionDate(event.target.value)} required /></label><button className="primary-button justify-center" type="submit"><CalendarDays size={17} /> {editingId ? 'Сохранить изменения' : 'Добавить занятие'}</button></form>}
      {tab === 'materials' && <form className="form-stack" onSubmit={saveMaterial}><label className="field-label">Предмет{selector(materialSubject, setMaterialSubject)}</label><label className="field-label">Название материала<input className="input-field" value={materialTitle} onChange={event => setMaterialTitle(event.target.value)} maxLength={120} required /></label><label className="field-label">Описание<textarea className="input-field min-h-20 resize-y" value={materialDescription} onChange={event => setMaterialDescription(event.target.value)} maxLength={5000} /></label><label className="field-label">Файл (до 20 МБ)<input ref={fileInput} className="input-field !py-2.5 text-xs" type="file" onChange={event => setFile(event.target.files?.[0] || null)} /></label>{editingId && customMaterials.find(item => item.id === editingId)?.fileName && <p className="text-xs text-slate-500">Текущий файл: {customMaterials.find(item => item.id === editingId).fileName}. Новый файл заменит его.</p>}<button className="primary-button justify-center" type="submit" disabled={busy}><Upload size={17} /> {editingId ? 'Сохранить изменения' : 'Добавить материал'}</button></form>}
    </div><div className="panel p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-extrabold text-slate-900">{tab === 'subjects' ? 'Предметы класса' : tab === 'topics' ? 'Добавленные темы' : tab === 'sessions' ? 'Расписание' : 'Добавленные материалы'}</h2><span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">{tab === 'subjects' ? allSubjects.length : tab === 'topics' ? customTopics.length : tab === 'sessions' ? sessions.length : customMaterials.length}</span></div><div className="max-h-[490px] space-y-2 overflow-y-auto pr-1">
      {tab === 'subjects' && allSubjects.map(item => <ListItem key={item.id} icon={BookOpen} title={item.name} subtitle={`${item.topics.length} учебных тем`} onEdit={item.id.startsWith('custom-') ? () => editSubject(item) : null} onDelete={item.id.startsWith('custom-') ? () => deleteItem('subjects', item.id, item.name) : null} />)}
      {tab === 'topics' && (customTopics.length ? customTopics.slice().reverse().map(item => <ListItem key={item.id} icon={FileText} title={item.title} subtitle={nameFor(item.subjectId)} onEdit={() => editTopic(item)} onDelete={() => deleteItem('topics', item.id, item.title)} />) : <EmptyList label="Добавленные темы появятся здесь и на странице предмета." />)}
      {tab === 'sessions' && (sessions.length ? sessions.slice().sort((a, b) => a.date.localeCompare(b.date)).map(item => <ListItem key={item.id} icon={CalendarDays} title={item.title} subtitle={`${nameFor(item.subjectId)} · ${new Date(item.date).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`} onEdit={() => editSession(item)} onDelete={() => deleteItem('sessions', item.id, item.title)} />) : <EmptyList label="Назначенные занятия появятся здесь и на главной странице ученика." />)}
      {tab === 'materials' && (customMaterials.length ? customMaterials.slice().reverse().map(item => <ListItem key={item.id} icon={Upload} title={item.title} subtitle={`${nameFor(item.subjectId)}${item.fileName ? ` · ${item.fileName}` : ''}`} onEdit={() => editMaterial(item)} onDelete={() => deleteItem('materials', item.id, item.title)} onDownload={item.fileStored ? () => downloadMaterial(item) : null} />) : <EmptyList label="Материалы появятся здесь и на странице предмета." />)}
    </div></div></div>}
    <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-800"><strong>Локальные данные.</strong> У другого браузера или устройства будет свой набор данных. Для переноса используйте вкладку «Мои данные».</div>
  </div>
}
