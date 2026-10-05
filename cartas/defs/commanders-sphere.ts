// Commander's Sphere
// {T}: Add one mana of any color in your commander's color identity.
// Sacrifice this artifact: Draw a card.
import { activated, defineCard, draw, manaCommanderIdentity } from '../../motor/api.ts';

export default defineCard({
  name: "Commander's Sphere",
  faces: [{
    abilities: [
      manaCommanderIdentity(),
      activated('Sacrifice this artifact', function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sacrifique este artefato: Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: comandante incolor não faz produzir {C}',
    2: 'teste: com dois comandantes, a identidade combinada',
    3: 'teste: sem comandante, não produz mana',
  },
});
