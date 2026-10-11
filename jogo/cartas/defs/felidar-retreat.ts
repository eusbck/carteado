// Felidar Retreat
// Landfall — Whenever a land you control enters, choose one —
// • Create a 2/2 white Cat Beast creature token.
// • Put a +1/+1 counter on each creature you control. Those creatures gain vigilance until end of turn.
import { addCounters, createTokens, creaturesOf, defineCard, modal, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Felidar Retreat',
  faces: [{
    abilities: [
      // rulings 1-3: dispara sempre que um terreno seu entra, por qualquer motivo; o modo é escolhido ao pôr na pilha
      triggered(on.landfall(), function* () { /* os modos fazem tudo */ }, {
        modes: modal(1, 1, [
          { text: 'Crie uma ficha de criatura Cat Beast 2/2 branca', *effect(c) { yield* createTokens(c.g, c.you, 'Cat Beast', 1); } },
          {
            text: 'Coloque um marcador +1/+1 em cada criatura que você controla. Essas criaturas ganham vigilância até o fim do turno',
            *effect(c) {
              // ruling 4: só as criaturas que você controla na resolução, inclusive as que não receberam o marcador
              const ids = creaturesOf(c.g, c.you);
              for (const id of ids) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
              if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'vigilance' }]);
            },
          },
        ]),
        text: 'Aterragem — Sempre que um terreno que você controla entra, escolha um — Crie uma ficha Cat Beast 2/2 branca; ou coloque um marcador +1/+1 em cada criatura que você controla, e elas ganham vigilância até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: jogando um terreno, cria um Cat Beast 2/2 ou põe um marcador +1/+1 em cada criatura sua, com vigilância',
    2: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    3: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    4: 'teste: jogando um terreno, cria um Cat Beast 2/2 ou põe um marcador +1/+1 em cada criatura sua, com vigilância',
  },
});
