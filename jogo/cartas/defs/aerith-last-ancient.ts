// Aerith, Last Ancient
// Lifelink
// Raise — At the beginning of your end step, if you gained life this turn, return target creature card from your
// graveyard to your hand. If you gained 7 or more life this turn, return that card to the battlefield instead.
import { defineCard, isCreature, keyword, moveObjects, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Aerith, Last Ancient',
  faces: [{
    abilities: [
      keyword('lifelink'),
      // CR 603.4 (ruling 1): condição interveniente
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (c.g.state.turnStats[c.you].lifeGained >= 7) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        else yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        targets: [t.card('graveyard', (c, id) => isCreature(c.g, id), 'carta de criatura alvo do seu cemitério', 'you')],
        text: 'Erguer — No início da sua etapa final, se você ganhou vida neste turno, devolva a carta de criatura alvo do seu cemitério para a sua mão. Se você ganhou 7 ou mais pontos de vida neste turno, em vez disso, devolva-a ao campo de batalha.',
      }),
    ],
  }],
  rulings: { 1: 'teste: sem ganhar vida, não dispara; com 7 ou mais, a carta volta ao campo' },
});
