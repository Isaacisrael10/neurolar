// Diagnóstico com um pontinho colorido por categoria. Trata a info sem virar
// mais um chip pesado: só uma bolinha + texto num tom mais escuro.

import { diagColor } from '../store'

export function Diag({ text }: { text: string }) {
  return <span className="diag" style={{ color: diagColor(text) }}>{text}</span>
}
