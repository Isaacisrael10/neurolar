// Telas da CLÍNICA — visão de gestão: pacientes, equipe e o negócio.

import { useStore, childById, proById, relTime } from '../store'
import { useNav } from '../nav'
import { BottomNav, type NavItem } from '../components/BottomNav'
import { PuzzleLogo, NavChart, NavUsers, NavPerson } from '../components/icons'

const PRECO_TERAPEUTA = 70 // R$/terapeuta/mês

const cliNav: NavItem[] = [
  { key: 'cli-painel', label: 'Painel', icon: (on) => <NavChart stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'cli-pacientes', label: 'Pacientes', icon: (on) => <NavUsers stroke={on ? '#177f70' : '#8496a2'} /> },
  { key: 'cli-equipe', label: 'Equipe', icon: (on) => <NavPerson stroke={on ? '#177f70' : '#8496a2'} /> },
]

function CliTabs({ active }: { active: string }) {
  const { goTab } = useNav()
  return <BottomNav items={cliNav} active={active} onSelect={goTab} />
}

export function ClinicaPainel() {
  const { state } = useStore()
  const { exit } = useNav()
  const nPac = state.children.length
  const nTer = state.professionals.length
  const receita = nTer * PRECO_TERAPEUTA

  const recentes = [
    ...state.prontuario.map((e) => {
      const p = proById(state, e.professionalId)
      return { id: e.id, ts: e.ts, name: p?.name ?? '', color: p?.color ?? '#1f9e8b', childId: e.childId, text: e.orientacao }
    }),
    ...state.registros
      .filter((r) => r.obs && r.obs.trim().length > 0)
      .map((r) => ({ id: r.id, ts: new Date(r.date + 'T20:00:00').getTime(), name: 'Família', color: '#1f9e8b', childId: r.childId, text: r.obs as string })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 6)

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div><div className="pt">Painel</div><div className="ps">Clínica Semear</div></div>
          <div className="pblogo"><PuzzleLogo size={22} /><div className="w">montar</div></div>
        </div>

        <div className="stats">
          <div className="stat"><div className="sv">{nPac}</div><div className="sl">pacientes ativos</div></div>
          <div className="stat"><div className="sv">{nTer}</div><div className="sl">terapeutas</div></div>
          <div className="stat"><div className="sv" style={{ fontSize: 17 }}>R$ {receita}</div><div className="sl">assinatura/mês</div></div>
        </div>

        <div className="sec-h"><div className="t">Atividade recente</div></div>
        <div className="card diary">
          {recentes.map((e) => {
            const c = childById(state, e.childId)
            return (
              <div className="dentry" key={e.id}>
                <div className="dav" style={{ background: e.color }}>{e.name.charAt(0)}</div>
                <div>
                  <div className="dtop">
                    <span className="dwho">{e.name}</span>
                    <span className="drole">em {c?.name}</span>
                    <span className="dwhen">{relTime(e.ts)}</span>
                  </div>
                  <div className="dmsg">{e.text}</div>
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn-ghost" onClick={exit}>Trocar de perfil</button>
      </div>
      <CliTabs active="cli-painel" />
    </>
  )
}

export function ClinicaPacientes() {
  const { state } = useStore()
  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Pacientes</div><div className="ps">{state.children.length} ativos</div></div></div>
        <div className="rowlist" style={{ marginTop: 8 }}>
          {state.children.map((c) => (
            <div className="mrow2" key={c.id}>
              <div className="mav" style={{ background: 'linear-gradient(140deg,#5bbfae,#2a9e8c)' }}>{c.initial}</div>
              <div>
                <div className="mnm">{c.name}, {c.age} anos</div>
                <div className="mrl">{c.diagnosis} &middot; {c.teamIds.length} profissionais</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CliTabs active="cli-pacientes" />
    </>
  )
}

export function ClinicaEquipe() {
  const { state } = useStore()
  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Equipe</div><div className="ps">{state.professionals.length} terapeutas</div></div></div>
        <div className="rowlist" style={{ marginTop: 8 }}>
          {state.professionals.map((p) => {
            const nPac = state.children.filter((c) => c.teamIds.includes(p.id)).length
            return (
              <div className="mrow2" key={p.id}>
                <div className="mav" style={{ background: p.color }}>{p.initial}</div>
                <div>
                  <div className="mnm">{p.name}</div>
                  <div className="mrl">{p.role} &middot; {nPac} paciente{nPac === 1 ? '' : 's'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CliTabs active="cli-equipe" />
    </>
  )
}
