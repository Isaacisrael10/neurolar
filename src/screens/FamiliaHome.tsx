// Início da FAMÍLIA: uma visão geral com atalhos. O conteúdo pesado mora nas
// abas próprias (Dia a dia = ofensiva + registro; Da equipe = publicações).

import { useStore, childById, teamOf, sessionsOf, prontuarioOf, streakOf, lastUpdateOf, proById, relTime } from '../store'
import { useNav } from '../nav'
import { BottomNav, type NavItem } from '../components/BottomNav'
import {
  PuzzleLogo, Bell, ChevronDown, ChevronRight, Heart, Moon, Utensils, Smiley, Pulse, Pencil, Calendar, Flame,
  Chat, NavHome, NavPerson,
} from '../components/icons'

const CHILD = 'ana'

export const familiaNav: NavItem[] = [
  { key: 'inicio', label: 'Início', icon: (on) => <NavHome stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'diaadia', label: 'Dia a dia', icon: (on) => <Pencil stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'daequipe', label: 'Da equipe', icon: (on) => <Chat stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'perfil', label: 'Perfil', icon: (on) => <NavPerson stroke={on ? '#177f70' : '#8496a2'} /> },
]

export function FamiliaTabs({ active }: { active: string }) {
  const { goTab } = useNav()
  return <BottomNav items={familiaNav} active={active} onSelect={goTab} />
}

export default function FamiliaHome() {
  const { state } = useStore()
  const { navigate, goTab } = useNav()

  const child = childById(state, CHILD)
  if (!child) return null

  const team = teamOf(state, child)
  const sessions = sessionsOf(state, CHILD).slice(0, 2)
  const daequipe = prontuarioOf(state, CHILD).slice(0, 2)
  const streak = streakOf(state, CHILD)
  const last = lastUpdateOf(state, CHILD)

  return (
    <>
      <div className="scroll">
        <div className="topbar">
          <div className="logo">
            <PuzzleLogo />
            <div className="w">montar</div>
          </div>
          <div className="bell"><Bell /></div>
        </div>

        <div className="child">
          <div className="kid">{child.initial}</div>
          <div>
            <div className="name">{child.name}</div>
            <div className="sub">{child.age} anos</div>
            {last && (
              <div className="live">
                <span className="gdot"></span> <b>{last.name}</b>&nbsp;deixou novidades {last.rel}
              </div>
            )}
          </div>
          <div className="chev"><ChevronDown /></div>
        </div>

        <div className="together">
          <div className="stack">
            <div className="a" style={{ background: 'var(--teal)' }}>V</div>
            {team.map((p) => (
              <div className="a" key={p.id} style={{ background: p.color }}>{p.initial}</div>
            ))}
          </div>
          <div className="t">
            <b>Toda a equipe</b> acompanha a mesma evolução da {child.name}
          </div>
          <Heart fill="#e2705a" />
        </div>

        {/* resumo da ofensiva (o lar dela é a aba Dia a dia) */}
        <div className="obanner" onClick={() => goTab('diaadia')}>
          <Flame />
          <div>
            <div className="ob-t">{streak} dias seguidos</div>
            <div className="ob-s">registrando o dia a dia da {child.name}</div>
          </div>
          <span className="go"><ChevronRight /></span>
        </div>

        {/* registrar o dia */}
        <div className="card reg">
          <div className="reg-h">Registrar o dia de hoje</div>
          <div className="reg-s">Um minutinho pra contar como a {child.name} esteve</div>
          <div className="chips">
            <div className="chip"><Moon /><div className="cl">Sono</div></div>
            <div className="chip"><Utensils /><div className="cl">Alimentação</div></div>
            <div className="chip"><Smiley /><div className="cl">Humor</div></div>
            <div className="chip"><Pulse /><div className="cl">Crises</div></div>
          </div>
          <div className="btn" onClick={() => navigate('registrar')}><Pencil /> Registrar hoje</div>
        </div>

        {/* próximas sessões */}
        <div className="sec-h">
          <div className="t"><Calendar />Próximas sessões</div>
          <div className="s">ver agenda</div>
        </div>
        <div className="card agenda">
          {sessions.map((se, i) => {
            const p = proById(state, se.professionalId)
            if (!p) return null
            return (
              <div className="arow" key={se.id}>
                <div className="aav" style={{ background: p.color }}>{p.initial}</div>
                <div>
                  <div className="aname">{p.name}</div>
                  <div className="arole">{p.role}</div>
                </div>
                <div className={i === 0 ? 'atime soon' : 'atime later'}>{se.when}</div>
              </div>
            )
          })}
        </div>

        {/* prévia das publicações da equipe */}
        <div className="sec-h">
          <div className="t"><Chat stroke="#2c3e4a" />Da equipe</div>
          <div className="s" onClick={() => goTab('daequipe')} style={{ cursor: 'pointer' }}>ver tudo</div>
        </div>
        {daequipe.map((e) => {
          const p = proById(state, e.professionalId)
          return (
            <div className="post" key={e.id} onClick={() => goTab('daequipe')} style={{ cursor: 'pointer' }}>
              <div className="post-h">
                <div className="post-av" style={{ background: p?.color }}>{p?.initial}</div>
                <div>
                  <div className="post-who">{p?.name}</div>
                  <div className="post-role">{p?.discipline} · sessão</div>
                </div>
                <div className="post-when">{relTime(e.ts)}</div>
              </div>
              <div className="stags" style={{ marginBottom: 8 }}>
                {e.tags.slice(0, 3).map((t) => <span className="stag" key={t}>{t}</span>)}
              </div>
              <div className="post-text">{e.orientacao}</div>
            </div>
          )
        })}
      </div>

      <FamiliaTabs active="inicio" />
    </>
  )
}
