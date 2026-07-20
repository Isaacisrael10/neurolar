// "Sessões" nível 2: as sessões de uma terapia numa LINHA DO TEMPO (cronológica,
// mais recente primeiro). Cada sessão é um nó. Clica numa sessão -> detalhe.

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
  const color = pro.color
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

        <div className="timeline">
          {sessions.map((e) => (
            <div className="tl" key={e.id}>
              <div className="tl-node" style={{ background: color }}></div>
              <div className="sess" onClick={() => navigate('daequipe-sessao', { sessId: e.id })}>
                <div className="sess-h">
                  <div>
                    <div className="sess-d">{longDate(e.ts)}</div>
                    <div className="sess-when">{e.tags.length} {e.tags.length === 1 ? 'área trabalhada' : 'áreas trabalhadas'}</div>
                  </div>
                  <span className="go">
                    {!e.readByFamily && <span className="novo">Novo</span>}
                    <ChevronRight />
                  </span>
                </div>
                <div className="stags">
                  {e.tags.map((t) => <span className="stag-c" key={t} style={{ background: `${color}1a`, color }}>{t}</span>)}
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
    </div>
  )
}
