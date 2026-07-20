import { useNav } from './nav'
import Landing from './screens/Landing'
import FamiliaHome from './screens/FamiliaHome'
import RegistrarDia from './screens/RegistrarDia'
import Perfil from './screens/Perfil'
import DiaADia from './screens/DiaADia'
import FamiliaParaCasa from './screens/FamiliaParaCasa'
import FamiliaCofre from './screens/FamiliaCofre'
import FamiliaAgenda from './screens/FamiliaAgenda'
import FamiliaEvolucao from './screens/FamiliaEvolucao'
import RelatorioEvolucao from './screens/RelatorioEvolucao'
import DaEquipe from './screens/DaEquipe'
import DaEquipeSessoes from './screens/DaEquipeSessoes'
import DaEquipeSessao from './screens/DaEquipeSessao'
import { TerapeutaPacientes, TerapeutaPaciente, TerapeutaDiscussao, TerapeutaTarefas, TerapeutaDisciplina, TerapeutaRegistrar, TerapeutaProntuario, TerapeutaAgenda, TerapeutaConta } from './screens/Terapeuta'
import { ClinicaPainel, ClinicaAgenda, ClinicaFinanceiro, ClinicaPacientes, ClinicaEquipe, ClinicaTerapeuta, ClinicaPaciente } from './screens/Clinica'

function CurrentScreen() {
  const { role, route } = useNav()
  if (!role || !route) return <Landing />
  const s = route.screen

  if (role === 'familia') {
    if (s === 'registrar') return <RegistrarDia />
    if (s === 'diaadia') return <DiaADia />
    if (s === 'paracasa') return <FamiliaParaCasa />
    if (s === 'cofre') return <FamiliaCofre />
    if (s === 'agenda') return <FamiliaAgenda />
    if (s === 'evolucao') return <FamiliaEvolucao />
    if (s === 'daequipe') return <DaEquipe />
    if (s === 'daequipe-sessoes') return <DaEquipeSessoes />
    if (s === 'daequipe-sessao') return <DaEquipeSessao />
    if (s === 'perfil') return <Perfil />
    return <FamiliaHome />
  }

  if (role === 'terapeuta') {
    if (s === 'ter-paciente') return <TerapeutaPaciente />
    if (s === 'ter-discussao') return <TerapeutaDiscussao />
    if (s === 'ter-tarefas') return <TerapeutaTarefas />
    if (s === 'ter-disciplina') return <TerapeutaDisciplina />
    if (s === 'ter-registrar') return <TerapeutaRegistrar />
    if (s === 'ter-prontuario') return <TerapeutaProntuario />
    if (s === 'ter-agenda') return <TerapeutaAgenda />
    if (s === 'ter-conta') return <TerapeutaConta />
    if (s === 'relatorio') return <RelatorioEvolucao />
    return <TerapeutaPacientes />
  }

  // clínica
  if (s === 'cli-agenda') return <ClinicaAgenda />
  if (s === 'cli-financeiro') return <ClinicaFinanceiro />
  if (s === 'cli-pacientes') return <ClinicaPacientes />
  if (s === 'cli-equipe') return <ClinicaEquipe />
  if (s === 'cli-terapeuta') return <ClinicaTerapeuta />
  if (s === 'cli-paciente') return <ClinicaPaciente />
  if (s === 'relatorio') return <RelatorioEvolucao />
  return <ClinicaPainel />
}

export default function App() {
  return (
    <>
      <div className="stage">
        <div className="phone">
          <CurrentScreen />
        </div>
      </div>
    </>
  )
}
