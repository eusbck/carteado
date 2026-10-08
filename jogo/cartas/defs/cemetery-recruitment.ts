// Cemetery Recruitment
// Return target creature card from your graveyard to your hand. If it's a Zombie card, draw a card.
import { chars, defineCard, draw, is, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cemetery Recruitment',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
      *effect(c) {
        // ruling 1: alvo ilegal na resolução = a mágica não resolve (CR 608.2b), sem comprar
        const id = tgt(c);
        if (id === null) return;
        const zumbi = chars(c.g, id).subtypes.includes('Zombie');
        yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
        if (zumbi) yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: { 1: 'teste: CR 608.2b: alvo ilegal na resolução, não resolve e não compra' },
});
