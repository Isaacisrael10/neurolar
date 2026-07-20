// A ofensiva = o placar da postagem diária dos pais. Mora na aba "Dia a dia".

import { useStore, childById, streakOf, weekOf, achievementsOf, type Achievement } from '../store'
import { Flame, Heart, Check, Plus, MedalMini, StarBadge, LockBadge } from './icons'

function badgeBg(a: Achievement): string {
  if (a.state === 'lock') return 'linear-gradient(145deg,#dbe0e5,#c3cad1)'
  const grads = [
    'linear-gradient(145deg,#d99553,#b26a26)',
    'linear-gradient(145deg,#aeb8c1,#8894a0)',
    'linear-gradient(145deg,#f6c84e,#e0a11c)',
    'linear-gradient(145deg,#f6c84e,#e0a11c)',
  ]
  return grads[a.tier]
}

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
              {streak} <span className="u">dias seguidos</span> <Heart fill="#1f9e8b" />
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

      <div className="sec-h"><div className="t">Conquistas</div><div className="s">ver todas</div></div>
      <div className="badges">
        {achievements.map((a, i) => (
          <div className={`badge ${a.state === 'next' ? 'next' : a.state === 'lock' ? 'lock' : ''}`.trim()} key={i}>
            <div className="bcir" style={{ background: badgeBg(a) }}>
              {a.state === 'lock' ? <LockBadge /> : <StarBadge />}
            </div>
            <div className="bn">{a.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
