// Evolução (família): resumo no topo (maior avanço) + metas agrupadas por
// disciplina/terapeuta, cada uma com gráfico. Payoff: "meu filho tá evoluindo?".

import { useStore, childById, conquistasOf, metasOf, metaDelta, proById, teamOf } from '../store'
import { MetaCard } from '../components/Metas'
import { FamiliaTabs } from './FamiliaHome'

const CHILD = 'ana'
const shortDate = (ts: number): string => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

export default function FamiliaEvolucao() {
  const { state } = useStore()
  const child = childById(state, CHILD)
  if (!child) return null
  const metas = metasOf(state, CHILD)
  const team = teamOf(state, child)
  const conquistas = conquistasOf(state, CHILD)

  const biggest = metas.length ? metas.reduce((a, b) => (metaDelta(b) > metaDelta(a) ? b : a), metas[0]) : null
  const biggestPro = biggest ? proById(state, biggest.professionalId) : null
  const emAvanco = metas.filter((m) => metaDelta(m) > 0).length

  // agrupa por profissional, na ordem da equipe
  const groups = team
    .map((p) => ({ pro: p, metas: metas.filter((m) => m.professionalId === p.id) }))
    .filter((g) => g.metas.length > 0)

  return (
    <>
      <div className="scroll">
        <div className="pagehead"><div><div className="pt">Evolução</div><div className="ps">o progresso da {child.name} nas terapias</div></div></div>

        {biggest && biggestPro && (
          <div className="evo-hero">
            <div className="eh-t">A {child.name} vem evoluindo bem</div>
            <div className="eh-s">{emAvanco} de {metas.length} objetivos com avanço desde o início do acompanhamento.</div>
            <div className="eh-win">
              <span className="ehw-l">Maior avanço</span>
              <span className="ehw-v"><span className="meta-dot" style={{ background: biggestPro.color }}></span>{biggest.title} <b style={{ color: biggestPro.color }}>+{metaDelta(biggest)} {metaDelta(biggest) === 1 ? 'nível' : 'níveis'}</b></span>
            </div>
          </div>
        )}

        {groups.map((g) => (
          <div className="evo-group" key={g.pro.id}>
            <div className="eg-h">
              <div className="eg-av" style={{ background: g.pro.color }}>{g.pro.initial}</div>
              <div>
                <div className="eg-disc">{g.pro.discipline}</div>
                <div className="eg-pro">{g.pro.name}</div>
              </div>
            </div>
            {g.metas.map((m) => <MetaCard key={m.id} meta={m} />)}
          </div>
        ))}

        {conquistas.length > 0 && (
          <div className="evo-conq">
            <div className="ec-h">Conquistas recentes</div>
            <ul className="conq-list">
              {conquistas.slice(0, 8).map((c) => {
                const pro = proById(state, c.professionalId)
                return (
                  <li className="conq-item" key={c.id}>
                    <span className="conq-dot" style={{ background: pro?.color ?? '#7c3aed' }}></span>
                    <div>
                      <span className="conq-text">{c.text}</span>
                      <div className="conq-meta">{shortDate(c.ts)} &middot; {pro?.discipline}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <FamiliaTabs active="evolucao" />
    </>
  )
}
