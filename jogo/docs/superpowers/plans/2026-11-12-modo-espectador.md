# Modo espectador Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Amigos com código e senha da sala entram só para assistir a mesa, a qualquer momento, sem nunca serem recusados e sem ver informação escondida.

**Architecture:** O servidor ganha conexões sem assento (`Conexao.espectador`), guardadas na sala ao lado dos assentos, que recebem a sala e a vista neutra do motor (`buildView(g, null, …)`). O cliente trata `voce === null` como espectador: saguão só de leitura e mesa sem interação, com um jogador escolhido embaixo.

**Tech Stack:** TypeScript (Node 24), Preact/Vite no cliente, vitest.

**Spec:** `jogo/docs/superpowers/specs/2026-11-12-modo-espectador-design.md`

## Global Constraints

- O espectador nunca é recusado por sala cheia nem por estado da sala (espera, jogando, fim); só por código ou senha errados, nome vazio ou teto.
- Teto: 8 espectadores por sala (`MAX_ESPECTADORES = 8`), mensagem "A sala já tem 8 espectadores".
- O espectador não recebe `chat` nem `revelada`; recebe `sala`, `jogo` (vista neutra), `aviso`, `pensando`, `erro`, `pong`, `saiu`.
- Toda mensagem do espectador além de `assistir`, `retomar`, `sair` e `ping` é recusada com "Espectadores só assistem".
- Jogador de baixo padrão no cliente: o anfitrião (`sala.anfitriao`).
- Textos da interface em português; nome do espectador limpo por `limparNome` como o dos jogadores.

## Review Focus

- Espectador entra com a partida em andamento: recebe a vista na hora (não espera o próximo passo) — teste no Task 1.
- Vista do espectador sem nenhuma carta de mão ou grimório com `def` preenchido, e sem `decision` — teste no Task 1.
- Servidor reinicia: o espectador volta pelo `retomar` com o token dele (os espectadores ficam em `DadosSala`) — teste no Task 1.
- O mesmo aparelho já sentado na sala tenta assistir: recusa "Você já está nesta sala" — teste no Task 1.
- Mesa do espectador com o jogador de baixo que saiu da partida: o seletor continua funcionando e a mesa não quebra — conferido no Task 4 (render com `you: null`).

---

### Task 1: Servidor — espectadores na sala

**Files:**
- Modify: `jogo/servidor/protocolo.ts` (MsgCliente `assistir`; `SalaPublica.espectadores: string[]`; `MsgServidor` `sala.voce: number | null`; FORMAS)
- Modify: `jogo/servidor/salas.ts` (Conexao, DadosSala, Sala, Gerente.tratarInterno)
- Test: `jogo/testes/espectador.test.ts` (mesmo harness `Falsa` de `testes/chat.test.ts`)

**Interfaces:**
- Produces: `MsgCliente` `{ t: 'assistir'; codigo: string; senhaSala: string; nome: string }`; `Conexao.espectador?: boolean`; `DadosSala.espectadores?: { nome: string; token: string }[]`; `SalaPublica.espectadores: string[]` (nomes, na ordem de chegada, só os conectados); mensagem `sala` com `voce: null` e o token do espectador; `export const MAX_ESPECTADORES = 8` em salas.ts.

- [ ] **Step 1: Write the failing tests** em `testes/espectador.test.ts`:
  - `assiste no saguão sem ocupar assento`: Ana cria 1v1, Bruno entra, Carla `assistir` → Carla recebe `sala` com `voce: null` e `sala.espectadores === ['Carla']`; assentos continuam 2 humanos; Ana recebe `espectadores: ['Carla']`.
  - `assiste com a partida em andamento e vê só a vista neutra`: sala 1v1 com dois bots ou Ana+bot iniciada (`deck`, `bot`, `iniciar` como em `servidor.test.ts`); Carla `assistir` → recebe `jogo` com `vista.you === null`, `vista.hand` vazia, `vista.decision === null`, e nenhuma carta da pilha/campo/zonas com `def` de carta virada para baixo (conferir `vista.hand.length === 0` e `players[i].handCount > 0`).
  - `não é recusado com a sala cheia nem jogando` (o caso acima já cobre jogando; acrescentar sala 1v1 cheia em espera).
  - `não age`: Carla manda `chat`, `responder`, `iniciar`, `deck` → cada um volta `erro` com `msg: 'Espectadores só assistem'`; Ana não recebe chat de Carla.
  - `não recebe chat nem revelada`: Ana manda `chat` → Carla não recebe mensagem `t: 'chat'`.
  - `volta pelo retomar, inclusive depois de reiniciar`: Carla guarda o token da `sala`; desconecta; nova conexão `retomar {codigo, token}` → `sala` com `voce: null`; repetir com novo `Gerente` sobre o mesmo `Banco` (`restaurar()`).
  - `teto de 8`: 8 espectadores entram, o 9º recebe `erro` "A sala já tem 8 espectadores".
  - `quem já está sentado não assiste a mesma sala`: Ana (sentada) manda `assistir` da mesma conexão → "Você já está nesta sala".
  - `sair`: Carla manda `sair` → recebe `saiu`; `espectadores` some da `sala` de Ana.
- [ ] **Step 2: Run** `cd jogo && npx vitest run testes/espectador.test.ts` — Expected: FAIL (mensagem desconhecida).
- [ ] **Step 3: Implement.** Pontos fixos:
  - `Sala.assistir(c: Conexao, nome: string): void` cria `{ nome, token: novoToken() }` em `d.espectadores`, liga a conexão com `c.espectador = true`, `c.assento = null`, `c.token = token`, e manda `sala` + vista (sem `chat`).
  - `transmitir`/`enviarJogo`: conexões com `espectador` recebem `sala` com `voce: null` e `jogo` com `buildView(g, null, pendente)`, `paradas` padrão, `posicoes` do campo, `desfazivel: false`, `desfazer: this.pedidoPublico()`; o token conferido é o do espectador em `d.espectadores` (sem ele, `soltar`).
  - `publica().espectadores`: nomes dos espectadores com conexão aberta.
  - chat e `revelar`: os laços já filtram por `c.assento !== null`/assento — conferir que espectador nunca entra.
  - `Gerente.tratarInterno`: `assistir` confere código e senha como `entrar` (mesma mensagem de erro), depois teto e "Você já está nesta sala"; `retomar` procura o token também em `d.espectadores`; no `default`, `c.espectador` e tipo fora de `sair`/`ping` → "Espectadores só assistem"; `sair` de espectador remove o registro dele e manda `saiu`.
  - `desligar`: espectador continua registrado (pode voltar), só sai da lista pública.
- [ ] **Step 4: Run** `npx vitest run testes/espectador.test.ts testes/chat.test.ts testes/servidor.test.ts testes/robustez-servidor.test.ts` — Expected: PASS; `npx tsc --noEmit -p tsconfig.json` sem erros (o cliente vai reclamar de `voce: number | null` — corrigir os pontos de tipo mínimos no cliente com `?? 0` só se impedir compilar; o comportamento vem nos Tasks 2–4).
- [ ] **Step 5: Commit** `git commit -m "Servidor: espectadores na sala (assistir, vista neutra, sem agir)"`

### Task 2: Cliente — loja e tela inicial

**Files:**
- Modify: `jogo/cliente/src/loja.ts` (estado `voce: number | null` já existe; ação `assistir`; avatar só com assento)
- Modify: `jogo/cliente/src/telas/Inicio.tsx` (botão "Assistir" no passo de entrar numa sala)

**Interfaces:**
- Consumes: `MsgCliente` `assistir` (Task 1).
- Produces: `loja.assistir(codigo: string, senha: string, nome: string): void`; `Estado.voce === null` com `sala` presente significa espectador (helper exportado `ehEspectador(e: Estado): boolean`).

- [ ] **Step 1:** Em `tratar('sala')`, só mandar avatar quando `m.voce !== null`; `guardarSala` continua guardando código e token (o `retomar` serve aos dois).
- [ ] **Step 2:** Inicio: no formulário de código e senha, segundo botão "Assistir" (mesmas condições de habilitado do "Entrar"), que chama `loja.assistir`.
- [ ] **Step 3: Verify** `npx tsc --noEmit -p tsconfig.json` e `npx vitest run testes` (sem novas falhas além das 7 de imagem).
- [ ] **Step 4: Commit** `git commit -m "Cliente: entrar como espectador"`

### Task 3: Cliente — saguão para espectador e lista de quem assiste

**Files:**
- Modify: `jogo/cliente/src/telas/Saguao.tsx`

- [ ] **Step 1:** Com `ehEspectador`, o saguão mostra assentos, decks e etapa sem nenhum controle (sem escolher deck, bots, regras, iniciar, chat), com a faixa "Você está assistindo" e o botão "Sair".
- [ ] **Step 2:** Para todos: linha "Assistindo: Carla, Davi" quando `sala.espectadores.length > 0`.
- [ ] **Step 3: Verify** tsc sem erros.
- [ ] **Step 4: Commit** `git commit -m "Saguão: modo espectador e lista de quem assiste"`

### Task 4: Cliente — mesa do espectador

**Files:**
- Modify: `jogo/cliente/src/mesa/Mesa.tsx`
- Test: `jogo/testes/cliente-espectador.test.tsx` se o projeto já testa componentes do cliente; senão, conferência pelo e2e no Task 5.

**Interfaces:**
- Consumes: `ehEspectador` (Task 2).

- [ ] **Step 1:** `const espectador = v.you === null`; `const [baixo, setBaixo] = useState(sala.anfitriao)`; `eu = espectador ? baixo : v.you!`. Se `baixo` saiu da partida, a mesa continua com ele embaixo (área mostra que saiu).
- [ ] **Step 2:** Com `espectador`: AreaJogador sem `mao`, sem handlers (`onPegarCampo`, `onPegarCampoVazio`, `onPegarMao`, `onDuploMao`, `onMenuArea`, `onLeque`), sem `FaixaFases` de ação (só fase e turno), sem `Paradas`, `Desfazer`, `Chat`, `Manual`, `Reorganizar`, menus de carta só com zoom; "Nova partida" escondido.
- [ ] **Step 3:** Seletor "Ver de baixo: [jogador]" no topo da mesa, com os nomes de `v.players`, e a faixa "Você está assistindo · Sair".
- [ ] **Step 4:** Para os jogadores: "Assistindo: …" discreto no topo quando houver espectadores.
- [ ] **Step 5: Verify** tsc; `npx vite build` não roda nesta cópia sem imagens — conferir só tipos aqui.
- [ ] **Step 6: Commit** `git commit -m "Mesa: modo espectador (só vê a mesa, escolhe quem fica embaixo)"`

### Task 5: Conferência ponta a ponta

**Files:**
- Modify: `jogo/PROGRESSO.md`

- [ ] **Step 1:** `npx vitest run testes` (só as 7 de imagem falham) e bots de estresse curtos (`node bots/estresse.ts 4 2 aleatorio esp`).
- [ ] **Step 2:** Entregar ao PC (arquivos do servidor e do cliente) e pedir ao Dadinho para conferir na mesa: abrir a sala numa aba, assistir noutra aba anônima com código e senha.
- [ ] **Step 3:** Entrada no PROGRESSO.md e commit.
