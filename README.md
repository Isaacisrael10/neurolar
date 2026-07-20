# montar

Protótipo do app **montar** — plataforma de comunicação e prontuário compartilhado
para crianças autistas, conectando a **família** e a **equipe multidisciplinar** (clínica).

Feito em **React + TypeScript + Vite**. Tudo salvo no navegador (localStorage);
depois o mesmo store vira Supabase sem mexer nas telas.

## Como rodar

1. Instale o Node.js (LTS) uma vez: https://nodejs.org  (`winget install OpenJS.NodeJS.LTS`)
2. Na pasta `montar-app`:
   ```bash
   npm install
   npm run dev
   ```
3. Abra `http://localhost:5173`. Para ver como celular: F12 → Ctrl+Shift+M.

## Perfis (a tela inicial deixa escolher)

- **Família** — Início (ofensiva, sessões, diário), Registrar o dia, Relatório, Perfil.
- **Terapeuta** — Pacientes, Prontuário compartilhado (vê o que a família registrou) + registrar sessão, Agenda, Conta.
- **Clínica** — Painel (pacientes, terapeutas, assinatura/mês), Pacientes, Equipe.

Tudo compartilha o **mesmo histórico**: um registro da família aparece no prontuário do
terapeuta; uma sessão do terapeuta aparece no diário da família.

### Deep links (para testar rápido)
`#familia`, `#familia/registrar`, `#familia/relatorio`, `#familia/perfil`,
`#terapeuta`, `#terapeuta/ter-paciente/ana`, `#clinica`, `#clinica/cli-equipe`.

## Estrutura

```
src/
  main.tsx              # providers (store + navegação) + React
  App.tsx              # roteamento por perfil + moldura
  store.tsx            # dados + persistência (localStorage) + ações + seletores
  nav.tsx              # perfil ativo + pilha de rotas + deep links
  montar.css           # design system (idêntico ao mockup aprovado)
  components/
    icons.tsx          # ícones SVG custom compartilhados
    BottomNav.tsx      # barra inferior reutilizável
  screens/
    Landing.tsx
    FamiliaHome.tsx  RegistrarDia.tsx  Relatorio.tsx  Perfil.tsx
    Terapeuta.tsx    Clinica.tsx
```

Para restaurar os dados de demonstração: perfil Família → "Restaurar dados de demonstração".
