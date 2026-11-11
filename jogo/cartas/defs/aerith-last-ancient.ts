// Aerith, Last Ancient
// Lifelink
// Raise — At the beginning of your end step, if you gained life this turn, return target creature card from your
// graveyard to your hand. If you gained 7 or more life this turn, return that card to the battlefield instead.
import { defineCard, is, keyword, moveObjects, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Aerith, Last Ancient',
  faces: [{
    abilities: [
      keyword('lifelink'),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: a quantidade é conferida na resolução; o ganho com o gatilho na pilha conta
        if ((c.g.state.turnStats[c.you].lifeGained ?? 0) >= 7) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        else yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo do seu cemitério', 'you')],
        // CR 603.4: condição interveniente, conferida ao disparar e ao resolver
        condition: (c) => (c.g.state.turnStats[c.you].lifeGained ?? 0) > 0,
        text: 'Ressurgir — No início da sua etapa final, se você ganhou vida neste turno, devolva a carta de criatura alvo do seu cemitério para a sua mão. Se você ganhou 7 ou mais pontos de vida neste turno, em vez disso, devolva essa carta para o campo de batalha.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com 5 de vida ganhos, ganhar mais 2 com o gatilho na pilha devolve a carta ao campo',
  },
});
