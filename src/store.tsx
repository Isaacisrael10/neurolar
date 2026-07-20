// Store do app: estado + persistência em localStorage + ações + seletores.
// Sem backend ainda: tudo salvo no navegador. Depois isto vira Supabase.
//
// Modelo (ClassApp, sem chat ao vivo, tudo ORGANIZADO por seções):
//  - registros: os PAIS postam UMA vez por dia (fim do dia), com tags + texto.
//  - prontuario: os TERAPEUTAS postam POR SESSÃO. Tem TAGS específicas da
//    disciplina (visão geral) + `orientacao` (recado à família, texto) +
//    `evolucao` (interna, só a clínica). Cada post tem leitura + respostas.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface Professional {
  id: string
  name: string
  initial: string
  role: string // título (ex.: Psicóloga)
  discipline: string // tipo de terapia (ex.: Psicologia)
  color: string
}

export interface Child {
  id: string
  name: string
  initial: string
  age: number
  diagnosis: string
  notes: string
  teamIds: string[]
  photo?: string // arquivo em /avatars (foto sintética; simula a foto que o pai subiria)
}

export interface Reply {
  id: string
  authorType: 'familia' | 'terapeuta'
  authorId: string
  authorName: string
  color: string
  ts: number
  text: string
}

export interface Registro {
  id: string
  childId: string
  date: string // YYYY-MM-DD
  sono?: string
  alim?: string
  humor?: string
  crises?: string
  obs?: string
  replies: Reply[]
  readByTeam: boolean
}

export interface ProntuarioEntry {
  id: string
  childId: string
  professionalId: string
  ts: number
  tags: string[] // específicas da disciplina (visão geral)
  evolucao: string // interna (clínica)
  orientacao: string // recado/texto para a família
  replies: Reply[]
  readByFamily: boolean
}

export interface Session {
  id: string
  childId: string
  professionalId: string
  when: string
  ts: number
  sala?: string // sala onde a sessão acontece (usada na agenda da clínica e na detecção de conflito)
}

// Discussão da equipe: conversa FECHADA entre os profissionais sobre um paciente.
// A família NÃO vê. Uma mensagem pode ser "promovida" a recado à família (vira
// um ProntuarioEntry com orientacao), e aí a conclusão chega, o debate não.
export interface TeamNote {
  id: string
  childId: string
  professionalId: string
  ts: number
  text: string
  sharedToFamily: boolean
}

// Tarefa de casa: cada terapeuta passa uma orientação de "para casa". A família
// vê TODAS unificadas num lugar só e marca o que fez. O terapeuta acompanha a
// adesão (quantos dias a família cumpriu na semana).
export interface Homework {
  id: string
  childId: string
  professionalId: string
  ts: number
  title: string
  detail: string
  frequency: string // rótulo livre: "Diário", "3x na semana"...
  doneDates: string[] // YYYY-MM-DD marcados pela família
  active: boolean
}

// Cofre de documentos: a família guarda num lugar só laudo, receitas, relatórios,
// carteirinha, etc. Resolve a "fadiga de acesso" (viver caçando papel no email).
export interface Documento {
  id: string
  childId: string
  ts: number
  name: string
  category: string
  note: string
  addedBy: string
}

// Evento da agenda criado pela FAMÍLIA (consulta, reunião na escola, exame...).
// As sessões de terapia vêm da clínica (array `sessions`) e são unificadas com
// estes na Agenda. A família pode ligar um lembrete em qualquer item.
export interface Evento {
  id: string
  childId: string
  ts: number
  timeLabel: string
  title: string
  category: string // 'Consulta' | 'Escola' | 'Exame' | 'Outro'
  location: string
}

// Meta terapêutica: um objetivo que um terapeuta trabalha com a criança
// (ex.: "Contato visual"). Guarda o NÍVEL atual (degrau de independência, em
// palavras, não gráfico) e uma frase curta do terapeuta. NÃO é protocolo ABA
// licenciado (VB-MAPP etc.), é uma meta estruturada nossa. Cada meta pertence a
// uma disciplina (o professional). A evolução que a família celebra são as CONQUISTAS.
export interface Meta {
  id: string
  childId: string
  professionalId: string
  title: string
  createdTs: number
  measures: { ts: number; value: number }[] // nível 0-4 (índice em META_NIVEIS); o mais recente é o nível de hoje
  nota?: string // frase curta do terapeuta sobre o objetivo (a família vê)
  active: boolean
}

// Conquista: um momento concreto que a equipe registra na linha do tempo da
// criança (ex.: "Fez contato visual espontâneo na brincadeira"). É isso que a
// família vê como evolução, no lugar de gráfico. Escrita por um terapeuta.
export interface Conquista {
  id: string
  childId: string
  professionalId: string
  ts: number
  text: string
}

// Mensalidade que a FAMÍLIA paga à clínica (financeiro leve, acessório). Um por
// criança por mês. Sem convênio/glosa/nota fiscal (isso fica pro backend/sócio).
export interface Pagamento {
  id: string
  childId: string
  mes: string // 'YYYY-MM'
  valor: number
  status: 'pago' | 'pendente'
}

// Gasto/despesa da clínica no mês (financeiro leve). Lucro = recebido - gastos.
// Sem folha detalhada por terapeuta / fiscal (isso fica pro backend).
export interface Gasto {
  id: string
  mes: string // 'YYYY-MM'
  categoria: string
  descricao: string
  valor: number
}

export interface State {
  children: Child[]
  professionals: Professional[]
  registros: Registro[]
  prontuario: ProntuarioEntry[]
  sessions: Session[]
  discussions: TeamNote[]
  homework: Homework[]
  documentos: Documento[]
  eventos: Evento[]
  metas: Meta[]
  conquistas: Conquista[]
  pagamentos: Pagamento[]
  gastos: Gasto[]
  reminders: string[] // ids (de sessão ou evento) com lembrete ligado
}

const KEY = 'neurolar-state-v1'
const TEAL = '#7c3aed'

// Vocabulário de tags por tipo de terapia. Cada sessão marca as que trabalhou.
export const TAGS_BY_DISCIPLINE: Record<string, string[]> = {
  Psicologia: ['Contato visual', 'Autorregulação', 'Interação social', 'Comportamento', 'Atenção compartilhada', 'Reconhecimento de emoções', 'Flexibilidade'],
  Fonoaudiologia: ['Vocabulário', 'Articulação', 'Compreensão', 'Fala funcional', 'Comunicação alternativa', 'Sons novos', 'Trocas comunicativas'],
  'Terapia Ocupacional': ['Coordenação motora fina', 'Coordenação motora ampla', 'Integração sensorial', 'Regulação sensorial', 'Atividades de vida diária', 'Praxia', 'Tolerância a texturas'],
  Psicopedagogia: ['Atenção', 'Leitura e escrita', 'Raciocínio lógico', 'Organização', 'Memória', 'Funções executivas'],
  Musicoterapia: ['Ritmo', 'Expressão musical', 'Atenção auditiva', 'Turnos musicais', 'Regulação pela música', 'Vocalização'],
  Fisioterapia: ['Equilíbrio', 'Marcha', 'Força muscular', 'Coordenação global', 'Tônus', 'Postura'],
}

/* ---------- bancos de conteúdo para gerar o restante da clínica ---------- */

const FIRST_NAMES = ['Miguel', 'Sofia', 'Arthur', 'Helena', 'Bernardo', 'Valentina', 'Heitor', 'Laura', 'Davi', 'Isabella', 'Lorenzo', 'Manuela', 'Théo', 'Alice', 'Pedro', 'Luiza', 'Gabriel', 'Cecília', 'Enzo', 'Eloá', 'Matheus', 'Giovanna', 'Rafael', 'Maria', 'Gustavo', 'Beatriz', 'Felipe', 'Lara', 'João', 'Yasmin', 'Samuel', 'Antonella', 'Nicolas', 'Rebeca', 'Benjamin', 'Lívia', 'Vicente', 'Mariana', 'Caio', 'Elisa', 'Otávio', 'Melissa', 'Anthony', 'Sarah', 'Benício', 'Clara', 'Murilo', 'Olívia', 'Noah', 'Marina', 'Ravi', 'Bryan', 'Emanuelly', 'Erick', 'Isadora', 'Kaique', 'Bianca', 'Léo', 'Heloísa', 'Vitor', 'Alícia', 'Henrique', 'Luana']

const DIAGNOSES = ['TEA nível 1', 'TEA nível 1', 'TEA nível 2', 'TEA nível 2', 'TEA nível 3', 'TDAH', 'TEA + TDAH', 'Atraso de linguagem', 'Deficiência intelectual leve', 'Síndrome de Down', 'TOD', 'Atraso no desenvolvimento neuropsicomotor']

const CHILD_NOTES = [
  'Gosta de rotina e previsibilidade. Sensível a barulhos altos.',
  'Muito comunicativo e afetuoso. Trabalhando interação com colegas.',
  'Responde bem a reforço positivo e apoio visual.',
  'Em desenvolvimento da linguagem. Gosta de atividades sensoriais.',
  'Dificuldade com transições. Prefere ambientes calmos.',
  'Curioso, interessado em números e letras.',
  'Em adaptação à rotina de terapias.',
  'Gosta de música e de brincar ao ar livre.',
]

// nomes femininos do pool (o resto é masculino), pra casar a foto com o gênero.
const FEMALE_NAMES = new Set(['Ana', 'Sofia', 'Helena', 'Valentina', 'Laura', 'Isabella', 'Manuela', 'Alice', 'Luiza', 'Cecília', 'Eloá', 'Giovanna', 'Maria', 'Beatriz', 'Lara', 'Yasmin', 'Antonella', 'Rebeca', 'Lívia', 'Mariana', 'Elisa', 'Melissa', 'Sarah', 'Clara', 'Olívia', 'Marina', 'Emanuelly', 'Isadora', 'Bianca', 'Heloísa', 'Alícia', 'Luana'])

// gênero de cada rosto recortado das grades (M/F), posições 0 a 13 por grade.
const PHOTO_GENDER = ['FMFMFMFMFMFMFM', 'MFMFMFMFMFMFMF', 'MFMFMFMFMFMFMF', 'MFFMMFFMMFMFMF', 'FMFMFMFFFMFMFM', 'FMFMFMFMMFFMFM', 'MFFMFMFMFFFMFM']
const BOY_PHOTOS: string[] = []
const GIRL_PHOTOS: string[] = []
PHOTO_GENDER.forEach((g, gi) => { for (let i = 0; i < 14; i++) (g[i] === 'M' ? BOY_PHOTOS : GIRL_PHOTOS).push(`g${gi}_${i}.jpg`) })

const OBS_POOL = ['', '', '', 'Dia tranquilo, brincou bastante.', 'Dormiu pouco à noite, acordou algumas vezes.', 'Comeu super bem e ficou de bom humor o dia todo.', 'Ficou um pouco agitado na hora de dormir.', 'Teve uma crise curta numa transição, mas se acalmou rápido.', 'Dia leve, gostou muito do parque.', 'Recusou o almoço, comeu melhor no jantar.']

const EVOL_TPL: ((n: string, t1: string, t2: string) => string)[] = [
  (n, t1, t2) => `${n} apresentou boa participação na sessão, com avanços em ${t1} e ${t2}. Manteve tolerância às atividades propostas.`,
  (n, t1) => `Sessão focada em ${t1}. ${n} sustentou atenção por períodos mais longos e reduziu comportamentos de esquiva.`,
  (n, t1, t2) => `Trabalhados objetivos de ${t1} e ${t2} com apoio graduado. ${n} demonstrou evolução na resposta aos comandos.`,
  (n, t1) => `${n} respondeu bem às estratégias de ${t1}, com mais iniciativa e engajamento ao longo da sessão.`,
]

const ORI_TPL: ((n: string, t1: string) => string)[] = [
  (n, t1) => `Hoje ${n} foi muito bem em ${t1}. Em casa, vale reforçar isso em pequenas situações do dia a dia, sempre comemorando as tentativas.`,
  (n, t1) => `${n} avançou em ${t1} na sessão de hoje. Podem praticar de um jeito leve e divertido durante a rotina.`,
  (n) => `${n} teve um ótimo dia por aqui. Continuem incentivando em casa, do jeitinho que a gente combinou.`,
]

const DISC_OPEN: ((n: string) => string)[] = [
  (n) => `Pessoal, tenho notado que ${n} rende mais quando começamos com uma atividade de regulação. Vale a gente alinhar isso entre as terapias.`,
  (n) => `${n} tem chegado mais agitado(a) nas últimas semanas. Alguém mais percebeu? Acho que vale combinarmos uma estratégia comum.`,
  (n) => `Queria alinhar os objetivos de ${n} pra puxarmos todos na mesma direção neste mês.`,
]

const DISC_REPLY: (() => string)[] = [
  () => `Faz sentido. Na minha área também percebo algo parecido, topo padronizar.`,
  () => `Concordo. Vou registrar e trago os dados na próxima semana.`,
  () => `Boa ideia. Podemos combinar de começar sempre pela regulação antes das tarefas.`,
]

const HW_DETAIL = (n: string, t: string): string => `Reserve uns minutinhos por dia para trabalhar ${t.toLowerCase()} com ${n}, de forma leve e divertida. Comemore cada tentativa.`

// Categorias do cofre, cada uma com sua cor.
export const DOC_CATEGORIES: { key: string; color: string }[] = [
  { key: 'Laudo', color: '#e2705a' },
  { key: 'Receita', color: '#45a86a' },
  { key: 'Relatório', color: '#3b8fd4' },
  { key: 'Exame', color: '#e6a02f' },
  { key: 'Carteirinha', color: '#6d7ee0' },
  { key: 'Escola', color: '#d1568c' },
  { key: 'Recibo', color: '#0d9488' },
  { key: 'Outros', color: '#938aa8' },
]

export function docColor(category: string): string {
  return DOC_CATEGORIES.find((c) => c.key === category)?.color ?? '#938aa8'
}

// Cor de categoria do diagnóstico (tom escuro, legível como texto).
export function diagColor(d: string): string {
  const s = d.toLowerCase()
  if (s.includes('tea')) return '#2f7bbf'
  if (s.includes('tdah')) return '#b57d16'
  if (s.includes('atraso')) return '#c14a34'
  if (s.includes('down')) return '#2f8451'
  if (s.includes('deficiência') || s.includes('deficiencia')) return '#6a52b0'
  if (s.includes('tod')) return '#c13b74'
  return '#5c6b76'
}

// Categorias de evento da família na agenda (Terapia vem da cor do profissional).
export const EVENT_CATEGORIES: { key: string; color: string }[] = [
  { key: 'Consulta', color: '#3b8fd4' },
  { key: 'Escola', color: '#45a86a' },
  { key: 'Exame', color: '#e6a02f' },
  { key: 'Outro', color: '#938aa8' },
]

export function eventColor(category: string): string {
  return EVENT_CATEGORIES.find((c) => c.key === category)?.color ?? '#938aa8'
}

/* ---------- helpers de data ---------- */

export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function relTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${Math.max(1, min)} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ontem'
  return `há ${d} dias`
}

export function fullDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function longDate(ts: number): string {
  const s = new Date(ts).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

/* ---------- seed inicial ---------- */

function seed(): State {
  const professionals: Professional[] = [
    { id: 'm', name: 'Marina', initial: 'M', role: 'Psicóloga', discipline: 'Psicologia', color: '#3b8fd4' },
    { id: 'c', name: 'Carla', initial: 'C', role: 'Fonoaudióloga', discipline: 'Fonoaudiologia', color: '#45a86a' },
    { id: 'j', name: 'João', initial: 'J', role: 'Terapeuta Ocupacional', discipline: 'Terapia Ocupacional', color: '#e6a02f' },
    { id: 'r', name: 'Rita', initial: 'R', role: 'Psicopedagoga', discipline: 'Psicopedagogia', color: '#e2705a' },
    { id: 'h', name: 'Helena', initial: 'H', role: 'Psicóloga', discipline: 'Psicologia', color: '#3b8fd4' },
    { id: 'd', name: 'Diego', initial: 'D', role: 'Fonoaudiólogo', discipline: 'Fonoaudiologia', color: '#45a86a' },
    { id: 'p', name: 'Paula', initial: 'P', role: 'Terapeuta Ocupacional', discipline: 'Terapia Ocupacional', color: '#e6a02f' },
    { id: 't', name: 'Tiago', initial: 'T', role: 'Psicopedagogo', discipline: 'Psicopedagogia', color: '#e2705a' },
    { id: 'b', name: 'Bruno', initial: 'B', role: 'Musicoterapeuta', discipline: 'Musicoterapia', color: '#1f9e8b' },
    { id: 'la', name: 'Larissa', initial: 'L', role: 'Musicoterapeuta', discipline: 'Musicoterapia', color: '#1f9e8b' },
    { id: 'ca', name: 'Camila', initial: 'C', role: 'Fisioterapeuta', discipline: 'Fisioterapia', color: '#d94f8a' },
    { id: 'ra', name: 'Rafael', initial: 'R', role: 'Fisioterapeuta', discipline: 'Fisioterapia', color: '#d94f8a' },
  ]

  const children: Child[] = [
    { id: 'ana', name: 'Ana', initial: 'A', age: 6, diagnosis: 'TEA nível 1', notes: 'Gosta de rotina e de música. Sensível a barulhos altos.', teamIds: ['m', 'c', 'j', 'r'], photo: 'g0_0.jpg' },
  ]

  const now = Date.now()
  const H = 3600000
  const D = 24 * H

  const registros: Registro[] = []
  const sonos = ['Dormiu bem', 'Agitada', 'Dormiu bem']
  const alims = ['Comeu bem', 'Comeu pouco', 'Comeu bem']
  const humores = ['Feliz', 'Tranquila', 'Feliz', 'Irritada', 'Tranquila']
  for (let i = 1; i <= 12; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const isYesterday = i === 1
    // os 2 registros mais recentes (menos o de ontem, que já foi respondido) ficam
    // como "não lidos" pela equipe, pra alimentar as Novidades da família.
    const naoLido = i === 2 || i === 3
    const obsExtra = i === 2 ? 'Ana teve um dia mais agitado, dormiu pouco à noite e acordou algumas vezes.' : i === 3 ? 'Dia bem tranquilo, comeu super bem e brincou bastante com a irmã.' : ''
    registros.push({
      id: uid(), childId: 'ana', date: dayKey(d),
      sono: sonos[i % 3], alim: alims[i % 3], humor: humores[i % 5],
      crises: i % 6 === 0 ? '1' : 'Nenhuma',
      obs: isYesterday ? 'Dia tranquilo, brincou bastante no parque. Só ficou um pouco agitada na hora de dormir.' : obsExtra,
      replies: isYesterday ? [{ id: uid(), authorType: 'terapeuta', authorId: 'm', authorName: 'Marina', color: '#3b8fd4', ts: now - 22 * H, text: 'Que ótimo! O parque ajuda muito na regulação dela. Obrigada por avisar.' }] : [],
      readByTeam: !naoLido,
    })
  }

  const prontuario: ProntuarioEntry[] = [
    {
      id: uid(), childId: 'ana', professionalId: 'm', ts: now - 2 * H,
      tags: ['Contato visual', 'Interação social', 'Atenção compartilhada'],
      evolucao: 'Paciente sustentou contato visual por períodos progressivamente mais longos, respondendo a comando simples com apoio verbal leve. Boa tolerância ao ambiente e iniciativa de interação com a terapeuta.',
      orientacao: 'A Ana manteve contato visual por muito mais tempo hoje, e buscou interagir comigo por conta própria. Em casa, tentem os joguinhos de olhar por uns 5 minutinhos, e sempre que ela buscar vocês, respondam com atenção total.',
      replies: [], readByFamily: false,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'm', ts: now - 7 * D,
      tags: ['Autorregulação', 'Comportamento'],
      evolucao: 'Trabalhada antecipação de transições com apoio visual. Reduziu tempo de desorganização diante de mudança de atividade.',
      orientacao: 'A Ana lidou melhor com as trocas de atividade hoje. Em casa, avisem com antecedência quando algo vai mudar (ex.: "daqui a 5 minutos vamos jantar").',
      replies: [], readByFamily: true,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'c', ts: now - 2 * D,
      tags: ['Vocabulário', 'Sons novos', 'Trocas comunicativas'],
      evolucao: 'Emissão de dois vocábulos novos ("água" e "mais") mediante pistas visuais e verbais. Ampliar repertório em contexto funcional.',
      orientacao: 'A Ana falou 2 palavras novas na sessão! Tentem repetir "água" e "mais" nas rotinas de casa, principalmente na hora do lanche.',
      replies: [{ id: uid(), authorType: 'familia', authorId: 'voce', authorName: 'Você', color: TEAL, ts: now - 1.8 * D, text: 'Que notícia boa, Carla! Vamos praticar bastante. Obrigada!' }],
      readByFamily: true,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'c', ts: now - 9 * D,
      tags: ['Compreensão', 'Fala funcional'],
      evolucao: 'Melhora na compreensão de ordens simples de dois passos com apoio gestual.',
      orientacao: 'A Ana está entendendo melhor pedidos de dois passos (ex.: "pega o copo e traz aqui"). Podem treinar isso em casa nas rotinas.',
      replies: [], readByFamily: true,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'j', ts: now - 4 * D,
      tags: ['Coordenação motora fina', 'Integração sensorial'],
      evolucao: 'Atividades de pinça e encaixe com boa tolerância. Melhor organização diante de estímulos táteis.',
      orientacao: 'A Ana foi super bem nas atividades de coordenação com as mãos. Em casa, massinha e encaixar peças grandes ajudam bastante.',
      replies: [], readByFamily: false,
    },
    {
      id: uid(), childId: 'ana', professionalId: 'r', ts: now - 5 * D,
      tags: ['Atenção', 'Organização'],
      evolucao: 'Manteve atenção em tarefa dirigida por períodos mais longos com apoio de rotina visual.',
      orientacao: 'A Ana conseguiu se concentrar por mais tempo hoje. Uma rotina visual em casa (com desenhos das etapas do dia) ajuda muito.',
      replies: [], readByFamily: false,
    },
  ]

  // sessões da Ana (a 1ª entra no lembrete lá embaixo). As dos demais pacientes
  // são geradas no bloco de roster mais abaixo.
  const sessions: Session[] = [
    { id: uid(), childId: 'ana', professionalId: 'm', when: 'Hoje, 16h', ts: now + 5 * H, sala: 'Sala 1' },
    { id: uid(), childId: 'ana', professionalId: 'c', when: 'Amanhã, 10h', ts: now + 1 * D + 2 * H, sala: 'Sala 2' },
    { id: uid(), childId: 'ana', professionalId: 'j', when: '16h', ts: now + 2 * D + 1 * H, sala: 'Sala 1' },
  ]

  const discussions: TeamNote[] = [
    { id: uid(), childId: 'ana', professionalId: 'j', ts: now - 27 * H, sharedToFamily: false, text: 'Pessoal, tenho reparado que a Ana chega bem desregulada nas terças. Quando começo a sessão com um bloco proprioceptivo (pular, empurrar peso), o resto rende MUITO mais. Vale a gente alinhar isso entre as terapias.' },
    { id: uid(), childId: 'ana', professionalId: 'm', ts: now - 26 * H, sharedToFamily: false, text: 'Faz total sentido, João. Na psicologia também vejo que depois de movimento ela sustenta atenção por bem mais tempo. Topo a gente padronizar: sempre começar com regulação corporal antes de tarefa dirigida.' },
    { id: uid(), childId: 'ana', professionalId: 'c', ts: now - 25 * H, sharedToFamily: false, text: 'Mesma coisa na fono. Vou passar a fazer uns 5 min de atividade motora antes e registro se muda a emissão dos vocábulos novos. Semana que vem trago os dados.' },
    { id: uid(), childId: 'ana', professionalId: 'j', ts: now - 3 * H, sharedToFamily: false, text: 'Combinado então: todo mundo começa com regulação corporal. Acho que vale orientar a mãe a fazer um pouco disso em casa antes das atividades também. Alguém topa escrever o recado pra família?' },
  ]

  // datas recentes (para simular a família marcando as tarefas nos últimos dias)
  const recentDays = (n: number): string[] => {
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      out.push(dayKey(d))
    }
    return out
  }

  const homework: Homework[] = [
    { id: uid(), childId: 'ana', professionalId: 'm', ts: now - 2 * H, title: 'Joguinhos de contato visual', detail: 'Uns 5 minutos por dia: chame a Ana pelo nome e espere ela olhar antes de entregar algo que ela gosta. Comemore quando ela buscar seu olhar.', frequency: 'Diário', doneDates: recentDays(3), active: true },
    { id: uid(), childId: 'ana', professionalId: 'c', ts: now - 2 * D, title: 'Repetir "água" e "mais" nas refeições', detail: 'Nas horas de comer e beber, incentive a Ana a pedir dizendo "água" e "mais". Vale repetir junto com ela e comemorar a tentativa.', frequency: 'Diário', doneDates: recentDays(2), active: true },
    { id: uid(), childId: 'ana', professionalId: 'j', ts: now - 4 * D, title: 'Massinha e encaixe de peças grandes', detail: 'Atividades de apertar massinha e encaixar peças grandes ajudam a coordenação das mãos. Uns 10 minutos, do jeito que for divertido pra ela.', frequency: '3x na semana', doneDates: [], active: true },
    { id: uid(), childId: 'ana', professionalId: 'r', ts: now - 5 * D, title: 'Rotina visual com desenhos do dia', detail: 'Monte com a Ana um quadrinho com desenhos das etapas do dia (acordar, escola, almoço, banho, dormir). Aponte cada etapa junto com ela.', frequency: 'Diário', doneDates: recentDays(5), active: true },
  ]

  const documentos: Documento[] = [
    { id: uid(), childId: 'ana', ts: now - 40 * D, name: 'Laudo diagnóstico (TEA nível 1)', category: 'Laudo', note: 'Emitido pela neuropediatra Dra. Helena Prado. CID F84.0.', addedBy: 'Você' },
    { id: uid(), childId: 'ana', ts: now - 12 * D, name: 'Receita - Risperidona', category: 'Receita', note: 'Uso contínuo. Renovar a cada 3 meses.', addedBy: 'Você' },
    { id: uid(), childId: 'ana', ts: now - 8 * D, name: 'Relatório de evolução trimestral', category: 'Relatório', note: 'Consolidado das terapias na Clínica Semear.', addedBy: 'Você' },
    { id: uid(), childId: 'ana', ts: now - 30 * D, name: 'Carteirinha do plano de saúde', category: 'Carteirinha', note: 'Amil - validade 2027.', addedBy: 'Você' },
    { id: uid(), childId: 'ana', ts: now - 20 * D, name: 'Relatório escolar - 1º semestre', category: 'Escola', note: 'Escola Recanto. Observações da professora de apoio.', addedBy: 'Você' },
    { id: uid(), childId: 'ana', ts: now - 55 * D, name: 'Audiometria', category: 'Exame', note: 'Resultado dentro da normalidade.', addedBy: 'Você' },
  ]

  const eventos: Evento[] = [
    { id: uid(), childId: 'ana', ts: now + 2 * D, timeLabel: '8h30', title: 'Reunião na escola', category: 'Escola', location: 'Escola Recanto' },
    { id: uid(), childId: 'ana', ts: now + 5 * D, timeLabel: '14h', title: 'Consulta com neuropediatra', category: 'Consulta', location: 'Dra. Helena Prado' },
    { id: uid(), childId: 'ana', ts: now + 9 * D, timeLabel: '7h30', title: 'Exame de sangue', category: 'Exame', location: 'Laboratório Vida' },
  ]

  // lembrete já ligado na consulta médica e na próxima sessão de terapia.
  const reminders: string[] = [eventos[1].id, sessions[0].id]

  /* ---------- roster: ~119 pacientes gerados, completos p/ terapeuta e clínica ---------- */
  const rpick = (a: any[]): any => a[Math.floor(Math.random() * a.length)]
  const rint = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1))
  const chance = (p: number): boolean => Math.random() < p
  const shuffle = (a: any[]): any[] => a.map((x) => [Math.random(), x] as [number, any]).sort((u, v) => u[0] - v[0]).map((z) => z[1])

  // gera uma série de medições subindo (evolução) de startLow até endHigh, com ruído
  const makeSeries = (start: number, end: number, points: number, weeksBack: number): { ts: number; value: number }[] => {
    const out: { ts: number; value: number }[] = []
    let cur = start
    for (let i = 0; i < points; i++) {
      const frac = points > 1 ? i / (points - 1) : 1
      cur = Math.max(cur, Math.min(4, Math.round(start + (end - start) * frac)))
      const daysAgo = Math.round(weeksBack * 7 * (1 - frac))
      const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(15, 0, 0, 0)
      out.push({ ts: d.getTime(), value: cur })
    }
    return out
  }

  const metas: Meta[] = [
    { id: uid(), childId: 'ana', professionalId: 'm', title: 'Contato visual', createdTs: now - 60 * D, measures: makeSeries(0, 3, 6, 8), nota: 'Já busca o olhar sozinha em brincadeiras curtas.', active: true },
    { id: uid(), childId: 'ana', professionalId: 'm', title: 'Interação social', createdTs: now - 55 * D, measures: makeSeries(0, 2, 6, 8), nota: 'Procura os colegas pra brincar, ainda com um empurrãozinho.', active: true },
    { id: uid(), childId: 'ana', professionalId: 'c', title: 'Vocabulário funcional', createdTs: now - 50 * D, measures: makeSeries(0, 3, 5, 7), nota: 'Usa palavras novas pra pedir o que quer.', active: true },
    { id: uid(), childId: 'ana', professionalId: 'j', title: 'Coordenação motora fina', createdTs: now - 45 * D, measures: makeSeries(1, 3, 5, 6), nota: 'Segura o lápis com mais firmeza nas atividades.', active: true },
    { id: uid(), childId: 'ana', professionalId: 'r', title: 'Atenção sustentada', createdTs: now - 40 * D, measures: makeSeries(1, 2, 5, 6), nota: 'Mantém o foco por mais tempo antes de dispersar.', active: true },
  ]

  // Conquistas: momentos concretos que a família vê como evolução (no lugar do gráfico).
  const conquistas: Conquista[] = [
    { id: uid(), childId: 'ana', professionalId: 'm', ts: now - 2 * D, text: 'Fez contato visual espontâneo durante a brincadeira, sem a gente pedir.' },
    { id: uid(), childId: 'ana', professionalId: 'c', ts: now - 6 * D, text: 'Pediu água apontando para o copo e olhando pra terapeuta.' },
    { id: uid(), childId: 'ana', professionalId: 'r', ts: now - 12 * D, text: 'Esperou a vez em uma atividade em grupo sem se frustrar.' },
    { id: uid(), childId: 'ana', professionalId: 'j', ts: now - 20 * D, text: 'Sentou para a atividade e se manteve concentrada por cinco minutos.' },
  ]
  const CONQ_POOL: ((n: string) => string)[] = [
    (n) => `${n} pediu ajuda com palavras em vez de chorar.`,
    (n) => `${n} esperou a vez numa brincadeira em grupo.`,
    (n) => `${n} manteve o foco na atividade até o fim.`,
    (n) => `${n} apontou pra pedir o que queria.`,
    (n) => `${n} topou experimentar uma textura nova sem recusar.`,
  ]

  const byDisc: Record<string, string[]> = {
    Psicologia: ['m', 'h'],
    Fonoaudiologia: ['c', 'd'],
    'Terapia Ocupacional': ['j', 'p'],
    Psicopedagogia: ['r', 't'],
    Musicoterapia: ['b', 'la'],
    Fisioterapia: ['ca', 'ra'],
  }
  const discNames = Object.keys(byDisc)
  let marinaCount = 0
  let bCur = 0, gCur = 0

  // alocação de sessões SEM colisão (clínica bem organizada). Guarda os slots já
  // ocupados por terapeuta e por sala; depois plantamos poucos conflitos de propósito.
  const SALAS = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5']
  const usedProSlot = new Set<string>()
  const usedRoomSlot = new Set<string>()
  sessions.forEach((se) => {
    const d = new Date(se.ts); const key = `${dayKey(d)}_${d.getHours()}`
    usedProSlot.add(`${se.professionalId}_${key}`)
    if (se.sala) usedRoomSlot.add(`${key}_${se.sala}`)
  })

  for (let k = 0; k < 119; k++) {
    const nome = FIRST_NAMES[k % FIRST_NAMES.length]
    const idc = `p${k}`
    const photo = FEMALE_NAMES.has(nome) ? GIRL_PHOTOS[gCur++ % GIRL_PHOTOS.length] : BOY_PHOTOS[bCur++ % BOY_PHOTOS.length]
    // equipe: 2 a 4 disciplinas distintas, 1 terapeuta por disciplina
    const chosen = shuffle(discNames).slice(0, rint(2, 4))
    const teamIds: string[] = chosen.map((disc: string) => {
      if (disc === 'Psicologia') {
        if (marinaCount < 15) { marinaCount++; return 'm' }
        return 'h'
      }
      return rpick(byDisc[disc])
    })
    children.push({ id: idc, name: nome, initial: nome[0].toUpperCase(), age: rint(3, 12), diagnosis: rpick(DIAGNOSES), notes: rpick(CHILD_NOTES), teamIds, photo })

    // prontuário: 2 a 4 sessões por terapeuta do time
    teamIds.forEach((tid) => {
      const p = professionals.find((pr) => pr.id === tid)!
      const tags = TAGS_BY_DISCIPLINE[p.discipline] ?? ['Sessão']
      for (let s = 0; s < rint(2, 4); s++) {
        const t1 = rpick(tags), t2 = rpick(tags)
        prontuario.push({
          id: uid(), childId: idc, professionalId: tid, ts: now - rint(1, 60) * D - rint(0, 8) * H,
          tags: t1 === t2 ? [t1] : [t1, t2],
          evolucao: rpick(EVOL_TPL)(nome, t1, t2),
          orientacao: rpick(ORI_TPL)(nome, t1),
          replies: [], readByFamily: chance(0.6),
        })
      }
    })

    // dia a dia da família: 5 a 10 registros recentes
    for (let rr = 0; rr < rint(5, 10); rr++) {
      const dd = new Date(); dd.setDate(dd.getDate() - (rr + 1))
      registros.push({
        id: uid(), childId: idc, date: dayKey(dd),
        sono: rpick(sonos), alim: rpick(alims), humor: rpick(humores),
        crises: chance(0.2) ? '1' : 'Nenhuma', obs: rpick(OBS_POOL), replies: [], readByTeam: chance(0.7),
      })
    }

    // discussão da equipe (quando 2+ terapeutas)
    if (teamIds.length >= 2 && chance(0.85)) {
      discussions.push({ id: uid(), childId: idc, professionalId: rpick(teamIds), ts: now - rint(2, 20) * D, text: rpick(DISC_OPEN)(nome), sharedToFamily: false })
      for (let rp = 0; rp < rint(1, 2); rp++) {
        discussions.push({ id: uid(), childId: idc, professionalId: rpick(teamIds), ts: now - rint(1, 19) * D, text: rpick(DISC_REPLY)(), sharedToFamily: false })
      }
    }

    // tarefas de casa: 1 a 3
    for (let hh = 0; hh < rint(1, 3); hh++) {
      const tid = rpick(teamIds)
      const p = professionals.find((pr) => pr.id === tid)!
      const tag = rpick(TAGS_BY_DISCIPLINE[p.discipline] ?? ['Atividade'])
      homework.push({ id: uid(), childId: idc, professionalId: tid, ts: now - rint(1, 20) * D, title: tag, detail: HW_DETAIL(nome, tag), frequency: rpick(['Diário', '3x na semana', '2x na semana']), doneDates: [], active: true })
    }

    // metas: 1 objetivo por terapeuta do time, com nível atual e frase
    teamIds.forEach((tid) => {
      const p = professionals.find((pr) => pr.id === tid)!
      const tag = rpick(TAGS_BY_DISCIPLINE[p.discipline] ?? ['Objetivo'])
      const start = rint(0, 1)
      const end = Math.min(4, start + rint(2, 3))
      metas.push({ id: uid(), childId: idc, professionalId: tid, title: tag, createdTs: now - rint(40, 70) * D, measures: makeSeries(start, end, rint(4, 6), rint(6, 9)), active: true })
    })

    // conquista recente pra boa parte dos pacientes (a linha do tempo da evolução)
    if (chance(0.7)) {
      const tid = rpick(teamIds)
      conquistas.push({ id: uid(), childId: idc, professionalId: tid, ts: now - rint(1, 30) * D, text: rpick(CONQ_POOL)(nome) })
    }

    // sessões futuras: 1 a 2 nos próximos 5 dias, alocadas em slot/sala livres
    for (let uu = 0; uu < rint(1, 2); uu++) {
      const proId = rpick(teamIds)
      for (let att = 0; att < 14; att++) {
        const day = rint(0, 5), hour = rint(8, 18)
        const ts = now + day * D + hour * H
        const d = new Date(ts); const key = `${dayKey(d)}_${d.getHours()}`
        const sala = rpick(SALAS)
        if (usedProSlot.has(`${proId}_${key}`) || usedRoomSlot.has(`${key}_${sala}`)) continue
        usedProSlot.add(`${proId}_${key}`); usedRoomSlot.add(`${key}_${sala}`)
        sessions.push({ id: uid(), childId: idc, professionalId: proId, when: `${hour}h`, ts, sala })
        break
      }
    }
  }

  // conflitos propositais pra demonstrar a detecção: mesma sala/mesmo horário da
  // 1ª sessão da Ana (hoje). Um é conflito de SALA, outro de TERAPEUTA (Marina 2x).
  sessions.push({ id: uid(), childId: 'p3', professionalId: 'h', when: 'Hoje', ts: sessions[0].ts, sala: sessions[0].sala })
  sessions.push({ id: uid(), childId: 'p7', professionalId: 'm', when: 'Hoje', ts: sessions[0].ts, sala: 'Sala 4' })

  // mensalidades do mês atual (financeiro leve): valor pelo tamanho da equipe.
  const mesAtual = dayKey(new Date()).slice(0, 7)
  const pagamentos: Pagamento[] = children.map((c) => ({
    id: uid(), childId: c.id, mes: mesAtual,
    valor: c.teamIds.length * rpick([400, 450, 500, 550]),
    status: c.id === 'ana' ? 'pago' : (chance(0.76) ? 'pago' : 'pendente'),
  }))

  // gastos do mês (exemplos realistas). Lucro = recebido - gastos.
  const gastos: Gasto[] = [
    { id: uid(), mes: mesAtual, categoria: 'Equipe', descricao: 'Repasse dos terapeutas', valor: 68000 },
    { id: uid(), mes: mesAtual, categoria: 'Aluguel', descricao: 'Aluguel da clínica', valor: 12000 },
    { id: uid(), mes: mesAtual, categoria: 'Materiais', descricao: 'Materiais terapêuticos', valor: 3500 },
    { id: uid(), mes: mesAtual, categoria: 'Contas', descricao: 'Água, luz e internet', valor: 2800 },
  ]

  return { children, professionals, registros, prontuario, sessions, discussions, homework, documentos, eventos, metas, conquistas, pagamentos, gastos, reminders }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as State
      if (parsed && parsed.children && parsed.prontuario && parsed.registros) {
        // Migração leve: estados salvos antes de novos campos não os têm.
        // Preenche com o seed pra não quebrar e já mostrar o exemplo.
        if (!parsed.discussions) parsed.discussions = seed().discussions
        if (!parsed.homework) parsed.homework = seed().homework
        if (!parsed.documentos) parsed.documentos = seed().documentos
        if (!parsed.eventos) parsed.eventos = seed().eventos
        if (!parsed.metas) parsed.metas = seed().metas
        if (!parsed.conquistas) parsed.conquistas = seed().conquistas
        if (!parsed.pagamentos) parsed.pagamentos = seed().pagamentos
        if (!parsed.gastos) parsed.gastos = seed().gastos
        if (!parsed.reminders) parsed.reminders = seed().reminders
        return parsed
      }
    }
  } catch {
    // ignora e reseeda
  }
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // sem localStorage: segue em memória
  }
  return s
}

/* ---------- contexto ---------- */

export interface Author {
  type: 'familia' | 'terapeuta'
  id: string
  name: string
  role: string
  color: string
}

export type PostKind = 'diario' | 'sessao'

interface StoreCtx {
  state: State
  addRegistro: (childId: string, data: { sono?: string; alim?: string; humor?: string; crises?: string; obs?: string }) => void
  addProntuario: (childId: string, professionalId: string, data: { tags: string[]; evolucao: string; orientacao: string }) => void
  addReply: (kind: PostKind, id: string, author: Author, text: string) => void
  markRead: (kind: PostKind, id: string) => void
  addTeamNote: (childId: string, professionalId: string, text: string) => void
  shareTeamNoteToFamily: (noteId: string, orientacao: string) => void
  addHomework: (childId: string, professionalId: string, data: { title: string; detail: string; frequency: string }) => void
  toggleHomeworkToday: (id: string) => void
  addDocumento: (childId: string, data: { name: string; category: string; note: string }) => void
  addEvento: (childId: string, data: { ts: number; timeLabel: string; title: string; category: string; location: string }) => void
  toggleReminder: (id: string) => void
  addMetaMeasure: (metaId: string, value: number) => void
  setMetaNota: (metaId: string, nota: string) => void
  addMeta: (childId: string, professionalId: string, title: string) => void
  addConquista: (childId: string, professionalId: string, text: string) => void
  togglePagamento: (id: string) => void
  addGasto: (data: { categoria: string; descricao: string; valor: number }) => void
  updateChild: (childId: string, patch: Partial<Child>) => void
  resetAll: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => load())

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // ignora
    }
  }, [state])

  function addRegistro(childId: string, data: { sono?: string; alim?: string; humor?: string; crises?: string; obs?: string }) {
    const today = dayKey(new Date())
    setState((s) => {
      const rest = s.registros.filter((r) => !(r.childId === childId && r.date === today))
      const novo: Registro = { id: uid(), childId, date: today, ...data, replies: [], readByTeam: false }
      return { ...s, registros: [novo, ...rest] }
    })
  }

  function addProntuario(childId: string, professionalId: string, data: { tags: string[]; evolucao: string; orientacao: string }) {
    setState((s) => {
      const entry: ProntuarioEntry = { id: uid(), childId, professionalId, ts: Date.now(), ...data, replies: [], readByFamily: false }
      return { ...s, prontuario: [entry, ...s.prontuario] }
    })
  }

  function addReply(kind: PostKind, id: string, author: Author, text: string) {
    const reply: Reply = { id: uid(), authorType: author.type, authorId: author.id, authorName: author.name, color: author.color, ts: Date.now(), text }
    setState((s) => {
      if (kind === 'sessao') return { ...s, prontuario: s.prontuario.map((e) => (e.id === id ? { ...e, replies: [...e.replies, reply] } : e)) }
      return { ...s, registros: s.registros.map((r) => (r.id === id ? { ...r, replies: [...r.replies, reply] } : r)) }
    })
  }

  function markRead(kind: PostKind, id: string) {
    setState((s) => {
      if (kind === 'sessao') return { ...s, prontuario: s.prontuario.map((e) => (e.id === id ? { ...e, readByFamily: true } : e)) }
      return { ...s, registros: s.registros.map((r) => (r.id === id ? { ...r, readByTeam: true } : r)) }
    })
  }

  function addTeamNote(childId: string, professionalId: string, text: string) {
    setState((s) => {
      const note: TeamNote = { id: uid(), childId, professionalId, ts: Date.now(), text, sharedToFamily: false }
      return { ...s, discussions: [...s.discussions, note] }
    })
  }

  // Promove uma mensagem da discussão a recado à família: cria um ProntuarioEntry
  // (reaproveita todo o encanamento que a família já enxerga em "Sessões"). O
  // debate interno vira `evolucao` (só equipe), e o texto que a família lê é a
  // `orientacao` escrita agora, em linguagem clara.
  function shareTeamNoteToFamily(noteId: string, orientacao: string) {
    setState((s) => {
      const note = s.discussions.find((n) => n.id === noteId)
      if (!note) return s
      const entry: ProntuarioEntry = {
        id: uid(), childId: note.childId, professionalId: note.professionalId, ts: Date.now(),
        tags: ['Alinhamento da equipe'], evolucao: note.text, orientacao, replies: [], readByFamily: false,
      }
      return {
        ...s,
        discussions: s.discussions.map((n) => (n.id === noteId ? { ...n, sharedToFamily: true } : n)),
        prontuario: [entry, ...s.prontuario],
      }
    })
  }

  function addHomework(childId: string, professionalId: string, data: { title: string; detail: string; frequency: string }) {
    setState((s) => {
      const hw: Homework = { id: uid(), childId, professionalId, ts: Date.now(), ...data, doneDates: [], active: true }
      return { ...s, homework: [hw, ...s.homework] }
    })
  }

  function toggleHomeworkToday(id: string) {
    const today = dayKey(new Date())
    setState((s) => ({
      ...s,
      homework: s.homework.map((h) => {
        if (h.id !== id) return h
        const has = h.doneDates.includes(today)
        return { ...h, doneDates: has ? h.doneDates.filter((d) => d !== today) : [...h.doneDates, today] }
      }),
    }))
  }

  function addDocumento(childId: string, data: { name: string; category: string; note: string }) {
    setState((s) => {
      const doc: Documento = { id: uid(), childId, ts: Date.now(), ...data, addedBy: 'Você' }
      return { ...s, documentos: [doc, ...s.documentos] }
    })
  }

  function addEvento(childId: string, data: { ts: number; timeLabel: string; title: string; category: string; location: string }) {
    setState((s) => {
      const ev: Evento = { id: uid(), childId, ...data }
      return { ...s, eventos: [...s.eventos, ev] }
    })
  }

  function toggleReminder(id: string) {
    setState((s) => ({
      ...s,
      reminders: s.reminders.includes(id) ? s.reminders.filter((r) => r !== id) : [...s.reminders, id],
    }))
  }

  function addMetaMeasure(metaId: string, value: number) {
    setState((s) => ({ ...s, metas: s.metas.map((m) => (m.id === metaId ? { ...m, measures: [...m.measures, { ts: Date.now(), value }] } : m)) }))
  }

  function setMetaNota(metaId: string, nota: string) {
    setState((s) => ({ ...s, metas: s.metas.map((m) => (m.id === metaId ? { ...m, nota } : m)) }))
  }

  function addMeta(childId: string, professionalId: string, title: string) {
    setState((s) => ({ ...s, metas: [...s.metas, { id: uid(), childId, professionalId, title, createdTs: Date.now(), measures: [{ ts: Date.now(), value: 0 }], active: true }] }))
  }

  function addConquista(childId: string, professionalId: string, text: string) {
    setState((s) => ({ ...s, conquistas: [{ id: uid(), childId, professionalId, ts: Date.now(), text }, ...s.conquistas] }))
  }

  function togglePagamento(id: string) {
    setState((s) => ({ ...s, pagamentos: s.pagamentos.map((p) => (p.id === id ? { ...p, status: p.status === 'pago' ? 'pendente' : 'pago' } : p)) }))
  }

  function addGasto(data: { categoria: string; descricao: string; valor: number }) {
    setState((s) => ({ ...s, gastos: [{ id: uid(), mes: mesAtualKey(), ...data }, ...s.gastos] }))
  }

  function updateChild(childId: string, patch: Partial<Child>) {
    setState((s) => ({ ...s, children: s.children.map((c) => (c.id === childId ? { ...c, ...patch } : c)) }))
  }

  function resetAll() {
    setState(seed())
  }

  return (
    <Ctx.Provider value={{ state, addRegistro, addProntuario, addReply, markRead, addTeamNote, shareTeamNoteToFamily, addHomework, toggleHomeworkToday, addDocumento, addEvento, toggleReminder, addMetaMeasure, setMetaNota, addMeta, addConquista, togglePagamento, addGasto, updateChild, resetAll }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore(): StoreCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore precisa do StoreProvider')
  return c
}

/* ---------- seletores ---------- */

export function childById(s: State, id: string): Child | undefined {
  return s.children.find((c) => c.id === id)
}

export function proById(s: State, id: string): Professional | undefined {
  return s.professionals.find((p) => p.id === id)
}

export function teamOf(s: State, child: Child): Professional[] {
  return child.teamIds.map((id) => proById(s, id)).filter((p): p is Professional => !!p)
}

export function registrosOf(s: State, childId: string): Registro[] {
  return s.registros.filter((r) => r.childId === childId).slice().sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function prontuarioOf(s: State, childId: string): ProntuarioEntry[] {
  return s.prontuario.filter((e) => e.childId === childId).slice().sort((a, b) => b.ts - a.ts)
}

export function prontuarioByPro(s: State, childId: string, professionalId: string): ProntuarioEntry[] {
  return prontuarioOf(s, childId).filter((e) => e.professionalId === professionalId)
}

export function sessionById(s: State, id: string): ProntuarioEntry | undefined {
  return s.prontuario.find((e) => e.id === id)
}

export function sessionsOf(s: State, childId: string): Session[] {
  return s.sessions.filter((e) => e.childId === childId).slice().sort((a, b) => a.ts - b.ts)
}

// Discussão da equipe sobre um paciente, em ordem cronológica (mais antiga em cima,
// como uma conversa que se lê de cima pra baixo).
export function discussionOf(s: State, childId: string): TeamNote[] {
  return s.discussions.filter((n) => n.childId === childId).slice().sort((a, b) => a.ts - b.ts)
}

/* ---------- tarefas de casa ---------- */

export function homeworkOf(s: State, childId: string): Homework[] {
  return s.homework.filter((h) => h.childId === childId && h.active).slice().sort((a, b) => b.ts - a.ts)
}

export function homeworkByPro(s: State, childId: string, professionalId: string): Homework[] {
  return homeworkOf(s, childId).filter((h) => h.professionalId === professionalId)
}

export function isHomeworkDoneToday(h: Homework): boolean {
  return h.doneDates.includes(dayKey(new Date()))
}

// dias marcados na semana atual (segunda a hoje), para o terapeuta ver adesão.
export function homeworkWeekCount(h: Homework): number {
  const today = new Date()
  const dow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - dow)
  const week = new Set<string>()
  for (let i = 0; i <= dow; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    week.add(dayKey(d))
  }
  return h.doneDates.filter((d) => week.has(d)).length
}

// progresso de hoje: quantas tarefas ativas já foram marcadas.
export function paraCasaToday(s: State, childId: string): { done: number; total: number } {
  const list = homeworkOf(s, childId)
  return { done: list.filter(isHomeworkDoneToday).length, total: list.length }
}

/* ---------- cofre de documentos ---------- */

export function documentosOf(s: State, childId: string): Documento[] {
  return s.documentos.filter((d) => d.childId === childId).slice().sort((a, b) => b.ts - a.ts)
}

/* ---------- metas + evolução ---------- */

export function metasOf(s: State, childId: string): Meta[] {
  return s.metas.filter((m) => m.childId === childId && m.active).slice().sort((a, b) => a.createdTs - b.createdTs)
}

export function metasByPro(s: State, childId: string, professionalId: string): Meta[] {
  return metasOf(s, childId).filter((m) => m.professionalId === professionalId)
}

export function conquistasOf(s: State, childId: string): Conquista[] {
  return s.conquistas.filter((c) => c.childId === childId).slice().sort((a, b) => b.ts - a.ts)
}

export function metaLatest(m: Meta): number {
  return m.measures.length ? m.measures[m.measures.length - 1].value : 0
}

export function metaDelta(m: Meta): number {
  if (m.measures.length < 2) return 0
  return metaLatest(m) - m.measures[0].value
}

// Níveis de domínio/independência (a "escada"). O terapeuta marca em que nível a
// criança está. Substitui o % (que fingia uma precisão que não existe). Critério
// final a validar com a clínica parceira.
export const META_NIVEIS = ['Com apoio total', 'Com apoio parcial', 'Com pouca ajuda', 'Sem ajuda', 'Em qualquer lugar']

export function nivelLabel(v: number): string {
  return META_NIVEIS[Math.max(0, Math.min(META_NIVEIS.length - 1, Math.round(v)))] ?? '—'
}

/* ---------- financeiro leve (mensalidades) ---------- */

export function mesAtualKey(): string {
  return dayKey(new Date()).slice(0, 7)
}

export function pagamentosDoMes(s: State, mes?: string): Pagamento[] {
  const m = mes ?? mesAtualKey()
  return s.pagamentos.filter((p) => p.mes === m)
}

export const GASTO_CATEGORIES = ['Equipe', 'Aluguel', 'Materiais', 'Contas', 'Impostos', 'Outros']

export function gastosDoMes(s: State, mes?: string): Gasto[] {
  const m = mes ?? mesAtualKey()
  return s.gastos.filter((g) => g.mes === m)
}

export function financeiroResumo(s: State, mes?: string): { total: number; recebido: number; pendente: number; nPagos: number; nTotal: number; gastos: number; lucro: number } {
  const list = pagamentosDoMes(s, mes)
  const total = list.reduce((a, p) => a + p.valor, 0)
  const recebido = list.filter((p) => p.status === 'pago').reduce((a, p) => a + p.valor, 0)
  const nPagos = list.filter((p) => p.status === 'pago').length
  const gastos = gastosDoMes(s, mes).reduce((a, g) => a + g.valor, 0)
  return { total, recebido, pendente: total - recebido, nPagos, nTotal: list.length, gastos, lucro: recebido - gastos }
}

export function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR')
}

/* ---------- agenda unificada ---------- */

export interface AgendaItem {
  id: string
  ts: number
  timeLabel: string
  title: string
  subtitle: string
  category: string
  color: string
  initial: string // inicial do profissional (terapia); vazio nos eventos da família
  sala?: string
  reminder: boolean
  origin: 'clinica' | 'familia'
}

// Junta as sessões da clínica com os eventos da família num só fluxo, ordenado
// por data, a partir de hoje. Cada item sabe se tem lembrete ligado.
export function agendaOf(s: State, childId: string): AgendaItem[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const startTs = start.getTime()

  const daSessao: AgendaItem[] = s.sessions
    .filter((se) => se.childId === childId)
    .map((se) => {
      const p = proById(s, se.professionalId)
      const timeLabel = se.when.includes(',') ? se.when.split(',')[1].trim() : se.when
      return {
        id: se.id, ts: se.ts, timeLabel,
        title: `Sessão de ${p?.discipline ?? 'terapia'}`,
        subtitle: p ? `${p.name} · ${p.role}` : '',
        category: 'Terapia', color: p?.color ?? '#938aa8', initial: p?.initial ?? '',
        sala: se.sala,
        reminder: s.reminders.includes(se.id), origin: 'clinica' as const,
      }
    })

  const daFamilia: AgendaItem[] = s.eventos
    .filter((e) => e.childId === childId)
    .map((e) => ({
      id: e.id, ts: e.ts, timeLabel: e.timeLabel,
      title: e.title, subtitle: e.location,
      category: e.category, color: eventColor(e.category), initial: '',
      reminder: s.reminders.includes(e.id), origin: 'familia' as const,
    }))

  return [...daSessao, ...daFamilia].filter((i) => i.ts >= startTs).sort((a, b) => a.ts - b.ts)
}

/* ---------- agenda da clínica: por sala + detecção de conflito ---------- */

export interface ClinicAgendaItem {
  id: string
  ts: number
  timeLabel: string
  childName: string
  childInitial: string
  childPhoto?: string
  proName: string
  proInitial: string
  discipline: string
  color: string
  sala?: string
  conflict: boolean
}

// Duas sessões conflitam quando caem no MESMO dia e hora e ou dividem a mesma sala,
// ou têm o mesmo terapeuta (dupla marcação). Retorna os ids envolvidos.
export function roomConflicts(s: State): Set<string> {
  const out = new Set<string>()
  const byslot: Record<string, Session[]> = {}
  for (const se of s.sessions) {
    const d = new Date(se.ts)
    const slot = `${dayKey(d)}_${d.getHours()}`
    if (!byslot[slot]) byslot[slot] = []
    byslot[slot].push(se)
  }
  for (const slot in byslot) {
    const arr = byslot[slot]
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const sameRoom = !!arr[i].sala && arr[i].sala === arr[j].sala
        const samePro = arr[i].professionalId === arr[j].professionalId
        if (sameRoom || samePro) { out.add(arr[i].id); out.add(arr[j].id) }
      }
    }
  }
  return out
}

export function allSalas(s: State): string[] {
  const set = new Set<string>()
  s.sessions.forEach((se) => { if (se.sala) set.add(se.sala) })
  return Array.from(set).sort()
}

export function clinicAgenda(s: State, salaFilter?: string): ClinicAgendaItem[] {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const conflicts = roomConflicts(s)
  return s.sessions
    .filter((se) => se.ts >= start.getTime())
    .filter((se) => !salaFilter || se.sala === salaFilter)
    .map((se) => {
      const c = childById(s, se.childId)
      const p = proById(s, se.professionalId)
      const timeLabel = se.when.includes(',') ? se.when.split(',')[1].trim() : se.when
      return {
        id: se.id, ts: se.ts, timeLabel,
        childName: c?.name ?? '', childInitial: c?.initial ?? '?', childPhoto: c?.photo,
        proName: p?.name ?? '', proInitial: p?.initial ?? '', discipline: p?.discipline ?? '',
        color: p?.color ?? '#938aa8', sala: se.sala, conflict: conflicts.has(se.id),
      }
    })
    .sort((a, b) => a.ts - b.ts)
}

// Rótulo do dia para agrupar a agenda: Hoje / Amanhã / data por extenso.
export function agendaDayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const amanha = new Date(today)
  amanha.setDate(today.getDate() + 1)
  if (dayKey(d) === dayKey(today)) return 'Hoje'
  if (dayKey(d) === dayKey(amanha)) return 'Amanhã'
  return longDate(ts)
}

// Feed do dia a dia (só posts diários da família), para o PostCard.
export interface TimelineItem {
  kind: 'diario'
  id: string
  ts: number
  authorName: string
  authorRole: string
  color: string
  photo?: string
  tags: { sono?: string; alim?: string; humor?: string; crises?: string }
  text?: string
  replies: Reply[]
  readByTeam: boolean
}

export function diarioFeedOf(s: State, childId: string): TimelineItem[] {
  const child = childById(s, childId)
  return registrosOf(s, childId).map((r) => ({
    kind: 'diario',
    id: r.id,
    ts: new Date(r.date + 'T20:00:00').getTime(),
    authorName: 'Você',
    authorRole: 'em casa',
    color: TEAL,
    photo: child?.photo,
    tags: { sono: r.sono, alim: r.alim, humor: r.humor, crises: r.crises },
    text: r.obs && r.obs.trim().length > 0 ? r.obs : undefined,
    replies: r.replies,
    readByTeam: r.readByTeam,
  }))
}

export function streakOf(s: State, childId: string): number {
  const dates = new Set(s.registros.filter((r) => r.childId === childId).map((r) => r.date))
  let streak = 0
  const d = new Date()
  if (!dates.has(dayKey(d))) d.setDate(d.getDate() - 1)
  while (dates.has(dayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export interface WeekDay {
  label: string
  done: boolean
  today: boolean
  future: boolean
}

export function weekOf(s: State, childId: string): WeekDay[] {
  const dates = new Set(s.registros.filter((r) => r.childId === childId).map((r) => r.date))
  const initials = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const today = new Date()
  const dow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - dow)
  const out: WeekDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = dayKey(d)
    out.push({ label: initials[i], done: dates.has(key), today: key === dayKey(today), future: d > today && key !== dayKey(today) })
  }
  return out
}

export function lastUpdateOf(s: State, childId: string): { name: string; rel: string } | null {
  const pron = prontuarioOf(s, childId)[0]
  const reg = registrosOf(s, childId)[0]
  const cands: { name: string; ts: number }[] = []
  if (pron) cands.push({ name: proById(s, pron.professionalId)?.name ?? '', ts: pron.ts })
  if (reg) cands.push({ name: 'Você', ts: new Date(reg.date + 'T20:00:00').getTime() })
  if (cands.length === 0) return null
  cands.sort((a, b) => b.ts - a.ts)
  return { name: cands[0].name, rel: relTime(cands[0].ts) }
}

export interface Achievement {
  label: string
  state: 'earned' | 'next' | 'lock'
  tier: number
}

export function achievementsOf(streak: number): Achievement[] {
  const defs = [
    { t: 7, label: '1 semana' },
    { t: 10, label: '10 dias' },
    { t: 15, label: '15 dias' },
    { t: 30, label: '1 mês' },
  ]
  let nextGiven = false
  return defs.map((d, i) => {
    let st: Achievement['state']
    if (streak >= d.t) st = 'earned'
    else if (!nextGiven) {
      st = 'next'
      nextGiven = true
    } else st = 'lock'
    return { label: d.label, state: st, tier: i }
  })
}
