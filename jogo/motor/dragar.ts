// lote4-e: dragar (dredge, CR 702.52). "Dragar N" é uma habilidade estática que só funciona com a carta no cemitério:
// "enquanto você tiver pelo menos N cartas no grimório, se fosse comprar uma carta, você pode, em vez disso, moer N
// cartas e devolver esta carta do seu cemitério para a sua mão" (702.52a); com menos de N cartas no grimório, não dá
// (702.52b). É uma substituição de compra (CR 614.1a) e vale para qualquer compra, não só a da etapa de compra.
//
// Com várias cartas com dragar no cemitério, uma compra só pode ser substituída por uma delas (ruling da Life from the
// Loam): a primeira carta utilizável responde pelas outras e pergunta qual usar (ou nenhuma). Cada compra de "compre
// N" é perguntada à parte, e uma carta moída por uma dragagem já pode ser usada na compra seguinte (CR 121.2).

import { chars } from './chars.ts';
import { chooseItems } from './ask.ts';
import { mill, moveObjects } from './actions.ts';
import { registry, type SCtx, type StaticDef } from './defs.ts';
import { staticAbility } from './dsl.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId } from './types.ts';

/** as habilidades de dragar e o N de cada uma */
const dragar = new Map<StaticDef, number>();

/** o N de dragar da carta (null se ela não tem dragar) */
export function dredgeN(g: G, id: ObjId): number | null {
  for (const a of chars(g, id).abilities) {
    const def = registry.abilities.get(a.id);
    if (def && def.kind === 'static' && dragar.has(def)) return dragar.get(def)!;
  }
  return null;
}

/** cartas com dragar no cemitério do jogador que podem substituir uma compra agora (CR 702.52b) */
export function dredgeOptions(g: G, p: PlayerId): { id: ObjId; n: number }[] {
  const lib = g.state.zones.library[p].length;
  const out: { id: ObjId; n: number }[] = [];
  for (const id of g.state.zones.graveyard[p]) {
    const n = dredgeN(g, id);
    if (n !== null && n <= lib) out.push({ id, n });
  }
  return out;
}

/** "Dragar N" (CR 702.52a), na lista de habilidades da carta */
export function dredge(n: number): StaticDef {
  const def = staticAbility({
    zones: ['graveyard'],
    rules: {
      // só a primeira carta utilizável do cemitério oferece a substituição (ela pergunta por todas)
      drawReplaceApplies: (c: SCtx, player: PlayerId) => {
        if (player !== c.you) return false;
        const ops = dredgeOptions(c.g, player);
        return ops.length > 0 && ops[0].id === c.source;
      },
      *drawReplace(c: SCtx, player: PlayerId) {
        const g = c.g;
        const ops = dredgeOptions(g, player);
        if (!ops.length) return false;
        const nome = (id: ObjId) => chars(g, id).name;
        const [esc] = yield* chooseItems(g, player, 'Dragar: em vez de comprar uma carta, moer cartas e devolver uma carta com dragar do seu cemitério para a mão?',
          ops.map((o) => ({ id: String(o.id), label: `${nome(o.id)} (dragar ${o.n})` })), 0, 1);
        if (esc === undefined) return false;
        const op = ops.find((o) => String(o.id) === esc)!;
        g.log(`${g.state.players[player].name} draga ${nome(op.id)}: moe ${op.n} cartas em vez de comprar.`, { rule: '702.52a' });
        yield* mill(g, player, op.n);
        // a carta volta para a mão se ainda estiver no cemitério
        if (g.state.objects[op.id]?.zone === 'graveyard') yield* moveObjects(g, [{ id: op.id, to: 'hand' }], 'dredge');
        return true;
      },
    },
    text: `Dragar ${n} (Se você fosse comprar uma carta, em vez disso você pode moer ${n} cartas. Se fizer isso, devolva esta carta do seu cemitério para a sua mão.)`,
  });
  dragar.set(def, n);
  return def;
}
