// Marwyn, the Preserver
// Lands you control have hexproof. (They can't be the targets of spells or abilities your opponents control.)
// {2}: Return target land card from your graveyard to your hand.
import { activated, and, anthem, defineCard, is, isLand, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Marwyn, the Preserver',
  faces: [{
    abilities: [
      anthem(and(is.land, is.yours), () => [{ k: 'addKeyword', kw: 'hexproof' }], 'Os terrenos que você controla têm resistência a magia.'),
      activated('{2}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      }, {
        targets: [t.card('graveyard', (c, id) => isLand(c.g, id), 'carta de terreno alvo do seu cemitério', 'you')],
        text: '{2}: Devolva a carta de terreno alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {},
});
