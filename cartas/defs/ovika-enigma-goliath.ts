// Ovika, Enigma Goliath
// Flying
// Ward—{3}, Pay 3 life.
// Whenever you cast a noncreature spell, create X 1/1 red Phyrexian Goblin creature tokens, where X is the mana value
// of that spell. They gain haste until end of turn.
import { createTokens, defineCard, is, keywords, lkiChars, manaValue, not, on, triggered, untilEndOfTurn, ward } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Ovika, Enigma Goliath',
  faces: [{
    abilities: [
      ...keywords('flying'),
      ...ward('{3}, Pay 3 life'),
      triggered(on.youCast(not(is.creature)), function* (c) {
        // ruling 1: com {X}, o valor escolhido conta no valor de mana; anulada antes, vale a última informação
        const sp = c.event.spell as ObjId;
        const x = c.g.state.objects[sp] ? manaValue(c.g, sp) : (lkiChars(c.g, sp)?.manaValue ?? 0);
        if (x <= 0) return;
        const fichas = yield* createTokens(c.g, c.you, 'Phyrexian Goblin', x);
        untilEndOfTurn(c, fichas, [{ k: 'addKeyword', kw: 'haste' }]);
      }, { text: 'Sempre que você conjura uma mágica que não seja de criatura, crie X fichas de criatura Goblin Phyrexiano vermelha 1/1, sendo X o valor de mana daquela mágica. Elas ganham ímpeto até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: com {X}, o valor escolhido conta no valor de mana da mágica',
  },
});
