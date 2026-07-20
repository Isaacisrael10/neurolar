import type { ReactNode } from 'react'

export interface NavItem {
  key: string
  label: string
  icon: (active: boolean) => ReactNode
}

export function BottomNav({
  items,
  active,
  onSelect,
}: {
  items: NavItem[]
  active: string
  onSelect: (key: string) => void
}) {
  return (
    <div className="nav">
      {items.map((it) => {
        const on = it.key === active
        return (
          <div key={it.key} className={on ? 'tab on' : 'tab'} onClick={() => onSelect(it.key)}>
            {it.icon(on)}
            <div className="l">{it.label}</div>
          </div>
        )
      })}
    </div>
  )
}
