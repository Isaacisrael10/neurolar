// Evolução por objetivos, SEM gráfico. Cada objetivo mostra o degrau atual em
// palavras (a "escada" de independência) e uma frase curta do terapeuta. A
// evolução que a família celebra é a linha de CONQUISTAS (momentos concretos).

import { useState } from 'react'
import { conquistasOf, metaLatest, metasByPro, nivelLabel, META_NIVEIS, proById, useStore, type Meta } from '../store'

const shortDate = (ts: number): string => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

export function MetaCard({ meta, showDiscipline = false }: { meta: Meta; showDiscipline?: boolean }) {
  const { state } = useStore()
  const pro = proById(state, meta.professionalId)
  const color = pro?.color ?? '#7c3aed'
  const latest = metaLatest(meta)
  const first = meta.measures[0]?.value ?? 0
  return (
    <div className="meta-card">
      <div className="meta-h">
        <div className="meta-tt">
          <span className="meta-dot" style={{ background: color }}></span>
          <div>
            <div className="meta-title">{meta.title}</div>
            {showDiscipline && <div className="meta-disc">{pro?.discipline}</div>}
          </div>
        </div>
        <span className="meta-nivel" style={{ color, background: `${color}18` }}>hoje: {nivelLabel(latest)}</span>
      </div>
      {meta.nota && <div className="meta-nota">“{meta.nota}”</div>}
      {latest > first && <div className="meta-journey">De <b>{nivelLabel(first)}</b> para <b>{nivelLabel(latest)}</b></div>}
    </div>
  )
}

// Visão do TERAPEUTA: metas (registrar nível de hoje + frase) e conquistas.
export function TherapistMetas({ childId, professionalId }: { childId: string; professionalId: string }) {
  const { state, addMetaMeasure, setMetaNota, addMeta, addConquista } = useStore()
  const metas = metasByPro(state, childId, professionalId)
  const conquistas = conquistasOf(state, childId).filter((c) => c.professionalId === professionalId)
  const [pickId, setPickId] = useState<string | null>(null)
  const [notaId, setNotaId] = useState<string | null>(null)
  const [notaText, setNotaText] = useState('')
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [conqOpen, setConqOpen] = useState(false)
  const [conqText, setConqText] = useState('')

  return (
    <div className="ther-metas">
      <div className="sec-h"><div className="t">Metas &amp; evolução</div></div>
      {metas.map((m) => (
        <div key={m.id}>
          <MetaCard meta={m} />
          {pickId === m.id ? (
            <div className="lvl-pick">
              <div className="lvl-lbl">Em que nível a criança está hoje?</div>
              {META_NIVEIS.map((n, i) => (
                <button key={i} className="lvl-b" onClick={() => { addMetaMeasure(m.id, i); setPickId(null) }}>{n}</button>
              ))}
            </div>
          ) : notaId === m.id ? (
            <div className="meta-log">
              <input className="c-input" style={{ flex: 1 }} placeholder="Frase pra família (ex.: já busca o olhar sozinha)" value={notaText} onChange={(e) => setNotaText(e.target.value)} />
              <button onClick={() => { setMetaNota(m.id, notaText.trim()); setNotaId(null); setNotaText('') }}>Salvar</button>
            </div>
          ) : (
            <div className="meta-actions">
              <button className="meta-add" onClick={() => setPickId(m.id)}>+ Registrar nível de hoje</button>
              <button className="meta-add" onClick={() => { setNotaId(m.id); setNotaText(m.nota ?? '') }}>{m.nota ? 'Editar frase' : '+ Frase'}</button>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div className="meta-log">
          <input className="c-input" style={{ flex: 1 }} placeholder="Nome da meta (ex.: Atenção)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button onClick={() => { if (title.trim()) { addMeta(childId, professionalId, title.trim()); setTitle(''); setAdding(false) } }}>Criar</button>
        </div>
      ) : (
        <button className="meta-add" onClick={() => setAdding(true)}>+ Nova meta</button>
      )}

      <div className="sec-h" style={{ marginTop: 20 }}><div className="t">Conquistas</div></div>
      <div className="conq-note">Momentos concretos que a família vê na evolução.</div>
      {conquistas.length > 0 && (
        <ul className="conq-list">
          {conquistas.slice(0, 5).map((c) => (
            <li className="conq-item" key={c.id}>
              <span className="conq-dot" style={{ background: proById(state, c.professionalId)?.color ?? '#7c3aed' }}></span>
              <div><span className="conq-date">{shortDate(c.ts)}</span> <span className="conq-text">{c.text}</span></div>
            </li>
          ))}
        </ul>
      )}
      {conqOpen ? (
        <div className="meta-log">
          <input className="c-input" style={{ flex: 1 }} placeholder="O que a criança conseguiu?" value={conqText} onChange={(e) => setConqText(e.target.value)} />
          <button onClick={() => { if (conqText.trim()) { addConquista(childId, professionalId, conqText.trim()); setConqText(''); setConqOpen(false) } }}>Registrar</button>
        </div>
      ) : (
        <button className="meta-add" onClick={() => setConqOpen(true)}>+ Registrar conquista</button>
      )}
    </div>
  )
}
