# Progresso

Lista de verificação das fases. É por aqui que uma sessão nova retoma o trabalho.

## Sessões

- 03/10/2026: explorar os dados, fazer o levantamento das 547 cartas e escrever a proposta (checkpoint 1).

## Fase 0: exploração e proposta

- [x] Ler `cartas/README.md`, um `deck.json`, `cards.json` e `rulings.json`
- [x] Percorrer o CR (100–700, 800, 806, 903, 722, 732) e `guia/06-Roteiro-de-simulacao.md`
- [x] Levantamento das 547 cartas: `ferramentas/levantamento.mjs` gera `levantamento/LEVANTAMENTO.md` e `levantamento/cartas.json`
- [x] Conferir no Forge e no XMage se as cartas dos decks já existem (Forge 501/502, XMage 502/502)
- [x] `PROPOSTA.md`
- [ ] **Aprovação da proposta: aguardando resposta**

## Fase 1: núcleo do motor

- [ ] Estrutura do repositório (motor, cartas, bots, servidor, cliente, ferramentas), TypeScript, Vitest
- [ ] Importação dos decks e validação 903.5
- [ ] Estado, PRNG com semente, máquina de decisões, vista por jogador
- [ ] Turno e etapas, prioridade, pilha, mana, ações baseadas em estado
- [ ] Gatilhos (APNAP), substituição e prevenção, camadas
- [ ] Combate com vários defensores
- [ ] Commander: zona de comando, imposto, dano de comandante, identidade de cor, vida 40, mulligan, saída de jogador
- [ ] Passagem automática (CR 732)
- [ ] Testes derivados do CR e de `dados/cenarios.json`
- [ ] Bot aleatório e teste de estresse

## Fase 2: cartas, parte A (229)

- [ ] Gerador de rascunho a partir do Oracle
- [ ] `COBERTURA.md` gerado por script
- [ ] Cartas da parte A com teste e rulings conferidos

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
