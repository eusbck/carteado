// Marwyn, the Preserver
// Lands you control have hexproof.
// {2}: Return target land card from your graveyard to your hand.
import { activated, and, anthem, defineCard, is, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Marwyn, the Preserver',
  faces: [{
    abilities: [
      anthem(and(is.land, is.yours), () => [{ k: 'addKeyword', kw: 'hexproof' }], 'Os terrenos que você controla têm resistência a magia.'),
      activated('{2}', function* (c) { const id = tgt(c); if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect'); },
        { targets: [t.card('graveyard', is.land, 'carta de terreno alvo do seu cemitério')], text: '{2}: Devolva a carta de terreno alvo do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {},
});
