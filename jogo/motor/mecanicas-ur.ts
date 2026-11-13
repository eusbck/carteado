// lote3-e: mecânicas do deck How to Train Ur-Dragon que o motor ainda não tinha: rolar dado (CR 706), dobrar o ar
// (airbend, CR 701.65), exaurir (exert, CR 701.43), farra (spree, CR 702.172) e dobra (warp, CR 702.185). O presságio
// (omen, CR 720) fica em formatos.ts e stack.ts, como a aventura.

import { exile, moveObjects } from './actions.ts';
import { chars, nameOf } from './chars.ts';
import { defineAbility, type AdditionalCostDef, type CastPermission, type CostPart, type Gen, type SCtx } from './defs.ts';
import { nextEndStepTrigger } from './efeitos.ts';
import type { G } from './game-context.ts';
import { next as sorteia } from './rng.ts';
import { addEffect } from './state.ts';
import type { ObjId, PlayerId } from './types.ts';
import { jog, obj, objs, reg } from './registro.ts';

// ---------------------------------------------------------------------------
// Rolar um dado (CR 706)
// ---------------------------------------------------------------------------
/** rola um dado de N faces (CR 706.1a) com o gerador da partida e devolve o resultado (de 1 a N) */
export function rollDie(g: G, p: PlayerId, faces: number): number {
  const r = 1 + Math.floor(sorteia(g.state.rng) * faces);
  reg(g, 'outro', { rule: '706.2' })`${jog(p)} rola um d${faces} e tira ${r}.`;
  return r;
}

// ---------------------------------------------------------------------------
// Dobrar o ar (CR 701.65)
// ---------------------------------------------------------------------------
/**
 * Dobrar o ar (CR 701.65a): exila os objetos; cada carta exilada assim pode ser conjurada pelo dono pagando {2} em vez
 * do custo de mana, enquanto continuar exilada (a permissão é do objeto no exílio; ao sair de lá ela some sozinha).
 * Fichas e cópias deixam de existir no exílio (CR 111.8, 707.10a). Devolve os ids no exílio.
 */
export function* airbend(g: G, controller: PlayerId, source: ObjId, ids: ObjId[]): Gen<ObjId[]> {
  if (!ids.length) return [];
  const res = (yield* exile(g, ids)).filter((x): x is ObjId => x !== null && x !== undefined && g.state.objects[x]?.zone === 'exile');
  const porDono = new Map<PlayerId, ObjId[]>();
  for (const id of res) {
    const o = g.state.objects[id];
    if (o.isToken || o.card === null) continue;
    porDono.set(o.owner, [...(porDono.get(o.owner) ?? []), id]);
  }
  for (const [dono, objs] of porDono) {
    addEffect(g, {
      source, sourceDef: '', controller, duration: { kind: 'permanent' }, affected: null,
      mods: [{ k: 'rule', id: 'rule:mayPlay', params: { objs, player: dono, mana: '{2}', spellsOnly: true, label: 'Conjurar do exílio por {2} (ar dobrado)' } }],
    });
  }
  if (res.length) reg(g, 'zona', { rule: '701.65a' })`${jog(controller)} dobra o ar: ${objs(res)}.`;
  return res;
}

// ---------------------------------------------------------------------------
// Exaurir (CR 701.43)
// ---------------------------------------------------------------------------
/** exaurir (CR 701.43a): o permanente não desvira na próxima etapa de desvirar do controlador; exaurir de novo antes
 *  dela não acumula (701.43b). Fora do campo não se exaure (701.43c) */
export function exert(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield') return false;
  o.data.skipNextUntap = true;
  g.bump();
  reg(g, 'outro', { rule: '701.43a' })`${obj(id)} é exaurido.`;
  return true;
}

// ---------------------------------------------------------------------------
// Farra (CR 702.172)
// ---------------------------------------------------------------------------
/**
 * Farra (CR 702.172a): "escolha um ou mais modos; como custo adicional, pague os custos desses modos". Um custo
 * adicional por modo, pago só quando o modo é escolhido (os modos são escolhidos antes, CR 601.2b). Use
 * `additionalCosts: spree(['{2}', '{4}{G}', '{1}'])` com `spell.modes = modal(1, n, …)`.
 */
export function spree(custos: string[]): AdditionalCostDef[] {
  return custos.map((cost, i) => ({ key: `spree${i}`, label: `farra — modo ${i + 1}: ${cost}`, optional: false, parts: [{ k: 'mana', cost } as CostPart], perMode: i }));
}

// ---------------------------------------------------------------------------
// Dobra (CR 702.185)
// ---------------------------------------------------------------------------
const DOBRA_EXILA = 'motor:dobra:exila';

/**
 * Permissão de conjurar da mão pela dobra (CR 702.185a: "você pode conjurar esta carta da sua mão pagando [custo] em vez
 * do custo de mana"). Ao conjurar, cria o gatilho atrasado que exila o permanente no início da próxima etapa final.
 */
export function warpPermission(custo: string): CastPermission {
  return {
    key: 'warp', label: `Dobra ${custo}`, mana: custo, fromHand: true,
    onUse: (c: SCtx, spell: ObjId) => {
      const s = c.g.state;
      const o = s.objects[spell];
      if (!o || o.card === null) return;
      o.data.warped = true;
      s.delayedTriggers.push({
        id: s.nextId++, abilityId: DOBRA_EXILA, source: spell, controller: c.you, data: { card: o.card }, once: true,
        expiresTurn: null, createdTurn: s.turn.number, createdStep: s.turn.step,
      });
      c.g.bump();
    },
  };
}

/** a mágica foi conjurada pela dobra? (CR 702.185c) */
export function foiDobrada(g: G, id: ObjId): boolean {
  return !!g.state.objects[id]?.data.warped;
}

defineAbility(DOBRA_EXILA, nextEndStepTrigger(function* (c) {
  const g = c.g;
  const carta = c.data.card as number;
  // o permanente em que a mágica se transformou: a mesma carta, vinda da pilha pela dobra (um objeto novo que voltou ao
  // campo de outro jeito não é exilado)
  const perm = g.state.zones.battlefield.find((id) => {
    const o = g.state.objects[id];
    return o.card === carta && (o.data.spell as { method?: string } | undefined)?.method?.includes('warp');
  });
  if (perm === undefined) return;
  const [ex] = yield* moveObjects(g, [{ id: perm, to: 'exile' }], 'warp');
  if (ex === null || ex === undefined || g.state.objects[ex]?.zone !== 'exile') return;
  const o = g.state.objects[ex];
  o.data.warpedExile = true;
  // CR 702.185a: o dono pode conjurá-la depois que o turno atual terminar, enquanto continuar exilada
  addEffect(g, {
    source: ex, sourceDef: '', controller: o.owner, duration: { kind: 'permanent' }, affected: null,
    mods: [{ k: 'rule', id: 'rule:mayPlay', params: { objs: [ex], player: o.owner, spellsOnly: true, fromTurn: g.state.turn.number + 1, label: 'Conjurar do exílio (dobra)' } }],
  });
  reg(g, 'zona', { rule: '702.185a' })`${obj(ex)} é exilada (dobra); o dono pode conjurá-la num turno posterior.`;
}, 'Dobra: exile este permanente; o dono pode conjurá-lo do exílio num turno posterior.'));

/** cartas de artefato ou de criatura vermelha na mão (Tannuk) e outras: para o filtro da permissão de dobra */
export function ehArtefatoOuCriaturaVermelha(g: G, id: ObjId): boolean {
  const c = chars(g, id);
  return c.types.includes('Artifact') || (c.types.includes('Creature') && c.colors.includes('R'));
}

// ---------------------------------------------------------------------------
// "Essa mágica não pode ser anulada" preso à mana gasta (Cavern of Souls, Delighted Halfling)
// ---------------------------------------------------------------------------
/** marca a mágica na pilha: counter() não a anula (CR 101.2: "não pode" vence "anule"); a cópia dela pode ser anulada */
export function spellCantBeCountered(g: G, spell: ObjId): void {
  const o = g.state.objects[spell];
  if (!o || o.zone !== 'stack' || !o.stack) return;
  o.stack.data.cantBeCountered = true;
  g.bump();
}
