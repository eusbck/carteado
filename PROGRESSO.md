# Progresso

Lista de verificação das fases. É por aqui que uma sessão nova retoma o trabalho.

## Sessões

- 03/10/2026: explorar os dados, fazer o levantamento das 547 cartas e escrever a proposta (checkpoint 1).
- 03/10/2026 (continuação): proposta aprovada (construir o motor; cartas em duas partes com servidor e cliente no meio; sem servidor XMage provisório). Começar a fase 1: núcleo do motor.
- 04/10/2026: fase 1 concluída; começar a fase 2 (cartas, parte A).
- 04/10/2026 (continuação): os agentes paralelos falharam por limite de uso; as cartas da parte A foram escritas direto. Fase 2 concluída; começar a fase 3 (servidor e cliente).
- 04/10/2026 (continuação): fase 3 concluída; começar a fase 4 (cartas, parte B).
- 05/10/2026: retomada depois do limite de uso da sessão anterior; fechar o lote 3e (cartas R, sem commit) e seguir com as cartas S–Z e as especiais.
- 05/10/2026 (continuação): fase 4 concluída (547/547); começar a fase 5 (bots).
- 05–06/10/2026 (outra conta, depois do limite): fase 5 concluída (bot heurístico, correções do estresse, bateria final 200/200); fase 6 concluída pela opção A (computador do Caio + túnel). Todas as fases do prompt estão feitas.
- 06/10/2026: fase 7 (mesa nova): protótipo aprovado (mulligan livre até 3 vezes; oponentes em cima e você embaixo; todos veem a arrumação de cada um); visual, interação, menus e mulligan feitos.
- 06/10/2026 (depois de uma queda do computador): ajuste pendente fechado (reserva de mana ao lado da vida na sua área), conferido com capturas.
- 06/10/2026 (noite): fase 8 (mesa real), pedida em `../PROMPT-FASE-8.md` depois da primeira partida com a mesa nova. Bugs da seção 1 corrigidos; proposta das seções 2 a 4 (com o levantamento da 2.5) publicada para aprovação.
- 06/10/2026 (noite, continuação): proposta aprovada; seções 2 a 6 implementadas e conferidas.
- 07/10/2026: fase 9 (ajustes depois das partidas contra bots), pedida em `../PROMPT-FASE-9.md`. Trabalho dividido com
  subagentes em worktrees irmãs (`../jogo-wt-a` a `../jogo-wt-d`, branches `fase9-a` a `fase9-d`).

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

- [x] Servidor HTTP + WebSocket (`servidor/`): senha de acesso (cookie de sessão), imagens só para sessões autenticadas, miniaturas WebP sob demanda
- [x] Salas privadas com código e senha, escolha de deck, bots nos lugares vazios
- [x] Partidas de quatro jogadores e um contra um, reconexão ao mesmo lugar (token), persistência em SQLite (semente + entradas + checkpoints) que sobrevive a reinício
- [x] Passagem automática com paradas configuráveis (CR 732), sem mostrar decisões que o servidor vai passar sozinho
- [x] Registro legível em português (nomes das impressões em português), modo manual no motor para cartas pendentes (entradas reprodutíveis)
- [x] Cliente Vite + Preact (`cliente/`): mesa com 4 ou 2 jogadores, mão, pilha, zona de comando, cemitério e exílio, vida e dano de comandante, decisões só por clique
- [x] Interface conferida com capturas de tela (`ferramentas/capturas.ts`) e teste de ponta a ponta com navegadores (`ferramentas/e2e.ts`)

Recapitulação da fase 3 (04/10/2026):
- Feito: dá para jogar no navegador, em 4 ou em 1v1, com pessoas e bots; as cartas ainda pendentes são jogáveis pelo ajuste manual. Guia de uso em `LEIAME.md`.
- Verificado: 253 arquivos e 661 testes passando (inclui salas, reinício e informação oculta no servidor, e o modo manual com reprodução por semente); `npm run typecheck` sem erros; `node ferramentas/e2e.ts` passou inteiro (1v1 entre dois navegadores com o servidor derrubado e religado no turno 4, a partida voltou no mesmo turno e foi até o fim; partida de 4 pessoas em 4 navegadores até o turno 9 e concessões até sobrar uma); capturas conferidas.
- Precisa de você: nada por enquanto. A hospedagem (fase 6) vai pedir sua confirmação antes de criar conta ou publicar.

## Fase 4: cartas, parte B (271, inclui 37 especiais) — concluída em 05/10/2026

- [x] Mecanismos raros no motor (transformar, resguardo, cópia de mágica, delve, preparar, bestow, aniquilador, sair de fase, apoio, exaltado, eco, devorar, manifestar, desenterrar, suspender, ficha de Aura, bravura, flanqueamento, ascensão, Strive, trocar vida e resistência, gatilho extra, Sagas, Classe, miríade, cópia ao entrar, Aura em carta do cemitério)
- [x] Cartas comuns da parte B (A–Y) com teste e rulings conferidos
- [x] As cartas especiais
- [x] `COBERTURA.md` em 547/547

Recapitulação da fase 4 (05/10/2026):
- Feito: todas as 547 entradas prontas (cartas dos 7 decks, fichas e recursos auxiliares), cada carta com teste próprio e os 1285 rulings com disposição registrada; nenhuma carta depende mais do modo manual. Correções no caminho: jogar terreno por permissão de outra carta (a chave era cortada), `attach()` respeitando "encantar a criatura posta no campo", custo repetível limitado ao que dá para pagar, a decisão de ataque passa a dizer quais alvos cumprem as exigências (CR 508.1d), o servidor usa a resposta neutra do motor se um bot errar, e o harness de testes ficou mais rigoroso (responde a ordem de gatilhos antes de resolver a pilha; "até a limpeza" para no fim do turno em vez de jogar até o fim da partida).
- Verificado: `npm run typecheck` sem erros; suíte inteira com 507 arquivos e 1064 testes passando; `COBERTURA.md` 547/547 e rulings 1285/1285; estresse com bots aleatórios: 80 partidas de 4 jogadores (sementes fase4 e fase4c) e 40 de 1v1 (fase4b) sem erro, travamento nem invariante violada (antes das correções, 11 das 40 primeiras falhavam).
- Precisa de você: nada.

Notas para retomar: depois de mexer no motor, rode `npx tsc --noEmit -p tsconfig.json`, os testes afetados, `npx vitest run` inteiro **sem mexer em arquivos durante a execução** (a suíte importa todas as definições e falha em massa se pegar um arquivo pela metade) e `node bots/estresse.ts 40 4 aleatorio <semente>`. Falhas do estresse ficam em `.cache/falhas/` e se reproduzem com `node .cache/repro-falha.ts <semente>`.

## Fase 5: bots — concluída em 06/10/2026

- [x] Heurísticas e busca rasa com informação determinizada (`bots/heuristico.ts`, `bots/simulacao.ts`, `bots/avaliacao.ts`)
- [x] 3 bots + 1 humano (servidor usa o bot heurístico nos lugares de bot; `ferramentas/humano-e-bots.ts`; cenário novo em `ferramentas/e2e.ts`)
- [x] 200 partidas seguidas com 4 bots, sem erro, travamento ou estado ilegal

Como o bot decide: nos momentos que importam (fases principais do próprio turno, etapa final dos oponentes e quando
um oponente põe algo na pilha), simula cada jogada candidata numa cópia da partida em que a mão e o grimório dos
oponentes são redistribuídos ao acaso e o próprio grimório é embaralhado, deixa a pilha resolver e avalia (vida,
mesa, cartas, dano de comandante, veneno). As escolhas da melhor simulação (alvos, modos, X) viram o plano seguido na
partida. Combate, mulligan, vidência e escolhas forçadas usam heurísticas. O número de simulações por decisão é fixo
(determinístico): 24 no servidor, 16 no estresse.

Recapitulação da fase 5 (06/10/2026):
- Feito: bot heurístico com busca rasa jogando no servidor nos lugares vazios; ataque letal com tudo quando o dano
  passa da vida de um oponente mesmo com os bloqueios; com o campo muito cheio (mais de 150 objetos), o bot passa em
  vez de simular, e com mais de 60 objetos simula menos. Correções que o estresse achou: custo de ataque (Ghostly Prison)
  e custo repetível sem laço, escolhas do bot conferidas pelos validadores da decisão, ataque obrigatório (Furygale),
  controle de base ao sair da partida (CR 800.4a), capítulo final da Saga, Animate Dead, miríade dobrada.
- Verificado: suíte inteira (509 arquivos, 1073 testes) e `npm run typecheck`; contra bots aleatórios, o heurístico
  ganha 7 de 10; **bateria final `bateria3`: 200/200 partidas de 4 bots heurísticos sem erro, travamento nem invariante
  violada** (6 processos, cerca de 69 min; média de 44 turnos, 179 com vencedor e 21 empates pelo limite de 60 turnos;
  a partida mais longa levou 7 min); `ferramentas/humano-e-bots.ts` em 4p (fim no turno 47) e 1v1 (turno 23) sem
  vazamento de informação oculta; `node ferramentas/e2e.ts` passou inteiro, inclusive uma pessoa com três bots pela
  interface.
- Precisa de você: nada. Se algum bot parecer lento numa partida de verdade, o número de simulações fica em
  `servidor/salas.ts` (`simulacoesBot`).

## Fase 6: hospedagem — concluída em 05/10/2026 (opção A)

- [x] Opções escritas em `HOSPEDAGEM.md` (A: computador de vocês + túnel; B: Tailscale; C: servidor sempre ligado)
- [x] Opção A escolhida pelo grupo (05/10/2026): `cloudflared` instalado no computador do Caio, `Abrir a mesa.cmd` sobe o servidor com HTTPS e o túnel rápido e mostra endereço e senha
- [x] Teste pela internet (`abrir-mesa.ps1 -Teste`): página, login com cookie seguro, senha errada recusada, WebSocket com e sem sessão

Recapitulação da fase 6 (05/10/2026):
- Feito: a mesa abre com dois cliques e fecha com Enter. Atrás do túnel, o limite de tentativas de senha usa o IP real do visitante, e o WebSocket sem sessão recebe 401 completo.
- Verificado: `abrir-mesa.ps1 -Teste` passou de ponta a ponta por um endereço `trycloudflare.com` (aberto só durante o teste e fechado em seguida).
- Precisa de você: abrir a mesa numa noite de jogo e mandar endereço e senha ao grupo. O endereço muda a cada abertura; endereço fixo pede conta na Cloudflare e domínio (só com sua confirmação).

## Fase 7: mesa nova (visual e manuseio das cartas) — concluída em 06/10/2026

Pedido feito na conversa de 06/10/2026 (não está em `../PROMPT-JOGO-ONLINE.md`), com as referências da EDHLab em
`../referências/`. Escopo: só interface; o motor só ganhou a opção de mulligan livre. Protótipo estático e os scripts
que geram as imagens dele ficam em `.cache/prototipo/` (fora do repositório).

- [x] Visual novo em todas as telas (`cliente/src/estilo.css`): fundo quase preto, verde para o que dá para fazer,
  botões de contorno, fonte Inter, arte do comandante ao fundo de cada área (recortada no servidor da imagem local:
  `/img/<id>/arte`)
- [x] Mesa maior (oponentes em cima, você embaixo com a mão em leque dentro da sua área) e barra lateral retrátil
  (lembrada no navegador); decisões, pilha e avisos numa coluna à direita da mesa
- [x] Zonas sempre visíveis em cada área (comando com imposto, mão, grimório, cemitério e exílio com a carta do topo)
- [x] Faixa de fases no meio da mesa: as 5 fases oficiais com as etapas dentro, Passar e "passar até o fim do turno";
  clicar numa etapa liga/desliga a parada
- [x] Mana na mesa: no pagamento, as fontes ficam com brilho e viram com um clique; o pagamento sai sozinho quando a
  reserva cobre o custo (`cliente/src/mana.ts`); com prioridade, clicar num terreno gera a mana; "pagar
  automaticamente por padrão" nas Configurações (desligado)
- [x] Jogar da mão arrastando para o campo ou com duplo clique; motivo na tela quando não dá
- [x] Arrumação livre das próprias permanentes: posição guardada pela sala (`posicoes` em `servidor/salas.ts`, fora do
  motor), proporcional ao tamanho da área, vista por todos; arrumação padrão em `cliente/src/mesa/arrumacao.ts`
- [x] Clique direito: jogadas válidas, ver informações, revelar carta da mão (para todos ou um jogador), ajuste manual
  (virar, marcadores, mover); no campo vazio, desvirar tudo, criar ficha, marcadores de jogador, reorganizar
- [x] Regra de mulligan na sala (Londres ou Livre, até 3 trocas sem pôr nada no fundo: `config.mulligan` em
  `motor/turn.ts`) e tela de mão inicial em leque
- [x] Combate: em 4 jogadores, menu para escolher quem atacar; arrastar o atacante até a área do oponente e o
  bloqueador até o atacante
- [x] Avisos no canto das jogadas, ataques e ajustes manuais de todos

Ficou de fora (para decidir depois): mudar força/resistência à mão (o ajuste manual não tem; dá para usar marcadores
+1/+1 e −1/−1), criar cópia de uma carta qualquer (o ajuste manual só cria fichas conhecidas), cronômetro de turno,
dados e moeda, voz.

Recapitulação da fase 7 (06/10/2026):
- Feito: a mesa nova inteira (itens acima), com o motor intocado a não ser pela opção de mulligan livre. Mensagens novas
  no protocolo: `posicao`, `mulligan`, `revelar` (e `revelada` do servidor); a vista do jogo vai com `posicoes`.
- Verificado: `npm run typecheck`; suíte inteira com 509 arquivos e 1077 testes (novos: mulligan livre no motor;
  regra de mulligan, posições e revelar no servidor); `node ferramentas/capturas.ts` conferido imagem por imagem
  (inclui arrastar da mão, pagar virando terreno, carta movida, menus de clique direito, carta revelada, mão inicial
  Londres e Livre, 1v1 em 1280×800); `node ferramentas/e2e.ts` passou inteiro (1v1 com reinício do servidor, 4 pessoas,
  uma pessoa com 3 bots); estresse com mulligan livre (`MULLIGAN=livre`): 40/40 partidas de 4 bots aleatórios e
  18/19 de 1v1.
- Observação: na partida 1v1 `fase7-livre-2p-11`, os bots aleatórios entram num laço de cartas (Blowfly Infestation e
  Puca's Covenant, com Grim Poppet) e escolhem alvos que o mantêm vivo; a pilha passa de 800 itens e cada decisão fica
  mais lenta. Não é erro do motor nem do mulligan (uma pessoa escolheria outro alvo e pararia o laço), mas o motor
  não detecta laço obrigatório sem fim (CR 104.4b). Fica para decidir se vale tratar.
- Precisa de você: jogar uma partida de verdade com a mesa nova e dizer o que ajustar.

## Fase 8: mesa real (menos ajuda do sistema) — concluída em 06/10/2026

Pedido em `../PROMPT-FASE-8.md`. Princípio: a interface ajuda menos e o jogador decide mais; toda ajuda vira auxílio
opcional, desligado por padrão; o motor continua conferindo as regras. Proposta aprovada ("continue", com as quatro
propostas marcadas): https://claude.ai/artifact/HkRAV2wkWt3XfaYiERRAMu

- [x] 1.1 e 1.2: janelas da barra lateral e barra recolhida (detalhes abaixo)
- [x] Proposta das seções 2 a 4 com o levantamento da 2.5, aprovada
- [x] 2: auxílios (`cliente/src/preferencias.ts`): níveis Mesa real (padrão), Leve, Completo e Personalizado; os itens
  do levantamento entram nos cinco auxílios; regra da sala no saguão (`auxilios` em `servidor/salas.ts`); o servidor
  recusa o pagamento automático quando a sala proíbe
- [x] 3: combate por cliques (`mesa/Mesa.tsx`, `mesa/Setas.tsx`) e efeitos de dano, vida e morte (`mesa/Efeitos.tsx`)
- [x] 4: Desfazer com aceite da mesa (`servidor/desfazer.ts`, `mesa/Desfazer.tsx`)
- [x] 5: sons com Web Audio (`cliente/src/sons.ts`, sem arquivos) e efeitos visuais configuráveis
- [x] 6: hover na mão inicial e faixa de fases mais fina
- [x] Capturas pedidas, `ferramentas/e2e.ts`, `PROGRESSO.md`, `LEIAME.md` e commit

Decisões (propostas aprovadas):
1. No Desfazer, "jogada" é tudo o que a pessoa fez, inclusive passar a prioridade; os passes automáticos do servidor e
   as respostas dos bots não contam. A jogada começa na resposta de prioridade, ataque ou bloqueio e leva junto as
   respostas seguintes da mesma pessoa (alvos, pagamento).
2. "Passar sozinho quando não há jogada possível" virou parte do auxílio "Brilho nas cartas jogáveis": em Mesa real a
   mesa para nas suas paradas mesmo sem jogada (campo novo `skipWhenNothing` em `StopSettings`); sala sem auxílios
   força isso para todos.
3. Em 4 jogadores, a criatura marcada vai no mesmo oponente da anterior até a pessoa clicar em outro (em 1v1 o alvo é
   automático).
4. Dá para pedir Desfazer de novo, um pedido por vez, sempre com aceite e só dentro do turno.

Como os auxílios se dividem (levantamento 2.5):
- Brilho nas cartas jogáveis: contorno verde no que dá para usar; criatura com enjoo apagada e o texto no zoom; passar
  sozinho sem jogada.
- Brilho nos alvos válidos: brilho de alvos, atacantes, bloqueadores e oponentes atacáveis; lista completa no painel de
  combate e "Marcar quem precisa atacar"; opções inválidas apagadas nas listas de escolha.
- Brilho nos terrenos ao pagar: fontes brilham, pagamento fecha sozinho quando a reserva cobre, "Confirmar
  pagamento" apagado quando falta mana.
- Aviso de por que não dá: motivo em texto (do cliente e as recusas do motor), "Solte para…" ao arrastar, dano letal
  pré-distribuído e "(letal: N)".
- Pagar automaticamente.
- Saíram para todos os textos de orientação ("As cartas que dá para usar…", "Clique nos terrenos com brilho verde…",
  "Você também pode clicar nas cartas da mesa"). Ficaram para todos: menu de jogadas da carta, arrumação automática,
  avisos do que os outros fizeram, estado do jogo (imposto, dano de comandante, reserva, força/resistência), zoom,
  registro e as regras automáticas (desvirar, comprar, limpeza).
- Sem auxílio de avisos, uma recusa (do motor ou da interface) treme o que a pessoa acabou de tocar, sem texto.
  Erros do servidor que não são recusa de jogada continuam aparecendo.

Desfazer (servidor):
- Cada entrada da partida guarda o turno e se foi a pessoa (coluna nova `meta` em `entradas`, criada sozinha em bancos
  antigos; entradas gravadas antes da fase 8 não se desfazem).
- O servidor guarda na memória o estado no começo dos últimos turnos e refaz a partida até antes da jogada
  (`Game.fromCheckpoint`/`Game.replay` com as entradas gravadas): o motor não muda. Aceito, as entradas do banco a
  partir da jogada são apagadas, os bots são recriados e as posições de permanentes que deixaram de existir saem.
- Enquanto o pedido está aberto, a mesa fica parada (respostas recusadas, bots esperam). Os outros humanos têm 30 s
  (`prazoDesfazer` em `Atrasos`); bots aceitam na hora; recusa, prazo, cancelamento, concessão ou saída fecham o
  pedido. Avisos para a mesa saem pela mensagem nova `aviso`.
- Concessão depois da jogada impede desfazer (traria a pessoa de volta).

Mudanças no motor: só `motor/autopass.ts` (campo opcional `skipWhenNothing`, padrão igual ao de antes). Regras intactas.

Outros ajustes: `abrir-mesa.ps1` recompila a interface quando o código dela é mais novo que a versão compilada (antes
só compilava na primeira vez), junto com a mudança de outra sessão que fecha uma mesa antiga esquecida aberta.
`ferramentas/cenarios.ts` gera salas prontas numa situação de jogo (bots jogam até lá, sementes fixas) para as capturas
de combate.

Seção 1 (06/10/2026):
- Causa: as janelas ficavam dentro da grade de `.mesa`. A do Ajuste manual vinha embrulhada numa `div` comum, que virava
  uma segunda linha da grade: o tabuleiro encolhia e sobrava uma faixa preta embaixo (bem maior com a barra recolhida).
  Esc e clique fora não fechavam Paradas, Conceder nem Ajuste manual, e o Ajuste manual sumia ao perder a prioridade e
  voltava sozinho na seguinte.
- Correção: componente `cliente/src/Janela.tsx` (centralizada, acima de tudo, rolagem por dentro, fecha pelo X, Esc e
  clique fora) para todas as janelas da mesa, desenhadas fora de `.mesa`; a grade da mesa tem uma linha só; o Ajuste
  manual fecha quando a prioridade vai embora; o zoom fica acima das janelas.
- Não reproduzido: "janela presa no topo, sem clique" (no Edge daqui Paradas e Configurações já abriam no centro). Se
  voltar, falta saber o navegador e o zoom da página.

Recapitulação da fase 8 (06/10/2026):
- Feito: tudo da lista acima; o motor só ganhou o campo opcional do passe automático.
- Verificado: `npm run typecheck`; suíte inteira com 510 arquivos e 1086 testes (9 novos em `testes/fase8.test.ts`: regra
  de auxílios da sala e pagamento automático recusado, parada sem jogada, desfazer aceito com o banco cortado e a partida
  igual depois de reiniciar, recusado, sem resposta no prazo, jogadas de outros desfeitas junto, fora do turno e contra
  bots); `node ferramentas/capturas.ts` com 40 capturas conferidas imagem por imagem (uma é opcional e depende da partida sorteada) (janelas e barra recolhida em
  1280×800 e 1920×1080, Configurações › Auxílios e travada pela sala, Mesa real e Completo, hover no mulligan, ataque
  marcado e com alvo, bloqueio, dano, ganho de vida, pedido de desfazer visto por quem pede e por quem responde, e o
  resultado); `node ferramentas/e2e.ts` passou inteiro; `ferramentas/humano-e-bots.ts` em 4 jogadores (2 partidas) e 1v1
  (5 partidas) até o fim, sem erro, travamento nem vazamento. No caminho, o e2e precisou de dois ajustes: os títulos
  novos do painel de combate ("Ataque", "Bloqueio") e ler o turno antes do reinício só com a mesa esperando alguém
  (com passes automáticos em andamento, a partida podia virar o turno entre a leitura e o reinício). Uma rodada feita
  junto com as capturas e as partidas de bots falhou por tempo (a concessão demorou mais de 10 s com a máquina cheia);
  sozinho ele passa, e um teste avulso no servidor confirmou a concessão de quem está com a prioridade.
- Precisa de você: jogar uma partida em Mesa real e dizer o que ajustar (por exemplo, se parar sem jogada em 4
  jogadores ficou pesado demais, ou o volume e os sons). Para abrir a mesa nova é só usar "Abrir a mesa.cmd": ele
  recompila a interface sozinho.

## Fase 9: ajustes depois das partidas contra bots — em andamento (07/10/2026)

Pedido em `../PROMPT-FASE-9.md`. O princípio da fase 8 continua: mesa real, o jogador decide mais, as regras com o motor.
Divisão do trabalho: 1.1, 1.5 e a seção 4 no repositório principal; com subagentes, cada um na sua worktree: 1.2 e 1.4
(`fase9-a`), 1.3 e 2.4 (`fase9-b`), 2.1 a 2.3 (`fase9-c`), 2.5 e a seção 3 (`fase9-d`).

### 1.1 Bots parecem travados
- Reproduzido (`.cache/fase9/repro-1-1.ts`): numa partida 1v1 de 8 turnos contra um bot, com as paradas padrão e a mesa
  real, a mesa esperou a pessoa 7 vezes no turno do bot (etapa final dos turnos 2, 4, 6 e 8; mágicas do bot nos turnos 6
  e 8).
- Causa: o bot não travava. As paradas padrão de quem sentava incluíam a **etapa final do turno dos outros** e **"parar
  quando um oponente põe algo na pilha"**; na mesa real (fase 8) a parada vale mesmo sem jogada possível. A mesa ficava
  esperando a prioridade da pessoa e a única indicação era o "Você tem prioridade" pequeno na faixa de fases. Além disso,
  o bot pensava na linha principal do servidor: por até 2 s a mesa inteira congelava (resolvido no item 4.3).
- Correção:
  - Paradas padrão de quem senta (`PARADAS_PADRAO` em `servidor/salas.ts`): só no próprio turno (1ª fase principal,
    início do combate, 2ª fase principal). No turno dos outros a mesa anda sozinha. Salas antigas com as paradas padrão de
    antes passam para as novas ao reiniciar o servidor; paradas escolhidas pela pessoa ficam.
  - Na faixa de fases, um botão sempre à vista, "Mágicas dos oponentes", liga a parada nas mágicas e habilidades dos
    oponentes; as etapas continuam marcáveis com um clique (no turno dos outros, marca a parada do turno dos outros).
  - Quando a mesa espera a pessoa fora do próprio turno ou com algo na pilha, a faixa ganha contorno amarelo, o Passar
    pulsa e aparece embaixo dela "Sua vez de responder a **Raio** de ROBSON" ou "Turno de ROBSON, **etapa final**: sua vez
    de agir" (`cliente/src/mesa/prioridade.ts`).
  - Bot pensando há mais de 1 s: "ROBSON está pensando…" na faixa e no selo da área dele (item 4.3).
- Testes: `testes/fase9-paradas.test.ts` (1v1 e 4 jogadores contra bots com as paradas padrão e a mesa real: nenhuma
  prioridade da pessoa fora das paradas do próprio turno; com as paradas marcadas, ela para na etapa final e nas mágicas
  do bot e o aviso diz por quê; migração das salas antigas). `ferramentas/humano-e-bots.ts` conta os "cliques extras" no
  turno dos bots e falha se houver algum (1v1 contra o Intermediário: fim no turno 23, nenhum clique extra).

### 1.2 Terreno que entra virado conta na reserva (`fase9-a`)
- Tentativas de reproduzir ao pé da letra, sem o sintoma: no motor, cada um dos 56 terrenos dos decks que entram virados
  (reserva vazia, o terreno nunca vira fonte de mana); partidas inteiras de bots conferindo a cada resposta; no
  navegador (duplo clique, arrastar, menu). O cliente não deduz mana pela diferença de estado: mostra o `manaPool` da
  vista.
- O que reproduziu: numa partida no servidor (pessoa com pagamento automático e bots), reserva com mana fora de
  pagamento, por exemplo "Ana joga Radiant Grove. / Ana conjura Faeburrow Elder." deixando {G}{G} na reserva.
- Causa: `planPayment` (`motor/costs.ts`) acrescentava fontes na ordem de preferência até a conta fechar e nunca tirava
  as que sobravam; o pagamento automático virava terrenos que não pagavam nada e a mana deles ficava na reserva até o
  fim da etapa. Logo depois de jogar um terreno virado e conjurar, parece a mana dele. Atinge os bots (que sempre pagam
  no automático) e quem usa o auxílio "Pagar automaticamente".
- Correção: plano de pagamento enxuto (tira, das menos preferidas para as mais, as fontes sem as quais o resto ainda
  paga). Testes em `testes/terreno-virado.test.ts` (todo terreno que entra virado: reserva vazia, não é fonte, desvira
  no próximo turno do dono; Radiant Grove + Faeburrow Elder no automático; casos do plano enxuto).
- Em aberto: se você voltar a ver mana de um terreno virado pagando à mão na mesa real, preciso saber qual terreno e o
  nível de auxílio.
- Atenção: como o pagamento automático mudou, uma partida salva no meio pode não retomar depois da atualização
  ("Reprodução divergiu") se o refazer passar por pagamentos automáticos; termine ou recomece as partidas abertas.

### 1.3 Posicionar cartas no campo (`fase9-b`)
- Reproduzido com Playwright (sala pronta `ARRUM` em `ferramentas/cenarios.ts`): arrastando pelo canto, a carta ficava
  de 53 a 105 px antes de onde foi solta (horizontal) e 3 px acima; as outras cartas eram empurradas; ela deslizava até
  o lugar; e uma vista nova chegando antes da confirmação a devolvia à origem.
- Causas: a posição era desenhada multiplicada pela largura do campo menos a coluna da direita (336 px) mas calculada no
  campo inteiro; âncora pelo centro da caixa com o "levantar" do hover; transição de 0,25 s em `left`/`top`; a carta
  posta saía da arrumação padrão e as outras se rearrumavam; cada vista nova apagava a posição otimista; o servidor
  guardava 3 casas.
- Correção: arraste direto no DOM (`cliente/src/mesa/mover.ts`), o ponto pego fica sob o ponteiro (de pé ou virada),
  mesma referência ao desenhar e ao soltar, a carta posta guarda o espaço dela na arrumação (nada é empurrado; fica um
  "buraco" onde ela estava até ela sair do campo ou você reorganizar), posição otimista até o servidor confirmar, 4
  casas no servidor. Arrastar uma Aura ou Equipamento move a carta em que está preso; da mão para o campo também vale o
  ponto pego. Erro medido depois: 0,0 a 0,1 px.

### 1.4 Bloqueios (`fase9-a`)
Auditoria do bloqueio por cliques, caso a caso (testes em `testes/bloqueios.test.ts`, `bloqueio-cliente.test.ts`,
`bloqueio-servidor.test.ts`; a lógica do clique saiu de `Mesa.tsx` para `cliente/src/mesa/bloqueio.ts`):
1. Um bloqueador: funciona.
2. Vários bloqueadores: funciona. Desde Foundations (2024) não há ordem de dano: quem ataca divide como quiser (CR
   510.1c), e é o que o motor faz. Corrigido: a resposta padrão da divisão de dano (`motor/ask.ts`) somava só o letal e
   era recusada (usada para quem saiu da partida e na rede de segurança do servidor).
3. Voar e alcance: funciona.
4. Ameaça: funciona no motor (um bloqueador só é recusado); na mesa, o motor recusa e a mesa treme (ou mostra o motivo
   com o auxílio de avisos).
5. Primeiro golpe e golpe duplo: funciona no motor. Corrigido no bot: ele "trocava" com quem tem primeiro golpe e
   perdia a criatura sem causar dano.
6. Atropelar: funciona.
7. 4 jogadores: funciona; só os atacados decidem, cada um vê só quem o ataca, e a mesa recusa marcar atacantes de outros.
8. Bot bloqueando e você bloqueando o bot: o seu lado funciona. Corrigido no bot: com um bloqueio inválido (ameaça) ele
   desfazia todos os outros; para não morrer, agora bloqueia a ameaça com duas criaturas; leva em conta primeiro golpe.

### 1.5 O bot nunca vê a mão de ninguém
- Como era: o bot recebia a partida inteira. A busca rasa sorteava de novo a mão e o grimório dos oponentes, mas partindo
  da ordem verdadeira (trocar as cartas da mão mudava o sorteio), a cópia guardava a última informação conhecida (LKI)
  das compras (que diz que carta foi para a mão) e as heurísticas de combate e de escolha liam a partida verdadeira.
- Agora (`bots/mundo.ts`): todo bot decide num "mundo", uma cópia em que tudo o que o assento não vê é sorteado de novo:
  mão dos outros, conteúdo e ordem dos grimórios (o dele também) e cartas viradas para baixo que ele não pode olhar. O
  sorteio parte do conjunto escondido em ordem canônica (número da carta) e troca só o conteúdo dos objetos escondidos;
  a LKI de cartas que passaram por zonas escondidas e as linhas do registro que ele não vê saem da cópia; o futuro
  aleatório também é sorteado. As cartas que a própria decisão mostra (uma busca no próprio grimório) ficam.
- Decisões óbvias saem da vista do jogador (`motor/view.ts`, a mesma que o servidor manda a uma pessoa), sem simular.
- Teste (`testes/fase9-bots.test.ts`), para os seis níveis: numa partida de semente fixa, a cada decisão em que o bot
  pensa, a mesma situação é refeita com a mão e o grimório da pessoa trocados e o grimório do bot em outra ordem;
  enquanto a vista do bot é igual, **cada mundo que o bot monta tem de ser idêntico** (resumo SHA-1 do estado) e a
  resposta também, pelo caminho do servidor e pelo da partida local. Conferido que o teste pega o vazamento: com o
  sorteio desligado, ele falha.

### 2.1 Janelas de escolha (`fase9-c`)
- As escolhas (`select`, `number`, `arrange`) saíram da coluna da direita e abrem `cliente/src/mesa/JanelaEscolha.tsx`,
  centrada na divisa entre os oponentes e você; cresce com o conteúdo até a altura da mesa e só então rola por dentro
  (título e botões fixos). Com algo na pilha, deixa a coluna da pilha à vista. Não escurece a mesa: as cartas em volta
  continuam clicáveis. Prioridade, pagamento, ataque, bloqueio, dano e mulligan continuam na coluna.
- Formato de cada escolha (`mesa/escolhas.ts`):
  - **grade** (mais de 8 cartas, como uma busca no grimório): rolagem, filtro por nome em português ou inglês e pelo
    texto, sem acento; cartas iguais viram um item "×N" (os básicos ocupam poucos quadros);
  - **cartas** (até 8 cartas ou jogadores: alvos, descarte, regra da lenda): cartas grandes lado a lado, cada uma
    dizendo onde está ("de Bruno · virada", "na sua mão"); jogadores com nome e vida; clicar na mesa também marca;
  - **fila** (ordenar gatilhos): arrastar ou ↑/↓, mostrada como a pilha (o de cima resolve primeiro), com a carta de
    origem e o texto;
  - **opções** (modos, custos): um botão largo por linha com o texto inteiro;
  - **sim ou não** (até 3 opções curtas): janela compacta, um clique responde;
  - **número**: mín., −, valor, +, máx.;
  - **arranjo** (vidência, vigiar): duas faixas (Topo e Fundo, ou Topo e Cemitério) com as cartas grandes.
- Recolher: "Ver a mesa" vira um cartão "Escolha pendente" na coluna (dá para clicar nas cartas da mesa como alvo);
  segurar Espaço esconde a janela enquanto a tecla está apertada.

### 2.2 Zoom (`fase9-c`)
- Sempre à esquerda ou à direita (no lado oposto ao da carta), centralizado na altura; a imagem tem cerca de 40% da
  altura da tela (no máximo 30% da largura da mesa e 620 px). Com muito texto (`mesa/medidaZoom.ts`): a carta encolhe até
  80%, depois o texto vai para o lado, por fim a letra diminui até 60%; nunca sai da tela.

### 2.3 Registro escondido (`fase9-c`)
- O botão Registro esconde e mostra o registro; escondido, a barra fica só com os ícones (64 px) e a mesa ocupa o resto
  (em 1920, de 1672 para 1856 px). Guardado em `preferencias.ts`. "Recolher a barra" virou o mesmo estado.

### 2.4 Seleção por arrasto (`fase9-b`)
- No espaço vazio do seu campo, segurar e arrastar desenha um retângulo roxo; as suas cartas que ele **toca** ficam
  selecionadas (Shift soma). Arrastar uma selecionada move o grupo inteiro com a precisão do 1.3 (o grupo para inteiro
  na borda); arrastar uma não selecionada move só ela. Clique no vazio ou Esc desfaz. O arraste só começa depois de
  7 px: clique, virar terreno para pagar, combate por cliques e o menu do clique direito continuam iguais. O servidor
  aceita as posições do grupo numa mensagem só (`posicao` com `lista`, tudo ou nada).

### 2.5 Fundo de cada jogador (`fase9-d`)
- Antes: recorte de 626×364 da imagem local, ampliado, com `blur(1px)`. Nenhuma fonte passa de 745 px de largura (a png
  da Scryfall é 745×1040; o `art_crop` tem 626×457). Escolhido: recorte na largura toda da png da impressão com a arte
  sem borda ou estendida (744×442; Quintorius 744×378), guardado em `gerado/artes/` (2,5 MB, origem de cada um em
  `fontes.json`; script `ferramentas/baixar-artes.ts`). Servido em `/img/<id>/fundo` (mesma sessão das outras imagens),
  ampliado para 2560 px com lanczos3 e nitidez leve; saiu o `blur`.

### 3.1 Som da troca de turno (`fase9-d`)
- "Seu turno": trompas subindo (ré, sol, ré agudo) com tímpano e sino, em sol como a música, que abaixa um instante.
  "Turno de um adversário": dois toques de harpa descendo, abafados (cerca de 8 dB mais baixo e metade da duração). Cada
  navegador decide pelo próprio assento (`cliente/src/somTurno.ts`); em Configurações, cada som liga e desliga separado,
  com botão de ouvir. Testes em `testes/fase9-sons.test.ts` (partida de 4 assentos: a cada turno novo, só o jogador do
  turno ouve "seu turno" e os outros três o de adversário).

### 3.2 Música (`fase9-d`)
- "The Snow Queen", de Kevin MacLeod (incompetech.com), licença CC BY 4.0, conferida na página da obra; registro em
  `cliente/src/musica/CREDITOS.md`, no `LEIAME.md` e na janela de Configurações. MP3 de 4,2 MB servido pelo nosso
  servidor. Laço sem corte: Web Audio, com a volta seguinte marcada no relógio do áudio, um compasso depois do acorde
  final, por cima da cauda. Só começa depois do primeiro clique (sem erro no console). Começa ligada em 40%; volume
  separado dos efeitos, guardado no navegador e ajustável no meio da partida.

### 4. Níveis de dificuldade
- Níveis em `bots/niveis.ts`: Iniciante, Fácil, Intermediário (padrão), Difícil, Cartomante, Magic God. Um só bot
  (`bots/heuristico.ts`) com parâmetros por nível:
  - Iniciante: regras (terreno; a criatura ou permanente mais cara que der; instantânea quase nunca; feitiço às vezes),
    nunca age no turno dos outros, ataca só quando o oponente não tem como bloquear aquela criatura, bloqueia para não
    morrer (o bloqueio "de graça" ele só vê 30% das vezes); erra como quem está começando: esquece de jogar o terreno
    (15% por fase principal), conjura outra coisa que não a melhor (25%), feitiço só às vezes (25%), esquece ataques
    (30%) e às vezes erra o alvo da remoção (35%, sempre numa coisa de oponente).
  - Fácil: o bot de antes com 8 simulações, às vezes a 2ª ou 3ª melhor jogada (25%), vantagem mínima 1,2 em vez de 0,5,
    responde só 30% das vezes, esquece ataques (15%).
  - Intermediário: o bot das fases anteriores (24 simulações, 2 s), agora decidindo no mundo do bot.
  - Difícil: as candidatas são jogadas nos **mesmos mundos sorteados** e vale a média (a diferença entre elas não depende
    da sorte do sorteio); variações de alvo; combate simulado (opções de ataque e de bloqueio comparadas até o fim do
    combate, com os oponentes bloqueando pela heurística); age no combate (truque depois dos bloqueios, remoção no
    atacante) com horizonte até o fim do combate; nas simulações os oponentes respondem com a remoção ou o anular que
    tiverem na mão sorteada; em 4 jogadores pesa mais quem está ganhando (avaliação e alvo de ataque); papel das cartas
    (`bots/papeis.ts`: remoção, anular, compra, rampa, varredura, tutor, proteção, fichas, pelo texto Oracle) na
    avaliação; escolhas (sacrificar, alvos de efeito, sim ou não) comparadas em simulação no lugar das palavras do texto.
  - Cartomante: Difícil mais a leitura da mesa (`bots/memoria.ts`): lembra das cartas que voltaram de uma zona pública
    para a mão e das reveladas que foram para a mão, até aparecerem de novo; no fim do turno de cada oponente, "não jogou
    terreno com cartas na mão" (o sorteio põe só não-terrenos nas cartas que já estavam na mão, 85%) e "passou o turno
    sem conjurar nada, com 2+ terrenos desvirados e cartas na mão" (põe uma instantânea ou lampejo na mão sorteada,
    65%). Só lê o que é público. Como a leitura sozinha não deu vantagem nos testes (contra bots, que não guardam mana
    de propósito, "passou com terrenos desvirados" quase sempre era falso), a Cartomante também olha mais longe que o
    Difícil: na fase principal antes do combate do próprio turno, cada jogada é simulada até o fim do combate (ataques
    e bloqueios pela heurística), e usa 6 mundos em vez de 3 (até 180 simulações, dentro dos 3 s).
  - Magic God: Cartomante mais a busca de `bots/busca.ts` (Monte Carlo com informação oculta): pré-seleção rasa como a da
    Cartomante, com mais mundos (8) e até metade do tempo; depois as 3 melhores candidatas e "passar" são jogadas até o
    fim do turno seguinte em mundos sorteados a cada rodada (todos jogam terreno e mágicas, atacam e bloqueiam com
    políticas rápidas, os oponentes respondem com a mão sorteada). A escolha da pré-seleção só muda se as jogadas longas
    mostrarem outra opção melhor com folga (diferença pareada por rodada acima de um erro-padrão e de 0,5).
- Threads de pensar (`servidor/pensadores.ts`, `servidor/pensador.ts`): 2 threads para todas as salas juntas, criadas ao
  subir o servidor; fila quando há mais bots pensando que threads livres; teto de 448 MB de heap por thread. A linha
  principal manda o checkpoint mais recente e as entradas; a thread refaz a partida (`bots/pensar.ts`) e guarda o
  checkpoint da última prioridade de cada sala para refazer pouco na próxima. Enquanto o bot pensa, a sala atende as
  mensagens e mostra o que mudou (paradas, posições). Decisões óbvias e o plano da jogada escolhida saem na linha
  principal, na hora.
- Reprodutibilidade e desfazer: continuam vindo das entradas gravadas (as respostas dos bots entram no banco como as das
  pessoas); o tempo-limite e as threads não mudam isso. Respostas pensadas para uma partida que mudou no meio (desfazer,
  concessão) são descartadas (geração da sala). Depois de reiniciar o servidor, a memória da Cartomante recomeça vazia.
- Nomes (`servidor/nomes.ts`, 50 nomes): sorteado quando o bot entra no assento, sem repetir outro bot nem uma pessoa da
  sala (se uma pessoa entra com o nome de um bot, o bot ganha outro); trocar deck ou nível mantém o nome. Nível e nome
  ficam salvos com a sala. No saguão e na mesa: "ROBSON · Cartomante".
- Motor: só desempenho, sem mudar regra (`motor/chars.ts`): modelo das características impressas por carta e face,
  índice dos efeitos de cópia por versão, e a passada das camadas não calcula objetos fora do campo sem estáticas que
  funcionem ali. Uma jogada até o fim do turno seguinte em 4 jogadores caiu de ~156 ms para ~80 ms.
- Calibração (`node bots/comparar.ts`, partidas 1v1 espelhadas: cada semente duas vezes com os assentos trocados; 6
  processos). Rodadas curtas de 40 partidas antes das baterias finais:
  - 1ª rodada: Fácil 23 × 16 Iniciante (57,5%); Intermediário 26 × 14 Fácil (65%); Difícil 25 × 15 Intermediário
    (62,5%); Cartomante 18 × 22 Difícil (só a leitura da mesa e mais simulações não bastaram).
  - 2ª rodada (Iniciante errando mais; Cartomante olhando até o fim do combate; leitura de instantânea mais exigente):
    Fácil 22 × 17 Iniciante (55%); Cartomante 22 × 18 Difícil (55%).
  - 3ª rodada: Iniciante sem os ataques "seguros" e quase sem o bloqueio de graça; Cartomante com 6 mundos; Magic God
    com a pré-seleção no mínimo igual à da Cartomante.
- Testes: `testes/fase9-servidor.test.ts` (nomes sorteados diferentes e nunca o de uma pessoa; trocar nível ou deck mantém
  o nome; nível e nome salvos com a sala depois de reiniciar, com a partida em andamento; fila com uma thread; a mesa
  respondendo enquanto um Magic God pensa e o aviso "pensando").
