// Tela de entrada: escolher com qual perfil entrar no app (protótipo).

import { useNav } from '../nav'
import { PuzzleLogo, ChevronRight, NavPerson, NavUsers, NavBuilding } from '../components/icons'

export default function Landing() {
  const { enter } = useNav()
  return (
    <div className="landing">
      <div className="brand">
        <PuzzleLogo size={30} />
        <div className="w">montar</div>
      </div>
      <div className="lsub">Acompanhamento de crianças autistas, com a família e a equipe no mesmo histórico. Entre como:</div>

      <div className="roles">
        <button className="role" onClick={() => enter('familia')}>
          <div className="ri" style={{ background: 'var(--teal-soft)' }}><NavPerson stroke="#177f70" /></div>
          <div>
            <div className="rt">Família</div>
            <div className="rd">Registrar o dia, ver a evolução e a equipe</div>
          </div>
          <span className="go"><ChevronRight /></span>
        </button>

        <button className="role" onClick={() => enter('terapeuta')}>
          <div className="ri" style={{ background: 'var(--blue-soft)' }}><NavUsers stroke="#2f7bbf" /></div>
          <div>
            <div className="rt">Terapeuta</div>
            <div className="rd">Seus pacientes, prontuário e registro de sessões</div>
          </div>
          <span className="go"><ChevronRight /></span>
        </button>

        <button className="role" onClick={() => enter('clinica')}>
          <div className="ri" style={{ background: 'var(--amber-soft)' }}><NavBuilding stroke="#b57d16" /></div>
          <div>
            <div className="rt">Clínica</div>
            <div className="rd">Painel de pacientes, equipe e visão do negócio</div>
          </div>
          <span className="go"><ChevronRight /></span>
        </button>
      </div>

      <div className="lfoot">Protótipo. Os dados ficam salvos só neste navegador.</div>
    </div>
  )
}
