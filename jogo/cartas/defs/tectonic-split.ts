// Tectonic Split
// As an additional cost to cast this spell, sacrifice half the lands you control, rounded up.
// Hexproof
// Lands you control have "{T}: Add three mana of any one color."
import { and, anthem, defineAbility, defineCard, is, keyword, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { terrenosDe } from '../terras.ts';

const TRES = defineAbility('Tectonic Split:mana', mana(() => (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((x) => [x, x, x]), { text: '{T}: Adicione três manas de uma cor qualquer.' }));

export default defineCard({
  name: 'Tectonic Split',
  faces: [{
    // CR 601.2h: metade dos terrenos, arredondada para cima, contada ao conjurar
    additionalCosts: [{
      key: 'sacrificar', label: 'sacrificar metade dos seus terrenos (para cima)', optional: false,
      parts: [{ k: 'sacrifice', n: (c) => Math.ceil(terrenosDe(c.g, c.you).length / 2), filter: (c, id) => is.land(c, id), label: 'terrenos (metade, para cima)' }],
    }],
    abilities: [
      keyword('hexproof'),
      anthem(and(is.land, is.yours), () => [{ k: 'addAbility', id: TRES.id! }], 'Os terrenos que você controla têm "{T}: Adicione três manas de uma cor qualquer."'),
    ],
  }],
  rulings: {},
});
