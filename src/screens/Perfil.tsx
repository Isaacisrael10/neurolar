// Perfil da família: dados da criança (editáveis e salvos), equipe e troca de perfil.

import { useState } from 'react'
import { useStore, childById, teamOf, documentosOf } from '../store'
import { useNav } from '../nav'
import { Check, FileText, ChevronRight } from '../components/icons'
import { Avatar } from '../components/Avatar'
import { FamiliaTabs } from './FamiliaHome'

const CHILD = 'ana'

export default function Perfil() {
  const { state, updateChild, resetAll } = useStore()
  const { exit, navigate } = useNav()
  const child = childById(state, CHILD)
  const docs = documentosOf(state, CHILD)

  const [nome, setNome] = useState(child?.name ?? '')
  const [idade, setIdade] = useState(String(child?.age ?? ''))
  const [diag, setDiag] = useState(child?.diagnosis ?? '')
  const [notes, setNotes] = useState(child?.notes ?? '')
  const [saved, setSaved] = useState(false)

  if (!child) return null
  const team = teamOf(state, child)

  function salvar() {
    updateChild(CHILD, { name: nome.trim() || child!.name, age: parseInt(idade) || child!.age, initial: (nome.trim()[0] || child!.initial).toUpperCase(), diagnosis: diag, notes })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <>
      <div className="scroll">
        <div className="pagehead">
          <div>
            <div className="pt">Perfil</div>
            <div className="ps">Dados da {child.name}</div>
          </div>
        </div>

        <div className="child" style={{ paddingTop: 8 }}>
          <Avatar photo={child.photo} initial={child.initial} className="kid" />
          <div>
            <div className="name">{child.name}</div>
            <div className="sub">{child.age} anos &middot; {child.diagnosis || 'sem diagnóstico'}</div>
          </div>
        </div>

        <div className="card reg" style={{ marginTop: 6 }}>
          <div className="field">
            <label>Nome</label>
            <input className="inp" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="field">
            <label>Idade</label>
            <input className="inp" value={idade} onChange={(e) => setIdade(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
          </div>
          <div className="field">
            <label>Diagnóstico</label>
            <input className="inp" value={diag} onChange={(e) => setDiag(e.target.value)} placeholder="Ex.: TEA nível 1" />
          </div>
          <div className="field" style={{ marginBottom: 4 }}>
            <label>Observações (a equipe vê)</label>
            <textarea className="inp" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferências, sensibilidades, o que ajuda a acalmar..." />
          </div>
          <div className="btn" onClick={salvar} style={{ marginTop: 6 }}>
            <Check stroke="#fff" width={18} height={18} /> {saved ? 'Salvo!' : 'Salvar alterações'}
          </div>
        </div>

        <div className="pc-home" onClick={() => navigate('cofre')} style={{ marginTop: 14 }}>
          <div className="pc-ic"><FileText stroke="#fff" /></div>
          <div className="pc-mid">
            <div className="pc-t">Cofre de documentos</div>
            <div className="pc-s">{docs.length} guardados &middot; laudo, receitas, relatórios</div>
          </div>
          <span className="go"><ChevronRight /></span>
        </div>

        <div className="sec-h"><div className="t">Equipe da {child.name}</div></div>
        <div className="rowlist">
          {team.map((p) => (
            <div className="mrow2" key={p.id}>
              <div className="mav" style={{ background: p.color }}>{p.initial}</div>
              <div>
                <div className="mnm">{p.name}</div>
                <div className="mrl">{p.role}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-ghost" onClick={exit}>Trocar de perfil</button>
        <button className="btn-soft" onClick={resetAll}>Restaurar dados de demonstração</button>
      </div>

      <FamiliaTabs active="perfil" />
    </>
  )
}
