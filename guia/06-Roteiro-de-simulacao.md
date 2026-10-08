# Roteiro de simulação e base para um motor futuro

## Usar o laboratório que está na pasta

Abra `simulador/index.html`. A mesa didática tem quatro jogadores por padrão; você pode escolher duas ou mais pessoas. Ela começa na manutenção do primeiro turno, depois de preparação, mulligan e desvirar. Não há deck real: cartas e habilidades genéricas representam categorias de timing, e seus custos/recursos são assumidos como disponíveis.

O motor acompanha jogador ativo, prioridade, fase/etapa, pilha, passes consecutivos, limite de terreno e uso de lealdade. O combate é previamente configurado para treinar janelas: declarações e dano aparecem como ações automáticas no histórico; escolha de criaturas, bloqueios, dano efetivo e efeitos de cartas não são calculados. A configuração de iniciativa/golpe duplo representa um combatente que permanece elegível para as etapas demonstradas. Não troque essa configuração no meio do combate: reinicie o exemplo.

“Passar prioridade” age uma vez. “Todos passam” representa uma volta inteira **a partir de quem está com prioridade**, interrompida assim que resolve um objeto ou avança uma etapa. Isso impede o atalho de resolver toda a pilha sem reabrir respostas.

Há uma opção de **exemplo de gatilho na limpeza**. Nela, um descarte necessário gera um gatilho fictício e abre a janela excepcional de CR 514.3a. Depois, o motor faz uma nova limpeza e só então troca de turno. Sem essa opção, a limpeza ocorre sem prioridade e o próximo turno começa após desvirar.

## Exercício A — passar e responder

1. Passe pela manutenção e compra até a primeira principal de Ana.
2. Ana conjura uma feitiçaria de treino. Ela continua com prioridade.
3. Ana passa; Bruno recebe prioridade e conjura uma instantânea.
4. Bruno continua com prioridade. Passe com Bruno, Carla, Diego e Ana.
5. A instantânea resolve. A feitiçaria permanece na pilha.
6. Ana recebe prioridade. Todos precisam passar novamente para resolver a feitiçaria.
7. Com a pilha vazia, outra volta de passes leva ao início do combate.

**O que observar:** passar prioridade, resolver um objeto e encerrar uma fase são eventos diferentes. **CR 117.3–117.5.**

## Exercício B — guerra de anulações

1. Na principal, Ana conjura a feitiçaria #1 e passa.
2. Bruno conjura uma anulação #2 mirando #1, depois passa.
3. Carla conjura uma anulação #3 mirando #2.
4. Todos passam: #3 resolve e remove #2 da pilha.
5. Ana volta a ter prioridade. #1 ainda pode receber novas respostas.
6. Todos passam: #1 resolve.

**O que observar:** anular a anulação não anula a mágica original; custos pagos não voltam. **CR 701.6; 117.4.**

## Exercício C — ações que não usam pilha

1. Na primeira principal de Ana, jogue o terreno de treino.
2. Ele não entra na pilha; Ana conserva prioridade.
3. Tente jogar um segundo terreno: sem uma permissão adicional, o motor recusa.
4. Ative mana: ela é produzida sem pilha no exemplo, e Ana conserva prioridade.
5. Passe até a segunda principal e tente outro terreno: o limite do mesmo turno ainda foi usado.

**O que observar:** jogar terreno é ação especial; passar prioridade não renova recursos nem esvazia mana. Este laboratório não mantém uma reserva detalhada de mana. **CR 305; 605; 106.4.**

## Exercício D — timing de feitiçaria e lealdade

1. Fora da sua principal ou sem prioridade, tente uma feitiçaria: a ação é recusada.
2. Na principal, ative uma habilidade genérica para colocá-la na pilha e tente uma criatura sem flash: a pilha cheia impede.
3. Use a criatura com flash na mesma situação: ela pode ser conjurada por quem tiver prioridade.
4. Na sua principal com pilha vazia, ative lealdade do planeswalker de treino já disponível.
5. Depois da resolução, tente lealdade outra vez no mesmo turno: a restrição continua, inclusive na principal 2.

**O que observar:** ativadas comuns e lealdade têm restrições diferentes. O planeswalker de treino é uma premissa do cenário, não uma carta que o motor procura em um deck. **CR 117.1; 606.3.**

## Exercício E — combate e limpeza

1. Reinicie com combate contendo atacantes e primeira iniciativa/golpe duplo.
2. Avance ao início do combate. Essa é a janela para impedir a declaração.
3. Avance à declaração de atacantes: o anúncio automático já ocorreu antes da prioridade exibida.
4. Avance aos bloqueadores: os bloqueios automáticos já ocorreram; aqui pode agir antes do dano.
5. Avance ao primeiro dano. Sua aplicação já ocorreu; há prioridade antes da segunda etapa de dano.
6. Compare com um exemplo sem atacantes, que pula bloqueadores/dano.
7. Reinicie com gatilho de limpeza habilitado e avance até o fim. Observe a janela excepcional, a resolução do gatilho e a nova limpeza.

**O que observar:** não existe prioridade no meio das ações automáticas; a janela de dano exibida é **depois** daquele dano. **CR 506.1; 508–510; 514.3a.**

## Perguntas de treinamento

Os cenários de múltipla escolha ficam em `dados/cenarios.json`. Cada um tem situação, alternativas, gabarito, explicação, assunto e números de regras. Os cenários cobrem comandante, timing, alvos, custos, combate, ações de estado e multiplayer, além do que o motor de pilha demonstra diretamente.

## Estrutura recomendada para uma simulação de decks reais

| Área | Estado necessário |
| --- | --- |
| Partida | Número inicial de jogadores, ordem de turnos, ativo, prioridade, passos/fases e turnos extras. |
| Jogadores | Vida, veneno, compras, limite de mão, mana com restrições, terrenos jogados e permissões. |
| Objetos | ID de instância, carta Oracle, dono, controlador, zona, características, estado, marcadores e dano. |
| Comandantes | ID da carta designada, casts da zona de comando por jogador, zonas e dano por carta por jogador. |
| Pilha | IDs, modos, alvos, X, custos, controlador, fonte e última informação conhecida pertinente. |
| Eventos | Conjuração, ativação, entrada, saída, ataque, bloqueio, dano, compra, descarte e perda/ganho de vida. |
| Regras | Substituições/prevenções, gatilhos pendentes/APNAP, ações de estado repetidas, camadas e duração. |
| Comunicação | Ações declaradas, passes, interrupções de atalhos e um histórico reproduzível. |

A rotina central precisa verificar legalidade; realizar anúncio e pagamento sem intercalar respostas; gerar eventos e gatilhos; tratar ações de estado repetidamente; ordenar gatilhos APNAP; dar prioridade; resolver só o topo depois dos passes; e só avançar com pilha vazia após todos passarem. Exceções de cartas e das variantes devem ser aplicadas explicitamente.

Uma engine geral exige implementar o texto das cartas, escolhas humanas/IA, informações ocultas, habilidades específicas, custos e todos os casos pertinentes. Ter o manual indexado não significa ter implementado automaticamente suas regras. Esta pasta entrega a base normativa completa, exemplos e o motor didático delimitado; uma simulação fiel dos seus decks ainda precisa das listas e de implementação/testes dessas cartas.

O arquivo `dados/estado-partida-exemplo.json` é um modelo de entrada para esse trabalho. Ele não afirma que o laboratório atual já executa todos os campos.
