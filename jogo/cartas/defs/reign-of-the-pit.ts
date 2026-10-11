// Reign of the Pit
// Each player sacrifices a creature of their choice. Create an X/X black Demon creature token with flying, where X is
// the total power of the creatures sacrificed this way.
import { chooseItems, createTokens, creaturesOf, defineCard, nameOf, objItem, power, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Reign of the Pit',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const escolhidas: ObjId[] = [];
        // ruling 1 (CR 101.4): você escolhe primeiro, depois os outros em ordem de turno; sacrificam ao mesmo tempo
        const ordem = [c.you, ...g.apnap().filter((p) => p !== c.you)];
        for (const p of ordem) {
          const criaturas = creaturesOf(g, p);
          if (!criaturas.length) continue;
          const [esc] = criaturas.length === 1 ? [String(criaturas[0])] : yield* chooseItems(g, p, 'Reign of the Pit: sacrifique uma criatura', criaturas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          escolhidas.push(Number(esc));
        }
        // ruling 2: a força como existia no campo, mesmo negativa
        const forcas = new Map(escolhidas.map((id) => [id, power(g, id)]));
        const res = escolhidas.length ? yield* sacrifice(g, escolhidas) : [];
        const x = Math.max(0, escolhidas.filter((_, i) => res[i] !== null && res[i] !== undefined).reduce((s, id) => s + (forcas.get(id) ?? 0), 0));
        yield* createTokens(g, c.you, { copyOf: { def: 'Demon X/X', face: 0, except: { power: x, toughness: x } } }, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador sacrifica uma criatura à escolha dele, e o Demon tem a soma das forças sacrificadas',
    2: 'teste: cada jogador sacrifica uma criatura à escolha dele, e o Demon tem a soma das forças sacrificadas',
  },
});
