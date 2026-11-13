// Peças repetidas nas cartas do deck We Are The Borg (Star Trek): fichas Borg, "criaturas artefato que você controlam
// recebem/têm…", o dano de combate de uma criatura artefato e "exile/revele do topo até uma carta de criatura".
// A ação de assimilar está em motor/assimilar.ts; a estação, em motor/estacao.ts.
import {
  and, anthem, assimilateCard, chars, controllerOf, createTokens, is, lkiChars, moveObjects, nameOf, on, triggered,
} from '../motor/api.ts';
import type { Ctx, EffectFn, Gen, SCtx, StaticDef, TriggerSpec } from '../motor/defs.ts';
import { defineAbility } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import { shuffle } from '../motor/rng.ts';
import type { Mod, ObjId, PlayerId } from '../motor/types.ts';
import { jog, objs, reg } from '../motor/registro.ts';

/** é uma criatura artefato? */
export function criaturaArtefato(c: SCtx, id: ObjId): boolean {
  return is.creature(c, id) && is.artifact(c, id);
}

/** "crie N fichas de criatura artefato Borg 1/1 incolor" */
export function* criaBorg(c: Ctx, n: number): Gen<ObjId[]> {
  return n > 0 ? yield* createTokens(c.g, c.you, 'Borg', n) : [];
}

/** "As criaturas artefato que você controla recebem/têm [mods]" */
export function artefatosRecebem(mods: Mod[], texto: string): StaticDef {
  return anthem(and(is.creature, is.artifact, is.yours), () => mods, texto);
}

/** "As criaturas artefato que você controla têm '[habilidade]'": `id` é a habilidade definida com defineAbility */
export function artefatosTem(id: string, texto: string): StaticDef {
  return artefatosRecebem([{ k: 'addAbility', id }], texto);
}

/** "Sempre que esta criatura causa dano de combate a um jogador" (para conceder): c.event.player é o jogador */
export function danoDeCombateAJogador(): TriggerSpec {
  return on.selfDealsCombatDamageToPlayer();
}

/** habilidade concedida "Sempre que esta criatura causa dano de combate a um jogador, [efeito]" */
export function concedidaDanoDeCombate(id: string, efeito: EffectFn, texto: string): string {
  defineAbility(id, triggered(danoDeCombateAJogador(), efeito, { text: texto }));
  return id;
}

/** põe as cartas no fundo do grimório do dono em ordem aleatória, saindo de onde estiverem (exílio ou grimório) */
export function* fundoAleatorio(g: G, ids: ObjId[]): Gen<void> {
  const s = g.state;
  const vivos = shuffle(s.rng, ids.filter((id) => !!s.objects[id]));
  const doGrimorio = vivos.filter((id) => s.objects[id].zone === 'library');
  for (const id of doGrimorio) {
    const dono = s.objects[id].owner;
    s.zones.library[dono] = [...s.zones.library[dono].filter((x) => x !== id), id];
  }
  const outros = vivos.filter((id) => s.objects[id].zone !== 'library');
  if (outros.length) yield* moveObjects(g, outros.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
  g.bump();
}

/**
 * "[O oponente] exila cartas do topo do grimório até exilar uma carta de criatura. Assimile essa carta. Ele põe o resto
 * no fundo em ordem aleatória" (The Borg Queen).
 */
export function* exilaAteCriaturaEAssimila(c: Ctx, op: PlayerId): Gen<ObjId | null> {
  const s = c.g.state;
  const lib = s.zones.library[op];
  const i = lib.findIndex((id) => chars(c.g, id).types.includes('Creature'));
  const tiradas = i < 0 ? [...lib] : lib.slice(0, i + 1);
  if (!tiradas.length) return null;
  reg(c.g, 'zona')`${jog(op)} exila ${objs(tiradas)}.`;
  const novos = (yield* moveObjects(c.g, tiradas.map((id) => ({ id, to: 'exile' as const })), 'effect')).filter((x): x is ObjId => x !== null);
  const criatura = i < 0 ? null : novos[novos.length - 1] ?? null;
  let assimilada: ObjId | null = null;
  if (criatura !== null && s.objects[criatura]?.zone === 'exile') assimilada = yield* assimilateCard(c.g, c.you, criatura, c.source, nameOf(c.g, c.source));
  yield* fundoAleatorio(c.g, novos.filter((id) => id !== criatura && s.objects[id]?.zone === 'exile'));
  return assimilada;
}

/** cartas do campo que este objeto assimilou (ainda o mesmo objeto) */
export function assimiladosPor(g: G, fonte: ObjId): ObjId[] {
  return g.state.zones.battlefield.filter((id) => g.state.objects[id].data.assimilado === true && g.state.objects[id].data.assimiladoPor === fonte);
}

/** a fonte de um dano de combate é uma criatura artefato que `p` controla? (pela última informação) */
export function criaturaArtefatoDe(g: G, id: ObjId, p: PlayerId): boolean {
  const ch = g.state.objects[id] ? chars(g, id) : lkiChars(g, id);
  return !!ch && ch.types.includes('Artifact') && ch.types.includes('Creature') && (g.state.objects[id] ? controllerOf(g, id) : ch.controller) === p;
}
