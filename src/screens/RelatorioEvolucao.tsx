// Relatório de evolução: consolida metas + sessões + participação da família num
// documento. Gerado pela clínica/terapeuta, salvável no cofre. (No app final: PDF.)

import { useState } from 'react'
import { useStore, childById, conquistasOf, metasOf, metaLatest, nivelLabel, proById, prontuarioOf, teamOf, fullDate } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, Check } from '../components/icons'

const D = 24 * 3600000

export default function RelatorioEvolucao() {
  const { state, addDocumento } = useStore()
  const { route, back } = useNav()
  const childId = (route?.params?.childId as string) ?? 'ana'
  const child = childById(state, childId)
  const [saved, setSaved] = useState(false)
  if (!child) return null

  const now = Date.now()
  const periodStart = now - 90 * D
  const metas = metasOf(state, childId)
  const conquistas = conquistasOf(state, childId).filter((c) => c.ts >= periodStart)
  const team = teamOf(state, child)
  const sessions = prontuarioOf(state, childId).filter((e) => e.ts >= periodStart)
  const registrosCount = state.registros.filter((r) => r.childId === childId && new Date(r.date + 'T20:00:00').getTime() >= periodStart).length

  const byDisc = team
    .map((p) => {
      const ss = sessions.filter((e) => e.professionalId === p.id).sort((a, b) => b.ts - a.ts)
      return { pro: p, count: ss.length, last: ss[0] }
    })
    .filter((d) => d.count > 0)

  function salvar() {
    const mes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    addDocumento(childId, { name: `Relatório de evolução - ${mes}`, category: 'Relatório', note: 'Consolidado das terapias dos últimos 90 dias, gerado no NeuroLar.' })
    setSaved(true)
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">Relatório de evolução<small>{child.name} &middot; últimos 90 dias</small></div>
      </div>

      <div className="rd-scroll">
        <div className="rep">
          <div className="rep-head">
            <div className="rep-clin">Clínica Semear</div>
            <div className="rep-ttl">Relatório de evolução</div>
            <div className="rep-sub">{child.name}, {child.age} anos &middot; {child.diagnosis}</div>
            <div className="rep-per">Período: {fullDate(periodStart)} a {fullDate(now)}</div>
          </div>

          <div className="rep-sec">
            <div className="rep-h">Metas e progresso</div>
            {metas.map((m) => {
              const pro = proById(state, m.professionalId)
              const color = pro?.color ?? '#7c3aed'
              return (
                <div className="rmr" key={m.id}>
                  <div className="rmr-top">
                    <span className="meta-dot" style={{ background: color }}></span>
                    <span className="rmr-title">{m.title} <span className="rmr-disc">· {pro?.discipline}</span></span>
                    <span className="rmr-prog"><b style={{ color }}>{nivelLabel(metaLatest(m))}</b></span>
                  </div>
                  {metaLatest(m) > (m.measures[0]?.value ?? 0) && (
                    <div className="rmr-journey">De {nivelLabel(m.measures[0]?.value ?? 0)} para {nivelLabel(metaLatest(m))}</div>
                  )}
                  {m.nota && <div className="ra-note">{m.nota}</div>}
                </div>
              )
            })}
          </div>

          {conquistas.length > 0 && (
            <div className="rep-sec">
              <div className="rep-h">Conquistas do período</div>
              {conquistas.map((c) => (
                <div className="rep-conq" key={c.id}>
                  <span className="meta-dot" style={{ background: proById(state, c.professionalId)?.color ?? '#7c3aed' }}></span>
                  <span><b>{fullDate(c.ts)}</b> &middot; {c.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rep-sec">
            <div className="rep-h">Resumo por área</div>
            {byDisc.map((d) => (
              <div className="rep-area" key={d.pro.id}>
                <div className="ra-h"><span className="meta-dot" style={{ background: d.pro.color }}></span>{d.pro.discipline} <span className="ra-count">{d.count} sessões no período</span></div>
                {d.last && <div className="ra-note">{d.last.orientacao}</div>}
              </div>
            ))}
          </div>

          <div className="rep-sec">
            <div className="rep-h">Participação da família</div>
            <div className="ra-note"><b>{registrosCount} registros</b> do dia a dia no período. A família acompanhou de perto a rotina da {child.name}, o que dá contexto valioso pra equipe.</div>
          </div>
        </div>

        {saved ? (
          <div className="rep-saved"><Check stroke="#2f8451" width={16} height={16} /> Salvo no cofre de documentos</div>
        ) : (
          <div className="btn" onClick={salvar}><Check stroke="#fff" width={17} height={17} /> Salvar no cofre</div>
        )}
        <div className="rep-foot">Protótipo. No app final, este relatório vira um PDF pronto pra enviar à família e ao convênio.</div>
      </div>
    </div>
  )
}
