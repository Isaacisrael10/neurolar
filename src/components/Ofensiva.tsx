// A ofensiva = o placar da postagem diária dos pais. Mora na aba "Dia a dia".

import { useStore, childById, streakOf, weekOf, achievementsOf } from '../store'
import { Flame, Heart, Check, Plus, MedalMini } from './icons'

export function Ofensiva({ childId }: { childId: string }) {
  const { state } = useStore()
  const child = childById(state, childId)
  if (!child) return null
  const streak = streakOf(state, childId)
  const week = weekOf(state, childId)
  const achievements = achievementsOf(streak)
  const nextAch = achievements.find((a) => a.state === 'next')

  return (
    <>
      <div className="streak">
        <div className="stop">
          <Flame />
          <div className="sinfo">
            <div className="snum">
              {streak} <span className="u">dias seguidos</span> <Heart fill="#7c3aed" />
            </div>
            <div className="ssub">registrando o dia a dia da {child.name}</div>
          </div>
          <div className="lvl">Nível {Math.max(1, Math.floor(streak / 5) + 1)}</div>
        </div>
        <div className="week">
          {week.map((d, i) => {
            const cls = d.done ? 'day on' : d.today ? 'day today' : 'day'
            return (
              <div className={cls} key={i}>
                <div className="d">{d.label}</div>
                <div className="c">{d.done ? <Check stroke="#fff" /> : d.today ? <Plus /> : null}</div>
              </div>
            )
          })}
        </div>
        {nextAch && (
          <div className="mile">
            <div className="mrow">
              <span className="a">Próxima conquista</span>
              <span className="b">{nextAch.label} <MedalMini /></span>
            </div>
            <div className="mbar"><i style={{ width: '80%' }}></i></div>
            <div className="mtxt">Continue registrando pra desbloquear!</div>
          </div>
        )}
      </div>
    </>
  )
}
