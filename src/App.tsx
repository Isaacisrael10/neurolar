import { useNav } from './nav'
import Landing from './screens/Landing'
import FamiliaHome from './screens/FamiliaHome'
import RegistrarDia from './screens/RegistrarDia'
import Perfil from './screens/Perfil'
import DiaADia from './screens/DiaADia'
import DaEquipe from './screens/DaEquipe'
import DaEquipeSessoes from './screens/DaEquipeSessoes'
import DaEquipeSessao from './screens/DaEquipeSessao'
import { TerapeutaPacientes, TerapeutaPaciente, TerapeutaRegistrar, TerapeutaProntuario, TerapeutaAgenda, TerapeutaConta } from './screens/Terapeuta'
import { ClinicaPainel, ClinicaPacientes, ClinicaEquipe } from './screens/Clinica'

// Definição global da peça do quebra-cabeça (usada no logo "montar").
function PuzzleDef() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <path
          id="pz"
          d="M0,0 L38,0 C38,-15 62,-15 62,0 L100,0 L100,38 C115,38 115,62 100,62 L100,100 L62,100 C62,85 38,85 38,100 L0,100 L0,62 C15,62 15,38 0,38 Z"
        />
      </defs>
    </svg>
  )
}

function CurrentScreen() {
  const { role, route } = useNav()
  if (!role || !route) return <Landing />
  const s = route.screen

  if (role === 'familia') {
    if (s === 'registrar') return <RegistrarDia />
    if (s === 'diaadia') return <DiaADia />
    if (s === 'daequipe') return <DaEquipe />
    if (s === 'daequipe-sessoes') return <DaEquipeSessoes />
    if (s === 'daequipe-sessao') return <DaEquipeSessao />
    if (s === 'perfil') return <Perfil />
    return <FamiliaHome />
  }

  if (role === 'terapeuta') {
    if (s === 'ter-paciente') return <TerapeutaPaciente />
    if (s === 'ter-registrar') return <TerapeutaRegistrar />
    if (s === 'ter-prontuario') return <TerapeutaProntuario />
    if (s === 'ter-agenda') return <TerapeutaAgenda />
    if (s === 'ter-conta') return <TerapeutaConta />
    return <TerapeutaPacientes />
  }

  // clínica
  if (s === 'cli-pacientes') return <ClinicaPacientes />
  if (s === 'cli-equipe') return <ClinicaEquipe />
  return <ClinicaPainel />
}

export default function App() {
  return (
    <>
      <PuzzleDef />
      <div className="stage">
        <div className="phone">
          <CurrentScreen />
        </div>
      </div>
    </>
  )
}
