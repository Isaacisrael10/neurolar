// Navegação simples: perfil ativo (família/terapeuta/clínica) + pilha de rotas.

import { createContext, useContext, useState, type ReactNode } from 'react'

export type Role = 'familia' | 'terapeuta' | 'clinica'

export interface Route {
  screen: string
  params?: Record<string, unknown>
}

interface NavCtx {
  role: Role | null
  route: Route | null
  enter: (role: Role) => void
  exit: () => void
  navigate: (screen: string, params?: Record<string, unknown>) => void
  goTab: (screen: string) => void
  back: () => void
}

const Ctx = createContext<NavCtx | null>(null)

function homeFor(role: Role): string {
  if (role === 'familia') return 'inicio'
  if (role === 'terapeuta') return 'ter-pacientes'
  return 'cli-painel'
}

function initFromHash(): { role: Role | null; stack: Route[] } {
  if (typeof window === 'undefined') return { role: null, stack: [] }
  const h = window.location.hash.replace(/^#\/?/, '')
  if (!h) return { role: null, stack: [] }
  const [r, screen, childId] = h.split('/')
  const role = (['familia', 'terapeuta', 'clinica'].includes(r) ? r : null) as Role | null
  if (!role) return { role: null, stack: [] }
  const params = childId ? { childId } : undefined
  return { role, stack: [{ screen: screen || homeFor(role), params }] }
}

export function NavProvider({ children }: { children: ReactNode }) {
  const init = initFromHash()
  const [role, setRole] = useState<Role | null>(init.role)
  const [stack, setStack] = useState<Route[]>(init.stack)

  function enter(r: Role) {
    setRole(r)
    setStack([{ screen: homeFor(r) }])
  }
  function exit() {
    setRole(null)
    setStack([])
  }
  function navigate(screen: string, params?: Record<string, unknown>) {
    setStack((s) => [...s, { screen, params }])
  }
  function goTab(screen: string) {
    setStack([{ screen }])
  }
  function back() {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }

  const route = stack.length > 0 ? stack[stack.length - 1] : null

  return <Ctx.Provider value={{ role, route, enter, exit, navigate, goTab, back }}>{children}</Ctx.Provider>
}

export function useNav(): NavCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useNav precisa do NavProvider')
  return c
}
