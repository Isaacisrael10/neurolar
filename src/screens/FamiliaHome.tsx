// Início da FAMÍLIA: uma visão geral com atalhos. O conteúdo pesado mora nas
// abas próprias (Dia a dia = ofensiva + registro; Da equipe = publicações).

import { useStore, childById, teamOf, sessionsOf, streakOf, lastUpdateOf, proById, paraCasaToday } from '../store'
import { useNav } from '../nav'
import { BottomNav, type NavItem } from '../components/BottomNav'
import { Avatar } from '../components/Avatar'
import {
  NeuroLarLogo, Bell, ChevronDown, ChevronRight, Heart, Moon, Utensils, Smiley, Pulse, Pencil, Calendar, Flame,
  Clipboard, Check, NavHome, NavPerson, NavChart,
} from '../components/icons'

const CHILD = 'ana'

export const familiaNav: NavItem[] = [
  { key: 'inicio', label: 'Início', icon: (on) => <NavHome stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'diaadia', label: 'Dia a dia', icon: (on) => <Pencil stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'evolucao', label: 'Evolução', icon: (on) => <NavChart stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'daequipe', label: 'Sessões', icon: (on) => <Clipboard stroke={on ? '#6d28d9' : '#938aa8'} /> },
  { key: 'perfil', label: 'Perfil', icon: (on) => <NavPerson stroke={on ? '#6d28d9' : '#938aa8'} /> },
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
  const streak = streakOf(state, CHILD)
  const last = lastUpdateOf(state, CHILD)
  const pc = paraCasaToday(state, CHILD)

  return (
    <>
      <div className="scroll">
        <div className="topbar">
          <div className="logo">
            <NeuroLarLogo />
            <div className="w">Neuro<span>Lar</span></div>
          </div>
          <div className="bell"><Bell /></div>
        </div>

        <div className="child">
          <Avatar photo={child.photo} initial={child.initial} className="kid" />
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
            <Avatar photo={child.photo} initial={child.initial} className="a" />
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

        {/* para casa: tarefas de todas as terapias unificadas */}
        <div className="pc-home" onClick={() => navigate('paracasa')}>
          <div className="pc-ic"><Clipboard stroke="#fff" /></div>
          <div className="pc-mid">
            <div className="pc-t">Para casa</div>
            <div className="pc-s">{pc.done} de {pc.total} feitas hoje</div>
            <div className="pc-bar"><span style={{ width: pc.total ? `${(pc.done / pc.total) * 100}%` : '0%' }}></span></div>
          </div>
          {pc.done === pc.total && pc.total > 0 ? (
            <span className="pc-done"><Check stroke="#fff" width={13} height={13} /></span>
          ) : (
            <span className="go"><ChevronRight /></span>
          )}
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
          <button className="seemore" onClick={() => navigate('agenda')}>Ver agenda <ChevronRight stroke="#6d28d9" /></button>
        </div>
        <div className="card agenda" onClick={() => navigate('agenda')} style={{ cursor: 'pointer' }}>
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

      </div>

      <FamiliaTabs active="inicio" />
    </>
  )
}
