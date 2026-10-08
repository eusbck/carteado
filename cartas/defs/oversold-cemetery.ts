// Oversold Cemetery
// At the beginning of your upkeep, if you have four or more creature cards in your graveyard, you may return target
// creature card from your graveyard to your hand.
import { defineCard, is, isCreature, moveObjects, nameOf, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/api.ts';

const quatroOuMais = (c: SCtx) => c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length >= 4;

export default defineCard({
  name: 'Oversold Cemetery',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Oversold Cemetery: devolver ${nameOf(c.g, id)} para a mão?`)) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        // ruling 1: cláusula "se" interveniente (CR 603.4): conferida ao disparar e de novo ao resolver
        condition: quatroOuMais,
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
        text: 'No início da sua manutenção, se você tiver quatro ou mais cartas de criatura no seu cemitério, você pode devolver a carta de criatura alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: { 1: 'teste: CR 603.4: com menos de quatro ao resolver, não faz nada' },
});
