// Peças dos decks de terrenos (Hearthhull, LandReanimator): sacrificar terrenos, terrenos do cemitério, buscas.
import { controlledBy, isLand, on, putOntoBattlefield, searchTo } from '../motor/api.ts';
import type { Ctx, Gen, SCtx, TriggerSpec } from '../motor/defs.ts';
import type { GameEvent } from '../motor/events.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';
import { chars } from '../motor/api.ts';

const eraTerreno = (g: G, old: ObjId) => !!g.state.lki[old]?.chars.types.includes('Land');

/** "Sempre que você sacrifica um terreno": um disparo por terreno sacrificado */
export function voceSacrificaTerreno(): TriggerSpec {
  return on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && eraTerreno(c.g, e.old));
}

/** "Sempre que você sacrifica um permanente" */
export function voceSacrificaPermanente(): TriggerSpec {
  return on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you);
}

/** "Sempre que um ou mais cartas de terreno vão para o seu cemitério [de onde]" (um disparo por lote) */
export function terrenosVaoParaSeuCemiterio(de?: 'library'): TriggerSpec {
  return on.batch((evs: GameEvent[], c) => {
    const ids = evs.flatMap((e) => (e.type === 'zone' && e.to === 'graveyard' && e.owner === c.you && (!de || e.from === de)
      && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj) ? [e.obj] : []));
    return ids.length ? { cartas: ids } : false;
  });
}

/** "Sempre que um terreno que você controla vai para o cemitério vindo do campo" */
export function seuTerrenoVaiProCemiterio(): TriggerSpec {
  return on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && eraTerreno(c.g, e.old) && c.g.state.lki[e.old]?.chars.controller === c.you);
}

/** "Devolva todas as cartas de terreno do seu cemitério ao campo [virados]" */
export function* terrenosDoCemiterio(c: Ctx, virados = true): Gen<ObjId[]> {
  const ids = c.g.state.zones.graveyard[c.you].filter((id) => isLand(c.g, id));
  if (!ids.length) return [];
  return (yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, tapped: virados })), 'effect')).filter((x): x is ObjId => x !== null);
}

/** procura cartas de terreno (com filtro) e põe no campo; embaralha */
export function* buscaTerrenos(c: Ctx, n: number, filtro: (id: ObjId) => boolean = () => true, virados = false, prompt = 'Procure uma carta de terreno'): Gen<ObjId[]> {
  return yield* searchTo(c, c.you, (id) => isLand(c.g, id) && filtro(id), n, 'battlefield', { tapped: virados, prompt });
}

export const tipoDeTerreno = (g: G, id: ObjId, ...tipos: string[]) => chars(g, id).subtypes.some((s) => tipos.includes(s));
export const basico = (g: G, id: ObjId) => chars(g, id).supertypes.includes('Basic');
export const terrenosDe = (g: G, p: PlayerId) => controlledBy(g, p, (id) => isLand(g, id));
export const sacrificaTerrenoCusto = { k: 'sacrifice' as const, n: 1, filter: (c: SCtx, id: ObjId) => isLand(c.g, id), label: 'um terreno' };
/** fetchland: "{T}, Pague 1 de vida, Sacrifique: procure uma carta de [tipo] ou [tipo]" */
export const fetchTexto = (a: string, b: string) => `{T}, Pague 1 de vida, Sacrifique este terreno: Procure uma carta de ${a} ou ${b}, coloque-a no campo de batalha e depois embaralhe.`;
