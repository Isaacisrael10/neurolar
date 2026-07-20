// Telas do TERAPEUTA. Seleciona o paciente (cada um separado) e, dentro dele,
// duas sub-abas: "Dia a dia da família" e "Sessões e prontuário".

import { useState } from 'react'
import {
  useStore, childById, proById, prontuarioOf, teamOf, diarioFeedOf, relTime, fullDate, TAGS_BY_DISCIPLINE,
  type Child, type Author,
} from '../store'
import { useNav } from '../nav'
import { BottomNav, type NavItem } from '../components/BottomNav'
import { PostCard } from '../components/PostCard'
import { PuzzleLogo, ChevronLeft, ChevronRight, Calendar, Note, Check, FileText, Send, NavUsers, NavPerson } from '../components/icons'

const THER = 'm' // terapeuta logada: Marina

function therAuthor(state: ReturnType<typeof useStore>['state']): Author {
  const p = proById(state, THER)!
  return { type: 'terapeuta', id: p.id, name: p.name, role: p.role, color: p.color }
}

const terNav: NavItem[] = [
  { key: 'ter-pacientes', label: 'Pacientes', icon: (on) => <NavUsers stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'ter-agenda', label: 'Agenda', icon: (on) => <Calendar stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'ter-conta', label: 'Conta', icon: (on) => <NavPerson stroke={on ? '#177f70' : '#8496a2'} /> },
]

function TerTabs({ active }: { active: string }) {
  const { goTab } = useNav()
  return <BottomNav items={terNav} active={active} onSelect={goTab} />
}

/* ---------- Lista de pacientes ---------- */

export function TerapeutaPacientes() {
  const { state } = useStore()
  const { navigate } = useNav()
  const pro = proById(state, THER)
  const pacientes = state.children.filter((c) => c.teamIds.includes(THER))

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div>
            <div className="pt">Pacientes</div>
            <div className="ps">{pro?.name} &middot; {pro?.role}</div>
          </div>
          <div className="pblogo"><PuzzleLogo size={22} /><div className="w">montar</div></div>
        </div>

        <div className="rowlist" style={{ marginTop: 8 }}>
          {pacientes.map((c) => {
            const pron = prontuarioOf(state, c.id)[0]
            return (
              <div className="mrow2" key={c.id} onClick={() => navigate('ter-paciente', { childId: c.id })} style={{ cursor: 'pointer' }}>
                <div className="mav" style={{ background: 'linear-gradient(140deg,#5bbfae,#2a9e8c)' }}>{c.initial}</div>
                <div>
                  <div className="mnm">{c.name}, {c.age} anos</div>
                  <div className="mrl">{pron ? `Última sessão ${relTime(pron.ts)}` : c.diagnosis}</div>
                </div>
                <span className="go"><ChevronRight /></span>
              </div>
            )
          })}
        </div>
      </div>
      <TerTabs active="ter-pacientes" />
    </>
  )
}

/* ---------- Paciente (sub-abas) ---------- */

export function TerapeutaPaciente() {
  const { state, addReply } = useStore()
  const { route, back, navigate } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const [tab, setTab] = useState<'diaadia' | 'sessoes'>('diaadia')
  const [sr, setSr] = useState<Record<string, string>>({})
  if (!child) return null

  const team = teamOf(state, child)
  const diarios = diarioFeedOf(state, childId)
  const pron = prontuarioOf(state, childId)
  const author = therAuthor(state)

  function enviarSess(id: string) {
    const t = (sr[id] ?? '').trim()
    if (!t) return
    addReply('sessao', id, author, t)
    setSr((s) => ({ ...s, [id]: '' }))
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          {child.name}
          <small>{child.age} anos &middot; {child.diagnosis}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="subtabs">
          <button className={tab === 'diaadia' ? 'subtab on' : 'subtab'} onClick={() => setTab('diaadia')}>Dia a dia da família</button>
          <button className={tab === 'sessoes' ? 'subtab on' : 'subtab'} onClick={() => setTab('sessoes')}>Sessões e prontuário</button>
        </div>

        {tab === 'diaadia' && (
          <>
            {child.notes && (
              <div className="info-card">
                <div className="il">O que a família contou</div>
                <div className="iv">{child.notes}</div>
              </div>
            )}
            {diarios.length === 0 && <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontWeight: 800, fontSize: 13 }}>Sem registros da família ainda.</div>}
            {diarios.map((it) => <PostCard key={it.id} item={it} author={author} />)}
          </>
        )}

        {tab === 'sessoes' && (
          <>
            <div className="info-card">
              <div className="il">Equipe</div>
              <div className="iv">{team.map((p) => `${p.name} (${p.role})`).join(', ')}</div>
            </div>
            <div className="internal"><Note stroke="#9a6a1a" width={13} height={13} /> A evolução clínica só a equipe vê. O recado a família recebe.</div>
            {pron.map((e) => {
              const p = proById(state, e.professionalId)
              return (
                <div className="post" key={e.id}>
                  <div className="post-h">
                    <div className="post-av" style={{ background: p?.color }}>{p?.initial}</div>
                    <div>
                      <div className="post-who">{p?.name}</div>
                      <div className="post-role">{p?.role} · sessão</div>
                    </div>
                    <div className="post-when">{relTime(e.ts)}</div>
                  </div>
                  <div className="stags" style={{ marginBottom: 8 }}>
                    {e.tags.map((t) => <span className="stag" key={t}>{t}</span>)}
                  </div>
                  <div className="ds-txt">{e.evolucao}</div>
                  <div className="fam-note"><Check stroke="#177f70" width={12} height={12} /> Recado à família: {e.orientacao}</div>
                  {e.replies.length > 0 && (
                    <div className="comments">
                      {e.replies.map((c) => (
                        <div className="comment" key={c.id}>
                          <div className="c-av" style={{ background: c.color }}>{c.authorName.charAt(0)}</div>
                          <div className="c-body">
                            <div className="c-top"><span className="c-who">{c.authorName}</span><span className="c-when">{relTime(c.ts)}</span></div>
                            <div className="c-text">{c.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="c-add">
                    <input className="c-input" placeholder="Responder à família..." value={sr[e.id] ?? ''} onChange={(ev) => setSr((s) => ({ ...s, [e.id]: ev.target.value }))} onKeyDown={(ev) => { if (ev.key === 'Enter') enviarSess(e.id) }} />
                    <button className="c-send" onClick={() => enviarSess(e.id)} aria-label="Responder"><Send /></button>
                  </div>
                </div>
              )
            })}
            <button className="btn-ghost" onClick={() => navigate('ter-prontuario', { childId })}>
              <FileText /> Ver prontuário formal
            </button>
          </>
        )}
      </div>

      <div className="savebar">
        <div className="btn" onClick={() => navigate('ter-registrar', { childId })}>
          <Note stroke="#fff" /> Registrar sessão de hoje
        </div>
      </div>
    </div>
  )
}

/* ---------- Registrar sessão (evolução interna + recado família) ---------- */

export function TerapeutaRegistrar() {
  const { state, addProntuario } = useStore()
  const { route, back } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const pro = proById(state, THER)
  const disciplineTags = pro ? TAGS_BY_DISCIPLINE[pro.discipline] ?? [] : []
  const [tags, setTags] = useState<string[]>([])
  const [evolucao, setEvolucao] = useState('')
  const [orientacao, setOrientacao] = useState('')
  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))

  function salvar() {
    addProntuario(childId, THER, {
      tags: tags.length ? tags : ['Sessão'],
      evolucao: evolucao.trim() || 'Sessão realizada.',
      orientacao: orientacao.trim() || 'Sessão realizada, sem orientações específicas para casa hoje.',
    })
    back()
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          Registrar sessão
          <small>{child?.name} &middot; {pro?.name}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="q">
          <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Note stroke="#177f70" /></span>O que foi trabalhado</div>
          <div className="reg-s" style={{ marginBottom: 11 }}>Marque as áreas de {pro?.discipline} trabalhadas nesta sessão.</div>
          <div className="filters" style={{ margin: 0, flexWrap: 'wrap', overflow: 'visible' }}>
            {disciplineTags.map((t) => (
              <button key={t} className={tags.includes(t) ? 'fil on' : 'fil'} onClick={() => toggleTag(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="q">
          <div className="q-h"><span className="qi" style={{ background: '#fbf0d8' }}><Note stroke="#9a6a1a" /></span>Evolução (clínica)</div>
          <div className="internal" style={{ marginBottom: 10 }}>Só a equipe vê. Vira o prontuário formal.</div>
          <textarea className="obs" placeholder="Registro técnico da sessão: evolução observada, objetivos, condutas." value={evolucao} onChange={(e) => setEvolucao(e.target.value)} />
        </div>

        <div className="q">
          <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Check stroke="#177f70" width={19} height={19} /></span>Recado para a família</div>
          <div className="fam-note" style={{ marginBottom: 10 }}>A família vê isto em "Da equipe", em linguagem clara.</div>
          <textarea className="obs" placeholder="Em linguagem simples: o que evoluiu e o que a família pode fazer em casa." value={orientacao} onChange={(e) => setOrientacao(e.target.value)} />
        </div>
      </div>

      <div className="savebar">
        <div className="btn" onClick={salvar}><Check stroke="#fff" width={18} height={18} /> Publicar sessão</div>
      </div>
    </div>
  )
}

/* ---------- Prontuário formal (montado automaticamente) ---------- */

export function TerapeutaProntuario() {
  const { state } = useStore()
  const { route, back } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const pron = prontuarioOf(state, childId)
  if (!child) return null

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          Prontuário formal
          <small>{child.name}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="doc">
          <div className="doc-title">Prontuário — {child.name}</div>
          <div className="doc-meta">{child.age} anos &middot; {child.diagnosis} &middot; Clínica Semear</div>
          <div className="doc-auto"><FileText stroke="#177f70" /> Montado automaticamente a partir das sessões da equipe</div>
          {pron.map((e) => {
            const p = proById(state, e.professionalId)
            return (
              <div className="doc-sess" key={e.id}>
                <div className="ds-h">
                  <div className="ds-date">{fullDate(e.ts)}</div>
                  <div className="ds-pro" style={{ color: p?.color }}>{p?.name} &middot; {p?.role}</div>
                </div>
                <div className="stags" style={{ margin: '8px 0 0' }}>
                  {e.tags.map((t) => <span className="stag" key={t}>{t}</span>)}
                </div>
                <div className="ds-txt">{e.evolucao}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Agenda ---------- */

export function TerapeutaAgenda() {
  const { state } = useStore()
  const { navigate } = useNav()
  const minhas = state.sessions.filter((se) => se.professionalId === THER).sort((a, b) => a.ts - b.ts)

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div><div className="pt">Agenda</div><div className="ps">suas próximas sessões</div></div>
        </div>
        <div className="rowlist" style={{ marginTop: 8 }}>
          {minhas.map((se) => {
            const c = childById(state, se.childId) as Child
            return (
              <div className="mrow2" key={se.id} onClick={() => navigate('ter-paciente', { childId: se.childId })} style={{ cursor: 'pointer' }}>
                <div className="mav" style={{ background: 'linear-gradient(140deg,#5bbfae,#2a9e8c)' }}>{c?.initial}</div>
                <div>
                  <div className="mnm">{c?.name}</div>
                  <div className="mrl">{se.when}</div>
                </div>
                <span className="go"><ChevronRight /></span>
              </div>
            )
          })}
        </div>
      </div>
      <TerTabs active="ter-agenda" />
    </>
  )
}

/* ---------- Conta ---------- */

export function TerapeutaConta() {
  const { state } = useStore()
  const { exit } = useNav()
  const pro = proById(state, THER)

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div><div className="pt">Conta</div><div className="ps">perfil profissional</div></div>
        </div>
        <div className="child" style={{ paddingTop: 8 }}>
          <div className="kid" style={{ background: pro?.color }}>{pro?.initial}</div>
          <div>
            <div className="name">{pro?.name}</div>
            <div className="sub">{pro?.role}</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={exit} style={{ marginTop: 18 }}>Trocar de perfil</button>
      </div>
      <TerTabs active="ter-conta" />
    </>
  )
}
