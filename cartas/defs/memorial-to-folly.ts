// Memorial to Folly
// This land enters tapped.
// {T}: Add {B}.
// {2}{B}, {T}, Sacrifice this land: Return target creature card from your graveyard to your hand.
import { activated, defineCard, is, land, mana, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Memorial to Folly',
  faces: [{
    abilities: [
      land.tapped(),
      mana('B'),
      activated('{2}{B}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo do seu cemitério')],
        text: '{2}{B}, {T}, Sacrifique este terreno: Devolva a carta de criatura alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {},
});
