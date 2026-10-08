// Prismari Pianist
// Whenever you cast an instant or sorcery spell, create a 1/1 blue and red Elemental creature token. If that spell's
// mana value is 5 or greater, create three of those tokens instead.
import { createTokens, defineCard, is, lkiChars, on, or, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Prismari Pianist',
  faces: [{
    abilities: [triggered(on.youCast(or(is.type('Instant'), is.type('Sorcery'))), function* (c) {
      // rulings 1 e 3: valor de mana da mágica na pilha (X incluído; custos alternativos e adicionais não contam)
      const vm = lkiChars(c.g, c.event.spell as ObjId)?.manaValue ?? 0;
      yield* createTokens(c.g, c.you, 'Elemental 1/1', vm >= 5 ? 3 : 1);
    }, { text: 'Sempre que você conjura uma mágica instantânea ou feitiço, crie uma ficha de criatura Elemental azul e vermelha 1/1. Se o valor de mana dessa mágica for 5 ou mais, crie três dessas fichas.' })],
  }],
  rulings: {
    1: 'teste: X conta no valor de mana da mágica na pilha',
    2: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica, mesmo que ela seja anulada',
    3: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana',
  },
});
