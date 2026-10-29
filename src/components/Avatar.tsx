// Avatar da criança: mostra a foto (sintética) se houver, senão cai pra inicial
// num tile colorido. A foto preenche o tile (object-fit cover via background).

import type { CSSProperties } from 'react'

const KIDBG = 'linear-gradient(140deg,#a78bfa,#7c3aed)'

export function Avatar({ photo, initial, className, style }: { photo?: string; initial: string; className?: string; style?: CSSProperties }) {
  if (photo) {
    return <div className={className} style={{ ...style, backgroundImage: `url(${import.meta.env.BASE_URL}avatars/${photo})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '50%', color: 'transparent' }} />
  }
  return <div className={className} style={{ ...style, background: KIDBG }}>{initial}</div>
}
