// lote4-e (deck LandReanimator, Sin): ajudantes compartilhados de "terrenos importam" — aterragem, terrenos do
// cemitério para o campo, sacrificar quantos terrenos quiser, cartas de terreno indo para o cemitério.
import {
  chars, chooseItems, controlledBy, isLand, nameOf, objItem, putOntoBattlefield, sacrifice, searchLibrary,
  shuffleLibrary, type G, type Gen,
} from '../motor/api.ts';
import type { Ctx } from '../motor/defs.ts';
import type { GameEvent } from '../motor/events.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/**
 * Os três rulings de aterragem que se repetem (Hedron Crab, Tatyova, Rampaging Baloths…). `teste` é o título do teste
 * que cobre o gatilho; `de` é o número do primeiro desses rulings na carta.
 */
export function ATERRAGEM(teste: string, de = 1): Record<number, string> {
  return {
    [de]: teste,
    [de + 1]: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    [de + 2]: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
  };
}

/** terrenos que o jogador controla */
export function terrenosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => isLand(g, id));
}

/** a carta (num cemitério, ou que acabou de ir para ele) é uma carta de terreno? */
export function cartaDeTerreno(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && chars(g, id).types.includes('Land');
}

/**
 * "Coloque todas as cartas de terreno do seu cemitério no campo viradas" (Lumra, World Shaper). Devolve os terrenos
 * que entraram.
 */
export function* todosOsTerrenosDoCemiterio(g: G, p: PlayerId, tapped = true): Gen<ObjId[]> {
  const ids = g.state.zones.graveyard[p].filter((id) => cartaDeTerreno(g, id));
  if (!ids.length) return [];
  return yield* putOntoBattlefield(g, ids.map((id) => ({ id, controller: p, tapped })), 'effect');
}

/**
 * "Sacrifique quantos terrenos quiser" (Scapeshift, Genesis Device): o jogador escolhe, e devolve quantos foram
 * sacrificados de fato.
 */
export function* sacrificaTerrenos(c: Ctx, prompt: string, filtro: (id: ObjId) => boolean = (id) => isLand(c.g, id)): Gen<number> {
  const cands = controlledBy(c.g, c.you, filtro);
  if (!cands.length) return 0;
  const esc = yield* chooseItems(c.g, c.you, prompt, cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, cands.length);
  if (!esc.length) return 0;
  const res = yield* sacrifice(c.g, esc.map(Number));
  return res.filter((x) => x !== null).length;
}

/** "procure até N cartas de terreno [filtro], coloque-as no campo [viradas] e embaralhe" */
export function* buscaTerrenosParaOCampo(c: Ctx, n: number, prompt: string, opts: { tapped?: boolean; filter?: (id: ObjId) => boolean } = {}): Gen<ObjId[]> {
  if (n <= 0) { shuffleLibrary(c.g, c.you); return []; }
  const achados = yield* searchLibrary(c.g, c.you, c.you, { max: n, filter: (id) => isLand(c.g, id) && (!opts.filter || opts.filter(id)), prompt });
  const res = achados.length ? yield* putOntoBattlefield(c.g, achados.map((id) => ({ id, controller: c.you, tapped: opts.tapped ?? false })), 'search') : [];
  shuffleLibrary(c.g, c.you);
  return res;
}

/** terreno básico (para os filtros de busca) */
export function ehBasico(g: G, id: ObjId): boolean {
  return chars(g, id).supertypes.includes('Basic');
}

/**
 * Cartas de terreno de `p` que foram para o cemitério num lote de eventos (Gitrog: "de qualquer lugar"; Hedge
 * Shredder: só do grimório). Olha a carta já no cemitério.
 */
export function terrenosAoCemiterio(g: G, evs: GameEvent[], p: PlayerId, de?: string): ObjId[] {
  return evs.flatMap((e) => (e.type === 'zone' && e.to === 'graveyard' && e.owner === p && (!de || e.from === de) && g.state.objects[e.obj]?.zone === 'graveyard' && cartaDeTerreno(g, e.obj) ? [e.obj] : []));
}

