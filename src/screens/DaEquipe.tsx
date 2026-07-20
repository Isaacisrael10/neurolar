// "Da equipe" nível 1: as terapias separadas por tipo. Clica num tipo -> sessões.

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
            <div className="pt">Da equipe</div>
            <div className="ps">as sessões de cada terapia da {child.name}</div>
          </div>
        </div>

        <div className="rowlist" style={{ marginTop: 8 }}>
          {team.map((p) => {
            const sessions = prontuarioByPro(state, CHILD, p.id)
            const unread = sessions.filter((e) => !e.readByFamily).length
            const last = sessions[0]
            return (
              <div className="mrow2" key={p.id} onClick={() => navigate('daequipe-sessoes', { proId: p.id })} style={{ cursor: 'pointer' }}>
                <div className="mav" style={{ background: p.color }}>{p.initial}</div>
                <div>
                  <div className="mnm">{p.discipline}</div>
                  <div className="mrl">
                    {unread > 0 && <span className="un"></span>}
                    {sessions.length} sess{sessions.length === 1 ? 'ão' : 'ões'}{last ? ` · última ${relTime(last.ts)}` : ''}
                  </div>
                </div>
                <span className="go"><ChevronRight /></span>
              </div>
            )
          })}
        </div>
      </div>

      <FamiliaTabs active="daequipe" />
    </>
  )
}
