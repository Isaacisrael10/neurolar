// "Da equipe" nível 2: as sessões de uma terapia, em ordem cronológica (mais
// recente primeiro), como resumo. Clica numa sessão -> detalhe completo.

import { useStore, proById, prontuarioByPro, longDate } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, ChevronRight } from '../components/icons'

const CHILD = 'ana'

export default function DaEquipeSessoes() {
  const { state } = useStore()
  const { route, back, navigate } = useNav()
  const proId = (route?.params?.proId as string) ?? 'm'
  const pro = proById(state, proId)
  if (!pro) return null
  const sessions = prontuarioByPro(state, CHILD, proId)

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          {pro.discipline}
          <small>{pro.name} &middot; {pro.role}</small>
        </div>
      </div>

      <div className="rd-scroll">
        {sessions.length === 0 && <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontWeight: 800, fontSize: 13 }}>Nenhuma sessão registrada ainda.</div>}
        {sessions.map((e) => (
          <div className="sess" key={e.id} onClick={() => navigate('daequipe-sessao', { sessId: e.id })}>
            <div className="sess-h">
              <div>
                <div className="sess-d">{longDate(e.ts)}</div>
                <div className="sess-when">sessão</div>
              </div>
              <span className="go">
                {!e.readByFamily && <span className="unread"></span>}
                <ChevronRight />
              </span>
            </div>
            <div className="stags">
              {e.tags.map((t) => <span className="stag" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
