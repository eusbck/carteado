// Rampart Architect
// Whenever this creature enters or attacks, create a 1/3 white Wall creature token with defender.
// Whenever a creature you control with defender dies, you may search your library for a basic land card, put that card
// onto the battlefield tapped, then shuffle.
import { createTokens, defineCard, etb, maySearchBasicToBattlefield, on, triggered } from '../../motor/api.ts';

function* muro(c: Parameters<Parameters<typeof etb>[0]>[0]) { yield* createTokens(c.g, c.you, 'Wall', 1); }

export default defineCard({
  name: 'Rampart Architect',
  faces: [{
    abilities: [
      etb(muro, { text: 'Quando esta criatura entra, crie uma ficha de criatura Wall branca 1/3 com defensor.' }),
      triggered(on.selfAttacks(), muro, { text: 'Quando esta criatura ataca, crie uma ficha de criatura Wall branca 1/3 com defensor.' }),
      triggered(on.dies((c, l) => l.controller === c.you && l.abilities.some((a) => a.kw === 'defender')), function* (c) {
        yield* maySearchBasicToBattlefield(c, c.you, true);
      }, { text: 'Sempre que uma criatura com defensor que você controla morre, você pode procurar uma carta de terreno básico e colocá-la no campo virada.' }),
    ],
  }],
  rulings: {},
});
