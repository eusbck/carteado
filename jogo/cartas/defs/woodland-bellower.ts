// Woodland Bellower
// When this creature enters, you may search your library for a nonlegendary green creature card with mana value 3 or
// less, put it onto the battlefield, then shuffle.
import { chars, defineCard, etb, isCreature, manaValue, searchTo, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Woodland Bellower',
  faces: [{
    abilities: [
      etb(function* (c) {
        const g = c.g;
        if (!(yield* yesNo(g, c.you, 'Woodland Bellower: procurar uma criatura verde não lendária com valor de mana 3 ou menos?'))) return;
        // ruling 1: na biblioteca, {X} vale 0 (CR 202.3e)
        yield* searchTo(c, c.you, (id) => {
          const ch = chars(g, id);
          return isCreature(g, id) && ch.colors.includes('G') && !ch.supertypes.includes('Legendary') && manaValue(g, id) <= 3;
        }, 1, 'battlefield', { prompt: 'Woodland Bellower: procure uma carta de criatura verde não lendária com valor de mana 3 ou menos' });
      }, { text: 'Quando esta criatura entra, você pode procurar no seu grimório uma carta de criatura verde não lendária com valor de mana 3 ou menos, colocá-la no campo e depois embaralhar.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — fora da pilha, {X} vale 0 no valor de mana (motor/chars.ts manaValue)',
  },
});
