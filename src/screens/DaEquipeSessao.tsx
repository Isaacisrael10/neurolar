// "Sessões" nível 3: detalhe de uma sessão, num card coeso e com acento da cor da
// disciplina (cabeçalho colorido, ícones, tags coloridas). Devolutiva + leitura + conversa.

import { useState } from 'react'
import { useStore, proById, sessionById, longDate, relTime, type Author } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, Check, Send, Target, Note } from '../components/icons'

const FAM: Author = { type: 'familia', id: 'voce', name: 'Você', role: 'em casa', color: '#7c3aed' }

export default function DaEquipeSessao() {
  const { state, addReply, markRead } = useStore()
  const { route, back } = useNav()
  const sessId = (route?.params?.sessId as string) ?? ''
  const e = sessionById(state, sessId)
  const [reply, setReply] = useState('')
  if (!e) return null
  const pro = proById(state, e.professionalId)
  const color = pro?.color ?? '#7c3aed'

  function enviar() {
    if (!reply.trim()) return
    addReply('sessao', e!.id, FAM, reply.trim())
    setReply('')
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          Sessão
          <small>{pro?.discipline}</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="card sheet">
          <div className="sheet-head" style={{ background: `linear-gradient(180deg, ${color}14, transparent)` }}>
            <div className="savatar" style={{ background: color }}>{pro?.initial}</div>
            <div style={{ flex: 1 }}>
              <div className="sh-name">{pro?.name}</div>
              <div className="sh-sub">{longDate(e.ts)}</div>
            </div>
            <span className="disc-badge" style={{ background: `${color}1f`, color }}>{pro?.discipline}</span>
          </div>

          <div className="sheet-sec">
            <div className="block-h ico"><Target stroke={color} /> O que foi trabalhado</div>
            <div className="stags">
              {e.tags.map((t) => <span className="stag-c" key={t} style={{ background: `${color}1a`, color }}>{t}</span>)}
            </div>
          </div>

          <div className="sheet-sec">
            <div className="block-h ico"><Note stroke={color} /> Recado de {pro?.name}</div>
            <div className="post-text">{e.orientacao}</div>
            <div className="tl-actions">
              {!e.readByFamily && <button className="read-chip" onClick={() => markRead('sessao', e.id)}><Check stroke="#6d28d9" width={13} height={13} /> Confirmar leitura</button>}
              {e.readByFamily && <span className="read-done"><Check stroke="#938aa8" width={13} height={13} /> Lido</span>}
            </div>
          </div>
        </div>

        <div className="sec-h"><div className="t">Conversa com {pro?.name}</div></div>
        <div className="card" style={{ padding: '13px 15px' }}>
          {e.replies.length === 0 && <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Nenhuma mensagem ainda. Tem uma dúvida? Escreva abaixo.</div>}
          {e.replies.length > 0 && (
            <div className="comments" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
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
            <input className="c-input" placeholder="Responder..." value={reply} onChange={(ev) => setReply(ev.target.value)} onKeyDown={(ev) => { if (ev.key === 'Enter') enviar() }} />
            <button className="c-send" onClick={enviar} aria-label="Responder"><Send /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
