// lote3-f: mecânicas do deck cEDH Inalla (Wizard's Chess): devoção, turno extra, evocar, dash, barganha e spree.
// Tudo aditivo: as cartas que já existiam não usam nada daqui.

import { chars, controllerOf } from './chars.ts';
import { returnToHand, sacrifice } from './actions.ts';
import { asEnters, defineAbility, etb, triggered, type AbilityDef, type AdditionalCostDef, type AltCastDef, type CostPart, type Ctx, type EffectFn, type ModeSpec, type SCtx, type StaticDef, type TargetSpec } from './dsl.ts';
import type { G } from './game-context.ts';
import { successor } from './state.ts';
import type { Color, GameObject, ManaSymbol, ObjId, PlayerId } from './types.ts';

// ---------------------------------------------------------------------------
// Devoção (CR 700.5)
// ---------------------------------------------------------------------------
/** o símbolo conta para a devoção a alguma destas cores? Híbridos, monocoloridos híbridos e phyrexianos contam; genérico,
 *  {C} e {X} não (CR 700.5, rulings de Thassa's Oracle) */
function simboloDaCor(s: ManaSymbol, cores: Color[]): boolean {
  if (s.k === 'color' || s.k === 'monohybrid' || s.k === 'phyrexian') return cores.includes(s.c);
  if (s.k === 'hybrid') return cores.includes(s.a) || cores.includes(s.b);
  return false;
}

/** devoção de um jogador a uma ou mais cores (CR 700.5): símbolos dessas cores nos custos de mana dos permanentes que ele
 *  controla; com duas cores, um símbolo híbrido das duas conta uma vez só */
export function devotion(g: G, p: PlayerId, cores: Color[]): number {
  let n = 0;
  for (const id of g.state.zones.battlefield) {
    const o = g.state.objects[id];
    if (o.phasedOut || controllerOf(g, id) !== p) continue;
    n += (chars(g, id).manaCost ?? []).filter((s) => simboloDaCor(s, cores)).length;
  }
  return n;
}

// ---------------------------------------------------------------------------
// Turno extra (CR 500.7)
// ---------------------------------------------------------------------------
/**
 * "Tome um turno extra depois deste" (CR 500.7): o turno é posto logo depois do atual; o criado por último é tomado
 * primeiro. Devolve o número que identifica esse turno (fica em `state.turn.extraTurnId` quando ele começa).
 */
export function takeExtraTurn(g: G, p: PlayerId): number {
  const s = g.state;
  const id = s.nextId++;
  s.extraTurns = [...(s.extraTurns ?? []), { player: p, id }];
  g.bump();
  return id;
}

// ---------------------------------------------------------------------------
// Evocar (CR 702.74)
// ---------------------------------------------------------------------------
/** o permanente entrou com o custo de evocar pago? (a mágica que o virou foi conjurada por evocar) */
export function evoked(o: GameObject | null | undefined): boolean {
  return (o?.data?.spell as { method?: string } | undefined)?.method === 'evoke';
}

/**
 * Evocar [custo] (CR 702.74a): "você pode conjurar esta carta pagando [custo] em vez do custo de mana" e "quando esta
 * permanente entra, se o custo de evocar foi pago, o controlador dela a sacrifica". `mana` é a parte de mana do custo
 * ('' se não tiver) e `parts` o resto ("exile uma carta preta da sua mão": Grief). Ponha `altCost` em altCosts e
 * `abilities` em abilities.
 */
export function evoke(mana: string, parts: CostPart[], label: string): { altCost: AltCastDef; abilities: AbilityDef[] } {
  return {
    altCost: { key: 'evoke', label: `Conjurar com evocar (${label})`, zone: 'hand', mana, parts },
    abilities: [
      { kind: 'static', kw: 'evoke', param: label, text: `Evocar — ${label} (você pode conjurar esta mágica pelo custo de evocar; se fizer isso, ela é sacrificada quando entrar)` },
      etb(function* (c) {
        const o = c.g.state.objects[c.source];
        if (o && o.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
      }, { condition: (c) => evoked(c.g.state.objects[c.source]), text: 'Quando esta permanente entra, se o custo de evocar foi pago, o controlador dela a sacrifica.' }),
    ],
  };
}

// ---------------------------------------------------------------------------
// Dash (CR 702.109)
// ---------------------------------------------------------------------------
/** o permanente entrou com o custo de dash pago? */
export function dashed(o: GameObject | null | undefined): boolean {
  return (o?.data?.spell as { method?: string } | undefined)?.method === 'dash';
}

const DASH_VOLTA = defineAbility('kw:dash:volta', triggered({
  kind: 'event',
  match: (e, c) => {
    if (e.type !== 'step' || e.step !== 'end') return false;
    // CR 513.2: criado na etapa final, espera a do próximo turno
    const d = (c as unknown as { delayed?: { createdTurn: number; createdStep: string } }).delayed;
    return !d || c.g.state.turn.number > d.createdTurn || d.createdStep !== 'end';
  },
}, function* (c) {
  // a mágica virou este permanente (CR 400.7); se ele já saiu do campo, fica onde está (ruling de Ragavan)
  const id = successor(c.g, c.data.magica as ObjId);
  if (id !== null && c.g.state.objects[id]?.zone === 'battlefield') yield* returnToHand(c.g, [id]);
}, { text: 'Dash: devolva este permanente para a mão do dono no início da próxima etapa final.' }));

/**
 * Dash [custo] (CR 702.109a): conjura-se pagando [custo] em vez do custo de mana; com o custo pago, o permanente tem
 * ímpeto e volta para a mão do dono no início da próxima etapa final (gatilho atrasado criado quando a mágica resolve).
 * Ponha `altCost` em altCosts e `abilities` em abilities.
 */
export function dash(custo: string): { altCost: AltCastDef; abilities: AbilityDef[] } {
  return {
    altCost: { key: 'dash', label: `Conjurar com dash ${custo}`, zone: 'hand', mana: custo },
    abilities: [
      // "enquanto o custo de dash deste permanente tiver sido pago, ele tem ímpeto" (cópias não têm: ruling de Ragavan)
      {
        kind: 'static', kw: 'dash', param: custo, affects: (c, o) => o.id === c.source && dashed(o), mods: () => [{ k: 'addKeyword', kw: 'haste' }],
        text: `Dash ${custo} (você pode conjurar esta mágica pagando ${custo}; se fizer isso, ela ganha ímpeto e volta para a mão do dono no início da próxima etapa final)`,
      } as StaticDef,
      // o gatilho atrasado nasce quando a mágica com dash pago vira permanente (CR 702.109a, 603.7a)
      asEnters((c, ev) => {
        if (ev.spell?.method !== 'dash' || ev.obj < 0) return;
        const s = c.g.state;
        s.delayedTriggers.push({ id: s.nextId++, abilityId: DASH_VOLTA.id!, source: ev.obj, controller: ev.controller, data: { magica: ev.obj }, once: true, expiresTurn: null, createdTurn: s.turn.number, createdStep: s.turn.step });
        c.g.bump();
      }),
    ],
  };
}

// ---------------------------------------------------------------------------
// Barganha (CR 702.166)
// ---------------------------------------------------------------------------
/** Barganha (CR 702.166a): custo adicional opcional de sacrificar um artefato, encantamento ou ficha. Vai em additionalCosts */
export function bargain(): AdditionalCostDef {
  return {
    key: 'bargain', label: 'barganha (sacrifique um artefato, encantamento ou ficha)', optional: true,
    parts: [{
      k: 'sacrifice', n: 1, label: 'um artefato, encantamento ou ficha',
      filter: (c: SCtx, id: ObjId) => { const ch = chars(c.g, id); return ch.types.includes('Artifact') || ch.types.includes('Enchantment') || !!c.g.state.objects[id]?.isToken; },
    }],
  };
}

/** a mágica foi barganhada? (CR 702.166b; a cópia também é: ruling de Beseech the Mirror) */
export function bargained(c: Ctx): boolean {
  return c.paid.bargain === true || c.paid.bargain === 1;
}

// ---------------------------------------------------------------------------
// Spree (CR 702.172)
// ---------------------------------------------------------------------------
/**
 * Spree (CR 702.172a): "escolha um ou mais modos; como custo adicional, pague os custos associados a esses modos".
 * Devolve `modes` (vai em spell.modes) e `additionalCosts` (vai na face). Cada modo só pode ser escolhido uma vez.
 */
export function spree(modos: { cost: string; text: string; targets?: TargetSpec[]; effect: EffectFn }[]): { modes: ModeSpec; additionalCosts: AdditionalCostDef[] } {
  return {
    modes: { min: 1, max: modos.length, modes: modos.map((m) => ({ text: `+ ${m.cost} — ${m.text}`, targets: m.targets, effect: m.effect })) },
    additionalCosts: modos.map((m, i) => ({ key: `spree${i}`, label: `spree ${m.cost}`, optional: true, forMode: i, parts: [{ k: 'mana', cost: m.cost }] })),
  };
}
