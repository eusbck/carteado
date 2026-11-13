// Tectonic Split
// As an additional cost to cast this spell, sacrifice half the lands you control, rounded up.
// Hexproof
// Lands you control have "{T}: Add three mana of any one color."
import { additionalCost, and, anthem, chooseItems, controlledBy, defineAbility, defineCard, is, isLand, keyword, mana, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { CostPart } from '../../motor/defs.ts';

// a habilidade concedida aos terrenos (CR 613.1f, camada 6)
const TRES = defineAbility('Tectonic Split:terrenos', mana(() => [['W', 'W', 'W'], ['U', 'U', 'U'], ['B', 'B', 'B'], ['R', 'R', 'R'], ['G', 'G', 'G']], { text: '{T}: Adicione três manas de qualquer uma cor.' }));

// "sacrifique metade dos terrenos que você controla, arredondado para cima": a quantidade é a do momento do pagamento
// (CR 601.2h); sem terrenos, sacrifica zero
const METADE: CostPart = {
  k: 'custom', label: 'Sacrifique metade dos seus terrenos (arredondado para cima)',
  canPay: () => true,
  *pay(c) {
    const meus = controlledBy(c.g, c.you, (id) => isLand(c.g, id));
    const n = Math.ceil(meus.length / 2);
    if (n === 0) return { sacrificed: [] };
    const esc = n === meus.length ? meus.map(String) : yield* chooseItems(c.g, c.you, `Sacrifique ${n} terreno(s) (metade, arredondado para cima)`, meus.map((id) => objItem(c.g, id, nameOf(c.g, id))), n, n);
    const ids = esc.map(Number);
    yield* sacrifice(c.g, ids);
    return { sacrificed: ids };
  },
};

export default defineCard({
  name: 'Tectonic Split',
  faces: [{
    additionalCosts: [additionalCost('metade', 'sacrifique metade dos seus terrenos, arredondado para cima', [METADE])],
    abilities: [
      keyword('hexproof'),
      anthem(and(is.land, is.yours), () => [{ k: 'addAbility', id: TRES.id! }], 'Os terrenos que você controla têm "{T}: Adicione três manas de qualquer uma cor."'),
    ],
  }],
  rulings: {},
});
