// Aba "Dia a dia" da família: a ofensiva (placar do post diário), o registro do
// dia, e o histórico dos próprios registros. Tudo que é do post diário mora aqui.

import { useStore, childById, registrosOf, diarioFeedOf, type Author } from '../store'
import { useNav } from '../nav'
import { Ofensiva } from '../components/Ofensiva'
import { PostCard } from '../components/PostCard'
import { Moon, Utensils, Smiley, Pulse, Pencil } from '../components/icons'
import { FamiliaTabs } from './FamiliaHome'

const CHILD = 'ana'
const FAM: Author = { type: 'familia', id: 'voce', name: 'Você', role: 'em casa', color: '#1f9e8b' }

export default function DiaADia() {
  const { state } = useStore()
  const { navigate } = useNav()
  const child = childById(state, CHILD)
  if (!child) return null

  const diarios = diarioFeedOf(state, CHILD)
  const regs = registrosOf(state, CHILD)
  const diasReg = regs.length
  const semCrise = regs.filter((r) => (r.crises ?? 'Nenhuma') === 'Nenhuma').length
  const counts: Record<string, number> = {}
  regs.forEach((r) => { if (r.humor) counts[r.humor] = (counts[r.humor] || 0) + 1 })
  const humorComum = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div>
            <div className="pt">Dia a dia</div>
            <div className="ps">o registro diário da {child.name}</div>
          </div>
        </div>

        {/* registrar o dia */}
        <div className="card reg" style={{ marginTop: 8 }}>
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

        {/* ofensiva */}
        <div className="sec-h"><div className="t">Sua constância</div></div>
        <Ofensiva childId={CHILD} />

        {/* resumo */}
        <div className="stats" style={{ marginTop: 20 }}>
          <div className="stat"><div className="sv">{diasReg}</div><div className="sl">dias registrados</div></div>
          <div className="stat"><div className="sv">{semCrise}</div><div className="sl">dias sem crise</div></div>
          <div className="stat"><div className="sv" style={{ fontSize: 16 }}>{humorComum}</div><div className="sl">humor mais comum</div></div>
        </div>

        {/* histórico */}
        <div className="sec-h"><div className="t">Seus registros</div></div>
        {diarios.map((it) => <PostCard key={it.id} item={it} author={FAM} />)}
      </div>

      <FamiliaTabs active="diaadia" />
    </>
  )
}
