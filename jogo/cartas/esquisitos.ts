// Peças repetidas nas cartas do deck Odd and Ends.
import { chooseItems, controlledBy, exile, is, isLand, mayCastFree, moveObjects, nameOf } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import { shuffle } from '../motor/rng.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/**
 * "Esse jogador exila cartas do topo do grimório dele até exilar uma carta instantânea ou de feitiço. Você pode conjurar
 * essa carta sem pagar o custo de mana. Depois as cartas exiladas que não foram conjuradas vão para o fundo desse
 * grimório em ordem aleatória." (Chaos Wand, Dazzling Sphinx)
 */
export function* exilaAteMagica(c: Ctx, p: PlayerId, rotulo: string): Gen<void> {
  const s = c.g.state;
  const exiladas: ObjId[] = [];
  let achada: ObjId | null = null;
  while (s.zones.library[p].length) {
    const [ex] = yield* exile(c.g, [s.zones.library[p][0]]);
    if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') break;
    exiladas.push(ex);
    if (is.instantOrSorcery({ g: c.g, you: c.you, source: c.source }, ex)) { achada = ex; break; }
  }
  if (achada !== null) yield* mayCastFree(c.g, c.you, achada, `${rotulo}: conjurar ${nameOf(c.g, achada)} sem pagar o custo de mana?`);
  const resto = exiladas.filter((id) => s.objects[id]?.zone === 'exile');
  if (resto.length) yield* moveObjects(c.g, shuffle(s.rng, [...resto]).map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
}

/** "olhe as N cartas do topo do seu grimório e ponha-as de volta em qualquer ordem" (CR 401.4): a primeira escolhida fica no topo */
export function* reordenaTopo(c: Ctx, n: number, rotulo: string): Gen<void> {
  const s = c.g.state;
  const topo = s.zones.library[c.you].slice(0, Math.max(0, n));
  if (topo.length < 2) return;
  const ordem = (yield* chooseItems(c.g, c.you, `${rotulo}: ponha as cartas de volta no topo na ordem que quiser (a primeira escolhida fica no topo)`,
    topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), topo.length, topo.length, true)).map(Number);
  const lib = s.zones.library[c.you];
  s.zones.library[c.you] = [...ordem, ...lib.filter((id) => !ordem.includes(id))];
  c.g.bump();
}

/** um oponente controla mais terrenos que o jogador? */
export function oponenteComMaisTerrenos(g: G, p: PlayerId): boolean {
  const conta = (x: PlayerId) => controlledBy(g, x, (id) => isLand(g, id)).length;
  const meus = conta(p);
  return g.opponents(p).some((x) => conta(x) > meus);
}
