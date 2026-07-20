// Card de um post DIÁRIO da família (tags do dia + texto). Usado no "Dia a dia"
// (família) e no "Dia a dia da família" (terapeuta, que marca visto e responde).

import { useState } from 'react'
import { useStore, relTime, type Author, type TimelineItem } from '../store'
import { Send, Check, Moon, Utensils, Smiley, Pulse } from './icons'
import { Avatar } from './Avatar'

function Tags({ tags }: { tags: { sono?: string; alim?: string; humor?: string; crises?: string } }) {
  const semC = (tags.crises ?? 'Nenhuma') === 'Nenhuma'
  return (
    <div className="drow-tags" style={{ marginTop: 4 }}>
      {tags.sono && <span className="tag" style={{ background: '#edeffb', color: '#5b62b8' }}><Moon stroke="#5b62b8" /> {tags.sono}</span>}
      {tags.alim && <span className="tag" style={{ background: 'var(--green-soft)', color: '#2f8451' }}><Utensils stroke="#2f8451" /> {tags.alim}</span>}
      {tags.humor && <span className="tag" style={{ background: 'var(--amber-soft)', color: '#b57d16' }}><Smiley stroke="#b57d16" /> {tags.humor}</span>}
      <span className="tag" style={semC ? { background: 'var(--teal-soft)', color: 'var(--teal-d)' } : { background: 'var(--coral-soft)', color: '#c14a34' }}>
        <Pulse stroke={semC ? '#6d28d9' : '#c14a34'} /> {semC ? 'Sem crise' : `${tags.crises} crise${tags.crises === '1' ? '' : 's'}`}
      </span>
    </div>
  )
}

export function PostCard({ item: it, author }: { item: TimelineItem; author: Author }) {
  const { addReply, markRead } = useStore()
  const [reply, setReply] = useState('')
  const isTeam = author.type === 'terapeuta'

  function enviar() {
    if (!reply.trim()) return
    addReply('diario', it.id, author, reply.trim())
    setReply('')
  }

  return (
    <div className="post">
      <div className="post-h">
        <Avatar photo={it.photo} initial={it.authorName.charAt(0)} className="post-av" />
        <div>
          <div className="post-who">{it.authorName}</div>
          <div className="post-role">registro do dia</div>
        </div>
        <div className="post-when">{relTime(it.ts)}</div>
      </div>

      <Tags tags={it.tags} />
      {it.text && <div className="post-text" style={{ marginTop: 10 }}>{it.text}</div>}

      {isTeam && (
        <div className="tl-actions">
          {!it.readByTeam && <button className="read-chip" onClick={() => markRead('diario', it.id)}><Check stroke="#6d28d9" width={13} height={13} /> Marcar como visto</button>}
          {it.readByTeam && <span className="read-done"><Check stroke="#938aa8" width={13} height={13} /> Visto</span>}
        </div>
      )}

      {it.replies.length > 0 && (
        <div className="comments">
          {it.replies.map((c) => (
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
        <input className="c-input" placeholder="Responder..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviar() }} />
        <button className="c-send" onClick={enviar} aria-label="Responder"><Send /></button>
      </div>
    </div>
  )
}
