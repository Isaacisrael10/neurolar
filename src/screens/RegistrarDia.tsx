// Tela "Registrar o dia" — salva no store (persistido) e volta pra home.

import { useState } from 'react'
import { useStore, childById } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, Moon, Utensils, Smiley, Pulse, Note, Check, Face } from '../components/icons'

const CHILD = 'ana'

const sonoOpts = ['Dormiu bem', 'Agitada', 'Dormiu mal']
const alimOpts = ['Comeu bem', 'Comeu pouco', 'Recusou']
const criseOpts = ['Nenhuma', '1', '2 ou mais']

const moods = [
  { key: 'Feliz', color: '#45a86a', mouth: 'M8 14.5s1.5 2 4 2 4-2 4-2' },
  { key: 'Tranquila', color: '#7c3aed', mouth: 'M8.5 14.5h7' },
  { key: 'Irritada', color: '#e6a02f', mouth: 'M8.5 15.5s1.3-1 3.5-1 3.5 1 3.5 1' },
  { key: 'Chorosa', color: '#e2705a', mouth: 'M8 16s1.5-2 4-2 4 2 4 2' },
]

export default function RegistrarDia() {
  const { state, addRegistro } = useStore()
  const { back } = useNav()
  const child = childById(state, CHILD)

  const [sono, setSono] = useState<string | null>(null)
  const [alim, setAlim] = useState<string | null>(null)
  const [humor, setHumor] = useState<string | null>(null)
  const [crise, setCrise] = useState<string | null>(null)
  const [obs, setObs] = useState('')

  function salvar() {
    addRegistro(CHILD, {
      sono: sono ?? undefined,
      alim: alim ?? undefined,
      humor: humor ?? undefined,
      crises: crise ?? undefined,
      obs: obs.trim() || undefined,
    })
    back()
  }

  const nome = child?.name ?? 'a criança'

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={back} aria-label="Voltar">
          <ChevronLeft />
        </button>
        <div className="ab-title">
          Registrar o dia
          <small>{nome} &middot; hoje</small>
        </div>
      </div>

      <div className="rd-scroll">
        <div className="q">
          <div className="q-h">
            <span className="qi" style={{ background: '#edeffb' }}><Moon /></span>
            Como {nome === 'a criança' ? 'a criança' : `a ${nome}`} dormiu?
          </div>
          <div className="opts">
            {sonoOpts.map((o) => (
              <button key={o} className={sono === o ? 'opt on' : 'opt'} onClick={() => setSono(o)}>{o}</button>
            ))}
          </div>
        </div>

        <div className="q">
          <div className="q-h">
            <span className="qi" style={{ background: 'var(--green-soft)' }}><Utensils /></span>
            Como foi a alimentação?
          </div>
          <div className="opts">
            {alimOpts.map((o) => (
              <button key={o} className={alim === o ? 'opt on' : 'opt'} onClick={() => setAlim(o)}>{o}</button>
            ))}
          </div>
        </div>

        <div className="q">
          <div className="q-h">
            <span className="qi" style={{ background: 'var(--amber-soft)' }}><Smiley /></span>
            Como estava o humor?
          </div>
          <div className="moods">
            {moods.map((m) => (
              <button key={m.key} className={humor === m.key ? 'mood on' : 'mood'} onClick={() => setHumor(m.key)}>
                <Face color={m.color} mouth={m.mouth} />
                <div className="ml">{m.key}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="q">
          <div className="q-h">
            <span className="qi" style={{ background: 'var(--coral-soft)' }}><Pulse /></span>
            Teve crises hoje?
          </div>
          <div className="opts">
            {criseOpts.map((o) => (
              <button key={o} className={crise === o ? 'opt on' : 'opt'} onClick={() => setCrise(o)}>{o}</button>
            ))}
          </div>
        </div>

        <div className="q">
          <div className="q-h">
            <span className="qi" style={{ background: 'linear-gradient(150deg,#a78bfa,#7c3aed)' }}><Note stroke="#fff" /></span>
            Observações do dia
          </div>
          <textarea
            className="obs"
            placeholder={`Conte com suas palavras como foi o dia da ${nome}: algo que funcionou, uma dificuldade, uma novidade... A equipe vai ler.`}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>
      </div>

      <div className="savebar">
        <div className="btn" onClick={salvar}>
          <Check stroke="#fff" width={18} height={18} /> Salvar o dia da {nome}
        </div>
      </div>
    </div>
  )
}
