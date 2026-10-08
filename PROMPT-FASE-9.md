# Fase 9: ajustes depois das partidas contra bots

Contexto: joguei partidas contra os bots com a mesa da fase 8. Retome por `jogo/PROGRESSO.md` e registre lá
esta fase 9. O princípio da fase 8 continua valendo: mesa real, em que o sistema ajuda menos e o jogador
decide mais, e as regras continuam com o motor.

Ordem: primeiro a seção 1 (bugs), depois a 2 (interface), a 3 (som e música) e por último a 4 (níveis de
dificuldade dos bots, que depende dos itens 1.1 e 1.5 já resolvidos). Antes de corrigir cada bug,
reproduza o problema e anote a causa no PROGRESSO.md. Não precisa pedir aprovação antes; só pergunte se algo
for ambíguo de verdade.

## 1. Bugs

1.1 Bots parecem travados
- No fim do turno de um bot (etapa final), a partida para e eu preciso clicar em "Passar" para o turno andar.
  O mesmo acontece quando um bot conjura uma mágica: a partida só segue depois que eu passo.
- Primeiro descubra o que está acontecendo: o bot travou de verdade, ou a mesa está esperando a minha
  prioridade (por exemplo, pela "parada sem jogada" da fase 8 ou por alguma parada configurada) sem deixar
  isso claro?
- Esperado: o turno do bot anda sozinho, e eu só paro onde marquei parada. Quando a mesa estiver mesmo
  esperando por mim, isso precisa ficar óbvio (um aviso visível como "Sua vez de responder a <mágica>"), sem
  parecer que o bot travou.
- Teste: partidas 1v1 e de 4 jogadores contra bots, com as paradas padrão, sem nenhum clique meu fora das
  paradas.

1.2 Terreno que entra virado conta na reserva
- Um terreno que entra no campo já virado está colocando mana na reserva, como se eu tivesse virado ele para
  pagar.
- Esperado: um terreno que entra virado não gera mana nenhuma. Só vai para a reserva a mana do terreno que
  eu mesmo viro para pagar. Ele desvira normalmente no meu próximo desvirar.
- Reproduza com um terreno dos decks que entra virado e escreva um teste (no motor e, se for o caso, no
  cliente).

1.3 Posicionar cartas no campo está emperrado
(No código, "Ajuste manual" é outra coisa: a janela de `mesa/Manual.tsx`. Aqui estou falando de arrastar
minhas cartas para arrumar o meu campo.)
- Ao arrastar uma carta para outro lugar do meu campo, ela não fica onde eu soltei.
- Esperado: a carta fica exatamente onde o mouse a deixou e mantém o ponto por onde eu peguei (se peguei
  pelo canto, ela solta pelo canto). Sem grade, sem pular, sem empurrar as outras cartas, e acompanhando o
  mouse sem atraso. A posição se mantém quando a carta vira, desvira ou a mesa é redesenhada.

1.4 Bloqueios
Não tenho certeza se os bloqueios funcionam direito. Faça uma auditoria do bloqueio pelo combate por
cliques nestes casos: um bloqueador; vários bloqueadores na mesma criatura (com a ordem de dano); voar e
alcance; menace; primeiro golpe; atropelar; bloqueio em 4 jogadores (quando atacam a mim e quando atacam
outro jogador); o bot bloqueando e eu bloqueando o bot. Para cada caso, diga se funciona ou o que você
corrigiu, e escreva os testes que faltarem.

1.5 O bot nunca pode ver a minha mão
Confirme que os bots decidem só com o que um jogador naquela cadeira veria (a vista por jogador de
`motor/view.ts`): nada da minha mão, da ordem do meu grimório nem de cartas viradas para baixo. Isso vale
também para as simulações e avaliações internas (`bots/heuristico.ts`, `bots/simulacao.ts`,
`bots/avaliacao.ts`). Se o bot precisa supor o que está escondido, ele sorteia a partir do que é público.
Se hoje ele usa o estado completo em algum ponto, corrija. Escreva um teste que garanta isso (por exemplo:
com a mesma semente, trocar as cartas da minha mão não muda nenhuma decisão do bot).

## 2. Interface

2.1 Janelas de escolha (buscar no grimório, conjurar, ordenar gatilhos, escolher alvos etc.)
- Hoje elas são pequenas e limitadas.
- Esperado: maiores e mais integradas à mesa. Minha sugestão: aparecer no meio da tela, por cima da divisa
  entre o campo dos oponentes e o meu. Podem ter até o dobro da altura atual, sem limite fixo: a janela
  cresce com o conteúdo até caber na tela e só usa rolagem por dentro quando passar disso. As cartas
  aparecem grandes o bastante para ler.
- O formato (pilha, leque, grade) fica a seu critério. Escolha o melhor para cada tipo de escolha e explique
  no PROGRESSO.md.
- Como a janela vai cobrir parte da mesa, deve dar para recolhê-la por um momento, olhar a mesa e voltar.

2.2 Zoom ao passar o mouse
- Hoje o zoom aparece no canto superior esquerdo ou no direito.
- Esperado: sempre a esquerda ou direita, mas centralizado verticalmente na tela, com tamanho proporcional à tela. O tamanho se ajusta ao conteúdo:
  se a carta tem muito texto, o zoom cresce, mas continua centralizado e nunca sai da tela nem fica cortado.

2.3 Ocultar o log
- Um botão para esconder e mostrar o registro da partida. Com o log escondido, a mesa ocupa o espaço que
  sobrou. A escolha fica guardada no navegador (`preferencias.ts`).

2.4 Seleção por arrasto
- Segurando o botão esquerdo numa área vazia do meu campo e arrastando, aparece um retângulo de seleção.
  As cartas dentro dele ficam selecionadas e, quando eu arrasto uma delas, todas se movem juntas, mantendo
  a distância entre elas, com a mesma precisão do item 1.3. Um clique numa área vazia ou o Esc desfaz a
  seleção.
- A seleção não pode atrapalhar o clique normal nas cartas nem o combate por cliques.

2.5 Fundo de cada jogador em alta qualidade
- Hoje o fundo da área do jogador é a arte recortada da imagem local do comandante (`servidor/imagens.ts`),
  e ela fica com pouca qualidade.
- Procure a melhor fonte disponível (por exemplo, a arte em alta resolução na Scryfall) e compare com a
  atual. Baixe uma vez e guarde localmente, para a partida não depender da internet. Confira que a imagem
  fica nítida em 1920×1080 e em telas maiores.

## 3. Som e música

3.1 Som da troca de turno
- Hoje toca o mesmo som a cada troca de turno, só um pouco mais alto quando o turno é meu (som `turno` de
  `sons.ts`, tocado em `mesa/Efeitos.tsx`).
- Esperado: dois sons bem diferentes, fáceis de distinguir sem olhar a tela. Um para "começou o seu turno",
  que chama atenção e é o que me avisa que é a minha vez. Outro, mais discreto, para "começou o turno de um
  adversário" (humano ou bot).
- Isso vale para cada jogador, do ponto de vista dele: no turno do Fulano, só o Fulano ouve o som de "seu
  turno", e todos os outros ouvem o de adversário. Cada navegador decide pelo próprio assento.
- Em Configurações, cada um dos dois sons liga e desliga separado. Por exemplo, quem quiser só o aviso do
  próprio turno desliga o de adversário.
- Os sons continuam gerados com Web Audio, no estilo dos que já existem, e combinando com a música.

3.2 Música
- Adicione uma trilha épica no clima de Magic (orquestral, de fantasia). A escolha é sua; confio no seu
  gosto.
- Ela precisa ter uma licença que permita o uso (domínio público, CC0 ou CC-BY com crédito). Registre no
  repositório a fonte, o autor e a licença. Nada de trilha oficial do Magic nem de outro jogo.
- Arquivo local, servido pelo nosso servidor, tocando em loop sem corte audível.
- Em Configurações: ligar/desligar e um volume separado dos efeitos sonoros (`sons.ts`), guardados no
  navegador e ajustáveis no meio da partida. Começa ligada, em volume baixo. O navegador só deixa tocar
  depois do primeiro clique; trate isso sem gerar erro.

## 4. Níveis de dificuldade dos bots
Seis níveis, do mais fraco ao mais forte: **Iniciante, Fácil, Intermediário, Difícil, Cartomante e Magic
God**. Tudo roda no meu computador e de graça: nada de API, IA paga ou internet.

4.1 Regras que valem para todos os níveis
- Nenhum nível trapaceia. O item 1.5 vale até para o Magic God: nenhum bot vê a minha mão, a ordem do meu
  grimório nem cartas viradas para baixo. A força vem de jogar melhor, não de ver mais.
- Os níveis fracos erram como uma pessoa erraria: esquecem um ataque bom, gastam a remoção na criatura errada,
  viram todos os terrenos no próprio turno. Nunca erram de um jeito absurdo, como jogar ao acaso ou atacar uma
  0/8 com uma 1/1 sem motivo. Por isso o bot aleatório (`bots/aleatorio.ts`) não serve como nível.
- Cada nível precisa ser comprovadamente mais forte que o anterior (item 4.5).

4.2 Como cada nível joga
| Nível         | Como joga |
|---------------|-----------|
| Iniciante     | Joga terreno e criatura na curva, ataca só quando é óbvio, quase não usa mágicas instantâneas e nunca responde no meu turno. Erra bastante. Quase não pensa. |
| Fácil         | O bot de hoje enfraquecido: poucas simulações, às vezes escolhe a segunda ou a terceira melhor jogada, responde pouco e precisa de uma vantagem maior para agir. |
| Intermediário | O bot de hoje (24 simulações), com os bugs da seção 1 corrigidos. É o nível padrão. |
| Difícil       | Intermediário mais as melhorias que já sabemos que faltam: combate dentro das simulações (compara opções de ataque e bloqueio em vez de seguir regras fixas); age durante o combate (truque depois dos bloqueios); considera que o oponente pode responder (terrenos desvirados, cartas já vistas); em 4 jogadores, foca em quem está ganhando; e entende o papel de cada carta (remoção, compra de cartas, rampa, combo) em vez de olhar só custo, poder/resistência e palavras-chave. Troca também as escolhas feitas por palavras do texto (`selecionar()` em `bots/heuristico.ts`) por algo mais confiável. |
| Cartomante    | Difícil mais leitura da mesa. Lembra de tudo que foi revelado para todos (ou para ele): carta buscada e mostrada, carta que voltou do campo para a mão, carta revelada por efeito. Conta o que já saiu da lista do deck e tira conclusões do meu jeito de jogar: se passei com terrenos desvirados, provavelmente tenho uma instantânea; se não joguei terreno, provavelmente não tenho. Usa isso para supor minhas cartas escondidas de forma mais realista e jogar em volta dos meus truques. Só sabe o que um jogador atento à mesa saberia. |
| Magic God     | Cartomante olhando bem mais longe: busca Monte Carlo com informação oculta (ISMCTS ou parecida), jogando até o fim do turno seguinte ou além, em vez de parar quando a pilha esvazia. É o mais forte que der dentro dos limites do item 4.3. |

4.3 Não pesar no computador
O servidor roda no meu notebook: Intel Core i5-1235U (10 núcleos e 12 threads, mas só 2 núcleos de alto
desempenho) e 16 GB de RAM. Os bots não podem deixá-lo travado, quente ou com a ventoinha no máximo.
- Os bots pensam fora da linha principal do servidor (worker threads). A mesa e os cliques dos jogadores nunca
  congelam enquanto um bot pensa (hoje congelam, porque o bot pensa na mesma linha do servidor).
- O limite é global, não por bot: todos os bots juntos usam no máximo 2 threads, mesmo com três Magic Gods na
  mesa. Se houver mais bots pensando do que threads livres, eles esperam a vez.
- Tempo máximo por decisão, como ponto de partida: Iniciante e Fácil quase instantâneo; Intermediário 2 s
  (como hoje); Difícil e Cartomante cerca de 3 s; Magic God cerca de 6 s. É um teto, não uma meta: quando a
  decisão é óbvia (uma jogada só, nada para fazer), o bot responde na hora.
- O bot só pensa quando é a vez dele decidir. Nada de ficar pensando durante o turno dos outros.
- Memória: todos os bots juntos usam no máximo cerca de 1 GB a mais, e esse uso não cresce ao longo da
  partida.
- Se um bot pensar por mais de 1 s, a mesa mostra "ROBSON está pensando…", para não parecer travado (como no
  item 1.1).
- Se a medição do item 4.5 mostrar que dá para mais (ou que precisa de menos), ajuste esses números e explique
  no PROGRESSO.md.

4.4 Escolher o nível
- No saguão, ao pôr um bot num assento, o anfitrião escolhe o nível (padrão: Intermediário). Dá para misturar
  níveis na mesma mesa.
- Nomes dos bots: em vez de "Bot 2", cada bot ganha um nome sorteado de uma lista com pelo menos 40 nomes
  no estilo NELSON, ROBSON, CLEITON, ANDERSON, OSVALDO, escritos em maiúsculas. Dois bots da mesma sala nunca
  têm o mesmo nome, e o nome não repete o de um jogador humano da sala. O nome é sorteado quando o bot entra
  no assento, fica salvo com a sala e aparece em todo lugar onde hoje aparece "Bot N" (saguão, mesa, log,
  avisos).
- O nível aparece junto do nome do bot no saguão e na mesa (por exemplo, "ROBSON · Cartomante").
- O nível fica salvo com a sala e continua o mesmo depois de reiniciar o servidor ou reconectar.
- A partida continua reproduzível depois de reiniciar, e o desfazer da fase 8 continua funcionando com
  qualquer nível. Confira o que garante isso hoje (respostas dos bots gravadas ou bot determinístico) e não
  quebre isso com os limites de tempo e as threads.

4.5 Medir a força e o custo
- Adapte `bots/comparar.ts` para escolher o nível de cada assento. Com sementes fixas, coloque cada nível
  contra o anterior em 1v1, com partidas suficientes para o resultado não ser sorte (por exemplo, 100 por par).
  Meta: o nível de cima vence pelo menos 60%. Em 4 jogadores, numa mesa com Magic God, Cartomante, Difícil e
  Intermediário, o Magic God deve ser quem mais vence.
- Para cada nível, meça o tempo médio e o máximo por decisão. Meça também o uso de processador e o pico de
  memória numa partida de 4 jogadores com três Magic Gods. Coloque as tabelas no PROGRESSO.md.
- As baterias de medição rodam em segundo plano e podem levar horas, mas sem fritar o notebook: no máximo
  metade das threads ocupadas.

## Conferência (mesmo padrão da fase 8)
- `npm run typecheck` e a suíte inteira passando, com testes novos para 1.1, 1.2, 1.4, 1.5 e 4. O teste do
  item 1.5 roda para todos os níveis. Também precisa de teste: o nível e o nome salvos com a sala depois de
  reiniciar; nomes diferentes para todos os bots de uma sala;
  a mesa respondendo enquanto um bot pensa; e, para cada assento, qual som de turno toca (o meu ou o de
  adversário) a cada troca de turno.
- `ferramentas/capturas.ts` com capturas novas, conferidas imagem por imagem, em 1280×800 e 1920×1080:
  janelas de escolha (busca num grimório com muitas cartas, ordem de gatilhos), zoom de uma carta com pouco
  texto e de uma com muito texto, log escondido, seleção por arrasto, os fundos novos, Configurações com a
  música, o saguão com a escolha de nível e o aviso "está pensando…".
- `ferramentas/e2e.ts` e `ferramentas/humano-e-bots.ts` (1v1 e 4 jogadores) até o fim, sem travamento e sem
  clique extra no turno dos bots.
- Rode as verificações longas em paralelo, com subagentes em segundo plano.
- No fim, escreva a recapitulação no PROGRESSO.md (Feito / Verificado / Precisa de você) e me diga o que eu
  devo testar jogando, principalmente o posicionamento e a seleção, que dependem da sensação na mão, e uma
  partida contra cada nível, para eu dizer se a escada de dificuldade ficou bem distribuída.
