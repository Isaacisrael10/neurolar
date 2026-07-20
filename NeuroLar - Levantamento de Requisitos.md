# NeuroLar, Levantamento de Requisitos

Documento de especificação do produto (fase Specify do Spec-Driven Development).
Serve como fonte de verdade para as fases seguintes (Design, Tasks, Execute).

Versão: 1.0
Data: 2026-07-15
Autor do produto: Isaac (fundador, produto e negócio)
Responsável técnico: sócio dev (backend, arquitetura e segurança)

---

## 1. Visão geral

NeuroLar é uma plataforma de comunicação e prontuário compartilhado para o acompanhamento terapêutico de crianças autistas (e neurodivergentes em geral). Ela conecta, em um mesmo histórico, a família e a equipe multidisciplinar que atende a criança.

As disciplinas envolvidas (por exemplo psicologia, fonoaudiologia, terapia ocupacional, psicopedagogia, musicoterapia, entre outras) variam de clínica para clínica. Elas não são uma lista fixa no código: cada clínica configura o próprio conjunto de disciplinas.

O produto é vendido no modelo clínica-first (B2B): a clínica contrata, e família e terapeutas usam sem custo.

O nome vem de Neuro (desenvolvimento, a raiz de "neurodivergente") mais Lar (casa, acolhimento, família).

### Diferencial central

Toda a equipe e a família acompanham a mesma criança sobre um único histórico compartilhado. Não é um app de hábitos infantil, não é chat, não é rede social. É um registro clínico e familiar contínuo, organizado e com fonte única de verdade.

### Plataformas de acesso

O NeuroLar existe em duas frentes, sobre a mesma base de dados:

- **Web:** voltada para os terapeutas e o pessoal da gestão da clínica, que costumam trabalhar no computador (registrar sessões, consultar prontuário, agenda, painel de gestão).
- **App (celular):** voltado principalmente para os pais, que usam no dia a dia para registrar e acompanhar.

Essa divisão é a de uso típico, não uma trava. Nada impede um terapeuta ou o gestor da clínica de acessar tudo pelo app no celular, nem um responsável de abrir pela web. O que muda entre os perfis é a permissão e as telas, não a plataforma.

---

## 2. Problema

Hoje a informação sobre a evolução da criança existe, mas está espalhada e desorganizada.

A comunicação acontece por caminhos frágeis e descentralizados: grupos de WhatsApp, caderno de recados, conversas soltas na recepção, memória dos pais, planilhas isoladas de cada profissional. O problema não é que os profissionais não se falem. O problema é que essa comunicação existe de forma ruim e sem centralização.

Consequências diretas:

- A família repete a mesma informação várias vezes para profissionais diferentes.
- Recados importantes (orientações de casa, mudanças de comportamento, crises) se perdem no meio das conversas.
- Não existe um histórico consolidado e confiável da evolução da criança ao longo do tempo.
- O prontuário formal, quando existe, é montado manualmente e com esforço, longe do dia a dia.
- A família tem pouca visibilidade clara do que está sendo trabalhado em cada terapia.

### O que o NeuroLar resolve

Centraliza tudo em um único lugar, com separação clara por seções (nunca um feed único e misturado), com confirmação de leitura, com linguagem adequada para cada público (clínica x família) e com montagem automática do prontuário a partir do próprio dia a dia.

---

## 3. Objetivos e metas de negócio

### Objetivos do produto

1. Ser a fonte única de verdade sobre a evolução da criança dentro da clínica.
2. Reduzir o retrabalho e a perda de informação entre família e equipe.
3. Facilitar a montagem do prontuário formal a partir dos registros do dia a dia.
4. Aumentar o engajamento da família no processo terapêutico (registro diário consistente).

### Metas de negócio

- Modelo de receita: R$30 por paciente ativo por mês, pago pela clínica. Família e terapeutas não pagam. (Valor ainda em validação.)
- Meta de tração inicial: fechar clínicas fundadoras (design partners) para validar o produto em uso real.
- Projeção de escala (com média de 100 pacientes por clínica):
  - 10 clínicas: cerca de R$360 mil por ano
  - 25 clínicas: cerca de R$900 mil por ano
  - 50 clínicas: cerca de R$1,8 milhão por ano
  - 100 clínicas: cerca de R$3,6 milhões por ano
  - (Projeção de referência, não garantia.)

### Métricas de sucesso (para acompanhar depois do lançamento)

- Percentual de famílias que registram no dia a dia de forma consistente (ofensiva ativa).
- Percentual de sessões com devolutiva registrada pelo terapeuta.
- Taxa de confirmação de leitura das orientações pela família.
- Retenção de clínicas mês a mês.

---

## 4. Perfis de usuário (personas)

O sistema tem três perfis de uso na clínica (família, terapeuta, clínica) mais um perfil interno de administração da plataforma (o fornecedor). Cada um tem seu próprio conjunto de telas e permissões.

### 4.1 Família (pais ou responsáveis)

Acompanha uma criança, registra o dia a dia em casa, lê as orientações da equipe e confirma leitura. Lado emocional e gamificado com bom gosto (ofensiva de registro diário).

Navegação: Início, Dia a dia, Da equipe, Perfil.

### 4.2 Terapeuta (profissional da clínica)

Atende vários pacientes. Registra a evolução por sessão, separando o que é clínico interno do que é orientação para a família. Consulta o histórico da criança e a agenda.

Navegação: Pacientes, Prontuário (registrar sessão), Agenda, Conta.

### 4.3 Clínica (gestão)

Administra pacientes, equipe e a visão geral. Lado sóbrio, focado em gestão.

Navegação: Painel, Pacientes, Equipe.

### 4.4 Administrador da plataforma (fornecedor)

Perfil interno de vocês, os donos do NeuroLar. Provisiona novas clínicas, gerencia as contas e a assinatura (cobrança por paciente ativo), e dá suporte. Não é um usuário da clínica; é quem opera a plataforma por trás. Por privacidade, o acesso dele ao conteúdo clínico das crianças é o mínimo necessário para operação e suporte.

---

## 5. Escopo (o que está dentro)

- Autenticação e controle de acesso por perfil (família, terapeuta, clínica).
- Registro diário da família (uma entrada consolidada por dia, com tags e texto).
- Registro de sessão do terapeuta, com dois campos separados: evolução (interno, clínico) e orientação (recado em linguagem clara para a família).
- Histórico compartilhado: registros da família aparecem para o terapeuta; devolutivas do terapeuta aparecem para a família, cada coisa em sua seção.
- Drill-down de sessões em três níveis (tipo de terapia, sessões em ordem, detalhe da sessão).
- Confirmação de leitura (ciente / visto) e respostas assíncronas contidas em cada post.
- Ofensiva (streak) de registro diário para a família.
- Tags específicas por disciplina.
- Montagem automática do prontuário formal a partir das evoluções.
- Agenda do terapeuta com controle de conflito e sala.
- Painel de gestão da clínica (pacientes e equipe).
- Metas terapêuticas por paciente, acompanhadas de forma qualitativa (pela narrativa do histórico e do prontuário, não por gráficos).
- Financeiro leve, apenas como acessório.
- Onboarding com fluxo de convite: a clínica cadastra e convida pais e terapeutas, que se vinculam por um link ou código.
- Administração da plataforma (fornecedor): provisionar clínicas, gerir assinatura e suporte.
- Notificações (push no app e email) para avisar de orientação nova, resposta e lembrete de registro.
- Anexos (foto, vídeo, arquivo) nos registros da família e nas sessões do terapeuta.
- Prontuário com validade clínica: identificação do profissional com registro do conselho, e registro que se corrige com histórico, sem apagar.
- Suporte a mais de um responsável por criança e a mais de uma criança por responsável.

---

## 6. Fora de escopo (o que NÃO vamos fazer agora)

Isso é tão importante quanto o escopo. Definir os limites evita o agente e o time perderem foco.

- Chat ao vivo (mensageria em tempo real estilo WhatsApp). A comunicação é assíncrona, por posts com confirmação de leitura e respostas contidas. Nada de chat aberto.
- Profundidade de instrumentos de ABA licenciados (VB-MAPP, ABLLS, Denver). Não vamos copiar a especialização do concorrente BlueSmiles nesse ponto.
- Faturamento fiscal e integração com convênios. O financeiro é apenas leve e acessório, não um sistema de cobrança fiscal.
- Multi-clínica por conta (marketplace). Por enquanto é uma clínica por instância; a estrutura fica preparada para evoluir depois.
- App de hábitos ou jogo infantil. A gamificação é um detalhe emocional do lado da família, não o produto.
- Gráficos e métricas numéricas de evolução da criança. O desenvolvimento acompanhado aqui é qualitativo e abstrato (linguagem, comportamento, autonomia, vínculo) e não se reduz a um gráfico. A evolução se lê na narrativa do histórico e do prontuário, não em números. Isso é uma escolha de produto, não uma limitação técnica.

---

## 7. User stories

Formato: como [perfil], quero [ação] para [objetivo].

### Família

- US-F1: Como responsável, quero registrar uma vez por dia como foi o dia da criança em casa, com tags e texto, para manter a equipe informada sem repetir a mesma coisa para cada profissional.
- US-F2: Como responsável, quero ver as orientações que a equipe deixou para casa, separadas por profissional, para saber o que trabalhar com meu filho.
- US-F3: Como responsável, quero confirmar que li uma orientação e poder responder ali mesmo, para fechar o ciclo de comunicação.
- US-F4: Como responsável, quero ver minha ofensiva de registros diários, para me manter engajado no acompanhamento.
- US-F5: Como responsável, quero ver o histórico do que já registrei, para lembrar da evolução ao longo do tempo.
- US-F6: Como responsável, quero receber um aviso quando a equipe deixar uma orientação nova ou responder algo, para não perder recado importante.
- US-F7: Como responsável, quero anexar uma foto ou vídeo ao registro do dia, para mostrar à equipe algo que é difícil de descrever em texto.
- US-F8: Como responsável, quero que os dois pais possam acompanhar a mesma criança, e acompanhar mais de um filho na mesma conta, para não depender de um único acesso.

### Terapeuta

- US-T1: Como terapeuta, quero selecionar um paciente e ver o dia a dia registrado pela família, para chegar na sessão já contextualizado.
- US-T2: Como terapeuta, quero registrar a evolução de cada sessão em dois campos separados (clínico interno e orientação para a família), para não misturar linguagem técnica com o recado dos pais.
- US-T3: Como terapeuta, quero marcar tags específicas da minha disciplina em cada sessão, para estruturar a evolução de forma consultável.
- US-T4: Como terapeuta, quero navegar pelo histórico da criança por tipo de terapia e por sessão, para acompanhar a evolução com clareza.
- US-T5: Como terapeuta, quero ver e gerenciar minha agenda, com aviso de conflito de horário e sala, para me organizar.
- US-T6: Como terapeuta, quero que minhas evoluções montem o prontuário formal automaticamente, para não ter esse trabalho manual.
- US-T7: Como terapeuta, quero anexar foto, vídeo ou documento a uma sessão, para registrar melhor uma atividade ou comportamento.
- US-T8: Como terapeuta, quero que o prontuário saia com minha identificação e meu registro de conselho, para ter validade profissional.
- US-T9: Como terapeuta, quero ser avisado quando a família registrar algo relevante, para chegar na sessão informado.

### Clínica

- US-CL1: Como clínica, quero convidar pais e terapeutas por link ou código, para que se vinculem à criança certa sem eu criar senha para cada um.

### Administrador da plataforma

- US-A1: Como administrador da plataforma, quero provisionar uma nova clínica e gerenciar sua assinatura, para colocar clientes no ar e cobrar por paciente ativo.

- US-C1: Como clínica, quero cadastrar e gerenciar pacientes, para controlar quem está em acompanhamento.
- US-C2: Como clínica, quero cadastrar e gerenciar a equipe (profissionais e disciplinas), para organizar quem atende quem.
- US-C3: Como clínica, quero uma visão geral (painel) do que está acontecendo, para acompanhar a operação.
- US-C4: Como clínica, quero relatórios de evolução e metas, para demonstrar valor para as famílias e para a gestão.

---

## 8. Requisitos funcionais

Numerados para virar tarefas depois. RF = requisito funcional.

### 8.1 Autenticação e acesso

- RF-01: O sistema deve autenticar usuários e identificar o perfil (família, terapeuta, clínica).
- RF-02: Cada perfil deve ver apenas as telas e os dados permitidos ao seu papel.
- RF-03: A família só acessa dados da própria criança. O terapeuta só acessa os pacientes vinculados a ele. A clínica acessa os dados da sua clínica. O administrador da plataforma opera as contas, com acesso mínimo ao conteúdo clínico.
- RF-03a: Uma criança pode ter mais de um responsável vinculado (por exemplo mãe e pai), e um responsável pode acompanhar mais de uma criança na mesma conta. O vínculo responsável-criança é de muitos para muitos.
- RF-04: O campo de evolução clínica interna nunca pode ser exposto para a família.

### 8.2 Dia a dia da família (registros)

- RF-05: A família registra uma entrada consolidada por dia (fim do dia), com tags e texto.
- RF-06: O registro do dia aparece no histórico da família e para o terapeuta vinculado.
- RF-07: A família visualiza o próprio histórico de registros em ordem cronológica.
- RF-08: O sistema mantém uma ofensiva (streak) que reflete a consistência de registro diário.

### 8.3 Sessões e prontuário (terapeuta)

- RF-09: O terapeuta registra uma evolução por sessão, com dois campos separados: evolução (interno, clínico) e orientação (recado em linguagem clara para a família).
- RF-10: Cada sessão recebe múltiplas tags específicas da disciplina do terapeuta, além do texto.
- RF-11: A orientação fica visível para a família na seção "Da equipe"; a evolução clínica fica restrita à clínica.
- RF-12: As evoluções se organizam automaticamente em um prontuário formal (montagem automática).
- RF-12a: Cada entrada do prontuário registra a identificação do profissional (nome e registro do conselho, por exemplo CRP, CRFa, CREFITO) e a data, para ter validade clínica.
- RF-12b: Registro clínico não é apagado livremente. Correções são feitas por versão ou adendo, preservando o histórico e a autoria da alteração (imutabilidade com trilha).

### 8.4 Navegação em três níveis das sessões

- RF-13: Nível 1: lista dos tipos de terapia separados, conforme as disciplinas que aquela clínica configurou.
- RF-14: Nível 2: ao abrir um tipo, lista das sessões daquele tipo em ordem cronológica, em cards de resumo com tags.
- RF-15: Nível 3: ao abrir uma sessão, o detalhe completo (tags, texto da devolutiva, confirmação de leitura e resposta).

### 8.5 Comunicação assíncrona

- RF-16: Cada post (registro ou devolutiva) tem confirmação de leitura (ciente / visto).
- RF-17: Cada post permite respostas assíncronas contidas nele (não um chat aberto).
- RF-18: O sistema deixa claro para quem envia se o outro lado já leu.

### 8.6 Agenda (terapeuta)

- RF-19: O terapeuta visualiza e gerencia sua agenda de sessões.
- RF-20: O sistema avisa conflitos de horário e de sala.

### 8.7 Gestão da clínica

- RF-21: A clínica cadastra e gerencia pacientes.
- RF-22: A clínica cadastra e gerencia a equipe (profissionais, cada um com sua disciplina) e o vínculo profissional-paciente.
- RF-22a: A clínica configura o próprio conjunto de disciplinas (não é uma lista fixa). Cada profissional é associado a uma disciplina desse conjunto, e as tags de sessão seguem a disciplina.
- RF-23: A clínica acessa um painel com a visão geral da operação.

### 8.8 Metas, relatórios e financeiro leve

- RF-24: O sistema permite definir metas terapêuticas por paciente e acompanhar o progresso de forma descritiva (marcos e observações), nunca por gráficos ou notas numéricas.
- RF-25: O sistema gera relatórios de evolução a partir do histórico, em texto (a narrativa do prontuário), não em gráficos.
- RF-26: O sistema oferece um controle financeiro leve, apenas como acessório (sem fiscal e sem convênio).

### 8.9 Onboarding e convites

- RF-27: O administrador da plataforma provisiona uma nova clínica (cria a conta da clínica e ativa o acesso).
- RF-28: O administrador da plataforma gerencia a assinatura da clínica, com a cobrança baseada no número de pacientes ativos.
- RF-29: A clínica cadastra pacientes, terapeutas e responsáveis, e dispara convites para que eles se vinculem.
- RF-30: O responsável e o terapeuta entram por um convite (link ou código) que já os vincula à criança ou aos pacientes certos, definindo sua senha no primeiro acesso.

### 8.10 Notificações

- RF-31: O sistema notifica o responsável quando há uma orientação nova, uma resposta ou uma novidade relevante da equipe.
- RF-32: O sistema notifica o terapeuta quando a família registra algo relevante sobre um paciente vinculado.
- RF-33: O sistema envia lembrete de registro diário à família, apoiando a ofensiva.
- RF-34: As notificações funcionam por push no app e por email, e cada usuário pode ajustar suas preferências de notificação.

### 8.11 Anexos

- RF-35: O responsável pode anexar foto, vídeo ou arquivo ao registro do dia.
- RF-36: O terapeuta pode anexar foto, vídeo ou documento a uma sessão.
- RF-37: Os anexos seguem as mesmas regras de acesso do post ao qual pertencem (um anexo de evolução clínica interna nunca é exposto à família).

---

## 9. Requisitos não funcionais

Ponto de atenção máxima para o sócio técnico, já que lidamos com dados sensíveis de saúde de menores.

### 9.1 Segurança e privacidade (crítico)

- RNF-01: Conformidade com a LGPD. Dados de saúde de crianças são dados pessoais sensíveis e exigem base legal, consentimento do responsável e finalidade clara.
- RNF-02: Controle de acesso por linha (row level security), garantindo que cada usuário só leia e escreva o que seu papel permite.
- RNF-03: Separação rígida entre evolução clínica interna e orientação visível à família, inclusive no nível de banco e de API.
- RNF-04: Criptografia em trânsito e em repouso para os dados sensíveis.
- RNF-05: Trilha de auditoria para acesso e alteração de registros clínicos.
- RNF-06: Política de retenção e exclusão de dados, e processo para atender solicitações do titular (ou responsável).

### 9.2 Plataforma e desempenho

- RNF-07: O produto roda em web e em app de celular, sobre a mesma base de dados. A web atende principalmente terapeutas e gestão da clínica; o app atende principalmente os pais. Qualquer perfil pode acessar por qualquer plataforma; o que muda é a permissão e as telas, não o meio de acesso.
- RNF-07a: Experiência mobile-first no app. A família usa como um app de tela cheia (sem moldura de celular falsa, sem barra de status fake).
- RNF-08: Respostas rápidas nas telas de uso diário (registro, leitura de devolutiva, agenda).
- RNF-09: Disponibilidade adequada para uso diário da clínica em horário comercial.

### 9.3 Usabilidade

- RNF-10: Seções separadas e navegação clara. Nunca um feed único misturado. Cada perfil abre o app e acha rápido o que precisa.
- RNF-11: Linguagem adequada a cada público: técnica no lado clínico, clara e acolhedora no lado da família.
- RNF-12: Ícones próprios (nunca emojis) e identidade visual violeta.

### 9.4 Acessibilidade

- RNF-13: O produto segue boas práticas de acessibilidade (referência WCAG): contraste adequado, navegação por leitor de tela, foco de teclado visível e alternativa em texto para conteúdo visual.
- RNF-14: O usuário pode ajustar o tamanho da fonte, e o sistema respeita a preferência de reduzir animações.
- RNF-15: Acessibilidade é tratada como requisito de produto e argumento de venda, não como um extra, dado o público neurodivergente.

---

## 10. Modelo de dados (visão inicial)

Estrutura de referência (o blueprint atual vive no arquivo `store.tsx` do protótipo; o alvo de backend é o Supabase, Postgres com auth, RLS, realtime e storage).

Entidades principais:

- **plataforma_admin**: perfil interno do fornecedor, que provisiona clínicas e gerencia assinaturas.
- **assinatura**: vínculo comercial da clínica, com a contagem de pacientes ativos que baseia a cobrança.
- **clinica**: dados da clínica (a conta contratante).
- **disciplina**: cada clínica define o próprio conjunto (não é uma lista fixa no código). Tags de sessão e tipos de terapia derivam daqui.
- **profissional**: nome, registro do conselho (por exemplo CRP, CRFa, CREFITO), disciplina (uma do conjunto da clínica), vínculo com a clínica.
- **paciente**: a criança em acompanhamento, vinculada à clínica e aos profissionais que a atendem.
- **responsavel**: usuário família. Liga-se a paciente por uma relação de muitos para muitos (um responsável pode ter vários pacientes, e um paciente vários responsáveis).
- **convite**: convite pendente (link ou código) que vincula um responsável ou terapeuta à criança ou aos pacientes certos no primeiro acesso.
- **registro**: entrada diária da família (data, tags, texto, confirmações).
- **sessao / prontuario_entry**: entrada por sessão do terapeuta, com campos separados de evolução (interno) e orientação (família), lista de tags da disciplina, data, autoria com registro do conselho. Correção por versão ou adendo, sem exclusão livre.
- **anexo**: foto, vídeo ou arquivo ligado a um registro ou a uma sessão, herdando as regras de acesso do post (guardado no storage).
- **confirmacao_leitura**: quem leu qual post e quando.
- **resposta**: resposta assíncrona contida em um post.
- **notificacao**: eventos enviados por push e email, com as preferências de notificação de cada usuário.
- **agenda**: sessões agendadas, horário, sala, profissional, paciente.
- **meta**: metas terapêuticas por paciente e marcos de evolução, em texto (qualitativo, sem gráficos).

Observações:

- Cada paciente é tratado de forma separada; nada se mistura entre pacientes.
- A relação profissional-paciente é o que define o que cada terapeuta enxerga.
- O registro clínico é imutável por natureza: correções geram versão ou adendo, com trilha de autoria.

---

## 11. Concorrência e posicionamento

Principal referência de mercado: BlueSmiles (software de gestão de clínicas ABA).

Postura: não competir na profundidade de instrumentos ABA licenciados nem no faturamento fiscal e de convênios. O NeuroLar se diferencia pela comunicação centralizada família mais equipe, pelo prontuário que se monta a partir do dia a dia, e pela experiência boa para a família (não só para a gestão). Adicionar metas terapêuticas, conflito de agenda e sala, e relatórios de evolução em texto, com um financeiro leve apenas como acessório. O acompanhamento da evolução é qualitativo, sem gráficos ou notas numéricas da criança.

---

## 12. Premissas e decisões travadas

- Modelo clínica-first: a clínica paga, família e terapeuta usam de graça.
- Comunicação assíncrona com confirmação de leitura. Nunca chat ao vivo.
- Separação rígida entre evolução clínica interna e orientação para a família.
- Seções separadas por tipo de conteúdo. Nunca um feed único.
- Uma clínica por instância agora, com estrutura preparada para evoluir depois.
- As disciplinas são configuráveis por clínica, nunca uma lista fixa no código.
- Duas plataformas sobre a mesma base: web (foco terapeuta e clínica) e app (foco pais), sem travar o acesso de nenhum perfil por plataforma.
- Existe um perfil interno de administrador da plataforma (fornecedor), acima das clínicas, que provisiona contas e cuida da assinatura.
- Pais e terapeutas entram por convite (link ou código) que já os vincula à criança certa.
- Notificações por push e email são parte do núcleo, não um extra, porque sustentam a promessa de que nada se perde.
- Registros e sessões aceitam anexos (foto, vídeo, arquivo), com as mesmas regras de acesso do post.
- O prontuário tem validade clínica: autoria com registro do conselho e correção por versão ou adendo, nunca exclusão livre.
- Vínculo responsável-criança é de muitos para muitos (dois pais, vários filhos).
- Acessibilidade é requisito de produto, não um extra.
- O acompanhamento da evolução é qualitativo (narrativa e marcos em texto). Sem gráficos nem notas numéricas da criança, porque desenvolvimento abstrato não se mede assim.
- Backend alvo: Supabase.
- Enquanto não existir backend seguro e revisão de segurança, o protótipo usa apenas dados fictícios.
- Identidade violeta, com ícones próprios.

---

## 13. Questões em aberto (para alinhar com o time)

- Definir a base legal e o fluxo de consentimento LGPD com o responsável no onboarding.
- Definir o formato final do prontuário formal exportável (PDF, layout, campos obrigatórios).
- Definir se o financeiro leve entra já na primeira versão ou depois da validação.
- Confirmar o valor de R$30 por paciente ativo com as primeiras clínicas.
- Definir política de backup e retenção de dados clínicos.
- Definir o escopo exato das metas terapêuticas e do acompanhamento qualitativo na primeira versão.
- Definir os canais e a política de notificação (quais eventos geram push, quais geram email, e os limites para não virar spam).
- Definir o formato do convite (link com expiração, código, validação do responsável) e como confirmar o vínculo com a criança certa.
- Definir limites de anexo (tamanho, tipos aceitos) e a política de retenção de vídeos, que pesam no storage.
- Definir o nível de acessibilidade alvo (por exemplo WCAG 2.1 AA) e testes de validação.

---

## 14. Estado atual do protótipo

O protótipo já está construído, integrado e persistindo dados localmente (React, TypeScript, Vite; persistência em localStorage, que virará Supabase). Os três perfis existem e compartilham um mesmo histórico: um registro da família aparece na visão do terapeuta, e uma nota do terapeuta aparece no diário da família. Serve como prova viva do conceito para as reuniões, e como base para a migração ao backend real.

---

## 15. Design e reaproveitamento do protótipo

O design do produto final não parte do zero nem de um Figma a ser recriado. O protótipo em código é a fonte de verdade do design. Como ele já está em React, TypeScript e Vite (o mesmo stack do produto final), o caminho é reaproveitar o próprio código, não redesenhar por cima.

Diretrizes:

- **O frontend do produto sai do protótipo.** As telas (`src/screens/`), os componentes, o CSS com a identidade violeta (`neurolar.css`), a fonte Nunito, os ícones próprios e a logo são a base. A linguagem visual já está definida e deve ser preservada.
- **O que muda é a camada de dados.** Hoje os dados vivem em `store.tsx` sobre localStorage. No produto final isso passa a ser Supabase (auth, queries, RLS, storage, realtime). A interface permanece; troca-se a origem dos dados.
- **Web e app compartilham os mesmos componentes React.** As mesmas telas atendem a web (terapeuta e clínica, de forma responsiva) e o app dos pais. A decisão de empacotamento do app (PWA ou Capacitor, por exemplo) fica com o responsável técnico, mas o design é o mesmo nos dois porque é o mesmo código.
- **Telas novas** (onboarding, convite, administração da plataforma, anexos) são construídas na mesma linguagem visual, reusando os componentes e os tokens de cor existentes, para manter a consistência.

Resumo: preservar a identidade e os componentes do protótipo, migrar a persistência para o Supabase e crescer a partir dali.
