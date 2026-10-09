# Magic Commander

Jogo de Commander online e privado para o grupo, com as regras aplicadas pelo servidor. Os decks
vêm do Moxfield: os 7 primeiros foram coletados em `../cartas/`, e outros entram (ou são atualizados)
pelo link, na tela **Decks**.

## Rodar no seu computador

No Windows, o jeito mais fácil é clicar duas vezes em `Abrir a mesa.cmd`: na primeira vez ele
oferece instalar o Node.js e o cloudflared, instala as dependências e compila a interface (veja o
`README.md` da raiz do repositório).

À mão, precisa do Node.js 24 ou mais novo. A pasta `jogo/` tem de ficar ao lado de `cartas/` (as
imagens das cartas dos 7 decks originais são lidas de lá; nada é copiado); as duas vêm juntas no
repositório. As imagens das cartas que entraram depois pela tela Decks ficam em
`dados-locais/imagens/`, que também vai no repositório (`node ferramentas/decks.ts imagens` baixa de
novo as que faltarem). O resto de `dados-locais/` (banco e senha) é de cada computador. A arte dos
comandantes para o fundo da mesa, em qualidade maior, fica em `gerado/artes/` (a importação baixa a
do deck novo; `node ferramentas/baixar-artes.ts` baixa de novo da Scryfall).

```
cd jogo
npm ci
npm run cliente:build
npm run servidor
```

Abra `http://localhost:8080`. Na primeira vez o servidor cria uma senha de acesso e a mostra no
terminal (fica guardada em `dados-locais/senha-acesso.txt`). Para escolher a senha, defina a
variável `SENHA_ACESSO` antes de subir o servidor.

Variáveis opcionais:

| Variável | Para quê | Padrão |
| --- | --- | --- |
| `PORTA` | porta HTTP | `8080` |
| `SENHA_ACESSO` | senha para entrar no site | gerada na primeira vez |
| `DADOS` | pasta do banco (salas e partidas) | `dados-locais/` |
| `IMAGENS` | imagens das cartas que entraram pela tela Decks | `dados-locais/imagens/` |
| `HTTPS` | `1` quando estiver atrás de um proxy com HTTPS (cookie seguro) | desligado |

## Abrir a mesa para o grupo pela internet

Clique duas vezes em `Abrir a mesa.cmd`. Ele sobe o servidor e abre um túnel da Cloudflare; a
janela mostra o endereço `https://` e a senha de acesso para mandar ao grupo. Detalhes em
`HOSPEDAGEM.md`.

## Como se joga

1. Entre com a senha do servidor (a abertura dá as boas-vindas aos feiticeiros: o M em brasa, as cinco joias de
   mana acendendo e brasas subindo no escuro).
2. A tela inicial vai um passo por vez: o nome (fica guardado no navegador, então da próxima vez ela já
   começa no passo seguinte), depois criar ou entrar numa sala. Quem cria escolhe o formato (quatro jogadores
   ou um contra um) e uma senha, e passa o código e a senha para os outros; quem entra digita os dois.
3. O saguão também vai em passos, iguais para a mesa toda (quem criou a sala avança):
   - **Lugares:** quem joga entra; quem criou a sala põe bots nos lugares livres (com o nível de cada um) ou
     tira. Os bots jogam com os mesmos decks e veem só o que um jogador veria.
   - **Regras:** quem criou a sala escolhe a regra de mulligan (Londres, o padrão, ou Livre: troca a mão
     inteira, até 3 vezes, sem pôr nada no fundo) e a de auxílios (permitidos ou proibidos); os outros
     acompanham.
   - **Retrato:** no passo dos lugares, "Trocar retrato" mostra os nove retratos (um por comandante da mesa, mas
     a escolha é livre); quem não escolhe usa o do comandante do próprio deck. A escolha fica guardada no
     navegador e vale nas próximas salas.
   - **Decks:** clicar num deck abre a prévia (o comandante e as cartas por tipo, com a carta grande ao passar o
     mouse) e o botão "Escolher este deck"; quem criou a sala escolhe também o deck de cada bot e começa a
     partida quando todos escolheram. Se alguém sair, a sala volta para os lugares (os decks escolhidos ficam).
4. Na mesa (o padrão é a **mesa real**: nada brilha e a mesa não explica o que não pode; tentou algo
   que não vale, a carta volta com um tremido):
   - **Avatares:** cada jogador aparece num medalhão com o retrato e a vida no medalhão pequeno embaixo; clicar na
     vida escolhe o jogador como alvo. Os oponentes ficam no canto de cima à direita da própria área (a arrumação
     padrão deixa o canto livre); o seu fica na base da mesa, na frente da mão, que se abre em leque por trás dele (a
     carta sob o mouse sobe por cima e aparece inteira no zoom). Em "Configurações" › "Seu retrato na mesa" dá para
     pôr o seu também no canto de cima à direita do seu campo.
   - **Auxílios:** em "Configurações", cada um escolhe Mesa real, Leve (só o brilho nas cartas
     jogáveis), Completo (tudo, menos pagar automaticamente) ou Personalizado. Vale na hora, só para
     você, e fica guardado no navegador. Se a sala proíbe, todos jogam em Mesa real.
   - **Jogar uma carta da mão:** arraste para o seu campo, dê duplo clique ou clique direito e escolha
     no menu. A carta fica tracejada onde você soltou até pagar, e a permanente entra ali.
   - **Pagar:** clique nos seus terrenos para virar (a mana vai para a reserva) e em "Confirmar
     pagamento". "Cancelar" devolve a carta para a mão e desvira os terrenos virados para ela. Com
     prioridade, clicar num terreno gera a mana antes de conjurar.
   - **Arrumar o campo:** arraste as suas permanentes para onde quiser; todos veem a sua arrumação.
     "Reorganizar meu campo" (clique direito no campo vazio) volta à arrumação padrão.
   - **Atacar:** clique na criatura (ela inclina e ganha uma espada; clique de novo para desmarcar) e,
     em 4 jogadores, no oponente que ela ataca (a próxima marcada vai no mesmo oponente até você
     clicar em outro). "Confirmar ataque" vira as criaturas. Arrastar até o oponente também vale.
   - **Bloquear:** clique na sua criatura e depois no atacante (escudo e linha azul) e em "Confirmar
     bloqueio". Setas, dano, ganho de vida e criaturas indo para o cemitério aparecem para todos.
   - **Desfazer:** o botão com a seta curva, ao lado de Passar, pede para voltar a sua última jogada
     deste turno (o que os outros fizeram depois volta junto). Os outros têm 30 segundos para aceitar;
     os bots aceitam na hora; uma recusa ou o prazo cancela. A mesa fica parada enquanto isso.
   - **Clique direito:** nas cartas, ver informações, revelar uma carta da mão e o ajuste manual
     (virar, marcadores, mover); no seu campo vazio, desvirar tudo, criar ficha e marcadores de jogador.
   - A faixa no meio da mesa mostra o turno, as cinco fases com as etapas e o botão Passar. Clicar
     numa etapa liga ou desliga a parada nela; "Paradas" na barra lateral tem todas as opções. Por
     padrão a mesa só para no seu turno; no turno dos outros ela anda sozinha. Para responder às
     mágicas dos oponentes, ligue "Mágicas dos oponentes" na faixa (ou marque a etapa final no turno
     de um oponente). Quando a mesa espera você fora do seu turno, a faixa fica amarela e diz por quê
     ("Sua vez de responder a …"). Bot pensando há mais de um segundo: "ROBSON está pensando…".
   - Arrumar o campo: arraste as suas cartas para onde quiser (elas ficam exatamente onde você
     soltou). Segurando o botão no espaço vazio do seu campo e arrastando, você seleciona várias e
     move o grupo junto; clique no vazio ou Esc desfaz a seleção.
   - Escolhas (buscar no grimório, alvos, modos, ordem dos gatilhos, vidência) aparecem numa janela
     no meio da mesa. "Ver a mesa" recolhe a janela num cartão à direita; segurar Espaço esconde a
     janela por um momento.
   - "Configurações" também tem o volume dos efeitos, os sons (começo do seu turno, que chama
     atenção; começo do turno de um adversário, mais discreto; dano; ganhar vida; mensagem no chat;
     cada um com um botão para ouvir) e os efeitos visuais, que valem em qualquer sala, e a música de fundo, com
     volume próprio. A música começa ligada e baixa, e só toca depois do primeiro clique ou tecla na
     página (regra do navegador).
   - **Chat:** embaixo do menu da barra lateral. O que você escreve (Enter envia) todos na sala leem;
     a conversa fica guardada com a sala, volta se a página recarregar ou o servidor reiniciar e
     continua numa partida nova com a mesma mesa. "Recolher" deixa a barra só com os ícones e a mesa
     mais larga (a escolha fica guardada no navegador); recolhida, cada mensagem nova aparece por uns
     segundos na mesa (clicar abre o chat) e o botão de abrir mostra quantas você não leu.
   - **Registro:** abre numa janela, como Paradas e Configurações: tudo o que aconteceu, separado por
     turno, com a regra (CR) de cada linha e uma busca. As outras decisões (prioridade, pagamento,
     combate) aparecem à direita da mesa.
   - No saguão, quem criou a sala põe bots nos lugares livres e escolhe o nível de cada um:
     Iniciante, Fácil, Intermediário (padrão), Difícil, Cartomante ou Magic God. Cada bot ganha um
     nome sorteado (ROBSON, CLEITON…), que aparece com o nível ("ROBSON · Cartomante").
5. Todas as cartas dos decks do saguão têm o efeito automatizado. O ajuste manual continua disponível
   para corrigir alguma situação à mão, só quando você tem prioridade, e todo ajuste aparece no
   registro para todos.

Se a conexão cair ou o servidor reiniciar, a página reconecta sozinha e volta ao mesmo lugar.

O visual segue a identidade do Magic: carvão e grafite na base, ouro envelhecido no que pede atenção, laranja
mítico no que dá para fazer agora, texto em marfim e as cores de mana nos jogadores (você em ouro). Atrás das
telas de fora da mesa (entrar, criar ou entrar numa sala, saguão e Decks) passa uma coleção de 24 wallpapers do
Magic, bem apagados: cada abertura começa por um diferente e, com a página aberta, eles trocam a cada minuto.
As fontes estão em `cliente/src/imagens/fundos/FONTES.md`.

## Decks: importar e atualizar pelo Moxfield

Na tela inicial, o botão **Decks** mostra todos os decks da mesa. Qualquer pessoa que entrou com a senha
do servidor pode usar:

1. **Importar:** cole o link do deck no Moxfield (`https://moxfield.com/decks/…`; o deck precisa ser
   público ou não listado) e clique em "Buscar deck". O servidor busca a lista e os dados das cartas
   (Scryfall), confere as regras de deck do Commander (comandante, 100 cartas, uma de cada, identidade
   de cor) e mostra uma prévia. Confirmando, ele baixa as imagens e a arte do comandante.
2. **Atualizar:** o botão "Atualizar" de cada deck busca o deck de novo no Moxfield e mostra o que
   **entra** e o que **sai**. Colar de novo o link de um deck que já está na mesa faz o mesmo.
3. **Só entra no saguão o deck com todas as cartas com regras.** As regras de cada carta são escritas à
   mão (`cartas/defs/`). Se o deck tem cartas que o jogo ainda não tem, ele fica **em preparação**
   ("29 de 93 cartas com regras"), com a lista do que falta. Numa atualização com cartas novas, a
   versão nova fica guardada e o deck continua no saguão com a lista anterior.
4. **Completar um deck em preparação:** o anfitrião abre o Claude Code na pasta do projeto e pede
   "complete os decks em preparação". As cartas que faltam são implementadas com testes (veja
   `cartas/COMO-IMPLEMENTAR.md`); na próxima vez que a mesa abrir, o deck (ou a atualização) entra
   sozinho.
5. Partidas em andamento guardam a lista com que começaram: atualizar um deck não muda a partida.

O que a importação grava: `decks/<id>.json` (a lista de cada deck, a atual e a que espera cartas),
`decks/cartas.json` e `decks/rulings.json` (dados das cartas novas), `gerado/` (o que o jogo lê),
`gerado/artes/` e `dados-locais/imagens/` (imagens das cartas novas). Faça commit dessas pastas
depois de importar e mande para o GitHub, para os outros anfitriões receberem o deck. A mesma coisa pela linha de comando:
`node ferramentas/decks.ts` (veja a tabela abaixo). Se o Moxfield recusar os pedidos do servidor, abra
`https://api2.moxfield.com/v3/decks/all/<id>` no navegador, salve o JSON e use
`node ferramentas/decks.ts importar --arquivo deck.json --confirmar`.

## Desenvolvimento

| Comando | O que faz |
| --- | --- |
| `npm test` | toda a suíte de testes (motor, cartas, servidor) |
| `npm run typecheck` | checagem de tipos do servidor e do cliente |
| `npm run cliente:dev` | cliente com recarga automática (precisa do servidor rodando) |
| `npm run estresse` | partidas de bots procurando erros do motor (`node bots/estresse.ts [partidas] [jogadores] [aleatorio ou heuristico] [semente]`) |
| `node bots/comparar.ts <nívelA> <nívelB> [partidas] [semente] [processos]` | força dos níveis de bot: partidas 1v1 espelhadas (mesmos decks, assentos trocados), em até 6 processos; `mesa <n1,n2,n3,n4>` para 4 jogadores |
| `node ferramentas/humano-e-bots.ts [semente] [4p|1v1] [níveis]` | uma partida inteira no servidor com uma pessoa simulada e bots pensando nas threads de verdade; mostra cliques extras no turno dos bots, processador e memória |
| `node ferramentas/capturas.ts` | capturas de tela da interface em `.cache/capturas/` |
| `node ferramentas/e2e.ts` | partidas de ponta a ponta com navegadores (1v1, 4 jogadores, reinício do servidor) |
| `node ferramentas/cobertura.ts` | atualiza `COBERTURA.md` |
| `node ferramentas/baixar-artes.ts` | baixa da Scryfall a arte dos comandantes em `gerado/artes/` (uma vez; `--forcar` baixa de novo) |
| `node ferramentas/decks.ts pendentes` | decks em preparação e as cartas que faltam implementar (Oracle, rulings, fichas, nome do arquivo) |
| `node ferramentas/decks.ts importar <link> [--confirmar]` | importa um deck do Moxfield (sem `--confirmar`, só mostra a prévia) |
| `node ferramentas/decks.ts atualizar <id\|todos> [--confirmar]` | busca de novo e mostra o que entra e sai |
| `node ferramentas/decks.ts gerar` | regera `gerado/` a partir de `../cartas` e `decks/`, e põe no saguão as versões em preparação que ficaram prontas |

O progresso das fases está em `PROGRESSO.md`.

## Créditos

- Música da mesa: "The Snow Queen", de Kevin MacLeod (incompetech.com), licenciada sob Creative
  Commons: By Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/). Fonte, arquivo
  original e o que foi alterado em `cliente/src/musica/CREDITOS.md`.
- Imagens e artes das cartas: Scryfall (https://scryfall.com); as artes são dos seus ilustradores e
  da Wizards of the Coast. A origem de cada arte de comandante está em `gerado/artes/fontes.json`.
