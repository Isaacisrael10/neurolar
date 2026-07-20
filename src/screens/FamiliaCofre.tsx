// Cofre de documentos da FAMÍLIA: laudo, receitas, relatórios, carteirinha, tudo
// num lugar só. A família adiciona e encontra rápido, sem caçar papel no email.

import { useState } from 'react'
import { useStore, childById, documentosOf, docColor, DOC_CATEGORIES, fullDate } from '../store'
import { useNav } from '../nav'
import { ChevronLeft, FileText, Plus, Check, Note } from '../components/icons'

const CHILD = 'ana'

export default function FamiliaCofre() {
  const { state, addDocumento } = useStore()
  const { back } = useNav()
  const child = childById(state, CHILD)
  const [filter, setFilter] = useState('Todos')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Laudo')
  const [note, setNote] = useState('')
  if (!child) return null

  const docs = documentosOf(state, CHILD)
  const presentes = DOC_CATEGORIES.map((c) => c.key).filter((k) => docs.some((d) => d.category === k))
  const chips = ['Todos', ...presentes]
  const lista = filter === 'Todos' ? docs : docs.filter((d) => d.category === filter)

  function salvar() {
    const n = name.trim()
    if (!n) return
    addDocumento(CHILD, { name: n, category, note: note.trim() })
    setName('')
    setNote('')
    setCategory('Laudo')
    setFilter('Todos')
    setAdding(false)
  }

  function cancelar() {
    setName('')
    setNote('')
    setCategory('Laudo')
    setAdding(false)
  }

  return (
    <div className="rd">
      <div className="appbar">
        <button className="abback" onClick={adding ? cancelar : back} aria-label="Voltar"><ChevronLeft /></button>
        <div className="ab-title">
          {adding ? 'Adicionar documento' : 'Cofre de documentos'}
          <small>{child.name} &middot; {adding ? 'guarde no lugar certo' : `${docs.length} documentos guardados`}</small>
        </div>
      </div>

      <div className="rd-scroll">
        {adding ? (
          <>
            <div className="q">
              <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><FileText stroke="#6d28d9" /></span>Qual documento?</div>
              <input className="c-input" style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, padding: '11px 14px', fontSize: 13.5 }} placeholder="Nome (ex.: Laudo diagnóstico, Receita...)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="q">
              <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Plus stroke="#6d28d9" /></span>Tipo</div>
              <div className="filters" style={{ margin: 0, flexWrap: 'wrap', overflow: 'visible' }}>
                {DOC_CATEGORIES.map((c) => (
                  <button key={c.key} className={category === c.key ? 'fil on' : 'fil'} onClick={() => setCategory(c.key)}>{c.key}</button>
                ))}
              </div>
            </div>
            <div className="q">
              <div className="q-h"><span className="qi" style={{ background: 'var(--teal-soft)' }}><Note stroke="#6d28d9" /></span>Observação (opcional)</div>
              <textarea className="obs" style={{ minHeight: 72 }} placeholder="Ex.: validade, médico que emitiu, quando renovar..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="internal" style={{ marginTop: 2 }}><FileText stroke="#9a6a1a" /> No protótipo o arquivo não é anexado de verdade ainda, só o registro do documento.</div>
          </>
        ) : (
          <>
            <div className="filters" style={{ marginTop: 0 }}>
              {chips.map((c) => (
                <button key={c} className={filter === c ? 'fil on' : 'fil'} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>

            {lista.length === 0 && (
              <div className="empty"><FileText stroke="#bdb6cb" /> Nenhum documento aqui ainda.</div>
            )}

            {lista.map((d) => {
              const color = docColor(d.category)
              return (
                <div className="cof-card" key={d.id}>
                  <div className="cof-ic" style={{ background: `${color}1a` }}><FileText stroke={color} /></div>
                  <div className="cof-main">
                    <div className="cof-nm">{d.name}</div>
                    <div className="cof-row">
                      <span className="cof-cat" style={{ background: `${color}1a`, color }}>{d.category}</span>
                      <span className="cof-when">{fullDate(d.ts)}</span>
                    </div>
                    {d.note && <div className="cof-note">{d.note}</div>}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <div className="savebar">
        {adding ? (
          <div className="share-actions" style={{ marginTop: 0 }}>
            <button className="sa-cancel" onClick={cancelar}>Cancelar</button>
            <button className="sa-send" onClick={salvar}><Check stroke="#fff" width={15} height={15} /> Guardar documento</button>
          </div>
        ) : (
          <div className="btn" onClick={() => setAdding(true)}><Plus stroke="#fff" /> Adicionar documento</div>
        )}
      </div>
    </div>
  )
}
