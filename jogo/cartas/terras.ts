// lote4-a: peças repetidas das cartas de "terrenos importam" (deck Jund Lands, Hearthhull). Genéricas, para servir também
// às outras frentes (LandReanimator).
import { controllerOf, dealDamage, eachSacrifices, isLand, lkiChars, on, putOntoBattlefield, staticAbility } from '../motor/api.ts';
import type { Ctx, Gen, StaticDef, TriggerSpec } from '../motor/defs.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** Aterragem com o terreno que entrou em `c.event.terreno` (Koth, Tiller Engine) */
export function aterragem(): TriggerSpec {
  return on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { terreno: e.obj } : false));
}

/** "Sempre que você sacrifica um terreno" (Hearthhull, Baloth Prime): um disparo por terreno; o terreno em `c.event.terreno` */
export function voceSacrificaTerreno(): TriggerSpec {
  return on.custom((e, c) => (e.type === 'sacrifice' && e.player === c.you && !!lkiChars(c.g, e.old)?.types.includes('Land') ? { terreno: e.old } : false));
}

/** "[fonte] causa N de dano a cada oponente" */
export function danoACadaOponente(c: Ctx, n: number): void {
  dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: n, combat: false })));
}

/** "Você pode jogar um terreno adicional em cada um dos seus turnos" (CR 305.2) */
export function terrenoAdicional(texto = 'Você pode jogar um terreno adicional em cada um dos seus turnos.'): StaticDef {
  return staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: texto });
}

/**
 * "Os terrenos que você controla entram desvirados" (Spelunking, Horizon Explorer). Substituição aplicada por último
 * (motor/actions.ts enterModifier): vence o "entra virado" do próprio terreno e o "ponha no campo virado" dos efeitos
 * (ruling 1 das duas cartas, sempre na ordem que deixa o terreno desvirado).
 */
export function terrenosEntramDesvirados(texto = 'Os terrenos que você controla entram desvirados.'): StaticDef {
  return staticAbility({
    rules: { enterModifier: (c, ev, seria) => { if (ev.controller === c.you && seria.types.includes('Land')) ev.tapped = false; } },
    text: texto,
  });
}

/** "Você pode jogar terrenos do seu cemitério" (Icetill Explorer): usa as jogadas de terreno do turno */
export function terrenosDoCemiterio(chave: string, texto = 'Você pode jogar terrenos do seu cemitério.'): StaticDef {
  return staticAbility({
    rules: {
      mayPlayFrom: (c, p, carta) => {
        const o = c.g.state.objects[carta];
        return p === c.you && o?.zone === 'graveyard' && o.owner === p && isLand(c.g, carta) ? { key: `${chave}:${c.source}`, label: 'jogar do cemitério', land: true } : null;
      },
    },
    text: texto,
  });
}

/** "Sacrifique N terrenos" como efeito: sacrifica os que tiver, até N (CR 701.21a) */
export function* sacrificaTerrenos(c: Ctx, p: PlayerId, n = 1): Gen<ObjId[]> {
  return yield* eachSacrifices(c, [p], (id) => isLand(c.g, id), n, n === 1 ? 'um terreno' : `${n} terrenos`);
}

/** "Devolva todas as cartas de terreno do seu cemitério ao campo viradas" (Splendid Reclamation, Aftermath Analyst) */
export function* devolveTerrenosDoCemiterio(c: Ctx, p: PlayerId = c.you): Gen<ObjId[]> {
  const terrenos = c.g.state.zones.graveyard[p].filter((id) => isLand(c.g, id));
  if (!terrenos.length) return [];
  return (yield* putOntoBattlefield(c.g, terrenos.map((id) => ({ id, controller: p, tapped: true })), 'effect')).filter((x): x is ObjId => x !== null);
}

/** cartas de terreno do cemitério do jogador */
export function terrenosNoCemiterio(c: { g: Ctx['g'] }, p: PlayerId): ObjId[] {
  return c.g.state.zones.graveyard[p].filter((id) => isLand(c.g, id));
}

