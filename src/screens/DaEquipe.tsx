// "Sessões" nível 1: as terapias separadas por tipo, cada uma num card que já
// mostra a prévia da última sessão. Clica num tipo -> lista de sessões.

import { useStore, childById, teamOf, prontuarioByPro, relTime } from '../store'
import { useNav } from '../nav'
import { ChevronRight } from '../components/icons'
import { FamiliaTabs } from './FamiliaHome'

const CHILD = 'ana'

export default function DaEquipe() {
  const { state } = useStore()
  const { navigate } = useNav()
  const child = childById(state, CHILD)
  if (!child) return null
  const team = teamOf(state, child)

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div>
            <div className="pt">Sessões</div>
            <div className="ps">as sessões de cada terapia da {child.name}</div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {team.map((p) => {
            const sessions = prontuarioByPro(state, CHILD, p.id)
            const unread = sessions.filter((e) => !e.readByFamily).length
            const last = sessions[0]
            return (
              <div className="disc-card" key={p.id} onClick={() => navigate('daequipe-sessoes', { proId: p.id })}>
                <div className="disc-top">
                  <div className="disc-ic" style={{ background: p.color }}>{p.initial}</div>
                  <div>
                    <div className="disc-name">{p.discipline}</div>
                    <div className="disc-sub"><span className="disc-who">{p.name}</span> &middot; {p.role}</div>
                  </div>
                  <span className="go">
                    {unread > 0 && <span className="novo">{unread} novo{unread > 1 ? 's' : ''}</span>}
                    <ChevronRight />
                  </span>
                </div>
                {last && (
                  <div className="disc-foot">
                    <div className="dl">{sessions.length} sess{sessions.length === 1 ? 'ão' : 'ões'} &middot; última {relTime(last.ts)}</div>
                    <div className="stags">
                      {last.tags.map((t) => <span className="stag-c" key={t} style={{ background: `${p.color}1a`, color: p.color }}>{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <FamiliaTabs active="daequipe" />
    </>
  )
}
