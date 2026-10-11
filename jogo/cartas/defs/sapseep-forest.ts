// Sapseep Forest
// ({T}: Add {G}.)
// This land enters tapped.
// {G}, {T}: You gain 1 life. Activate only if you control two or more green permanents.
import { activated, chars, controlledBy, defineCard, gainLife, land } from '../../motor/api.ts';

export default defineCard({
  name: 'Sapseep Forest',
  faces: [{
    abilities: [
      // CR 305.6: Forest dá a habilidade de mana {G} (motor/chars.ts)
      land.tapped(),
      activated('{G}, {T}', function* (c) {
        gainLife(c.g, c.you, 1, c.source);
      }, {
        condition: (c) => controlledBy(c.g, c.you, (id) => chars(c.g, id).colors.includes('G')).length >= 2,
        text: '{G}, {T}: Você ganha 1 de vida. Ative apenas se você controlar duas ou mais permanentes verdes.',
      }),
    ],
  }],
  rulings: {},
});
