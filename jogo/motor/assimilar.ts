// lote3-b: Assimilar (Star Trek, deck We Are The Borg). A ação ainda não está nas Comprehensive Rules de 25/09/2026;
// vale o texto de lembrete das cartas:
// - carta: "ponha-a no campo sob o seu controle com um marcador +1/+1. Ela é uma criatura artefato Borg e perde todos
//   os outros tipos de criatura" (The Borg Queen, Gift of Perfection, Assimilate the Wounded, Assimilation Assessor);
// - permanente: "ganhe o controle dela e ponha um marcador +1/+1 nela. Ela é uma criatura artefato Borg e perde todos os
//   outros tipos de criatura" (The Best of Both Worlds).
// A mudança de tipo é um efeito da camada 4 (CR 613.1d) sem fim marcado: vale enquanto o objeto estiver no campo (um
// objeto que muda de zona é outro objeto, CR 400.7). Para a carta, ela já entra como criatura artefato Borg (CR 614.1c,
// como "entra como"), então os gatilhos de "um artefato entra" a veem assim. O controle (camada 2, CR 613.1b) também não
// tem fim. Os subtipos que não são de criatura ficam (CR 205.1a).

import { addCounters, gainControl, putOntoBattlefield } from './actions.ts';
import { nameOf } from './chars.ts';
import type { Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { addEffect } from './state.ts';
import type { Mod, ObjId, PlayerId } from './types.ts';

/** a mudança de tipo do assimilar */
export const MODS_ASSIMILAR: Mod[] = [{ k: 'addTypes', types: ['Artifact', 'Creature'], subtypes: ['Borg'], loseOtherCreatureTypes: true }];

/** o objeto foi assimilado (e ainda é o mesmo objeto)? */
export function foiAssimilado(g: G, id: ObjId): boolean {
  return g.state.objects[id]?.data.assimilado === true;
}

/**
 * Assimila uma carta de outra zona (grimório, exílio, cemitério): põe no campo sob o controle de `p` com um marcador
 * +1/+1, já como criatura artefato Borg. Devolve o novo id, ou null se não entrou.
 */
export function* assimilateCard(g: G, p: PlayerId, card: ObjId, source: ObjId, sourceDef = ''): Gen<ObjId | null> {
  const o = g.state.objects[card];
  if (!o || o.zone === 'battlefield' || g.state.players[p].left) return null;
  const nome = nameOf(g, card);
  const [novo] = yield* putOntoBattlefield(g, [{
    id: card, controller: p, counters: { '+1/+1': 1 }, data: { assimilado: true, assimiladoPor: source },
    enterEffects: [{ mods: MODS_ASSIMILAR, duration: { kind: 'whileOnBattlefield', obj: -1 }, controller: p, sourceDef }],
  }], 'assimilate');
  if (novo === undefined) return null;
  g.log(`${g.state.players[p].name} assimila ${nome}.`);
  return novo;
}

/** Assimila uma permanente que já está no campo: ganha o controle dela, põe um marcador +1/+1 e a torna Borg */
export function assimilatePermanent(g: G, p: PlayerId, id: ObjId, source: ObjId, sourceDef = ''): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || g.state.players[p].left) return false;
  gainControl(g, id, p, { kind: 'whileOnBattlefield', obj: id }, source);
  addCounters(g, { kind: 'obj', id }, '+1/+1', 1, p);
  addEffect(g, { source, sourceDef, controller: p, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id], mods: MODS_ASSIMILAR });
  o.data.assimilado = true;
  o.data.assimiladoPor = source;
  g.log(`${g.state.players[p].name} assimila ${nameOf(g, id)}.`);
  g.bump();
  return true;
}
