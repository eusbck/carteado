// Silent Clearing
// {T}, Pay 1 life: Add {W} or {B}.
// {1}, {T}, Sacrifice this land: Draw a card.
import { activated, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Silent Clearing',
  faces: [{
    abilities: [
      // pagar vida faz parte do custo da habilidade de mana (CR 118.3, 605.3b)
      mana(['W', 'B'], { cost: '{T}, Pay 1 life', text: '{T}, Pague 1 de vida: Adicione {W} ou {B}.' }),
      activated('{1}, {T}, Sacrifice this land', function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: '{1}, {T}, Sacrifique este terreno: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});
