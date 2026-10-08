# Fase 8: mesa mais "real" (ajustes depois da primeira partida)

Contexto: joguei uma partida com a mesa nova da fase 7. O motor continua ótimo; o que falta agora é
interface, manuseio e sensação de jogo. Retome por `jogo/PROGRESSO.md` e registre lá esta fase 8.

## Princípio que guia tudo
Quero simular uma mesa física de verdade: o sistema ajuda menos e o jogador decide mais. Na dúvida entre
automatizar ou deixar com o jogador, deixe com o jogador. Toda ajuda vira um auxílio opcional (seção 2),
desligado por padrão. As regras continuam sendo conferidas pelo motor: autonomia é na interface, não nas
regras.

## 1. Bugs (corrigir primeiro)
1.1 Janelas da barra lateral: qualquer opção da barra lateral que abre uma janela faz ela aparecer presa no
    topo da tela; não consigo clicar em nada dentro dela nem fechá-la.
    Esperado: janela centralizada e acima de tudo, com rolagem se for alta, fechando pelo X, pelo Esc e
    pelo clique fora.
1.2 Barra lateral recolhida: ao recolher, o campo fica cortado e aparece uma faixa preta embaixo.
    Esperado: a mesa ocupa o espaço liberado sem cortes, tanto ao recolher quanto ao abrir de novo.
Reproduza os dois em 1280×800 e 1920×1080 antes de corrigir e inclua essas situações em
`ferramentas/capturas.ts`.

## 2. Autonomia: mesa real, com auxílios opcionais

### 2.1 Comportamento base (nível "Mesa real", o padrão)
- Pagamento manual: o sistema não paga por mim e nenhum terreno brilha. Eu viro meus terrenos com um
  clique e confirmo o pagamento com um botão.
- Jogar uma carta: ao arrastar da mão (ou dar duplo clique), a carta vai direto para a mesa/pilha, sem
  cobrar mana automaticamente. Ela só vale quando a mana que eu virei cobre o custo, e eu posso cancelar
  e devolver a carta para a mão.
- O motor continua conferindo as regras (custo, um terreno por turno, momento de jogar etc.). Não troque
  isso por "combinado sem conferência".
- Desvirar no começo do turno continua automático (é regra, 502.3). O "nada vira sozinho" vale para o
  pagamento.
- Nenhuma dica: sem brilho em carta jogável, terreno ou alvo; sem textos de orientação (como "As cartas
  que dá para usar agora ficam com brilho verde" em `mesa/Decisao.tsx`); sem "Solte para conjurar" ao
  arrastar. Se eu tentar algo que não pode, a carta volta para o lugar com um tremido discreto, sem
  explicação.

### 2.2 Auxílios (cada um é opcional)
| Auxílio                        | O que faz                                                               |
|--------------------------------|-------------------------------------------------------------------------|
| Brilho nas cartas jogáveis     | contorno verde no que dá para usar agora (realce `acao`, `mesa/Carta.tsx`) |
| Brilho nos alvos válidos       | ao mirar, atacar ou bloquear, o que pode ser escolhido brilha (realce `escolhivel`) |
| Brilho nos terrenos ao pagar   | as fontes de mana brilham e o pagamento fecha sozinho quando cobre o custo |
| Aviso de por que não dá        | mostra o motivo ("Terrenos só no seu turno", "Falta mana…") e o "Solte para conjurar" |
| Pagar automaticamente          | o sistema vira os terrenos por mim (hoje é `pagarAuto` em `cliente/src/preferencias.ts`) |

### 2.3 Configurações › Auxílios
Níveis prontos mais um modo Personalizado:

    ( ) Mesa real      nenhum auxílio (padrão para quem nunca mexeu)
    ( ) Leve           só o brilho nas cartas jogáveis
    ( ) Completo       tudo, menos pagar automaticamente (igual à mesa de hoje)
    ( ) Personalizado  uma caixa para cada auxílio da tabela

- A escolha é de cada jogador, fica guardada no navegador dele (`preferencias.ts`) e não muda nada para
  os outros.
- Dá para trocar no meio da partida sem sair da mesa, e a troca vale na hora.

### 2.4 Regra da sala
- No saguão, junto com a regra de mulligan, o anfitrião define antes de começar:
  "Auxílios: permitidos / proibidos". A regra aparece para todos no saguão e na mesa.
- Proibidos: todos jogam em Mesa real; a seção Auxílios fica travada com o aviso "Esta sala não
  permite auxílios"; o servidor recusa o pagamento automático (o único auxílio que passa por ele).

### 2.5 Levantamento
Procure outras ajudas ou automatismos além dos da tabela (por exemplo, o menu do clique direito que só
lista jogadas válidas) e me diga, para cada um, se propõe virar auxílio, ficar como está ou sair.

## 3. Combate por cliques (inspirado no MTG Arena)
Você não consegue assistir vídeos, então siga esta descrição (se tiver acesso à web, procure imagens do
combate do MTG Arena como referência):
- Atacar: clico na minha criatura e ela dá uma leve inclinada para o lado (uns 15°, animação suave) com
  um ícone de espada; clico de novo para desmarcar. Em 4 jogadores, depois de marcar a criatura clico no
  oponente que ela vai atacar (em 1v1 isso é automático). Um botão "Confirmar ataque" fecha a declaração
  e só aí as criaturas viram de verdade (menos as com vigilância).
- Bloquear: o defensor vê os atacantes destacados, com seta até ele; clica na própria criatura e depois no
  atacante para bloquear (ícone de escudo e uma linha ligando os dois), e confirma.
- Dano: os atacantes avançam um pouco na direção do alvo, os números de dano aparecem flutuando e as
  criaturas que morrem somem na direção do cemitério.
- Todos os jogadores veem as animações. O arrastar da fase 7 continua funcionando.
- O brilho em quem pode atacar ou bloquear só aparece com o auxílio "Brilho nos alvos válidos" ligado.

## 4. Desfazer com aceite da mesa
- Botão "Desfazer" que abre um pedido para voltar a minha última jogada (ex.: joguei a carta errada,
  esqueci de baixar o terreno).
- Só a última jogada e só dentro do turno em que ela aconteceu. Se outro jogador agiu depois dela, essas
  jogadas também voltam, e o pedido mostra isso.
- Os outros jogadores humanos têm 30 s para aceitar; os bots aceitam sozinhos. Uma recusa, ou nenhuma
  resposta no prazo, cancela o pedido.
- Todo mundo vê o pedido e o que vai ser desfeito. Use o histórico de entradas e checkpoints do servidor
  para voltar o estado, sem mexer nas regras do motor.

## 5. Efeitos visuais e sonoros (tudo configurável)
- Som ao passar o turno (hoje não tem nenhum).
- Ao tomar dano ou ganhar vida: efeito visual na área/vida do jogador (ex.: tremida e brilho vermelho
  para dano, brilho verde para vida, número flutuando) e um som para cada um.
- Configurações: volume geral, liga/desliga por tipo de som e liga/desliga dos efeitos visuais
  (respeitando "reduzir movimento" do sistema). Estes não contam como auxílios: valem mesmo em sala
  sem auxílios.
- Sons curtos e leves: gerados com Web Audio ou arquivos de licença livre (CC0) em `cliente/public/`;
  informe a origem de cada um.

## 6. Polimento visual
6.1 Mulligan: na tela de mão inicial, ao passar o mouse a carta sobe um pouco e cresce de leve, e as
    vizinhas se afastam, tudo suave (transição de ~150–200 ms, sem tremer).
6.2 Faixa de fases, turno e botão Passar: mais fina, elegante e delicada (menos altura, tipografia
    mais leve, menos peso visual), sem perder a leitura de qual etapa está ativa.

## Restrições
- O motor de regras continua o mesmo; mude só o necessário e diga o quê e por quê.
- Bots, 1v1, 4 jogadores, reconexão e partidas salvas continuam funcionando.

## Processo
Corrija os bugs da seção 1 direto. Para as seções 2 a 4, me mostre uma proposta curta (pode ser um
protótipo estático, como na fase 7, com o resultado do levantamento da seção 2.5) e implemente depois do
meu ok. As seções 5 e 6 podem ir junto com a implementação.

## Pronto quando
- `npm run typecheck` e a suíte de testes passam; testes novos no servidor para o Desfazer (incluindo
  recusa, prazo e jogadas de outros desfeitas junto) e para a regra de auxílios da sala (pagamento
  automático recusado quando a sala proíbe).
- `node ferramentas/capturas.ts` com capturas novas: janela da barra lateral aberta, barra recolhida
  nas duas resoluções, Configurações › Auxílios (incluindo travada por sala que proíbe), a mesa em Mesa
  real e em Completo, hover no mulligan, ataque marcado, bloqueio, efeito de dano/vida e o pedido de
  desfazer. Confira imagem por imagem.
- `node ferramentas/e2e.ts` passa inteiro.
- `PROGRESSO.md` atualizado com a fase 8 e commit no repositório `jogo/`.
