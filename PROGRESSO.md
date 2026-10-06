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

