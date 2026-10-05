// Kor Spiritdancer
// This creature gets +2/+2 for each Aura attached to it.
// Whenever you cast an Aura spell, you may draw a card.
import { defineCard, draw, is, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Kor Spiritdancer',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.id === c.source,
        mods: (c) => {
          const n = c.g.state.zones.battlefield.filter((id) => c.g.state.objects[id].attachedTo === c.source && is.subtype('Aura')(c, id)).length;
          return n ? [{ k: 'pt', p: 2 * n, t: 2 * n }] : [];
        },
        text: 'Esta criatura recebe +2/+2 para cada Aura anexada a ela.',
      }),
      // rulings 1-2: qualquer mágica de Aura; o gatilho resolve antes dela
      triggered(on.youCast(is.subtype('Aura')), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Kor Spiritdancer: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de Aura, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: dispara com Aura em outra criatura',
    2: 'regra geral: CR 603.3 — o gatilho vai para a pilha por cima da mágica',
  },
});
