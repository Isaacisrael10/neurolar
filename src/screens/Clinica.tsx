// Telas da CLÍNICA (o comprador). Painel que mostra valor: atividade da equipe e
// engajamento das famílias. Pacientes e Equipe em cards ricos, color-coded.

import { useState } from 'react'
import { useStore, childById, proById, teamOf, prontuarioOf, metasOf, relTime, clinicAgenda, allSalas, roomConflicts, agendaDayLabel, financeiroResumo, pagamentosDoMes, gastosDoMes, GASTO_CATEGORIES, brl } from '../store'
import { MetaCard } from '../components/Metas'
import { useNav } from '../nav'
import { BottomNav, type NavItem } from '../components/BottomNav'
import { NeuroLarLogo, NavChart, NavUsers, NavPerson, NavMoney, Clipboard, Target, Search, Calendar, ChevronLeft, ChevronRight } from '../components/icons'
import { Diag } from '../components/Diag'
import { Avatar } from '../components/Avatar'

const KIDBG = 'linear-gradient(140deg,#a78bfa,#7c3aed)'
const D = 24 * 3600000

const cliNav: NavItem[] = [
  { key: 'cli-painel', label: 'Painel', icon: (on) => <NavChart stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'cli-pacientes', label: 'Pacientes', icon: (on) => <NavUsers stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'cli-agenda', label: 'Agenda', icon: (on) => <Calendar stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'cli-equipe', label: 'Equipe', icon: (on) => <NavPerson stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'cli-financeiro', label: 'Financeiro', icon: (on) => <NavMoney stroke={on ? '#6d28d9' : '#938aa8'} /> },
]

function CliTabs({ active }: { active: string }) {
  const { goTab } = useNav()
  return <BottomNav items={cliNav} active={active} onSelect={goTab} />
}

export function ClinicaPainel() {
  const { state } = useStore()
  const { exit } = useNav()
  const now = Date.now()
  const nPac = state.children.length
  const nTer = state.professionals.length
  const sess30 = state.prontuario.filter((e) => now - e.ts < 30 * D).length
  const reg7 = state.registros.filter((r) => now - new Date(r.date + 'T20:00:00').getTime() < 7 * D).length

  const atividade = [
    ...state.prontuario.map((e) => {
      const p = proById(state, e.professionalId)
      return { id: e.id, ts: e.ts, avatar: p?.initial ?? '?', color: p?.color ?? '#7c3aed', who: p?.name ?? '', action: 'registrou uma sessão de', childId: e.childId }
    }),
    ...state.registros.map((r) => ({ id: r.id, ts: new Date(r.date + 'T20:00:00').getTime(), avatar: 'F', color: '#7c3aed', who: 'A família', action: 'registrou o dia de', childId: r.childId })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 7)

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div><div className="pt">Painel</div><div className="ps">Clínica Semear</div></div>
          <div className="pblogo"><NeuroLarLogo size={22} /><div className="w">Neuro<span>Lar</span></div></div>
        </div>

        <div className="statgrid">
          <div className="statc">
            <div className="si" style={{ background: 'var(--teal-soft)' }}><NavUsers stroke="#6d28d9" /></div>
            <div className="sv">{nPac}</div>
            <div className="sl">pacientes ativos</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: 'var(--blue-soft)' }}><NavPerson stroke="#2f7bbf" /></div>
            <div className="sv">{nTer}</div>
            <div className="sl">terapeutas</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: 'var(--amber-soft)' }}><Clipboard stroke="#b57d16" /></div>
            <div className="sv">{sess30}</div>
            <div className="sl">sessões nos últimos 30 dias</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: 'var(--green-soft)' }}><Target stroke="#2f8451" /></div>
            <div className="sv">{reg7}</div>
            <div className="sl">registros das famílias na semana</div>
          </div>
        </div>

        <div className="sec-h"><div className="t">Atividade recente</div></div>
        <div className="log">
          {atividade.map((a) => {
            const c = childById(state, a.childId)
            return (
              <div className="logrow" key={a.id}>
                <Avatar photo={c?.photo} initial={c?.initial ?? '?'} className="log-av" />
                <div className="log-txt"><b>{a.who}</b> {a.action} <b>{c?.name}</b></div>
                <div className="log-when">{relTime(a.ts)}</div>
              </div>
            )
          })}
        </div>

        <button className="btn-ghost" onClick={exit}>Trocar de perfil</button>
      </div>
      <CliTabs active="cli-painel" />
    </>
  )
}

export function ClinicaFinanceiro() {
  const { state, togglePagamento, addDocumento, addGasto } = useStore()
  const [recibos, setRecibos] = useState<Set<string>>(new Set())
  const [gForm, setGForm] = useState(false)
  const [gCat, setGCat] = useState('Materiais')
  const [gDesc, setGDesc] = useState('')
  const [gVal, setGVal] = useState('')
  const resumo = financeiroResumo(state)
  const list = pagamentosDoMes(state).slice().sort((a, b) => (a.status === b.status ? 0 : a.status === 'pendente' ? -1 : 1))
  const gastos = gastosDoMes(state)
  const mesLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const pct = resumo.total ? Math.round((resumo.recebido / resumo.total) * 100) : 0

  function gerarRecibo(childId: string, valor: number) {
    addDocumento(childId, { name: `Recibo - ${mesLabel}`, category: 'Recibo', note: `Mensalidade de ${brl(valor)} referente a ${mesLabel}, paga à Clínica Semear.` })
    setRecibos((prev) => new Set(prev).add(childId))
  }

  function salvarGasto() {
    const v = parseInt(gVal.replace(/\D/g, ''), 10)
    if (!v || !gDesc.trim()) return
    addGasto({ categoria: gCat, descricao: gDesc.trim(), valor: v })
    setGDesc(''); setGVal(''); setGForm(false)
  }

  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Financeiro</div><div className="ps">Clínica Semear &middot; {mesLabel}</div></div></div>

        <div className={resumo.lucro >= 0 ? 'fin-lucro' : 'fin-lucro neg'}>
          <div className="flu-l">Lucro do mês</div>
          <div className="flu-v">{brl(resumo.lucro)}</div>
          <div className="flu-s">Recebido {brl(resumo.recebido)} &minus; Gastos {brl(resumo.gastos)}</div>
        </div>
        <div className="fin-cards">
          <div className="fin-card green"><div className="fc-l">Recebido</div><div className="fc-v">{brl(resumo.recebido)}</div></div>
          <div className="fin-card coral"><div className="fc-l">Gastos</div><div className="fc-v">{brl(resumo.gastos)}</div></div>
          <div className="fin-card"><div className="fc-l">Pendente</div><div className="fc-v">{brl(resumo.pendente)}</div></div>
        </div>
        <div className="fin-bar"><span style={{ width: pct + '%' }}></span></div>
        <div className="fin-barlbl">{pct}% recebido &middot; {resumo.nPagos} de {resumo.nTotal} famílias em dia</div>

        <div className="sec-h"><div className="t">Mensalidades</div></div>
        {list.map((pg) => {
          const c = childById(state, pg.childId)
          const pago = pg.status === 'pago'
          return (
            <div className="fin-row" key={pg.id}>
              <Avatar photo={c?.photo} initial={c?.initial ?? '?'} className="fin-av" />
              <div className="fin-mid">
                <div className="fin-name">{c?.name}</div>
                <div className="fin-val">{brl(pg.valor)} / mês</div>
              </div>
              <div className="fin-right">
                <button className={pago ? 'fin-st pago' : 'fin-st pend'} onClick={() => togglePagamento(pg.id)}>{pago ? 'Pago' : 'Pendente'}</button>
                {pago && (recibos.has(pg.childId)
                  ? <span className="fin-rec done">✓ recibo no cofre</span>
                  : <button className="fin-rec" onClick={() => gerarRecibo(pg.childId, pg.valor)}>Gerar recibo</button>)}
              </div>
            </div>
          )
        })}

        <div className="sec-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="t">Gastos do mês</div>
          <button className="seemore" onClick={() => setGForm(!gForm)}>{gForm ? 'Cancelar' : '+ Adicionar'}</button>
        </div>
        {gForm && (
          <div className="gasto-form">
            <div className="gf-cats">
              {GASTO_CATEGORIES.map((c) => <button key={c} className={gCat === c ? 'gf-cat on' : 'gf-cat'} onClick={() => setGCat(c)}>{c}</button>)}
            </div>
            <input className="c-input" placeholder="Descrição (ex.: Conta de luz)" value={gDesc} onChange={(e) => setGDesc(e.target.value)} />
            <div className="gf-row">
              <input className="c-input" placeholder="Valor (R$)" inputMode="numeric" value={gVal} onChange={(e) => setGVal(e.target.value)} />
              <button className="gf-save" onClick={salvarGasto}>Salvar</button>
            </div>
          </div>
        )}
        {gastos.map((g) => (
          <div className="gasto-row" key={g.id}>
            <div className="gasto-mid">
              <div className="gasto-desc">{g.descricao}</div>
              <div className="gasto-cat">{g.categoria}</div>
            </div>
            <div className="gasto-val">&minus; {brl(g.valor)}</div>
          </div>
        ))}

        <div className="rep-foot">Financeiro leve: mensalidades e gastos. Repasse detalhado por terapeuta, convênio e nota fiscal ficam pro app final.</div>
      </div>
      <CliTabs active="cli-financeiro" />
    </>
  )
}

export function ClinicaAgenda() {
  const { state } = useStore()
  const [sala, setSala] = useState('')
  const salas = allSalas(state)
  const conflitos = roomConflicts(state)
  const items = clinicAgenda(state, sala || undefined)

  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Agenda</div><div className="ps">Clínica Semear &middot; sessões por sala</div></div></div>

        {conflitos.size > 0 && (
          <div className="conf-banner">
            <span className="conf-ic">!</span>
            <div><b>{conflitos.size} sessões em conflito.</b> Mesma sala ou mesmo terapeuta no mesmo horário.</div>
          </div>
        )}

        <div className="sala-strip">
          <button className={sala === '' ? 'sfil on' : 'sfil'} onClick={() => setSala('')}>Todas</button>
          {salas.map((s) => <button key={s} className={sala === s ? 'sfil on' : 'sfil'} onClick={() => setSala(s)}>{s}</button>)}
        </div>

        {items.length === 0 && <div className="empty" style={{ marginTop: 12 }}>Nenhuma sessão nesta sala.</div>}

        {items.map((it, i) => {
          const day = agendaDayLabel(it.ts)
          const showDay = i === 0 || agendaDayLabel(items[i - 1].ts) !== day
          return (
            <div key={it.id}>
              {showDay && <div className="agd-day">{day}</div>}
              <div className={it.conflict ? 'cag-row conflict' : 'cag-row'}>
                <div className="cag-time" style={{ color: it.color }}>{it.timeLabel}</div>
                <Avatar photo={it.childPhoto} initial={it.childInitial} className="cag-av" />
                <div className="cag-mid">
                  <div className="cag-name">{it.childName}</div>
                  <div className="cag-sub">{it.proName} &middot; {it.discipline}</div>
                </div>
                <div className="cag-right">
                  {it.sala && <span className="cag-sala">{it.sala}</span>}
                  {it.conflict && <span className="cag-conf">Conflito</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <CliTabs active="cli-agenda" />
    </>
  )
}

export function ClinicaPacientes() {
  const { state } = useStore()
  const { navigate } = useNav()
  const [q, setQ] = useState('')
  const termo = q.trim().toLowerCase()
  const lista = termo
    ? state.children.filter((c) => c.name.toLowerCase().includes(termo) || c.diagnosis.toLowerCase().includes(termo))
    : state.children
  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Pacientes</div><div className="ps">{state.children.length} ativos</div></div></div>
        <div className="searchbar">
          <Search />
          <input placeholder="Buscar por nome ou diagnóstico" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {termo && <div className="dl" style={{ margin: '0 4px 10px', fontWeight: 800 }}>{lista.length} resultado{lista.length === 1 ? '' : 's'}</div>}
        {lista.length === 0 && <div className="empty"><Search stroke="#bdb6cb" /> Nenhum paciente encontrado.</div>}
        <div>
          {lista.map((c) => {
            const last = state.prontuario.filter((e) => e.childId === c.id).sort((a, b) => b.ts - a.ts)[0]
            const lastPro = last ? proById(state, last.professionalId) : null
            return (
              <div className="disc-card" key={c.id} onClick={() => navigate('cli-paciente', { childId: c.id })}>
                <div className="disc-top">
                  <Avatar photo={c.photo} initial={c.initial} className="disc-ic" />
                  <div>
                    <div className="disc-name">{c.name}, {c.age} anos</div>
                    <div className="disc-sub"><Diag text={c.diagnosis} /> &middot; {c.teamIds.length} profissionais</div>
                  </div>
                  <span className="go"><ChevronRight /></span>
                </div>
                <div className="disc-foot">
                  <div className="dl" style={{ marginBottom: 0 }}>
                    {last && lastPro ? `Última sessão ${relTime(last.ts)} · ${lastPro.discipline}` : 'Sem sessões ainda'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CliTabs active="cli-pacientes" />
    </>
  )
}

export function ClinicaEquipe() {
  const { state } = useStore()
  const { navigate } = useNav()
  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Equipe</div><div className="ps">{state.professionals.length} terapeutas</div></div></div>

        <div style={{ marginTop: 8 }}>
          {state.professionals.map((p) => {
            const nPac = state.children.filter((c) => c.teamIds.includes(p.id)).length
            const sess = state.prontuario.filter((e) => e.professionalId === p.id).sort((a, b) => b.ts - a.ts)
            const last = sess[0]
            return (
              <div className="disc-card" key={p.id} onClick={() => navigate('cli-terapeuta', { proId: p.id })}>
                <div className="disc-top">
                  <div className="disc-ic" style={{ background: p.color }}>{p.initial}</div>
                  <div>
                    <div className="disc-name">{p.name}</div>
                    <div className="disc-sub">{p.discipline}</div>
                  </div>
                  <span className="go">
                    <span className="disc-badge" style={{ background: `${p.color}1f`, color: p.color }}>{nPac} paciente{nPac === 1 ? '' : 's'}</span>
                    <ChevronRight />
                  </span>
                </div>
                <div className="disc-foot">
                  <div className="dl" style={{ marginBottom: 0 }}>
                    {sess.length} sess{sess.length === 1 ? 'ão' : 'ões'} registrada{sess.length === 1 ? '' : 's'}{last ? ` · última ${relTime(last.ts)}` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CliTabs active="cli-equipe" />
    </>
  )
}

/* ---------- Perfil do terapeuta (visão do admin) ---------- */

export function ClinicaTerapeuta() {
  const { state } = useStore()
  const { route, back, navigate } = useNav()
  const proId = (route?.params?.proId as string) ?? 'm'
  const pro = proById(state, proId)
  if (!pro) return null
  const color = pro.color
  const pacientes = state.children.filter((c) => c.teamIds.includes(proId))
  const sessoes = state.prontuario.filter((e) => e.professionalId === proId).sort((a, b) => b.ts - a.ts)

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          {pro.name}
          <small>{pro.discipline}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="child" style={{ paddingTop: 2 }}>
          <div className="kid" style={{ background: color }}>{pro.initial}</div>
          <div>
            <div className="name">{pro.name}</div>
            <div className="sub">{pro.role}</div>
          </div>
        </div>

        <div className="statgrid">
          <div className="statc">
            <div className="si" style={{ background: `${color}1a` }}><NavUsers stroke={color} /></div>
            <div className="sv">{pacientes.length}</div>
            <div className="sl">pacientes</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: `${color}1a` }}><Clipboard stroke={color} /></div>
            <div className="sv">{sessoes.length}</div>
            <div className="sl">sessões registradas</div>
          </div>
        </div>

        <div className="sec-h"><div className="t">Pacientes acompanhados</div></div>
        <div className="rowlist">
          {pacientes.map((c) => {
            const cs = sessoes.filter((e) => e.childId === c.id)
            const clast = cs[0]
            return (
              <div className="mrow2" key={c.id} onClick={() => navigate('cli-paciente', { childId: c.id })} style={{ cursor: 'pointer' }}>
                <Avatar photo={c.photo} initial={c.initial} className="mav" />
                <div>
                  <div className="mnm">{c.name}, {c.age} anos</div>
                  <div className="mrl">{cs.length} sess{cs.length === 1 ? 'ão' : 'ões'}{clast ? ` · última ${relTime(clast.ts)}` : ''}</div>
                </div>
                <span className="go"><ChevronRight /></span>
              </div>
            )
          })}
        </div>

        <div className="sec-h"><div className="t">Últimas sessões</div></div>
        <div className="log">
          {sessoes.length === 0 && <div style={{ padding: '14px 0', color: 'var(--muted)', fontWeight: 800, fontSize: 13 }}>Nenhuma sessão registrada ainda.</div>}
          {sessoes.slice(0, 6).map((e) => {
            const c = childById(state, e.childId)
            return (
              <div className="logrow" key={e.id}>
                <div className="log-av" style={{ background: color }}>{pro.initial}</div>
                <div className="log-txt">Sessão de <b>{c?.name}</b> &middot; {e.tags.slice(0, 2).join(', ')}</div>
                <div className="log-when">{relTime(e.ts)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Perfil do paciente (visão do admin) ---------- */

export function ClinicaPaciente() {
  const { state } = useStore()
  const { route, back, navigate } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  if (!child) return null
  const team = teamOf(state, child)
  const sessoes = prontuarioOf(state, childId)
  const registros = state.registros.filter((r) => r.childId === childId)

  const atividade = [
    ...sessoes.map((e) => {
      const p = proById(state, e.professionalId)
      return { id: e.id, ts: e.ts, avatar: p?.initial ?? '?', color: p?.color ?? '#7c3aed', who: p?.name ?? '', action: 'registrou uma sessão' }
    }),
    ...registros.map((r) => ({ id: r.id, ts: new Date(r.date + 'T20:00:00').getTime(), avatar: 'F', color: '#7c3aed', who: 'A família', action: 'registrou o dia' })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 6)

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
        <div className="child" style={{ paddingTop: 2 }}>
          <Avatar photo={child.photo} initial={child.initial} className="kid" />
          <div>
            <div className="name">{child.name}</div>
            <div className="sub">{child.age} anos &middot; {child.diagnosis}</div>
          </div>
        </div>

        {child.notes && (
          <div className="info-card">
            <div className="il">O que a família contou</div>
            <div className="iv">{child.notes}</div>
          </div>
        )}

        <div className="statgrid">
          <div className="statc">
            <div className="si" style={{ background: 'var(--amber-soft)' }}><Clipboard stroke="#b57d16" /></div>
            <div className="sv">{sessoes.length}</div>
            <div className="sl">sessões registradas</div>
          </div>
          <div className="statc">
            <div className="si" style={{ background: 'var(--green-soft)' }}><Target stroke="#2f8451" /></div>
            <div className="sv">{registros.length}</div>
            <div className="sl">registros da família</div>
          </div>
        </div>

        <div className="sec-h"><div className="t">Evolução</div></div>
        {metasOf(state, childId).map((m) => <MetaCard key={m.id} meta={m} showDiscipline />)}
        <button className="btn-ghost" onClick={() => navigate('relatorio', { childId })}><Clipboard stroke="#6d28d9" width={17} height={17} /> Gerar relatório de evolução</button>

        <div className="sec-h"><div className="t">Equipe</div></div>
        <div className="rowlist">
          {team.map((p) => (
            <div className="mrow2" key={p.id} onClick={() => navigate('cli-terapeuta', { proId: p.id })} style={{ cursor: 'pointer' }}>
              <div className="mav" style={{ background: p.color }}>{p.initial}</div>
              <div>
                <div className="mnm">{p.name}</div>
                <div className="mrl">{p.discipline}</div>
              </div>
              <span className="go"><ChevronRight /></span>
            </div>
          ))}
        </div>

        <div className="sec-h"><div className="t">Atividade recente</div></div>
        <div className="log">
          {atividade.map((a) => (
            <div className="logrow" key={a.id}>
              <div className="log-av" style={{ background: a.color }}>{a.avatar}</div>
              <div className="log-txt"><b>{a.who}</b> {a.action}</div>
              <div className="log-when">{relTime(a.ts)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
