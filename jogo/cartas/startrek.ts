// Ajudantes do deck Landing Party (Star Trek): "terrenos com nomes diferentes" (Strange new worlds) e "exile … e
// devolva ao campo no início da próxima etapa final" (Temporal Tribulation, Balance of Terror, Chief Kyle, The
// Guardian of Forever).
import { controlledBy, controllerOf, defineAbility, delayed, exile, isLand, nameOf, nextEndStepTrigger, putOntoBattlefield } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';
import { shuffle } from '../motor/rng.ts';
import { jog, objs, reg } from '../motor/registro.ts';

/**
 * "o número de terrenos com nomes diferentes que você controla" (Strange new worlds é só uma palavra de habilidade,
 * CR 207.2c). Terreno virado para baixo não tem nome (CR 708.2a) e não conta.
 */
export function terrenosComNomesDiferentes(g: G, p: PlayerId): number {
  const nomes = new Set<string>();
  for (const id of controlledBy(g, p, (x) => isLand(g, x))) {
    if (g.state.objects[id]?.faceDown) continue;
    nomes.add(nameOf(g, id));
  }
  return nomes.size;
}

/**
 * gatilho atrasado: as cartas voltam ao campo sob o controle dos donos (CR 603.7, 610.3c), se ainda estiverem na zona
 * para onde foram (`data.zona`, o exílio por padrão; o cemitério na The Guardian of Forever)
 */
export const VOLTA_NA_ETAPA_FINAL = defineAbility('Star Trek:voltaNaEtapaFinal', nextEndStepTrigger(function* (c) {
  const zona = (c.data.zona as string | undefined) ?? 'exile';
  const cartas = ((c.data.cartas as ObjId[] | undefined) ?? []).filter((id) => c.g.state.objects[id]?.zone === zona);
  if (!cartas.length) return;
  yield* putOntoBattlefield(c.g, cartas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
}, 'No início da próxima etapa final, devolva as cartas exiladas ao campo sob o controle dos donos.'));

/**
 * Exila os permanentes e cria o gatilho atrasado que os devolve no início da próxima etapa final. Fichas exiladas
 * deixam de existir (CR 111.7) e não voltam. Devolve os ids das cartas no exílio.
 */
export function* exilaAteAProximaEtapaFinal(c: Ctx, ids: ObjId[]): Gen<ObjId[]> {
  if (!ids.length) return [];
  const res = yield* exile(c.g, ids);
  const cartas = res.filter((x): x is ObjId => x !== null && c.g.state.objects[x]?.zone === 'exile' && !c.g.state.objects[x].isToken);
  if (cartas.length) delayed(c, VOLTA_NA_ETAPA_FINAL.id!, { data: { cartas } });
  return cartas;
}

/** o jogador defensor de quem esta criatura ataca (CR 506.2): o atacado, ou o controlador do planeswalker atacado */
export function defensorDe(g: G, atacante: ObjId): PlayerId | null {
  const a = g.state.combat?.attackers.find((x) => x.id === atacante && !x.removed);
  if (!a) return null;
  return a.target.kind === 'player' ? a.target.id : controllerOf(g, a.target.id);
}

/**
 * Revela cartas do topo do grimório até revelar uma que sirva (CR 701.20); devolve a achada (ou null) e as outras
 * reveladas, que quem chama põe onde a carta mandar.
 */
export function revelaAte(g: G, p: PlayerId, serve: (id: ObjId) => boolean): { achada: ObjId | null; outras: ObjId[] } {
  const lib = g.state.zones.library[p];
  const outras: ObjId[] = [];
  let achada: ObjId | null = null;
  for (const id of lib) {
    if (serve(id)) { achada = id; break; }
    outras.push(id);
  }
  const reveladas = achada === null ? outras : [...outras, achada];
  if (reveladas.length) reg(g, 'revela', { rule: '701.20' })`${jog(p)} revela ${objs(reveladas)}.`;
  return { achada, outras };
}

/** põe as cartas (no grimório) no fundo dele, em ordem aleatória */
export function paraOFundoAleatorio(g: G, p: PlayerId, ids: ObjId[]): void {
  const ficam = ids.filter((id) => g.state.objects[id]?.zone === 'library');
  if (!ficam.length) return;
  const ordem = shuffle(g.state.rng, ficam);
  g.state.zones.library[p] = [...g.state.zones.library[p].filter((id) => !ordem.includes(id)), ...ordem];
  g.bump();
}
