import { useState } from 'react'
import { ArrowRight, BookOpen, Eye, EyeOff, GraduationCap, LockKeyhole, Sparkles } from 'lucide-react'
import { createAccount, normalizeLogin, validLogin, validPassword, verifyPassword } from './auth'

export default function AuthPage({ accounts, onSetup, onLogin }) {
  const setup = accounts.length === 0
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const normalized = normalizeLogin(login)
      if (setup) {
        if (!validLogin(normalized)) throw new Error('Логин: 3–32 буквы, цифры, точки, дефисы или подчёркивания.')
        if (!name.trim()) throw new Error('Укажите имя преподавателя.')
        if (!validPassword(password)) throw new Error('Пароль должен содержать от 12 до 128 символов.')
        if (password !== repeat) throw new Error('Пароли не совпадают.')
        const account = await createAccount({ login: normalized, name, password, role: 'teacher' })
        onSetup(account)
      } else {
        const account = accounts.find(item => item.login === normalized)
        if (!account || !(await verifyPassword(account, password))) throw new Error('Неверный логин или пароль.')
        onLogin(account)
      }
    } catch (failure) { setError(failure.message || 'Не удалось войти. Повторите попытку.') }
    finally { setBusy(false) }
  }

  return <div className="login-screen"><div className="login-orb login-orb-one" /><div className="login-orb login-orb-two" /><div className="relative z-10 mx-auto w-full max-w-[1040px] px-5 py-10"><div className="flex items-center gap-3"><div className="logo-mark"><Sparkles size={21} strokeWidth={2.5} /></div><div className="text-[21px] font-extrabold tracking-[-.06em] text-slate-900">edu<span className="text-violet-600">agent</span></div></div><div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_430px] lg:gap-20"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-4 py-2 text-xs font-extrabold text-violet-700"><LockKeyhole size={14} /> Локальный учебный кабинет</div><h1 className="max-w-xl text-4xl font-extrabold leading-[1.12] tracking-[-.055em] text-slate-900 sm:text-6xl">Знания, которые <span className="gradient-text">становятся понятными.</span></h1><p className="mt-6 max-w-lg text-base leading-8 text-slate-500">Темы, практика и прогресс каждого ученика в одном пространстве для 9 класса.</p><div className="mt-10 flex flex-wrap gap-6 text-sm font-bold text-slate-600"><span className="flex items-center gap-2"><BookOpen size={18} className="text-violet-500" /> 5 предметов</span><span className="flex items-center gap-2"><GraduationCap size={18} className="text-violet-500" /> Отдельные кабинеты</span><span className="flex items-center gap-2"><LockKeyhole size={18} className="text-violet-500" /> Вход по паролю</span></div></div><div className="rounded-[28px] border border-white/80 bg-white/90 p-7 shadow-[0_25px_90px_rgba(55,64,129,.13)] backdrop-blur-xl sm:p-9"><div className="mb-2 text-xs font-extrabold uppercase tracking-[.2em] text-violet-500">{setup ? 'ПЕРВЫЙ ЗАПУСК' : 'ДОБРО ПОЖАЛОВАТЬ'}</div><h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{setup ? 'Создайте преподавателя' : 'Войти в EduAgent'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{setup ? 'Этот аккаунт сможет добавлять учеников и управлять материалами.' : 'Введите логин и пароль, выданные преподавателем.'}</p><form className="form-stack mt-7" onSubmit={submit}>
    {setup && <label className="field-label">Имя преподавателя<input className="input-field" value={name} onChange={event => setName(event.target.value)} autoComplete="name" maxLength={80} required /></label>}
    <label className="field-label">Логин<input className="input-field" value={login} onChange={event => setLogin(event.target.value)} autoComplete="username" maxLength={32} required /></label>
    <label className="field-label">Пароль<div className="relative"><input className="input-field pr-11" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete={setup ? 'new-password' : 'current-password'} minLength={setup ? 12 : undefined} maxLength={128} required /><button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-violet-600" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
    {setup && <label className="field-label">Повторите пароль<input className="input-field" type={showPassword ? 'text' : 'password'} value={repeat} onChange={event => setRepeat(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required /></label>}
    {error && <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700" role="alert">{error}</div>}
    <button className="primary-button justify-center" type="submit" disabled={busy}>{busy ? 'Проверяем…' : setup ? 'Создать аккаунт' : 'Войти'} <ArrowRight size={17} /></button>
  </form><p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-500">{setup ? 'Запомните пароль: без сервера восстановить его нельзя.' : 'Новый ученик получает логин и пароль у преподавателя.'}</p></div></div></div></div>
}
