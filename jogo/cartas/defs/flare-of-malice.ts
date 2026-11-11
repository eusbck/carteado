// Flare of Malice
// You may sacrifice a nontoken black creature rather than pay this spell's mana cost.
// Each opponent sacrifices a creature or planeswalker with the greatest mana value among creatures and planeswalkers
// they control.
import { chars, chooseItems, controlledBy, defineCard, isCreature, isType, manaValue, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Flare of Malice',
  faces: [{
    altCosts: [{
      key: 'sacrificar', label: 'sacrificar uma criatura preta que não seja ficha', zone: 'hand', mana: '',
      parts: [{ k: 'sacrifice', n: 1, filter: (c, id) => isCreature(c.g, id) && !c.g.state.objects[id].isToken && chars(c.g, id).colors.includes('B'), label: 'uma criatura preta que não seja ficha' }],
    }],
    spell: {
      *effect(c) {
        const escolhidos: ObjId[] = [];
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const cands = controlledBy(c.g, p, (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'));
          if (!cands.length) continue;
          const maior = Math.max(...cands.map((id) => manaValue(c.g, id)));
          const top = cands.filter((id) => manaValue(c.g, id) === maior);
          if (top.length === 1) { escolhidos.push(top[0]); continue; }
          const [e] = yield* chooseItems(c.g, p, 'Sacrifique uma criatura ou planeswalker de maior valor de mana', top.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
          escolhidos.push(Number(e));
        }
        if (escolhidos.length) yield* sacrifice(c.g, escolhidos);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9 — sacrificar é custo alternativo: não dá para combinar com outro',
    2: 'regra geral: CR 101.4 — com empate no maior valor, o oponente escolhe qual',
  },
});
