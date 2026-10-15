// Peças repetidas nas cartas do deck Quick Draw (Stella Lee, Wild Card): "sempre que você conjura a sua segunda mágica
// em cada turno", instantâneas e feitiços no cemitério, impulso (jump-start, CR 702.133), adaptar (CR 701.46), copiar
// cartas e conjurar as cópias (CR 707.12) e "a próxima mágica instantânea ou de feitiço que você conjurar neste turno".
import { addCounters, createObject, defineAbility, is, isType, manaValue, nameOf, on } from '../motor/api.ts';
import type { AltCastDef, Ctx, Gen, SCtx, StaticDef, TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';
import { conjuraDentreGratis } from './roubo.ts';

/**
 * "Sempre que você conjura a sua segunda mágica em cada turno" (Stella Lee, Eris): a contagem do turno já inclui a mágica
 * que acabou de ser conjurada; as mágicas conjuradas antes de o permanente entrar também contam (ruling 1 de Stella Lee).
 */
export function segundaMagicaDoTurno(): TriggerSpec {
  return on.custom((e, c) => (e.type === 'cast' && e.player === c.you && c.g.state.turnStats[c.you]?.spellsCast === 2 ? { spell: e.obj } : false));
}

/** cartas de instantânea e de feitiço no cemitério do jogador (a carta dividida que é as duas conta uma vez só) */
export function instantesEFeiticosNoCemiterio(g: G, p: PlayerId): ObjId[] {
  return g.state.zones.graveyard[p].filter((id) => isType(g, id, 'Instant') || isType(g, id, 'Sorcery'));
}

/** valores de mana diferentes entre as cartas de instantânea e de feitiço do cemitério (Eris, Roar of the Storm) */
export function valoresDeManaDiferentes(g: G, p: PlayerId): number {
  return new Set(instantesEFeiticosNoCemiterio(g, p).map((id) => manaValue(g, id))).size;
}

/**
 * Impulso / jump-start (CR 702.133a): pode conjurar a carta do cemitério descartando uma carta além de pagar os outros
 * custos (o custo de mana normal); conjurada assim, ela é exilada em vez de ir para qualquer outro lugar ao sair da pilha.
 * `altCost` vai em altCosts e `ability` em abilities.
 */
export function jumpStart(): { altCost: AltCastDef; ability: StaticDef } {
  return {
    altCost: {
      key: 'jump-start', label: 'Conjurar do cemitério com impulso (descartando uma carta)', zone: 'graveyard', mana: null, useManaCost: true,
      exileAfter: true, parts: [{ k: 'discard', n: 1, label: 'uma carta' }],
    },
    ability: {
      kind: 'static', kw: 'jump-start', zones: ['graveyard'],
      text: 'Impulso (você pode conjurar esta carta do seu cemitério descartando uma carta além de pagar os outros custos. Depois, exile esta carta.)',
    },
  };
}

/** Adaptar N (CR 701.46a): se este permanente não tiver marcadores +1/+1, ponha N marcadores +1/+1 nele */
export function adaptar(g: G, id: ObjId, n: number, por: PlayerId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || (o.counters['+1/+1'] ?? 0) > 0) return false;
  addCounters(g, { kind: 'obj', id }, '+1/+1', n, por);
  g.log(`${nameOf(g, id)} se adapta (${n} marcadores +1/+1).`, { rule: '701.46a' });
  return true;
}

/**
 * "Copie [essas cartas]. Você pode conjurar quantas cópias quiser sem pagar o custo de mana" (CR 707.12): as cópias são
 * criadas no exílio e conjuradas durante a resolução, uma de cada vez, na ordem que o jogador escolher; as que não forem
 * conjuradas deixam de existir pela ação de estado (CR 704.5e). Devolve quantas foram conjuradas.
 */
export function* conjuraCopiasGratis(c: Ctx, cartas: ObjId[], rotulo: string): Gen<number> {
  const copias: ObjId[] = [];
  for (const id of cartas) {
    const o = c.g.state.objects[id];
    if (!o) continue;
    const def = o.copyOf?.def ?? o.def;
    copias.push(createObject(c.g, { def, owner: c.you, controller: c.you, zone: 'exile', isCopy: true, copyOf: { def, face: 0 } }).id);
  }
  if (!copias.length) return 0;
  return yield* conjuraDentreGratis(c, copias, { rotulo, varias: true });
}

/** mágica instantânea ou de feitiço, pelo objeto atual ou pela última informação conhecida */
export function ehInstantaneaOuFeitico(c: SCtx, id: ObjId): boolean {
  if (c.g.state.objects[id]) return is.instantOrSorcery(c, id);
  const l = c.g.state.lki[id]?.chars;
  return !!l && (l.types.includes('Instant') || l.types.includes('Sorcery'));
}

/**
 * "A próxima mágica instantânea ou de feitiço que você conjurar neste turno custa {X} a menos" (Kaza, Roil Chaser; CR
 * 601.2f): vale só para a primeira instantânea ou feitiço conjurada depois de o efeito começar (`desde` é a contagem do
 * turno naquele momento), e reduz só o genérico. Efeito de regra com `params: { player, n, desde }`, até o fim do turno.
 */
export const PROXIMA_MAIS_BARATA = defineAbility<StaticDef>('rule:saque:proximaMaisBarata', {
  kind: 'static',
  rules: {
    costModifier: (c, spell) => {
      const prm = (c as SCtx & { params?: { player: PlayerId; n: number; desde: number } }).params;
      if (!prm || spell.controller !== prm.player || prm.n <= 0) return null;
      if (!spell.chars.types.includes('Instant') && !spell.chars.types.includes('Sorcery')) return null;
      if ((c.g.state.turnStats[prm.player]?.instantSorceryCast ?? 0) !== prm.desde) return null;
      return { reduce: prm.n };
    },
  },
});

/** quantas mágicas do tipo o jogador conjurou neste turno (instantâneas e feitiços contam cada um no seu tipo) */
export function conjuradasDoTipo(g: G, p: PlayerId, tipo: 'Instant' | 'Sorcery'): number {
  return (g.state.turnStats[p]?.castLog ?? []).filter((m) => m.types.includes(tipo)).length;
}

/** "Você não tem tamanho máximo de mão pelo resto da partida" (Finale of Revelation; CR 402.2): efeito de regra com
 *  `params: { player }` e duração permanente */
export const SEM_LIMITE_DE_MAO = defineAbility<StaticDef>('rule:saque:semLimiteDeMao', {
  kind: 'static',
  rules: { noMaxHandSize: (c, p) => (c as SCtx & { params?: { player: PlayerId } }).params?.player === p },
});
