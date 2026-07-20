// Telas do TERAPEUTA. Lista de pacientes (cards ricos). Dentro do paciente, duas
// sub-abas: "Dia a dia da família" e "Sessões e prontuário" (separado por
// disciplina). Clica numa disciplina -> timeline daquela terapia (com evolução interna).

import { useState } from 'react'
import {
  useStore, childById, proById, prontuarioOf, prontuarioByPro, teamOf, diarioFeedOf, discussionOf, homeworkByPro, homeworkWeekCount, agendaDayLabel, dayKey, relTime, fullDate, longDate, TAGS_BY_DISCIPLINE,
  type Child, type Author,
} from '../store'
import { useNav } from '../nav'
import { BottomNav, type NavItem } from '../components/BottomNav'
import { PostCard } from '../components/PostCard'
import { NeuroLarLogo, ChevronLeft, ChevronRight, Calendar, Note, Check, FileText, Send, Target, Chat, Clipboard, Plus, Search, NavUsers, NavPerson } from '../components/icons'
import { Diag } from '../components/Diag'
import { Avatar } from '../components/Avatar'
import { TherapistMetas } from '../components/Metas'

const THER = 'm' // terapeuta logada: Marina
const KIDBG = 'linear-gradient(140deg,#a78bfa,#7c3aed)'

function therAuthor(state: ReturnType<typeof useStore>['state']): Author {
  const p = proById(state, THER)!
  return { type: 'terapeuta', id: p.id, name: p.name, role: p.role, color: p.color }
}

const terNav: NavItem[] = [
  { key: 'ter-pacientes', label: 'Pacientes', icon: (on) => <NavUsers stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'ter-agenda', label: 'Agenda', icon: (on) => <Calendar stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'ter-conta', label: 'Conta', icon: (on) => <NavPerson stroke={on ? '#6d28d9' : '#938aa8'} /> },
]

function TerTabs({ active }: { active: string }) {
  const { goTab } = useNav()
  return <BottomNav items={terNav} active={active} onSelect={goTab} />
}

/* ---------- Lista de pacientes (cards ricos) ---------- */

export function TerapeutaPacientes() {
  const { state } = useStore()
  const { navigate } = useNav()
  const pro = proById(state, THER)
  const pacientes = state.children.filter((c) => c.teamIds.includes(THER))
  const [q, setQ] = useState('')
  const termo = q.trim().toLowerCase()
  const pacFiltrados = termo ? pacientes.filter((c) => c.name.toLowerCase().includes(termo) || c.diagnosis.toLowerCase().includes(termo)) : pacientes

  // sessões da semana atual (segunda a domingo)
  const t = new Date()
  const dow = (t.getDay() + 6) % 7
  const mon = new Date(t); mon.setHours(0, 0, 0, 0); mon.setDate(t.getDate() - dow)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 7)
  const sessoesSemana = state.sessions.filter((se) => se.professionalId === THER && se.ts >= mon.getTime() && se.ts < sun.getTime()).length
  const hoje = dayKey(new Date())
  const sessoesHoje = state.sessions.filter((se) => se.professionalId === THER && dayKey(new Date(se.ts)) === hoje).length

  // novidades: registros da família ainda não lidos pela equipe, dos pacientes dela
  const novidades = state.registros
    .filter((r) => !r.readByTeam && pacientes.some((p) => p.id === r.childId))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div>
            <div className="pt">Pacientes</div>
            <div className="ps">{pro?.name} &middot; {pro?.role}</div>
          </div>
          <div className="pblogo"><NeuroLarLogo size={22} /><div className="w">Neuro<span>Lar</span></div></div>
        </div>

        <div className="statgrid">
          <div className="statc">
            <div className="si" style={{ background: 'var(--teal-soft)' }}><NavUsers stroke="#6d28d9" /></div>
            <div className="sv">{pacientes.length}</div>
            <div className="sl">pacientes ativos</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: '#e8f2fb' }}><Calendar stroke="#3b8fd4" /></div>
            <div className="sv">{sessoesHoje}</div>
            <div className="sl">sessões hoje</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: '#e6f4ec' }}><Calendar stroke="#45a86a" /></div>
            <div className="sv">{sessoesSemana}</div>
            <div className="sl">sessões esta semana</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: '#fcf1d8' }}><Chat stroke="#c9861a" /></div>
            <div className="sv">{novidades.length}</div>
            <div className="sl">novidades da família</div>
          </div>
        </div>

        <div className="sec-h"><div className="t"><NavUsers stroke="#2c3e4a" /> Seus pacientes</div></div>
        <div className="searchbar">
          <Search />
          <input placeholder="Buscar por nome ou diagnóstico" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {termo && <div className="dl" style={{ margin: '0 4px 10px', fontWeight: 800 }}>{pacFiltrados.length} resultado{pacFiltrados.length === 1 ? '' : 's'}</div>}
        {pacFiltrados.length === 0 && <div className="empty"><Search stroke="#bdb6cb" /> Nenhum paciente encontrado.</div>}
        {pacFiltrados.map((c) => {
          const sess = prontuarioOf(state, c.id)
          const last = sess[0]
          const lastPro = last ? proById(state, last.professionalId) : null
          const novos = state.registros.filter((r) => r.childId === c.id && !r.readByTeam).length
          return (
            <div className="disc-card" key={c.id} onClick={() => navigate('ter-paciente', { childId: c.id })}>
              <div className="disc-top">
                <Avatar photo={c.photo} initial={c.initial} className="disc-ic" />
                <div>
                  <div className="disc-name">{c.name}, {c.age} anos</div>
                  <div className="disc-sub"><Diag text={c.diagnosis} /></div>
                </div>
                <span className="go">
                  {novos > 0 && <span className="novo">{novos} novo{novos > 1 ? 's' : ''}</span>}
                  <ChevronRight />
                </span>
              </div>
              {last && lastPro && (
                <div className="disc-foot">
                  <div className="dl">Última sessão {relTime(last.ts)} &middot; {lastPro.discipline}</div>
                  <div className="stags">
                    {last.tags.map((t) => <span className="stag-c" key={t} style={{ background: `${lastPro.color}1a`, color: lastPro.color }}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {novidades.length > 0 && (
          <>
            <div className="sec-h"><div className="t"><Chat stroke="#2c3e4a" /> Novidades da família</div></div>
            {novidades.slice(0, 6).map((r) => {
              const c = childById(state, r.childId)
              const ts = new Date(r.date + 'T20:00:00').getTime()
              const preview = r.obs && r.obs.trim() ? r.obs : `Sono: ${r.sono} · Alimentação: ${r.alim} · Humor: ${r.humor}`
              return (
                <div className="disc-card" key={r.id} onClick={() => navigate('ter-paciente', { childId: r.childId })}>
                  <div className="disc-top">
                    <Avatar photo={c?.photo} initial={c?.initial ?? ''} className="disc-ic" />
                    <div>
                      <div className="disc-name">{c?.name}</div>
                      <div className="disc-sub">Registro em casa &middot; {relTime(ts)}</div>
                    </div>
                    <span className="go"><span className="novo">Novo</span><ChevronRight /></span>
                  </div>
                  <div className="disc-foot">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#645d78', lineHeight: 1.45 }}>{preview}</div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
      <TerTabs active="ter-pacientes" />
    </>
  )
}

/* ---------- Paciente (sub-abas) ---------- */

export function TerapeutaPaciente() {
  const { state } = useStore()
  const { route, back, navigate } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const [tab, setTab] = useState<'diaadia' | 'sessoes'>('diaadia')
  if (!child) return null

  const team = teamOf(state, child)
  const diarios = diarioFeedOf(state, childId)
  const author = therAuthor(state)
  const discussao = discussionOf(state, childId)
  const ultima = discussao[discussao.length - 1]
  const ultimaPro = ultima ? proById(state, ultima.professionalId) : null

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
        <div className="team-card" onClick={() => navigate('ter-discussao', { childId })}>
          <div className="team-head">
            <div className="team-avs">
              {team.slice(0, 4).map((p, i) => (
                <div className="team-av" key={p.id} style={{ background: p.color, zIndex: 4 - i }}>{p.initial}</div>
              ))}
            </div>
            <div className="team-meta">
              <div className="team-t"><Chat stroke="#6d28d9" /> Discussão da equipe</div>
              <div className="team-s">{team.length} profissionais &middot; só a equipe vê</div>
            </div>
            <span className="go"><ChevronRight /></span>
          </div>
          {ultima && ultimaPro && (
            <div className="team-prev">
              <span className="team-prev-who" style={{ color: ultimaPro.color }}>{ultimaPro.name}:</span> {ultima.text}
            </div>
          )}
        </div>

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
            <div className="internal"><Note stroke="#9a6a1a" width={13} height={13} /> A evolução clínica só a equipe vê. O recado a família recebe.</div>
            <button className="btn-ghost" onClick={() => navigate('relatorio', { childId })}><FileText stroke="#6d28d9" width={17} height={17} /> Gerar relatório de evolução</button>
            {team.map((p) => {
              const sess = prontuarioByPro(state, childId, p.id)
              const last = sess[0]
              return (
                <div className="disc-card" key={p.id} onClick={() => navigate('ter-disciplina', { childId, proId: p.id })}>
                  <div className="disc-top">
                    <div className="disc-ic" style={{ background: p.color }}>{p.initial}</div>
                    <div>
                      <div className="disc-name">{p.discipline}</div>
                      <div className="disc-sub"><span className="disc-who">{p.name}</span> &middot; {sess.length} sess{sess.length === 1 ? 'ão' : 'ões'}</div>
                    </div>
                    <span className="go"><ChevronRight /></span>
                  </div>
                  <div className="disc-foot">
                    {last ? (
                      <>
                        <div className="dl">Última sessão {relTime(last.ts)}</div>
                        <div className="stags">
                          {last.tags.map((t) => <span className="stag-c" key={t} style={{ background: `${p.color}1a`, color: p.color }}>{t}</span>)}
                        </div>
                      </>
                    ) : (
                      <div className="dl" style={{ marginBottom: 0 }}>Sem sessões registradas ainda</div>
                    )}
                  </div>
                </div>
              )
            })}
            <button className="btn-ghost" onClick={() => navigate('ter-tarefas', { childId })}>
              <Clipboard stroke="#6d28d9" /> Tarefas de casa
            </button>
            <button className="btn-ghost" onClick={() => navigate('ter-prontuario', { childId })}>
              <FileText /> Ver prontuário formal
            </button>
          </>
        )}
      </div>

      {tab === 'sessoes' && (
        <div className="savebar">
          <div className="btn" onClick={() => navigate('ter-registrar', { childId })}>
            <Note stroke="#fff" /> Registrar sessão de hoje
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Discussão da equipe (fechada, só profissionais) ---------- */

export function TerapeutaDiscussao() {
  const { state, addTeamNote, shareTeamNoteToFamily } = useStore()
  const { route, back } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const [msg, setMsg] = useState('')
  const [shareFor, setShareFor] = useState<string | null>(null)
  const [shareText, setShareText] = useState('')
  if (!child) return null

  const team = teamOf(state, child)
  const notes = discussionOf(state, childId)

  function enviar() {
    const t = msg.trim()
    if (!t) return
    addTeamNote(childId, THER, t)
    setMsg('')
  }

  function compartilhar(noteId: string) {
    const t = shareText.trim()
    if (!t) return
    shareTeamNoteToFamily(noteId, t)
    setShareFor(null)
    setShareText('')
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          Discussão da equipe
          <small>{child.name} &middot; só a equipe vê</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="internal"><Note stroke="#9a6a1a" width={13} height={13} /> Conversa fechada da equipe. A família não vê nada aqui. Ao chegarem numa conclusão, enviem só ela como recado à família.</div>

        <div className="team-strip">
          {team.map((p) => (
            <div className="ts-item" key={p.id}>
              <div className="ts-av" style={{ background: p.color }}>{p.initial}</div>
              <div className="ts-nm">{p.name}</div>
              <div className="ts-rl">{p.discipline}</div>
            </div>
          ))}
        </div>

        {notes.map((n) => {
          const p = proById(state, n.professionalId)
          const mine = n.professionalId === THER
          const color = p?.color ?? '#938aa8'
          return (
            <div className={mine ? 'tmsg mine' : 'tmsg'} key={n.id}>
              <div className="tmsg-av" style={{ background: color }}>{p?.initial}</div>
              <div className="tmsg-body" style={{ borderLeftColor: color }}>
                <div className="tmsg-top">
                  <span className="tmsg-who" style={{ color }}>{p?.name}</span>
                  <span className="tmsg-role">{p?.role}</span>
                  <span className="tmsg-when">{relTime(n.ts)}</span>
                </div>
                <div className="tmsg-text">{n.text}</div>

                {n.sharedToFamily ? (
                  <div className="shared-tag"><Check stroke="#6d28d9" width={11} height={11} /> Conclusão enviada à família</div>
                ) : shareFor === n.id ? (
                  <div className="share-box">
                    <div className="fam-note" style={{ marginBottom: 8 }}><Check stroke="#6d28d9" width={12} height={12} /> Escreva em linguagem clara. Só isto a família vai ler.</div>
                    <textarea className="obs" placeholder="Ex.: A equipe alinhou uma novidade pra Ana. Antes das atividades, faça uns minutinhos de movimento com ela (pular, empurrar almofada). Ajuda ela a focar melhor." value={shareText} onChange={(e) => setShareText(e.target.value)} />
                    <div className="share-actions">
                      <button className="sa-cancel" onClick={() => { setShareFor(null); setShareText('') }}>Cancelar</button>
                      <button className="sa-send" onClick={() => compartilhar(n.id)}><Send stroke="#fff" /> Enviar à família</button>
                    </div>
                  </div>
                ) : (
                  <button className="share-link" onClick={() => { setShareFor(n.id); setShareText('') }}>Compartilhar esta conclusão com a família</button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="savebar">
        <div className="c-add" style={{ margin: 0, width: '100%' }}>
          <input className="c-input" placeholder="Escrever para a equipe..." value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviar() }} />
          <button className="c-send" onClick={enviar} aria-label="Enviar"><Send /></button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Tarefas de casa (o terapeuta passa, vê adesão da família) ---------- */

const FREQS = ['Diário', '3x na semana', '2x na semana', 'Livre']

export function TerapeutaTarefas() {
  const { state, addHomework } = useStore()
  const { route, back } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const pro = proById(state, THER)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [freq, setFreq] = useState('Diário')
  if (!child || !pro) return null

  const minhas = homeworkByPro(state, childId, THER)
  const color = pro.color

  function salvar() {
    const t = title.trim()
    if (!t) return
    addHomework(childId, THER, { title: t, detail: detail.trim() || 'Sem detalhes adicionais.', frequency: freq })
    setTitle('')
    setDetail('')
    setFreq('Diário')
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          Tarefas de casa
          <small>{child.name} &middot; {pro.discipline}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="fam-note" style={{ marginBottom: 14 }}><Check stroke="#6d28d9" width={12} height={12} /> A família vê suas tarefas em "Para casa", junto com as das outras terapias, e marca o que fez.</div>

        {minhas.length > 0 && <div className="reg-s" style={{ marginBottom: 10, fontWeight: 800 }}>Suas tarefas ativas</div>}
        {minhas.map((h) => {
          const wk = homeworkWeekCount(h)
          return (
            <div className="hw" key={h.id} style={{ borderLeftColor: color, cursor: 'default' }}>
              <div className="hw-top">
                <span className="hw-freq">{h.frequency}</span>
              </div>
              <div className="hw-title">{h.title}</div>
              <div className="hw-detail">{h.detail}</div>
              <div className="hw-foot">
                <span className="hw-adh" style={{ color }}><Check stroke={color} width={12} height={12} /> Família cumpriu {wk} {wk === 1 ? 'dia' : 'dias'} esta semana</span>
              </div>
            </div>
          )
        })}

        <div className="q" style={{ marginTop: 6 }}>
          <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Plus stroke="#6d28d9" /></span>Nova tarefa de casa</div>
          <input className="c-input" style={{ width: '100%', boxSizing: 'border-box', marginBottom: 10, borderRadius: 14, padding: '11px 14px', fontSize: 13.5 }} placeholder="Título curto (ex.: Joguinhos de contato visual)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="obs" style={{ minHeight: 78, marginBottom: 11 }} placeholder="Como fazer em casa, em linguagem simples pra família." value={detail} onChange={(e) => setDetail(e.target.value)} />
          <div className="reg-s" style={{ marginBottom: 8 }}>Com que frequência?</div>
          <div className="filters" style={{ margin: 0, flexWrap: 'wrap', overflow: 'visible' }}>
            {FREQS.map((f) => (
              <button key={f} className={freq === f ? 'fil on' : 'fil'} onClick={() => setFreq(f)}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="savebar">
        <div className="btn" onClick={salvar}><Plus stroke="#fff" /> Passar tarefa</div>
      </div>
    </div>
  )
}

/* ---------- Sessões de uma disciplina (timeline com evolução interna) ---------- */

export function TerapeutaDisciplina() {
  const { state, addReply } = useStore()
  const { route, back, navigate } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const proId = (route?.params?.proId as string) ?? 'm'
  const child = childById(state, childId)
  const pro = proById(state, proId)
  const [sr, setSr] = useState<Record<string, string>>({})
  if (!child || !pro) return null
  const color = pro.color
  const sessions = prontuarioByPro(state, childId, proId)
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
          {pro.discipline}
          <small>{child.name} &middot; {pro.name}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="internal"><Note stroke="#9a6a1a" width={13} height={13} /> A evolução clínica só a equipe vê. O recado a família recebe.</div>

        <TherapistMetas childId={childId} professionalId={proId} />

        <div className="sec-h" style={{ marginTop: 20 }}><div className="t"><Note stroke="#2c3e4a" width={16} height={16} /> Sessões</div></div>
        {sessions.length === 0 && <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontWeight: 800, fontSize: 13 }}>Nenhuma sessão registrada ainda.</div>}

        <div className="timeline">
          {sessions.map((e) => (
            <div className="tl" key={e.id}>
              <div className="tl-node" style={{ background: color }}></div>
              <div className="card sheet">
                <div className="sheet-head" style={{ background: `linear-gradient(180deg, ${color}14, transparent)` }}>
                  <div className="savatar" style={{ background: color }}>{pro.initial}</div>
                  <div style={{ flex: 1 }}>
                    <div className="sh-name">{pro.name}</div>
                    <div className="sh-sub">{longDate(e.ts)}</div>
                  </div>
                  <span className="disc-badge" style={{ background: `${color}1f`, color }}>{pro.discipline}</span>
                </div>

                <div className="sheet-sec">
                  <div className="block-h ico"><Target stroke={color} /> O que foi trabalhado</div>
                  <div className="stags">
                    {e.tags.map((t) => <span className="stag-c" key={t} style={{ background: `${color}1a`, color }}>{t}</span>)}
                  </div>
                </div>

                <div className="sheet-sec">
                  <div className="block-h ico"><Note stroke={color} /> Evolução (clínica)</div>
                  <div className="post-text">{e.evolucao}</div>
                </div>

                <div className="sheet-sec">
                  <div className="fam-note" style={{ marginBottom: 9 }}><Check stroke="#6d28d9" width={12} height={12} /> Recado enviado à família</div>
                  <div className="post-text">{e.orientacao}</div>
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
              </div>
            </div>
          ))}
          {sessions.length > 0 && (
            <div className="tl">
              <div className="tl-node tl-start"></div>
              <div className="tl-start-label">Início do acompanhamento na {pro.discipline}</div>
            </div>
          )}
        </div>
      </div>

      {proId === THER && (
        <div className="savebar">
          <div className="btn" onClick={() => navigate('ter-registrar', { childId })}>
            <Note stroke="#fff" /> Registrar sessão de hoje
          </div>
        </div>
      )}
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
          <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Note stroke="#6d28d9" /></span>O que foi trabalhado</div>
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
          <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Check stroke="#6d28d9" width={19} height={19} /></span>Recado para a família</div>
          <div className="fam-note" style={{ marginBottom: 10 }}>A família vê isto em "Sessões", em linguagem clara.</div>
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
          <div className="doc-auto"><FileText stroke="#6d28d9" /> Montado automaticamente a partir das sessões da equipe</div>
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
  const pro = proById(state, THER)
  const minhas = state.sessions.filter((se) => se.professionalId === THER).slice().sort((a, b) => a.ts - b.ts)
  let lastDay = ''

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div><div className="pt">Agenda</div><div className="ps">{minhas.length} sess{minhas.length === 1 ? 'ão' : 'ões'} agendada{minhas.length === 1 ? '' : 's'}</div></div>
        </div>

        {minhas.length === 0 && <div className="empty"><Calendar stroke="#bdb6cb" /> Nenhuma sessão agendada.</div>}

        {minhas.map((se) => {
          const c = childById(state, se.childId) as Child
          const dk = dayKey(new Date(se.ts))
          const novoDia = dk !== lastDay
          lastDay = dk
          const timeLabel = se.when.includes(',') ? se.when.split(',')[1].trim() : se.when
          return (
            <div key={se.id}>
              {novoDia && <div className="agd-day">{agendaDayLabel(se.ts)}</div>}
              <div className="agd" onClick={() => navigate('ter-paciente', { childId: se.childId })} style={{ cursor: 'pointer' }}>
                <Avatar photo={c?.photo} initial={c?.initial ?? ''} className="agd-ic" />
                <div className="agd-main">
                  <div className="agd-title">{c?.name}</div>
                  <div className="agd-meta">
                    <span className="agd-time" style={{ color: 'var(--teal-d)' }}>{timeLabel}</span>
                    <span className="agd-sub">&middot; {pro?.discipline}</span>
                  </div>
                </div>
                <span className="go" style={{ alignSelf: 'center' }}><ChevronRight /></span>
              </div>
            </div>
          )
        })}
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
