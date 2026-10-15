// Hall of Heliod's Generosity
// {T}: Add {C}.
// {1}{W}, {T}: Put target enchantment card from your graveyard on top of your library.
import { activated, defineCard, is, mana, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Hall of Heliod's Generosity",
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      activated('{1}{W}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'library', position: 'top' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.enchantment, 'carta de encantamento alvo do seu cemitério', 'you')],
        text: '{1}{W}, {T}: Coloque a carta de encantamento alvo do seu cemitério no topo do seu grimório.',
      }),
    ],
  }],
  rulings: {},
});
