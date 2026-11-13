// Flare of Malice
// You may sacrifice a nontoken black creature rather than pay this spell's mana cost.
// Each opponent sacrifices a creature or planeswalker with the greatest mana value among creatures and planeswalkers
// they control.
import { chars, controllerOf, controlledBy, defineCard, eachSacrifices, isCreature, isType, manaValue } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

const criaturaOuPw = (g: G, id: ObjId): boolean => isCreature(g, id) || isType(g, id, 'Planeswalker');

/** o maior valor de mana entre as criaturas e os planeswalkers do jogador */
function maior(g: G, p: PlayerId): number {
  return Math.max(-1, ...controlledBy(g, p, (id) => criaturaOuPw(g, id)).map((id) => manaValue(g, id)));
}

export default defineCard({
  name: 'Flare of Malice',
  faces: [{
    // CR 118.9: custo alternativo, só da mão
    altCosts: [{
      key: 'flare', label: 'sacrificar uma criatura preta que não é ficha', zone: 'hand', mana: '',
      parts: [{ k: 'sacrifice', n: 1, label: 'uma criatura preta que não é ficha', filter: (c, id) => isCreature(c.g, id) && !c.g.state.objects[id].isToken && chars(c.g, id).colors.includes('B') }],
    }],
    spell: {
      *effect(c) {
        const g = c.g;
        const maiores = new Map(g.opponents(c.you).map((p) => [p, maior(g, p)]));
        // rulings 1-2: cada oponente escolhe entre as empatadas, em ordem de turno; sacrificadas ao mesmo tempo
        yield* eachSacrifices(c, g.opponents(c.you), (id) => criaturaOuPw(g, id) && manaValue(g, id) === maiores.get(controllerOf(g, id)), 1, 'uma criatura ou planeswalker de maior valor de mana');
      },
    },
  }],
  rulings: {
    1: 'teste: cada oponente sacrifica a criatura ou planeswalker de maior valor de mana',
    2: 'regra geral: CR 101.4 — escolhas em ordem de turno, sacrifícios ao mesmo tempo (motor/efeitos.ts eachSacrifices)',
  },
});
