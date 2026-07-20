// "Para casa" da FAMÍLIA: as tarefas de TODAS as terapias, unificadas num lugar
// só. A família marca o que fez hoje. Fecha o ciclo terapia -> casa.

import { useStore, childById, proById, teamOf, homeworkOf, isHomeworkDoneToday, paraCasaToday } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, Check, Clipboard } from '../components/icons'

const CHILD = 'ana'

export default function FamiliaParaCasa() {
  const { state, toggleHomeworkToday } = useStore()
  const { back } = useNav()
  const child = childById(state, CHILD)
  if (!child) return null

  // ordena pela ordem da equipe, pra agrupar visualmente por disciplina
  const order = teamOf(state, child).map((p) => p.id)
  const list = homeworkOf(state, CHILD).slice().sort((a, b) => order.indexOf(a.professionalId) - order.indexOf(b.professionalId))
  const pc = paraCasaToday(state, CHILD)
  const pct = pc.total ? Math.round((pc.done / pc.total) * 100) : 0

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          Para casa
          <small>{child.name} &middot; de todas as terapias</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="pc-progress">
          <div className="pcp-l">
            <div className="pcp-num">{pc.done}<span>/{pc.total}</span></div>
            <div className="pcp-lbl">feitas hoje</div>
          </div>
          <div className="pcp-r">
            <div className="pcp-bar"><span style={{ width: `${pct}%` }}></span></div>
            <div className="pcp-msg">{pc.total === 0 ? 'Nenhuma tarefa por enquanto.' : pc.done === pc.total ? 'Tudo feito hoje. Mandou bem!' : `Faltam ${pc.total - pc.done} pra fechar o dia.`}</div>
          </div>
        </div>

        {list.length === 0 && (
          <div className="empty"><Clipboard stroke="#bdb6cb" /> A equipe ainda não passou tarefas de casa.</div>
        )}

        {list.map((h) => {
          const p = proById(state, h.professionalId)
          const color = p?.color ?? '#938aa8'
          const done = isHomeworkDoneToday(h)
          return (
            <div className={done ? 'hw done' : 'hw'} key={h.id}>
              <div className="hw-top">
                <span className="hw-disc" style={{ background: `${color}1a`, color }}>{p?.discipline}</span>
                <span className="hw-freq">{h.frequency}</span>
              </div>
              <div className="hw-title">{h.title}</div>
              <div className="hw-detail">{h.detail}</div>
              <div className="hw-foot">
                <span className="hw-who">Passado por {p?.name}</span>
                <button className={done ? 'hw-btn on' : 'hw-btn'} onClick={() => toggleHomeworkToday(h.id)}>
                  {done ? <><Check stroke="#fff" width={13} height={13} /> Feita hoje</> : 'Marcar feita hoje'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
