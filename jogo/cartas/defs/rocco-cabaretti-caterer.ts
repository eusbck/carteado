// Rocco, Cabaretti Caterer
// When Rocco enters, if you cast it, you may search your library for a creature card with mana value X or less, put it
// onto the battlefield, then shuffle.
import { defineCard, etb, isCreature, lkiObj, manaValue, searchTo, yesNo } from '../../motor/api.ts';

/** a mágica que virou o Rocco (objeto.data.spell, CR 400.7d): só existe se ele foi conjurado */
function magicaDoRocco(c: { g: Parameters<typeof lkiObj>[0]; source: number }): { x?: number } | undefined {
  const o = c.g.state.objects[c.source] ?? lkiObj(c.g, c.source);
  return o?.data.spell as { x?: number } | undefined;
}

export default defineCard({
  name: 'Rocco, Cabaretti Caterer',
  faces: [{
    abilities: [
      // CR 603.4: "se você o conjurou" é condição interveniente
      etb(function* (c) {
        const x = Number(magicaDoRocco(c)?.x ?? 0);
        if (!(yield* yesNo(c.g, c.you, `Rocco: procurar uma carta de criatura com valor de mana ${x} ou menos?`))) return;
        yield* searchTo(c, c.you, (id) => isCreature(c.g, id) && manaValue(c.g, id) <= x, 1, 'battlefield', { prompt: `Rocco: procure uma carta de criatura com valor de mana ${x} ou menos` });
      }, {
        condition: (c) => magicaDoRocco(c) !== undefined,
        text: 'Quando Rocco entra, se você o conjurou, você pode procurar no seu grimório uma carta de criatura com valor de mana X ou menos, colocá-la no campo e depois embaralhar.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — conjurado sem pagar o custo de mana, X é 0 (motor/stack.ts totalSpellCost)',
  },
});
