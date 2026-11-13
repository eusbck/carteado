// Horizon of Progress
// {T}, Pay 1 life: Add one mana of any type that a land you control could produce.
// {3}, {T}: You may put a land card from your hand onto the battlefield tapped.
// {1}, {T}, Sacrifice this land: Draw a card.
import { activated, chooseItems, controlledBy, couldProduce, defineCard, draw, isLand, mana, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Horizon of Progress',
  faces: [{
    abilities: [
      // rulings 1 a 3: os tipos de mana (as cinco cores e incolor) que as habilidades de mana dos seus terrenos produzem,
      // sem olhar custo nem se dá para ativar agora; ela mesma não conta (CR 106.7)
      mana((c) => {
        const tipos = new Set<ManaType>();
        const visto = new Set<number>([c.source]);
        for (const id of controlledBy(c.g, c.you, (x) => isLand(c.g, x) && x !== c.source)) for (const tp of couldProduce(c.g, id, visto)) tipos.add(tp);
        return (['W', 'U', 'B', 'R', 'G', 'C'] as ManaType[]).filter((tp) => tipos.has(tp)).map((tp) => [tp]);
      }, { cost: '{T}, Pay 1 life', text: '{T}, Pague 1 de vida: Adicione uma mana de qualquer tipo que um terreno que você controla poderia produzir.' }),
      activated('{3}, {T}', function* (c) {
        const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terrenos.length) return;
        const r = yield* chooseItems(c.g, c.you, 'Horizon of Progress: você pode pôr uma carta de terreno da sua mão no campo virada', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (r.length) yield* putOntoBattlefield(c.g, [{ id: Number(r[0]), controller: c.you, tapped: true }], 'effect');
      }, { text: '{3}, {T}: Você pode pôr uma carta de terreno da sua mão no campo virada.' }),
      activated('{1}, {T}, Sacrifice this land', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, {T}, Sacrifique este terreno: Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 106.1 — os tipos de mana são as cinco cores e incolor',
    2: 'teste: produz o que os seus terrenos produziriam (um terreno com tipo trocado conta o tipo novo)',
    3: 'teste: não olha custo nem se o terreno está virado',
  },
});
