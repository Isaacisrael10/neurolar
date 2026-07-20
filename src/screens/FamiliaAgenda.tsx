// Agenda unificada da FAMÍLIA: as sessões de todas as terapias + os compromissos
// que a família adiciona (consulta, escola, exame). A régua de dias no topo filtra
// por data (ou "Tudo"). A família liga um lembrete em qualquer item.

import { useState } from 'react'
import { useStore, childById, agendaOf, agendaDayLabel, dayKey, EVENT_CATEGORIES, type AgendaItem } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, Bell, Plus, Check, Calendar, Pulse, Clipboard, NavBuilding } from '../components/icons'

const CHILD = 'ana'

function timeToLabel(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  return m && m !== '00' ? `${parseInt(h)}h${m}` : `${parseInt(h)}h`
}

function catIcon(cat: string, color: string) {
  if (cat === 'Consulta') return <Pulse stroke={color} />
  if (cat === 'Escola') return <NavBuilding stroke={color} />
  if (cat === 'Exame') return <Clipboard stroke={color} />
  return <Calendar stroke={color} />
}

export default function FamiliaAgenda() {
  const { state, addEvento, toggleReminder } = useStore()
  const { back } = useNav()
  const child = childById(state, CHILD)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Consulta')
  const [date, setDate] = useState(dayKey(new Date()))
  const [time, setTime] = useState('09:00')
  const [local, setLocal] = useState('')
  const [sel, setSel] = useState<string>('all')
  if (!child) return null

  const itens = agendaOf(state, CHILD)
  const visiveis = sel === 'all' ? itens : itens.filter((it) => dayKey(new Date(it.ts)) === sel)

  // régua dos próximos 14 dias, marcando os que têm compromisso.
  const strip: { dk: string; wd: string; day: number; has: boolean }[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + i)
    const dk = dayKey(d)
    strip.push({
      dk,
      wd: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      day: d.getDate(),
      has: itens.some((it) => dayKey(new Date(it.ts)) === dk),
    })
  }

  function salvar() {
    const t = title.trim()
    if (!t) return
    const ts = new Date(`${date}T${time || '09:00'}`).getTime()
    addEvento(CHILD, { ts, timeLabel: timeToLabel(time || '09:00'), title: t, category, location: local.trim() })
    setTitle('')
    setLocal('')
    setCategory('Consulta')
    setTime('09:00')
    setDate(dayKey(new Date()))
    setAdding(false)
  }

  function cancelar() {
    setTitle('')
    setLocal('')
    setCategory('Consulta')
    setAdding(false)
  }

  function Item({ it }: { it: AgendaItem }) {
    return (
      <div className="agd">
        <div className="agd-ic" style={{ background: `${it.color}1a`, color: it.color }}>
          {it.origin === 'clinica' && it.initial ? it.initial : catIcon(it.category, it.color)}
        </div>
        <div className="agd-main">
          <div className="agd-title">{it.title}</div>
          <div className="agd-meta">
            <span className="agd-time" style={{ color: it.color }}>{it.timeLabel}</span>
            {it.subtitle && <span className="agd-sub">&middot; {it.subtitle}</span>}
          </div>
          <div className="agd-tags">
            <span className="agd-cat" style={{ background: `${it.color}1a`, color: it.color }}>{it.category}</span>
            {it.origin === 'clinica' && <span className="agd-src">agendado pela clínica</span>}
            {it.sala && <span className="agd-sala">{it.sala}</span>}
            {it.reminder && <span className="agd-rem"><Bell stroke="#6d28d9" /> Lembrete</span>}
          </div>
        </div>
        <button className={it.reminder ? 'agd-bell on' : 'agd-bell'} onClick={() => toggleReminder(it.id)} aria-label="Lembrete">
          <Bell stroke={it.reminder ? '#fff' : '#938aa8'} />
        </button>
      </div>
    )
  }

  let lastDay = ''

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={adding ? cancelar : back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          {adding ? 'Novo compromisso' : 'Agenda'}
          <small>{child.name} &middot; {adding ? 'terapias e compromissos' : 'tudo num lugar só'}</small>
        </div>
      </div>

      <div className="rd-scroll">
        {adding ? (
          <>
            <div className="q">
              <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Calendar stroke="#6d28d9" /></span>O que é?</div>
              <input className="c-input" style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, padding: '11px 14px', fontSize: 13.5 }} placeholder="Ex.: Consulta com neuropediatra" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="q">
              <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Plus stroke="#6d28d9" /></span>Tipo</div>
              <div className="filters" style={{ margin: 0, flexWrap: 'wrap', overflow: 'visible' }}>
                {EVENT_CATEGORIES.map((c) => (
                  <button key={c.key} className={category === c.key ? 'fil on' : 'fil'} onClick={() => setCategory(c.key)}>{c.key}</button>
                ))}
              </div>
            </div>
            <div className="q">
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Dia</label>
                <input className="inp" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Horário</label>
                <input className="inp" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Local (opcional)</label>
                <input className="inp" placeholder="Ex.: Consultório, escola..." value={local} onChange={(e) => setLocal(e.target.value)} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="daystrip">
              <button className={sel === 'all' ? 'ds ds-all on' : 'ds ds-all'} onClick={() => setSel('all')}>Tudo</button>
              {strip.map((d) => (
                <button key={d.dk} className={sel === d.dk ? 'ds on' : 'ds'} onClick={() => setSel(d.dk)}>
                  <span className="ds-wd">{d.wd}</span>
                  <span className="ds-n">{d.day}</span>
                  <span className={d.has ? 'ds-dot yes' : 'ds-dot'}></span>
                </button>
              ))}
            </div>

            {sel !== 'all' ? (
              <>
                <div className="agd-day">{agendaDayLabel(new Date(`${sel}T12:00`).getTime())}</div>
                {visiveis.length === 0 ? (
                  <div className="empty"><Calendar stroke="#bdb6cb" /> Nada marcado nesse dia.</div>
                ) : (
                  visiveis.map((it) => <Item key={it.id} it={it} />)
                )}
              </>
            ) : (
              <>
                {itens.length === 0 && (
                  <div className="empty"><Calendar stroke="#bdb6cb" /> Nenhum compromisso à vista.</div>
                )}
                {itens.map((it) => {
                  const dk = dayKey(new Date(it.ts))
                  const novoDia = dk !== lastDay
                  lastDay = dk
                  return (
                    <div key={it.id}>
                      {novoDia && <div className="agd-day">{agendaDayLabel(it.ts)}</div>}
                      <Item it={it} />
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}
      </div>

      <div className="savebar">
        {adding ? (
          <div className="share-actions" style={{ marginTop: 0 }}>
            <button className="sa-cancel" onClick={cancelar}>Cancelar</button>
            <button className="sa-send" onClick={salvar}><Check stroke="#fff" width={15} height={15} /> Salvar compromisso</button>
          </div>
        ) : (
          <div className="btn" onClick={() => setAdding(true)}><Plus stroke="#fff" /> Adicionar compromisso</div>
        )}
      </div>
    </div>
  )
}
