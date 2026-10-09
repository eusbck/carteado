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
- 07/10/2026 (noite): decks do Moxfield pelo link (importar e atualizar), pedido na conversa; plano aprovado em
  `~/.claude/plans/fa-a-com-que-seja-snuggly-hummingbird.md`.
- 08/10/2026: completar o deck do Jace (64 cartas), importar e completar o deck da Gisa (59 cartas) e conferir a
  importação por link. Trabalho dividido com 7 subagentes em worktrees (`../jogo-wt-a` a `../jogo-wt-g`, branches
  `cartas-a` a `cartas-g`), juntados no `main`.
- 08/10/2026 (noite): o verso das cartas (mão dos oponentes, grimório, cartas viradas para baixo) passa a ser o verso
  clássico do Magic enviado pelo Caio (`cliente/src/imagens/verso.webp`, 500×698, sem a borda preta da imagem original),
  no lugar do verso desenhado em CSS.
- 08/10/2026 (noite, continuação), pedidos na conversa:
  - o nome na tela passa a ser **Magic Commander** (título da página, barra lateral, entrada, início e Decks; LEIAME,
    README, HOSPEDAGEM e a linha do servidor). As chaves do navegador (`commander-da-mesa:*`) e o nome do pacote ficam
    como estavam, para ninguém perder a sala e as preferências guardadas;
  - o ícone é o "M" do logo clássico do Magic, recortado do verso da carta (`cliente/src/imagens/logo-m.png` na marca e
    `cliente/public/favicon.png`, no lugar do `favicon.svg`);
  - o **Registro** virou uma janela do menu, como Paradas e Configurações (`cliente/src/mesa/Registro.tsx`): separado
    por turno, com a regra de cada linha, nome de quem jogou na cor do jogador e uma busca;
  - no lugar dele, na barra lateral, um **chat** da sala (`cliente/src/mesa/Chat.tsx`; mensagens `chat` no protocolo).
    O servidor guarda as últimas 200 mensagens com a sala (sobrevivem a reiniciar e continuam numa partida nova),
    manda a conversa inteira a quem entra ou volta, limpa o texto (uma linha, até 280 caracteres) e limita o ritmo
    (5 mensagens a cada 5 s por pessoa). Barra recolhida: cada mensagem nova aparece por 6 s na mesa (clicar abre o
    chat) e o botão de abrir mostra quantas não foram lidas. Som novo "mensagem no chat" nas Configurações.
    "Recolher" é agora o único botão que recolhe a barra (antes era o Registro); a preferência guardada é a mesma.
  - testes: `testes/chat.test.ts` (entrega, conversa para quem entra, texto limpo, ritmo, 200 guardadas, reinício);
    `ferramentas/e2e.ts` confere o chat entre dois navegadores (com a barra recolhida e depois do reinício do
    servidor) e lê o registro pela janela; `ferramentas/capturas.ts` fotografa o chat, a janela do registro (com a
    busca) e a barra recolhida.
  - verificado: `npm run typecheck` sem erros; `npx vitest run` com 657 arquivos e 1776 testes passando;
    `node ferramentas/e2e.ts` passou inteiro; `CAPTURAS_SO=janelas node ferramentas/capturas.ts` passou, com as
    capturas novas (44 a 44d) conferidas.
- 08/10/2026 (noite, continuação), pedidos na conversa:
  - **cores da identidade do Magic** (a partir de uma resposta do ChatGPT que o Caio compartilhou: grafite, ouro
    envelhecido e laranja mítico na base, cores de mana para o que é do jogo). Tokens novos no `:root` do
    `estilo.css`: `--acao` (laranja mítico #e85d28: botões principais, jogáveis, foco, etapa atual; era o verde),
    `--ouro` (#d6a85b: atenção, escolhido, decisão pendente; era o amarelo), `--positivo` (verde de mana: ganhar
    vida, marcadores +1, aceitar, deck pronto), `--vermelho` carmim (perigo, dano, ataque, distinto do laranja),
    neutros quentes (carvão #121113, grafite, texto marfim #f2e8d5). As cores fixas em rgba viraram `color-mix`
    dos tokens, então a paleta mora só no `:root`. Jogadores: você em ouro, os outros em azul, verde e violeta
    (cores de mana). Setas de combate e brilho de vida/dano acompanham (`Setas.tsx`, `Efeitos.tsx`);
  - **wallpapers no fundo** das telas de fora da mesa (entrada, início, saguão e Decks): 24 imagens escolhidas
    da busca do Brave ("wallpaper magic the gathering"), escuras e nos tons da identidade, sem texto por cima,
    recortadas para 1920×1080 em WebP (2,8 MB) em `cliente/src/imagens/fundos/` com as fontes em `FONTES.md`.
    `cliente/src/FundoArte.tsx`: ordem embaralhada guardada no navegador (passa por todas antes de repetir),
    troca a cada minuto com fade e um zoom lento; opacidade .45 com vinheta, e os painéis dessas telas
    (`.janela`) ficaram translúcidos (62%, com desfoque leve) para a imagem aparecer, a pedido do Caio. Fica fora da mesa.
  - **fundo da mesa de cada deck** em alta: o Caio mandou 9 imagens (1672×941, feitas no ChatGPT, uma por
    comandante), porque o fundo antigo era a arte da carta (até 745 px) ampliada para 2560 px e ficava estourado.
    Viraram `gerado/fundos/<id da imagem do comandante>.webp` (qualidade 88, sem ampliar; `fontes.json` liga cada
    uma ao deck e ao arquivo original). `servidor/imagens.ts` serve esse fundo antes de tudo; a miniatura dos
    decks no saguão continua a arte oficial. A URL do fundo ganhou `?v=2` (`VERSAO_FUNDO` em `cliente/src/cartas.ts`)
    porque as imagens vão com cache imutável de 7 dias. Deck novo sem fundo próprio continua com a arte ampliada.
  - **tela inicial em passos** (`telas/Inicio.tsx`): o nome, depois criar ou entrar, depois só os campos daquela
    escolha; cada passo entra deslizando (para frente ou para trás), o painel acompanha a altura, Enter avança,
    Esc volta, o foco vai para o campo de cada passo; com o nome guardado começa na escolha.
  - **saguão em passos** (`telas/Saguao.tsx`), a etapa no servidor (`SalaPublica.etapa`, mensagem `etapa` só do
    anfitrião; avançar exige os lugares cheios; um lugar que vaga volta a sala para os lugares, os decks
    escolhidos ficam; `iniciar` não exige a etapa, para os testes e ferramentas antigas). Lugares (o anfitrião
    põe bots com um deck sorteado e o nível), regras (os outros acompanham), decks (clicar abre a **prévia**,
    `telas/PreviaDeck.tsx`, com a lista de `GET /api/catalogo/<id>/cartas` por tipo e a carta grande; o anfitrião
    troca o deck dos bots).
  - **entrada épica** (`telas/Entrada.tsx`, `Atmosfera.tsx`): boas-vindas aos feiticeiros com abertura em
    sequência (o M em brasa com halo, "Magic Commander" em Cinzel dourada, as cinco joias de mana do verso
    acendendo, o texto, a senha), brasas e ciscos verdes subindo (a luz e a vida nas trevas); títulos das primeiras
    telas em Cinzel; tudo parado com "reduzir movimento". As trepadeiras com folhas que cresciam dos cantos saíram a
    pedido do Caio (gostou das partículas, não das folhas).
  - **avatares na mesa** (pedido com especificação, retratos feitos pelo Caio): `servidor/avatares.ts` (catálogo
    dos 9, aura de cada um, retrato automático pelo comandante), `cliente/src/imagens/avatares/<id>.webp` (512 px
    com alfa, recortados da margem transparente), `cliente/src/avatares.ts`, componente `mesa/Avatar.tsx` (medalhão
    com aura, moldura dourada, a cabeça passando por cima da moldura com duas cópias do retrato, vida embaixo com a
    classe `.vida-n` que os efeitos e as setas já usam). Na área: oponente no meio em cima, você no meio embaixo,
    acima da mão; a vida separada do canto saiu (o dano de comandante e a reserva ficam). A arrumação padrão ganhou
    um vão (`Vao` em `mesa/arrumacao.ts`) para não pôr cartas sob o medalhão. O servidor guarda `avatar` por assento
    (mensagem `avatar`, só ids do catálogo; null volta ao automático). Escolha no saguão (`telas/EscolhaRetrato.tsx`),
    guardada no navegador e reenviada ao entrar numa sala. Reação ao dano e brilho de quem tem o turno; tudo com
    "reduzir movimento". No 4 jogadores cada oponente tem o seu, menor. Testes: `testes/avatar.test.ts`.
  - **área de baixo em camadas** (pedido do Caio, em várias rodadas): o avatar inteiro à vista na base (a vida
    centralizada embaixo da moldura, a 6 px da borda), as cartas da mão descendo até 55% da moldura e
    passando por TRÁS dele (o Caio preferiu o retrato com a vida na frente: a carta sob o mouse sobe por cima de tudo e
    o zoom lateral mostra a carta inteira), o leque em arco (até ~52° de abertura, pontas descendo 34% da largura da
    carta) e o rótulo "Mão (X)" centralizado acima do leque, que some com o mouse na mão. A mão não forma camada
    própria (sem transform nem z-index): cada carta disputa a camada com o avatar, que não bloqueia cliques. O seu
    avatar fica fora do campo, então a arrumação só deixa o vão no do oponente.
  - a carta da mão sob o mouse sobe na direção da própria inclinação (endireitar girava em torno de um ponto bem
    abaixo dela e a jogava para o lado, saindo de baixo do cursor e piscando), com uma faixa invisível embaixo que segura
    o mouse; selos de força e resistência fora das cartas da mão; o leque desconta o quanto as pontas avançam (cobria o
    grimório em 1280); prévia com as categorias em três colunas equilibradas; laranja que sobrava em seleção e rótulos
    (aba e botão ativos, caixas, fila, rótulos de seção) foi para o ouro; nome do oponente para antes do medalhão; o
    wallpaper 23 (marca do site) recortado de novo; roteiro de capturas: terreno básico primeiro, seleção começando num
    ponto vazio e terminando abaixo da criatura de cima, espera antes das fotos do saguão.
  - **avatar do oponente no canto** de cima à direita da área dele (onde ficava a vida; o dano de comandante e a reserva
    ficam à esquerda do medalhão, e a arrumação deixa o canto livre). O seu continua no meio da base; nas Configurações,
    "Seu retrato na mesa" (preferência `avatarCanto`, guardada no navegador) põe o seu no canto de cima à direita do seu
    campo, abaixo da faixa de fases e à esquerda da coluna de decisões, com a mão voltando a ficar rente à base.
  - **wallpapers sobrepostos**: na troca a nova entrava por cima da anterior e as duas, semitransparentes, apareciam
    uma através da outra; agora a anterior some em fade e sai da página.
  - revisão da bateria de capturas por um subagente: a prévia do deck ficava presa no painel do saguão (o
    `backdrop-filter` do painel prende o fundo fixo): as janelas agora vão para o `<body>` por portal (`Janela.tsx`);
    o que está escolhido (opção ativa, deck escolhido, "anfitrião", primeiro da fila) passou do laranja para o ouro;
    a fase que contém a etapa atual ficou neutra; seis wallpapers com logo no canto foram recortados de novo.
  - a sala podia ficar sem anfitrião quando todas as pessoas saíam (achado do subagente dos testes): quem senta numa
    sala cujo anfitrião não é uma pessoa passa a conduzir.
  - da pasta "bugs a corrigir" do Caio: o destaque da etapa atual do saguão englobava o tracinho de ligação (agora
    fica fora da pílula); o saguão tinha altura mínima e sobrava um vão antes do rodapé; a prévia do deck passava
    da tela e rolava para o lado (a lista em colunas com altura fixa transbordava; agora é uma grade que rola só na
    vertical, dentro de um modal que cabe na tela).
  - **ícone em brasa**: o M passou do azul do verso para o vermelho-alaranjado com bordas amarelas da imagem que o
    Caio mandou (mapa de cores sobre o recorte; `imagens/logo-m.png` com 320 px e o favicon).
  - revisão das capturas por um subagente: hover verde que sobrara nos botões cheios, desativados ilegíveis (agora
    cinza), "Aceitar" do desfazer em verde (`.botao.positivo`), etapas da faixa em neutro, subtítulo do seletor,
    neutros frios que sobraram, `.mini` da pilha colidindo com a janela da entrada, topo da pilha em ouro,
    linha de ajuste manual do registro distinta do nome em ouro.

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

## Fase 9: ajustes depois das partidas contra bots — feita em 07/10/2026, falta fechar a bateria de cima (4.5)

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
    e bloqueios pela heurística); usa 6 mundos em vez de 3 nas jogadas (até 180 simulações) e compara as opções de
    ataque, bloqueio e escolhas em 5 mundos em vez de 3, tudo dentro dos 3 s.
  - Magic God: Cartomante mais a busca de `bots/busca.ts` (Monte Carlo com informação oculta): pré-seleção rasa como a da
    Cartomante, com mais mundos (8, até 240 simulações) e até 40% do tempo; depois as 3 melhores candidatas e "passar"
    são jogadas até o fim do turno seguinte em mundos sorteados a cada rodada (todos jogam terreno e mágicas, atacam e
    bloqueiam com políticas rápidas, os oponentes respondem com a mão sorteada), até o prazo. A escolha da pré-seleção
    só muda se as jogadas longas mostrarem outra opção melhor (diferença pareada por rodada acima de 0,3 mais meio
    erro-padrão, com pelo menos 3 rodadas).
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
  - 3ª rodada (Iniciante sem os ataques "seguros" e quase sem o bloqueio de graça; Cartomante com 6 mundos; Magic God
    com a pré-seleção no mínimo igual à da Cartomante): Fácil 31 × 5 Iniciante (77,5%, 4 empates); Intermediário 26 ×
    14 Fácil (65%); Magic God 15 × 9 Cartomante (62,5%, 24 partidas); Cartomante 20 × 20 Difícil.
  - 4ª rodada: a Cartomante ganhou uma versão leve da busca longa do Magic God, e o combate da Cartomante e do Magic God
    passou a ser comparado em 5 mundos (o Difícil, 3): Cartomante 26 × 14 Difícil (65%), mas o Magic God ficou parelho
    com ela (7 × 7; depois de dar mais rodadas longas ao Magic God, 10 × 14).
  - 5ª rodada (experiência): Cartomante sem a busca longa, mantendo o combate em 5 mundos: Cartomante 25 × 15 Difícil
    (62,5%) e Magic God 15 × 9 Cartomante (62,5%). A vantagem da Cartomante vinha do combate comparado em mais mundos
    (e de olhar até o fim do combate), não da busca longa, que fica só com o Magic God. É a configuração final.
  - Tempo: as comparações de combate passaram a parar no prazo (uma decisão da Cartomante tinha chegado a 6 s).
- Testes: `testes/fase9-servidor.test.ts` (nomes sorteados diferentes e nunca o de uma pessoa; trocar nível ou deck mantém
  o nome; nível e nome salvos com a sala depois de reiniciar, com a partida em andamento; com Iniciante, Difícil,
  Cartomante e Magic God, o bot aceita o desfazer e a partida refeita depois de reiniciar é igual; fila com uma thread;
  a mesa respondendo enquanto um Magic God pensa, com a linha principal livre, e o aviso "pensando").

### Conferência da fase 9
- Junção: as quatro branches dos subagentes entraram no `main` (com sua permissão); conflitos só em `Mesa.tsx` (imports),
  `ferramentas/capturas.ts` e `ferramentas/cenarios.ts` (blocos de cada um, mantidos todos). O `bloquear` corrigido no
  `fase9-a` entrou na versão nova do bot sem perda.
- Suíte inteira depois da junção: 521 arquivos e 1170 testes passando; na rodada final, com os últimos ajustes, 1174
  testes passando; `npm run typecheck` sem erros.
- `ferramentas/capturas.ts`: rodada completa com 94 capturas, conferidas imagem por imagem (por um subagente). Correções
  que saíram da conferência: o roteiro ficou mais robusto depois da junção (mulligan quando a mão inicial não tem
  terreno, resposta às janelas de escolha, ponto vazio de verdade no campo); no saguão o nome do bot não é mais cortado
  ("UBIRAJARA · Intermediário"); a faixa de fases encolhe antes por causa do botão novo; em 4 jogadores a 1280 o
  "Exílio" dos oponentes saía cortado; o aviso "Sua vez de…" quebra a linha em vez de cobrir a coluna; os avisos de
  jogada não bloqueiam cliques e somem enquanto a janela de escolha está aberta (a mesa está esperando você, e eles
  cobriam cartas da janela); "ROBSON está pensando…" continua na faixa a 1280 com a barra aberta.
- `ferramentas/e2e.ts`: passou inteiro (1v1 com reinício do servidor, 4 pessoas, uma pessoa com três bots).
- `ferramentas/humano-e-bots.ts` 1v1 contra um Magic God, pelas threads de pensar: fim no turno 20, nenhum clique extra
  no turno do bot, nenhum vazamento; o Magic God pensou 67 decisões, média 2,5 s e máximo 6,3 s, sem espera na fila;
  pico de memória do processo 303 MB (heap das threads de pensar 89 MB).
- `ferramentas/humano-e-bots.ts` 4 jogadores (pessoa, Magic God, Cartomante, Difícil): fim no turno 57, venceu o Magic
  God; nenhum clique extra no turno dos bots, nenhum vazamento. Decisões pensadas: Difícil 102 (média 0,9 s, máximo
  3,0 s), Cartomante 110 (média 1,5 s, máximo 3,1 s), Magic God 160 (média 3,3 s, máximo 6,6 s); nenhuma espera na fila;
  pico de memória do processo 449 MB (heap das threads 94 MB).

### 4.5 Força e custo dos níveis (baterias finais)
1v1, 100 partidas por par com sementes fixas (`final-2p-0` a `final-2p-49`), cada semente jogada duas vezes com os
assentos trocados (mesmos decks e embaralhamento), em 6 processos (metade das threads), sem limite de turnos além do
padrão de 40 (empate):

| Par | Vitórias do nível de cima | do de baixo | Empates | Meta (≥ 60%) |
|---|---|---|---|---|
| Fácil × Iniciante | 83 | 13 | 4 | ✓ |
| Intermediário × Fácil | 61 | 39 | 0 | ✓ |
| Difícil × Intermediário | 62 | 38 | 0 | ✓ |
| Cartomante × Difícil | 39 | 34 | 0 | ✗ 53% em 73 partidas (interrompida) |
| Magic God × Cartomante | — | — | — | não rodou (calibração: 15 × 9, 62,5% em 24) |

A bateria final de cima foi interrompida pelo Claude Code com o sistema sem memória (6 processos com Cartomante e
Magic God juntos, mais o resto do computador; sobraram 4,5 GB livres de 15,7 GB): Cartomante × Difícil parou em 73 de
100 partidas, e Magic God × Cartomante e a mesa de 4 jogadores não começaram. Na calibração (40 partidas) a Cartomante
tinha feito 25 × 15 (62,5%); com 73 partidas na final, 53%: a vantagem dela sobre o Difícil existe, mas é menor que a
meta. A primeira tentativa desta bateria, com a suíte e outra medição rodando junto, estava 8 × 8 e foi descartada (os
níveis altos dependem de tempo e perdem força com a máquina ocupada).

Tempo por decisão nas baterias (um processo por partida, sem as threads do servidor):

| Nível | Média (todas) | Média (as que pensaram) | Máximo | Teto do nível |
|---|---|---|---|---|
| Iniciante | 4,7 ms | 16 ms | 189 ms | 0,3 s |
| Fácil | 15,8 a 30 ms | 61 a 109 ms | 1,9 s | 0,5 s |
| Intermediário | 31 a 36 ms | 107 a 124 ms | 2,5 s | 2 s |
| Difícil | 139 ms | 466 ms | 3,9 s | 3 s |
| Cartomante | 296 ms | 953 ms | 6,1 s (antes da trava no combate) | 3 s |
| Magic God | 658 ms | 2,6 s | 6,5 s | 6 s |

(Cartomante e Magic God: da calibração de 40 e 24 partidas da 5ª rodada, a mesma configuração da final.)

Processador e memória numa partida de 4 jogadores com três Magic Gods, pelo servidor e as threads de pensar
(`node ferramentas/humano-e-bots.ts medir3mg 4p magicgod,magicgod,magicgod`; fim no turno 49, 20 min, nenhum clique
extra, nenhum vazamento):
- processador do processo inteiro: em média 99% de uma thread, 8% das 12 threads do notebook (numa mesa só um bot pensa
  por vez, então a segunda thread fica livre para outra sala);
- memória do processo: pico de 365 MB; média por quarto da partida 277 → 320 → 358 → 339 MB (sobe no começo, com as
  cartas carregadas nas threads, e para de crescer); heap das threads de pensar no máximo 105 MB, longe do teto de
  448 MB por thread;
- Magic God: 295 decisões pensadas, média 4,0 s, máximo 6,3 s, nenhuma espera na fila.

Os números de partida ficam como estão (2 threads, tetos de 0,3/0,5/2/3/3/6 s): a medição não mostrou necessidade de
menos, e mais tempo deixaria os bots altos lentos para jogar contra.

"Pensaram": decisões com mais de 5 ms (as óbvias saem antes). O teto é conferido entre uma simulação e outra; o máximo
passa dele quando uma simulação sozinha é longa (campo cheio) e com a máquina ocupada pelas baterias. No servidor, pela
partida de 4 jogadores acima: Difícil 0,9 s de média, Cartomante 1,5 s, Magic God 3,3 s.

### Recapitulação da fase 9
- Feito:
  - 1.1: a mesa só espera você nas paradas do seu turno (padrão novo), "Mágicas dos oponentes" à vista na faixa, aviso
    grande quando a mesa espera você fora do seu turno, "ROBSON está pensando…".
  - 1.2: o pagamento automático não vira mais terrenos que não pagam nada (a sobra ia para a reserva); o literal "terreno
    que entra virado gera mana" não se reproduziu.
  - 1.3 e 2.4: a carta fica exatamente onde foi solta, pelo ponto pego; seleção por arrasto e grupo movido junto.
  - 1.4: auditoria dos oito casos de bloqueio; corrigidos a divisão de dano padrão e três falhas do bot ao bloquear.
  - 1.5: os bots decidem num mundo em que o escondido é sorteado de novo; teste que pega vazamento, para os seis níveis.
  - 2.1 a 2.3: janelas de escolha no meio da mesa, no formato de cada escolha e recolhíveis; zoom centralizado; registro
    escondido.
  - 2.5: fundos na melhor resolução que existe (745 px de largura), guardados no repositório, ampliados com nitidez.
  - 3.1 e 3.2: dois sons de turno bem diferentes, cada um ligável; música "The Snow Queen" (Kevin MacLeod, CC BY 4.0) em
    laço sem corte, com volume próprio.
  - 4: seis níveis, threads de pensar com limite global de 2, nomes sorteados, nível no saguão e na mesa, medições.
- Verificado: ver "Conferência da fase 9" e "4.5" acima. Três dos cinco degraus da escada passaram da meta em 100
  partidas; Cartomante × Difícil ficou em 53% (73 partidas) e Magic God × Cartomante só tem a calibração (62,5% em 24).
- Precisa de você:
  - Decidir se rodo de novo a bateria de cima (Cartomante × Difícil, Magic God × Cartomante e a mesa de 4 jogadores)
    com menos processos (4 em vez de 6, para caber na memória; leva umas 3 a 4 horas) e se continuo reforçando a
    Cartomante, que hoje fica só um pouco acima do Difícil.
  - Jogar e sentir o posicionamento e a seleção por arrasto (pelo canto e pelo meio, de pé e virada, perto das bordas,
    Shift, mover grupo, Esc e clique no vazio) e dizer se o "buraco" que a carta posta deixa na arrumação incomoda.
  - Uma partida contra cada nível, do Iniciante ao Magic God, para dizer se a escada ficou bem distribuída (nas baterias,
    o Fácil ganhou 83% do Iniciante: a diferença ali é a maior).
  - Ouvir os dois sons de turno e a música (volume inicial de 40%, emenda do laço).
  - Por padrão a mesa não para mais no turno dos outros: se quiser responder às mágicas dos oponentes, ligue "Mágicas dos
    oponentes" na faixa.
  - Se voltar a ver mana de um terreno virado pagando à mão na mesa real, dizer qual terreno e o nível de auxílio.
  - Partidas abertas antes desta atualização podem não retomar (o pagamento automático mudou): termine ou recomece.
  - As pastas `../jogo-wt-a` a `../jogo-wt-d` (worktrees dos subagentes, já juntadas) podem ser apagadas. Dentro delas,
    `node_modules` é um atalho (junção) para o do `jogo`: tire o atalho primeiro, com `cmd /c rmdir ..\jogo-wt-a\node_modules`
    (apaga só o atalho), e depois `git worktree remove --force ../jogo-wt-a` (o mesmo para b, c e d).

## Decks do Moxfield: importar pelo link e atualizar — 07/10/2026

Pedido na conversa: puxar decks do Moxfield pelo link (ex.: `https://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg`) e
atualizar um deck quando ele mudar lá, trocando só as cartas que mudaram. Decisões suas:
- tela **Decks** na própria mesa, para qualquer pessoa que entrou com a senha;
- o deck **só entra no saguão completo** (todas as cartas com regras); o que falta fica "em preparação";
- quem implementa as cartas que faltam é o Claude Code, **quando você pedir** ("complete os decks em preparação");
- atualização com cartas novas fica guardada e o deck segue jogável com a lista antiga até elas ficarem prontas;
- as 64 cartas novas do deck do link (Jace, Multiverse Architect) ficam para um pedido separado.

Como ficou:
- **Fonte dos decks: `decks/`** (no repositório). Um arquivo por deck (`<id do Moxfield>.json`) com a lista jogável
  (`atual`) e a que espera cartas (`preparacao`), o link, a ordem fixa e as datas. Os 7 decks de `../cartas` foram
  migrados (`node ferramentas/decks.ts migrar`, ordem 0 a 6) e também podem ser atualizados. As cartas que `../cartas`
  não tem ficam em `decks/cartas.json` (mesmo formato de `../cartas/data`, só cresce) e os rulings delas em
  `decks/rulings.json`; as imagens, em `dados-locais/imagens/` (fora do git; `decks.ts imagens` baixa de novo).
- **`gerado/`** continua sendo o que o motor lê, agora gerado de `../cartas` + `decks/` (`servidor/catalogo/gerar.ts`;
  `ferramentas/importar.ts` virou um atalho para ele). `gerado/cartas.json` guarda toda carta que já esteve num deck
  (partidas salvas nunca perdem uma carta); `gerado/decks.json` só os decks jogáveis, na ordem fixa. Logo depois da
  migração, `git diff gerado/` saiu vazio.
- **Servidor** (`servidor/catalogo/`): `moxfield.ts` (link e API v3, com a v2 se a v3 não achar; usa comandante e deck
  principal, recusa parceiros, companheiro e zonas que o jogo não tem), `scryfall.ts` (cartas desconhecidas em lotes de
  75, impressão em português pela mesma regra do coletor, rulings, fichas que a carta cria, imagens), `validar.ts`
  (CR 903.3 e 903.5 antes de gravar; banidas viram aviso), `tarefas.ts` (verificar → prévia com token por 30 min →
  confirmar; uma tarefa por vez; uma falha no meio não muda o arquivo do deck), `catalogo.ts`, `trava.ts` (a tela e a
  linha de comando nunca gravam juntas), `rotas.ts` (`/api/catalogo`, só com sessão, limite por endereço) e
  `artes.ts` (extraído de `baixar-artes.ts`: a importação baixa a arte do comandante).
- **Ao vivo:** confirmar uma lista pronta troca os decks do saguão na hora (`Gerente.trocarDecks`) e avisa as telas
  abertas (mensagens `decks` e `catalogo` no WebSocket). O andamento e a prévia chegam pelo WebSocket (rotas que
  esperassem a importação inteira esbarrariam no prazo do túnel).
- **Partidas guardam as listas com que começaram** (`partida.listas` em `servidor/salas.ts`); refazer depois de um
  reinício, o desfazer e as threads dos bots usam essa cópia. Salas salvas antes disso recebem a lista atual ao subir
  (e na linha de comando, antes de trocar uma lista). Deck que saiu do saguão não começa partida.
- **Ao subir**, o servidor põe no saguão as versões em preparação cujas cartas ficaram prontas (implementadas desde a
  última vez); `node ferramentas/decks.ts gerar` faz o mesmo pela linha de comando.
- **Tela Decks** (`cliente/src/telas/Decks.tsx`, botão "Decks" no início): cartões com a arte do comandante e o estado
  (No saguão, Em preparação N/M, Atualização esperando N cartas), campo do link, andamento, prévia (comandante, cartas
  com regras, o que falta, entram e saem, erros de regra e avisos), detalhes de cada deck e "Atualizar". O saguão
  ordena os decks por nome.
- **Linha de comando** `node ferramentas/decks.ts`: `migrar`, `gerar`, `pendentes [--json]` (o que falta implementar,
  com Oracle, rulings, fichas, nome do arquivo e alerta de layout que o motor ainda não tem), `importar <link>
  [--confirmar]`, `importar --arquivo resposta.json` (quando o Moxfield recusar o servidor), `atualizar <id|todos>
  [--confirmar]` e `imagens`. `rulings.ts`, `ficha-carta.ts`, `rulings-padrao.ts`, `rulings-terrenos.ts` e
  `rascunho.ts` passaram a enxergar as cartas importadas. Passo a passo em `cartas/COMO-IMPLEMENTAR.md`.
- Achados no caminho: o Moxfield recusa (403) o `fetch` do Node (os cabeçalhos de navegador que ele põe sozinho), mas
  aceita o mesmo pedido honesto pelo `node:https`, como já aceitava o coletor em Python; o Scryfall responde 403 a um
  User-Agent com acento. O transporte é o `node:https` e o User-Agent é só ASCII.
- Testes: `testes/decks-teste.json` é a cópia congelada da lista de decks de hoje, usada pelos testes que jogam
  partidas com semente (atualizar um deck de verdade não muda esses resultados); novos em `testes/catalogo/` (rede,
  Moxfield, Scryfall, gerar, catálogo, tarefas de ponta a ponta com rede falsa, imagens da pasta extra, dados reais) e
  `testes/listas-salvas.test.ts`.
- Achados na conferência: a janela de resultado sumia se o catálogo fosse recarregado com outra tarefa no servidor
  (o cliente agora guarda o estado da própria tarefa à parte); as imagens das cartas importadas dependiam da pasta do
  banco (`DADOS`) e davam 404 num servidor de teste (agora ficam sempre em `dados-locais/imagens`, ou em `IMAGENS`), e
  imagem que não carrega vira o quadro tracejado. Da revisão das capturas: resumo da prévia em vermelho quando a lista
  quebra uma regra de deck (antes dizia que o deck entraria no saguão), concordância com 1 carta, aviso das zonas que
  ficam de fora, botões "Fechar" iguais, campo e botão da busca alinhados, nome comprido do deck cortado com "…".

Recapitulação (07/10/2026):
- Feito: tela Decks com importar e atualizar pelo link; decks só no saguão quando completos; atualização com carta nova
  guardada; partidas guardam as listas; linha de comando `ferramentas/decks.ts`; os 7 decks migrados para `decks/`.
- Deck do link importado de verdade pela tela: "Multiverse Reforged (Reality Fracture Commander Decklist)", comandante
  Jace, Multiverse Architect, **em preparação: 29 de 93 cartas com regras, faltam 64** (nenhuma com layout que o motor
  ainda não tenha; 21 criam fichas). Prévia em 2 s, confirmação em 112 s (64 cartas, 46 com impressão em português,
  143 rulings, 16 fichas novas, 121 imagens em `dados-locais/imagens`, arte do Jace 744×378). Nenhuma carta, ficha ou
  imagem que já existia em `gerado/` mudou (só acréscimos). Os 7 decks: "Nenhuma carta mudou" no Moxfield.
- Verificado: `npm run typecheck`; suíte inteira com 530 arquivos e 1218 testes passando, antes da importação real e de
  novo no fim (com o deck do Jace em `gerado/` e as correções da revisão);
  `node ferramentas/e2e.ts` passou inteiro; `ferramentas/humano-e-bots.ts` em 1v1 (Intermediário, fim no turno 16) e em
  4 jogadores (Difícil, Intermediário, Fácil; fim no turno 48), sem erro, vazamento nem clique extra; capturas da tela
  Decks (`CAPTURAS_SO=decks node ferramentas/capturas.ts`, 22 imagens em 1280×800 e 1920×1080, conferidas uma a uma
  por um subagente e as corrigidas de novo por mim; nenhuma grava em `decks/` nem `gerado/`).
- Observação: os testes do desfazer em `testes/fase8.test.ts` falham de vez em quando (a semente da partida vem de
  `Date.now()` em `Sala.iniciar`, e algumas mãos sorteadas levam a outra decisão depois de jogar o terreno). Já
  acontecia antes desta mudança (1 em 8 rodadas na versão do último commit). Fica para decidir se vale fixar a semente
  nesses testes.
- Precisa de você:
  - Reabrir a mesa ("Abrir a mesa.cmd") para usar a tela Decks: a mesa que estava aberta continua com o código antigo.
  - Quando quiser o deck do Jace no saguão, pedir para implementar as 64 cartas que faltam
    (`node ferramentas/decks.ts pendentes` mostra a lista).

## Decks do Jace e da Gisa completos — 08/10/2026

Pedido na conversa: implementar as 64 cartas que faltavam no deck do Jace
(`https://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg`), importar e completar
`https://moxfield.com/decks/HAKhAUw1_Xqr0ZxAoQgsCg` e ver se a importação por link aparece e funciona.

Contagem, pelos links do Moxfield (08/10):
- **Multiverse Reforged** (Jace, Multiverse Architect): 100 cartas, 93 nomes (11 básicos), 29 já com regras, faltavam 64.
- **Wretched Ranks** (Ghoulcaller Gisa, precon de Foundations Commander): 100 cartas, 69 nomes (32 Swamps), 10 já com
  regras, faltavam 59. Total: 123 cartas novas.

Importação por link:
- Funciona: o segundo deck foi importado pela própria tela Decks (servidor de teste e Playwright): prévia em 2,3 s,
  confirmação em 78 s, "ficou em preparação: faltam regras para 59 cartas".
- Achado: o botão Decks só existia na tela inicial. Quem abre a mesa com uma sala guardada cai direto nela e não via
  o botão. Agora há um botão **Decks** no saguão (ao lado de "N decks da mesa"); o Voltar leva de volta para a sala, e
  a tela Decks continua aberta quando alguém entra na sala ou troca de deck (só a partida começando leva à mesa).

Como ficou:
- **123 cartas** em `cartas/defs/` (626 no total), cada uma com testes e todos os rulings. Os dois decks saíram de
  "em preparação" para o saguão (`node ferramentas/decks.ts gerar`): **9 decks jogáveis**.
- Fichas novas em `cartas/fichas.ts`: Zombie 2/2 (sem decaimento; a `Zombie` antiga é a com decaimento), Zombie Army,
  Soldier, Warrior, Human, Citizen, Insect 2/1, Angel, Kobolds of Kher Keep, Goblin, Phyrexian Goblin, Myr, Shark,
  Map (com explorar), Jace (planeswalker, com `empowerJace`), Incubator (duas faces) e Phyrexian Mite.
- **Motor** (recursos novos, gerais, com testes em `testes/regras-*.test.ts`):
  - presente/gift (CR 702.174), convoke (702.51), substituição ao sair do campo (`leavesBattlefield`, 614.6 e 616.1:
    Kalitas), resguardo pago com vida (Zul Ashur, Ovika), custo alternativo da mão com condição (Flawless Maneuver),
    alvo "mágica ou permanente" (Fatehold Charm), mágicas não criatura no turno (Plan for All Outcomes), virar a
    própria criatura no custo (Cryptbreaker);
  - tóxico e veneno (702.164), corrompido, emblemas (114), "não pode perder o jogo" (104.3), marcadores de
    atordoamento (122.1d), proteção contra tipo de carta e proteção de jogador (702.16), mana não gasta que vira
    incolor (Omnath), monarca que sai passa ao jogador ativo (725.4);
  - fichas de duas faces que transformam, incubar (701.53), iminente/impending (702.176), eminência, restrição de
    ataque a planeswalkers (Jace), habilidades de lealdade emprestadas (Nicol Bolas, Dragon-God);
  - correções: habilidade que define P/T vale fora do campo (604.3: Soulless One); "Aura" e "Saga" saíram da lista de
    tipos de criatura (205.3g-k: Crippling Fear, Patchwork Banner); rótulo do custo de sacrificar em português e com cor.
- **Cliente**: emblemas na zona de comando à parte do comandante (texto no zoom); verso da ficha de duas faces
  (Incubator transformado); zoom sem P/T para o que não é criatura (Overlord iminente); palavras-chave novas em
  português.
- Guia `cartas/COMO-IMPLEMENTAR.md` com os recursos novos.

Verificado:
- `npx tsc` (motor e cliente) sem erros; **suíte inteira: 656 arquivos, 1769 testes passando** (com as 123 cartas).
- Partidas de bots sempre com os decks novos na mesa (invariantes a cada resposta; script desta sessão, fora do
  repositório; `node bots/estresse.ts` já sorteia os decks novos): **25 de 25 sem erro**
  (Gisa 1v1 ×4 e 4 jogadores ×3; Jace × Gisa ×6; 4 jogadores com os dois ×6; Jace 1v1 ×6).
- Emblema na mesa conferido em 1280×800 e 1920×1080 (emblema injetado na vista, a partida em si não chega lá fácil).
- `node ferramentas/e2e.ts`: todas as verificações de ponta a ponta passaram (com o cliente compilado de novo).
- `node bots/estresse.ts 60 4 aleatorio novos08` e `60 2`: **120 de 120 partidas sem erro** (bots aleatórios, que fazem
  escolhas estranhas; sorteiam entre os 9 decks).

Observações (não corrigidas, ficam para decidir):
- **O bot joga o deck do Jace mal**: perdeu 11 de 12 partidas 1v1. Numa partida analisada ele não conjurou o Dimir
  Signet podendo desde o turno 5 e guardou o Command Tower na mão. Não é regressão destas mudanças (Terra × Abzan
  Armor deu exatamente as mesmas partidas antes e depois); é o estilo conservador do bot heurístico, que pesa menos
  num deck lento de cinco cores. Se quiser, dá para ensinar o bot a priorizar pedras de mana e terrenos que fazem
  as cores que faltam.
- Achados do motor sem efeito nos decks de hoje: dano de infectar a jogador vira perda de vida em vez de veneno
  (CR 120.3b; nenhuma carta com infectar causa dano a jogador nos decks); as substituições `lifeGain`, `damage`,
  `counters` e `enterOther` declaradas em `motor/defs.ts` não são aplicadas (só "ao entrar" e a nova de sair do
  campo); não há redução de custo para habilidades ativadas (Razorlash Transmogrant tem duas versões da habilidade,
  uma para cada caso).
- Os nomes dos decks importados são compridos ("Multiverse Reforged (Reality Fracture Commander Decklist)"): o
  saguão corta com "…". Renomeando no Moxfield e usando "Atualizar" na tela Decks, o nome muda aqui.
- Worktrees desta sessão (`../jogo-wt-a` a `../jogo-wt-g`, branches `cartas-a` a `cartas-g` e `integra`) já estão
  juntadas e podem ser apagadas: `node_modules` dentro delas é um atalho (junção). Para cada uma,
  `cmd /c rmdir ..\jogo-wt-X\node_modules` (apaga só o atalho) e depois `git worktree remove --force ../jogo-wt-X`.

Precisa de você:
- Reabrir a mesa ("Abrir a mesa.cmd") para os decks novos e o botão Decks no saguão aparecerem.
- Jogar com os dois decks e dizer se alguma carta se comportou diferente do esperado.

## Repositório pronto para o GitHub — 08/10/2026

Pedido: preparar o projeto para ir ao GitHub, sem enviar ainda. Repositório **privado**, com regras, decks e
imagens, para os amigos clonarem e saírem jogando.

- O repositório agora é a pasta `Magic-Commander` inteira, com o jogo em `jogo/`. O histórico do jogo é o mesmo (os
  commits citados acima continuam valendo); o commit da mudança mostra os arquivos indo para `jogo/`. A pasta
  `jogo/.git` ficou vazia porque o VS Code a mantém aberta; dá para apagá-la com o VS Code fechado.
- Entram: `cartas/` (listas, dados, rulings e as 990 imagens dos 7 decks), `dados/`, `fontes-oficiais/`, `guia/`,
  `simulador/`, `referências/`, os prompts e as imagens das cartas importadas pela tela Decks
  (`jogo/dados-locais/imagens/`, agora fora do `.gitignore`). Ficam fora: os caches do coletor (`cartas/.cache`,
  `.recovery`, `.local`), `node_modules`, o banco e a senha (o resto de `dados-locais/`) e as worktrees. São cerca
  de 1,1 GB, dos quais 1,06 GB são as 1.231 imagens PNG.
- Fim de linha: fora de `jogo/`, os arquivos vão byte a byte (`* -text` no `.gitattributes` da raiz), porque
  `cartas/checksums.json` e `dados/manifesto.json` conferem o SHA-256 de cada arquivo. No jogo, `.cmd` sai com CRLF.
- `Abrir a mesa.cmd` serve para quem clona do zero: oferece instalar o Node.js e o cloudflared pelo winget, roda
  `npm ci` na primeira vez e quando o `package-lock.json` muda, abre só neste computador se não houver cloudflared
  e abre o navegador na mesa.
- `README.md` na raiz (a página do repositório no GitHub); `LEIAME.md` e `HOSPEDAGEM.md` atualizados.
- A pasta raiz foi criada por outro usuário do Windows (`CodexSandboxOffline`), e o git recusava o repositório por
  isso; ele foi liberado com `git config --global --add safe.directory C:/Users/icaio/Documents/Magic-Commander`.

Verificado num clone do repositório novo, numa pasta à parte:
- 4.937 arquivos, 1,1 GB, nada pendente. Fora de `jogo/`, tudo idêntico byte a byte à pasta original (`diff -r`), e
  `python coletar.py --verify` confirma a integridade de `cartas/`. `Abrir a mesa.cmd` sai com CRLF.
- `npm ci`, `npm run typecheck` e `npm run cliente:build` sem erros.
- Servidor do clone: login com a senha, imagem grande (PNG) e miniatura (WebP) de uma carta dos 7 decks e de uma carta
  importada, e 9 decks no saguão.
- Suíte inteira: 655 de 656 arquivos; as 2 falhas são de `testes/fase8.test.ts` (desfazer), que é instável desde antes:
  no clone feito antes destas mudanças, o mesmo arquivo falhou 1 de 5 vezes; no novo, 3 de 5.
- O script de abrir a mesa não rodou inteiro, porque abriria o túnel público; o Node.js já instalado, o `npm ci` e a
  compilação foram conferidos à parte, e o script não tem erro de sintaxe.

Precisa de você:
- Criar um repositório **privado e vazio** no GitHub e enviar: na pasta `Magic-Commander`,
  `git remote add origin <endereço>` e `git push -u origin main` (cerca de 1,1 GB). Depois, convidar os amigos em
  *Settings → Collaborators*.
- Se quiser, apagar as worktrees antigas (instruções na seção anterior) e a pasta vazia `jogo/.git`, com o VS Code fechado.

Enviado em 08/10/2026 para **https://github.com/eusbck/carteado** (privado). O GitHub tinha criado um README de uma
linha; ele foi juntado ao histórico (merge), e o README do projeto ficou. Este projeto envia com a conta `eusbck`
(o endereço do `origin` leva o usuário); a conta guardada como padrão no computador é outra (`computer-co`).
Falta: convidar os amigos em *Settings → Collaborators*.
