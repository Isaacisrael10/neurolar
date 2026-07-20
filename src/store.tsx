// Store do app: estado + persistência em localStorage + ações + seletores.
// Sem backend ainda: tudo salvo no navegador. Depois isto vira Supabase.
//
// Modelo (ClassApp, sem chat ao vivo, tudo ORGANIZADO por seções):
//  - registros: os PAIS postam UMA vez por dia (fim do dia), com tags + texto.
//  - prontuario: os TERAPEUTAS postam POR SESSÃO. Tem TAGS específicas da
//    disciplina (visão geral) + `orientacao` (recado à família, texto) +
//    `evolucao` (interna, só a clínica). Cada post tem leitura + respostas.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface Professional {
  id: string
  name: string
  initial: string
  role: string // título (ex.: Psicóloga)
  discipline: string // tipo de terapia (ex.: Psicologia)
  color: string
}

export interface Child {
  id: string
  name: string
  initial: string
  age: number
  diagnosis: string
  notes: string
  teamIds: string[]
}

export interface Reply {
  id: string
  authorType: 'familia' | 'terapeuta'
  authorId: string
  authorName: string
  color: string
  ts: number
  text: string
}

export interface Registro {
  id: string
  childId: string
  date: string // YYYY-MM-DD
  sono?: string
  alim?: string
  humor?: string
  crises?: string
  obs?: string
  replies: Reply[]
  readByTeam: boolean
}

export interface ProntuarioEntry {
  id: string
  childId: string
  professionalId: string
  ts: number
  tags: string[] // específicas da disciplina (visão geral)
  evolucao: string // interna (clínica)
  orientacao: string // recado/texto para a família
  replies: Reply[]
  readByFamily: boolean
}

export interface Session {
  id: string
  childId: string
  professionalId: string
  when: string
  ts: number
}

export interface State {
  children: Child[]
  professionals: Professional[]
  registros: Registro[]
  prontuario: ProntuarioEntry[]
  sessions: Session[]
}

const KEY = 'montar-state-v4'
const TEAL = '#1f9e8b'

// Vocabulário de tags por tipo de terapia. Cada sessão marca as que trabalhou.
export const TAGS_BY_DISCIPLINE: Record<string, string[]> = {
  Psicologia: ['Contato visual', 'Autorregulação', 'Interação social', 'Comportamento', 'Atenção compartilhada', 'Reconhecimento de emoções', 'Flexibilidade'],
  Fonoaudiologia: ['Vocabulário', 'Articulação', 'Compreensão', 'Fala funcional', 'Comunicação alternativa', 'Sons novos', 'Trocas comunicativas'],
  'Terapia Ocupacional': ['Coordenação motora fina', 'Coordenação motora ampla', 'Integração sensorial', 'Regulação sensorial', 'Atividades de vida diária', 'Praxia', 'Tolerância a texturas'],
  Psicopedagogia: ['Atenção', 'Leitura e escrita', 'Raciocínio lógico', 'Organização', 'Memória', 'Funções executivas'],
}

/* ---------- helpers de data ---------- */

export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function relTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${Math.max(1, min)} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ontem'
  return `há ${d} dias`
}

export function fullDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function longDate(ts: number): string {
  const s = new Date(ts).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

/* ---------- seed inicial ---------- */

function seed(): State {
  const professionals: Professional[] = [
    { id: 'm', name: 'Marina', initial: 'M', role: 'Psicóloga', discipline: 'Psicologia', color: '#3b8fd4' },
    { id: 'c', name: 'Carla', initial: 'C', role: 'Fonoaudióloga', discipline: 'Fonoaudiologia', color: '#45a86a' },
    { id: 'j', name: 'João', initial: 'J', role: 'Terapeuta Ocupacional', discipline: 'Terapia Ocupacional', color: '#e6a02f' },
    { id: 'r', name: 'Rita', initial: 'R', role: 'Psicopedagoga', discipline: 'Psicopedagogia', color: '#e2705a' },
  ]

  const children: Child[] = [
    { id: 'ana', name: 'Ana', initial: 'A', age: 6, diagnosis: 'TEA nível 1', notes: 'Gosta de rotina e de música. Sensível a barulhos altos.', teamIds: ['m', 'c', 'j', 'r'] },
    { id: 'lucas', name: 'Lucas', initial: 'L', age: 5, diagnosis: 'TEA nível 2', notes: 'Em processo de comunicação alternativa.', teamIds: ['m', 'c'] },
  ]

  const now = Date.now()
  const H = 3600000
  const D = 24 * H

  const registros: Registro[] = []
  const sonos = ['Dormiu bem', 'Agitada', 'Dormiu bem']
  const alims = ['Comeu bem', 'Comeu pouco', 'Comeu bem']
  const humores = ['Feliz', 'Tranquila', 'Feliz', 'Irritada', 'Tranquila']
  for (let i = 1; i <= 12; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const isYesterday = i === 1
    registros.push({
      id: uid(), childId: 'ana', date: dayKey(d),
      sono: sonos[i % 3], alim: alims[i % 3], humor: humores[i % 5],
      crises: i % 6 === 0 ? '1' : 'Nenhuma',
      obs: isYesterday ? 'Dia tranquilo, brincou bastante no parque. Só ficou um pouco agitada na hora de dormir.' : '',
      replies: isYesterday ? [{ id: uid(), authorType: 'terapeuta', authorId: 'm', authorName: 'Marina', color: '#3b8fd4', ts: now - 22 * H, text: 'Que ótimo! O parque ajuda muito na regulação dela. Obrigada por avisar.' }] : [],
      readByTeam: true,
    })
  }

  const prontuario: ProntuarioEntry[] = [
    {
      id: uid(), childId: 'ana', professionalId: 'm', ts: now - 2 * H,
      tags: ['Contato visual', 'Interação social', 'Atenção compartilhada'],
      evolucao: 'Paciente sustentou contato visual por períodos progressivamente mais longos, respondendo a comando simples com apoio verbal leve. Boa tolerância ao ambiente e iniciativa de interação com a terapeuta.',
      orientacao: 'A Ana manteve contato visual por muito mais tempo hoje, e buscou interagir comigo por conta própria. Em casa, tentem os joguinhos de olhar por uns 5 minutinhos, e sempre que ela buscar vocês, respondam com atenção total.',
      replies: [], readByFamily: false,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'm', ts: now - 7 * D,
      tags: ['Autorregulação', 'Comportamento'],
      evolucao: 'Trabalhada antecipação de transições com apoio visual. Reduziu tempo de desorganização diante de mudança de atividade.',
      orientacao: 'A Ana lidou melhor com as trocas de atividade hoje. Em casa, avisem com antecedência quando algo vai mudar (ex.: "daqui a 5 minutos vamos jantar").',
      replies: [], readByFamily: true,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'c', ts: now - 2 * D,
      tags: ['Vocabulário', 'Sons novos', 'Trocas comunicativas'],
      evolucao: 'Emissão de dois vocábulos novos ("água" e "mais") mediante pistas visuais e verbais. Ampliar repertório em contexto funcional.',
      orientacao: 'A Ana falou 2 palavras novas na sessão! Tentem repetir "água" e "mais" nas rotinas de casa, principalmente na hora do lanche.',
      replies: [{ id: uid(), authorType: 'familia', authorId: 'voce', authorName: 'Você', color: TEAL, ts: now - 1.8 * D, text: 'Que notícia boa, Carla! Vamos praticar bastante. Obrigada!' }],
      readByFamily: true,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'c', ts: now - 9 * D,
      tags: ['Compreensão', 'Fala funcional'],
      evolucao: 'Melhora na compreensão de ordens simples de dois passos com apoio gestual.',
      orientacao: 'A Ana está entendendo melhor pedidos de dois passos (ex.: "pega o copo e traz aqui"). Podem treinar isso em casa nas rotinas.',
      replies: [], readByFamily: true,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'j', ts: now - 4 * D,
      tags: ['Coordenação motora fina', 'Integração sensorial'],
      evolucao: 'Atividades de pinça e encaixe com boa tolerância. Melhor organização diante de estímulos táteis.',
      orientacao: 'A Ana foi super bem nas atividades de coordenação com as mãos. Em casa, massinha e encaixar peças grandes ajudam bastante.',
      replies: [], readByFamily: false,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'r', ts: now - 5 * D,
      tags: ['Atenção', 'Organização'],
      evolucao: 'Manteve atenção em tarefa dirigida por períodos mais longos com apoio de rotina visual.',
      orientacao: 'A Ana conseguiu se concentrar por mais tempo hoje. Uma rotina visual em casa (com desenhos das etapas do dia) ajuda muito.',
      replies: [], readByFamily: false,
    },
  ]

  const sessions: Session[] = [
    { id: uid(), childId: 'ana', professionalId: 'm', when: 'Amanhã, 15h', ts: now + 1 * D },
    { id: uid(), childId: 'ana', professionalId: 'c', when: 'Quinta, 10h', ts: now + 3 * D },
    { id: uid(), childId: 'lucas', professionalId: 'm', when: 'Sexta, 9h', ts: now + 4 * D },
  ]

  return { children, professionals, registros, prontuario, sessions }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as State
      if (parsed && parsed.children && parsed.prontuario && parsed.registros) return parsed
    }
  } catch {
    // ignora e reseeda
  }
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // sem localStorage: segue em memória
  }
  return s
}

/* ---------- contexto ---------- */

export interface Author {
  type: 'familia' | 'terapeuta'
  id: string
  name: string
  role: string
  color: string
}

export type PostKind = 'diario' | 'sessao'

interface StoreCtx {
  state: State
  addRegistro: (childId: string, data: { sono?: string; alim?: string; humor?: string; crises?: string; obs?: string }) => void
  addProntuario: (childId: string, professionalId: string, data: { tags: string[]; evolucao: string; orientacao: string }) => void
  addReply: (kind: PostKind, id: string, author: Author, text: string) => void
  markRead: (kind: PostKind, id: string) => void
  updateChild: (childId: string, patch: Partial<Child>) => void
  resetAll: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => load())

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // ignora
    }
  }, [state])

  function addRegistro(childId: string, data: { sono?: string; alim?: string; humor?: string; crises?: string; obs?: string }) {
    const today = dayKey(new Date())
    setState((s) => {
      const rest = s.registros.filter((r) => !(r.childId === childId && r.date === today))
      const novo: Registro = { id: uid(), childId, date: today, ...data, replies: [], readByTeam: false }
      return { ...s, registros: [novo, ...rest] }
    })
  }

  function addProntuario(childId: string, professionalId: string, data: { tags: string[]; evolucao: string; orientacao: string }) {
    setState((s) => {
      const entry: ProntuarioEntry = { id: uid(), childId, professionalId, ts: Date.now(), ...data, replies: [], readByFamily: false }
      return { ...s, prontuario: [entry, ...s.prontuario] }
    })
  }

  function addReply(kind: PostKind, id: string, author: Author, text: string) {
    const reply: Reply = { id: uid(), authorType: author.type, authorId: author.id, authorName: author.name, color: author.color, ts: Date.now(), text }
    setState((s) => {
      if (kind === 'sessao') return { ...s, prontuario: s.prontuario.map((e) => (e.id === id ? { ...e, replies: [...e.replies, reply] } : e)) }
      return { ...s, registros: s.registros.map((r) => (r.id === id ? { ...r, replies: [...r.replies, reply] } : r)) }
    })
  }

  function markRead(kind: PostKind, id: string) {
    setState((s) => {
      if (kind === 'sessao') return { ...s, prontuario: s.prontuario.map((e) => (e.id === id ? { ...e, readByFamily: true } : e)) }
      return { ...s, registros: s.registros.map((r) => (r.id === id ? { ...r, readByTeam: true } : r)) }
    })
  }

  function updateChild(childId: string, patch: Partial<Child>) {
    setState((s) => ({ ...s, children: s.children.map((c) => (c.id === childId ? { ...c, ...patch } : c)) }))
  }

  function resetAll() {
    setState(seed())
  }

  return (
    <Ctx.Provider value={{ state, addRegistro, addProntuario, addReply, markRead, updateChild, resetAll }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore(): StoreCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore precisa do StoreProvider')
  return c
}

/* ---------- seletores ---------- */

export function childById(s: State, id: string): Child | undefined {
  return s.children.find((c) => c.id === id)
}

export function proById(s: State, id: string): Professional | undefined {
  return s.professionals.find((p) => p.id === id)
}

export function teamOf(s: State, child: Child): Professional[] {
  return child.teamIds.map((id) => proById(s, id)).filter((p): p is Professional => !!p)
}

export function registrosOf(s: State, childId: string): Registro[] {
  return s.registros.filter((r) => r.childId === childId).slice().sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function prontuarioOf(s: State, childId: string): ProntuarioEntry[] {
  return s.prontuario.filter((e) => e.childId === childId).slice().sort((a, b) => b.ts - a.ts)
}

export function prontuarioByPro(s: State, childId: string, professionalId: string): ProntuarioEntry[] {
  return prontuarioOf(s, childId).filter((e) => e.professionalId === professionalId)
}

export function sessionById(s: State, id: string): ProntuarioEntry | undefined {
  return s.prontuario.find((e) => e.id === id)
}

export function sessionsOf(s: State, childId: string): Session[] {
  return s.sessions.filter((e) => e.childId === childId).slice().sort((a, b) => a.ts - b.ts)
}

// Feed do dia a dia (só posts diários da família), para o PostCard.
export interface TimelineItem {
  kind: 'diario'
  id: string
  ts: number
  authorName: string
  authorRole: string
  color: string
  tags: { sono?: string; alim?: string; humor?: string; crises?: string }
  text?: string
  replies: Reply[]
  readByTeam: boolean
}

export function diarioFeedOf(s: State, childId: string): TimelineItem[] {
  return registrosOf(s, childId).map((r) => ({
    kind: 'diario',
    id: r.id,
    ts: new Date(r.date + 'T20:00:00').getTime(),
    authorName: 'Você',
    authorRole: 'em casa',
    color: TEAL,
    tags: { sono: r.sono, alim: r.alim, humor: r.humor, crises: r.crises },
    text: r.obs && r.obs.trim().length > 0 ? r.obs : undefined,
    replies: r.replies,
    readByTeam: r.readByTeam,
  }))
}

export function streakOf(s: State, childId: string): number {
  const dates = new Set(s.registros.filter((r) => r.childId === childId).map((r) => r.date))
  let streak = 0
  const d = new Date()
  if (!dates.has(dayKey(d))) d.setDate(d.getDate() - 1)
  while (dates.has(dayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export interface WeekDay {
  label: string
  done: boolean
  today: boolean
  future: boolean
}

export function weekOf(s: State, childId: string): WeekDay[] {
  const dates = new Set(s.registros.filter((r) => r.childId === childId).map((r) => r.date))
  const initials = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const today = new Date()
  const dow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - dow)
  const out: WeekDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = dayKey(d)
    out.push({ label: initials[i], done: dates.has(key), today: key === dayKey(today), future: d > today && key !== dayKey(today) })
  }
  return out
}

export function lastUpdateOf(s: State, childId: string): { name: string; rel: string } | null {
  const pron = prontuarioOf(s, childId)[0]
  const reg = registrosOf(s, childId)[0]
  const cands: { name: string; ts: number }[] = []
  if (pron) cands.push({ name: proById(s, pron.professionalId)?.name ?? '', ts: pron.ts })
  if (reg) cands.push({ name: 'Você', ts: new Date(reg.date + 'T20:00:00').getTime() })
  if (cands.length === 0) return null
  cands.sort((a, b) => b.ts - a.ts)
  return { name: cands[0].name, rel: relTime(cands[0].ts) }
}

export interface Achievement {
  label: string
  state: 'earned' | 'next' | 'lock'
  tier: number
}

export function achievementsOf(streak: number): Achievement[] {
  const defs = [
    { t: 7, label: '1 semana' },
    { t: 10, label: '10 dias' },
    { t: 15, label: '15 dias' },
    { t: 30, label: '1 mês' },
  ]
  let nextGiven = false
  return defs.map((d, i) => {
    let st: Achievement['state']
    if (streak >= d.t) st = 'earned'
    else if (!nextGiven) {
      st = 'next'
      nextGiven = true
    } else st = 'lock'
    return { label: d.label, state: st, tier: i }
  })
}
