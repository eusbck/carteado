# Progresso

Lista de verificação das fases. É por aqui que uma sessão nova retoma o trabalho.

## Sessões

- 03/10/2026: explorar os dados, fazer o levantamento das 547 cartas e escrever a proposta (checkpoint 1).
- 03/10/2026 (continuação): proposta aprovada (construir o motor; cartas em duas partes com servidor e cliente no meio; sem servidor XMage provisório). Começar a fase 1: núcleo do motor.
- 04/10/2026: fase 1 concluída; começar a fase 2 (cartas, parte A).
- 04/10/2026 (continuação): os agentes paralelos falharam por limite de uso; as cartas da parte A foram escritas direto. Fase 2 concluída; começar a fase 3 (servidor e cliente).

## Fase 0: exploração e proposta

- [x] Ler `cartas/README.md`, um `deck.json`, `cards.json` e `rulings.json`
- [x] Percorrer o CR (100–700, 800, 806, 903, 722, 732) e `guia/06-Roteiro-de-simulacao.md`
- [x] Levantamento das 547 cartas: `ferramentas/levantamento.mjs` gera `levantamento/LEVANTAMENTO.md` e `levantamento/cartas.json`
- [x] Conferir no Forge e no XMage se as cartas dos decks já existem (Forge 501/502, XMage 502/502)
- [x] `PROPOSTA.md`
- [x] Aprovação da proposta (03/10/2026)

## Fase 1: núcleo do motor — concluída em 04/10/2026

- [x] Estrutura do repositório (motor, cartas, bots, servidor, cliente, ferramentas), TypeScript (Node 24 roda .ts direto), Vitest
- [x] Importação dos decks (`ferramentas/importar.ts` → `gerado/`) e validação 903.5 (`motor/deck.ts`): os 7 decks são legais
- [x] Estado serializável, PRNG com semente (`motor/rng.ts`), máquina de decisões (`motor/ask.ts`, `motor/game.ts`), vista por jogador (`motor/view.ts`)
- [x] Turno e etapas, prioridade, pilha, mana, ações baseadas em estado (`turn.ts`, `stack.ts`, `costs.ts`, `sba.ts`)
- [x] Gatilhos APNAP com "olhar para trás" (603.10), substituições (comandante 903.9b, finalidade, flashback, entrar no campo), prevenção (proteção, escudos), camadas 1–7 (`chars.ts`)
- [x] Combate com vários defensores (802), primeiro golpe, atropelar, menace, voar, custos e exigências de ataque (goad)
- [x] Commander: zona de comando, imposto, retorno (903.9a/b), dano de comandante (903.10a), identidade de cor, vida 40, mulligan com o primeiro grátis em multijogador, saída de jogador (800.4)
- [x] Passagem automática (CR 732): `motor/autopass.ts`, usada pelo servidor na fase 3
- [x] Testes derivados do CR e de `dados/cenarios.json` (46 dos 51 cenários; os outros dependem de cartas futuras ou de mecânicas ausentes)
- [x] Bot aleatório (`bots/aleatorio.ts`) e teste de estresse (`bots/estresse.ts`) com verificação de invariantes

Recapitulação da fase 1:
- Feito: o motor joga partidas completas de 2 e 4 jogadores com os 7 decks; cartas ainda não implementadas entram como pendentes (sem efeito).
- Verificado: 79 testes passando; 85 partidas de bots aleatórios (40 de 4 jogadores, 40 de 2, 5 de 4) sem erro, travamento nem invariante violada; reprodução por semente e retomada de checkpoint dão o mesmo estado; a vista de um jogador não contém mão nem grimório dos outros.
- Precisa de você: nada.

## Fase 2: cartas, parte A — concluída em 04/10/2026

- [x] Gerador de rascunho a partir do Oracle (`ferramentas/rascunho.ts`, terrenos) e ficha de Oracle + rulings (`ferramentas/ficha-carta.ts`)
- [x] `COBERTURA.md` gerado por script (`ferramentas/cobertura.ts`)
- [x] Cartas da parte A com teste e rulings conferidos (nenhuma da parte A pendente)
- [x] Fichas conferidas com as fichas impressas (`cartas/fichas.test.ts`)

Recapitulação da fase 2:
- Feito: 287 das 547 entradas prontas (cartas da parte A, básicos, 34 fichas); ajustes de regra que apareceram no caminho: ficha fora do campo não volta (111.8), decaimento (702.147a), devoid (702.114a), cor das fichas (111.4), entrar com marcadores conta como colocar (122.6), gatilho que dispara uma vez por marcador.
- Verificado: suíte inteira com 250 arquivos e 648 testes passando; `tsc` sem erros; 40 partidas de 4 bots aleatórios sem erro nem invariante violada.
- Precisa de você: nada.

## Fase 3: servidor e cliente

- [ ] Salas privadas com código e senha, escolha de deck
- [ ] Partidas de quatro jogadores e um contra um, reconexão, persistência
- [ ] Log legível, modo manual para cartas pendentes
- [ ] Interface conferida com capturas de tela

## Fase 4: cartas, parte B (271, inclui 37 especiais)

- [ ] Mecanismos raros no motor
- [ ] Cartas da parte B com teste e rulings conferidos
- [ ] `COBERTURA.md` em 547/547

## Fase 5: bots

- [ ] Heurísticas e busca rasa com informação determinizada
- [ ] 3 bots + 1 humano
- [ ] 200 partidas seguidas com 4 bots, sem erro, travamento ou estado ilegal

## Fase 6: hospedagem

- [ ] Deploy e instruções (com confirmação antes de criar conta, publicar ou gerar custo)
