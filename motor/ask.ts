// Perguntas aos jogadores. Toda escolha passa por aqui: o motor gera a decisão com as
// opções legais já enumeradas e espera a resposta. A resposta é validada antes de entrar
// no log (ver game.ts), para que só ações legais sejam aplicadas.

import type { Gen } from './defs.ts';
import type { G } from './game-context.ts';
import type { Answer, ChoiceItem, Color, Decision, ObjId, PlayerId, TargetRef } from './types.ts';

export type DecisionInput = Omit<Decision, 'id'> extends infer D ? (D extends unknown ? Omit<D, never> : never) : never;

/** decisão com um validador opcional (não serializado) */
export type LiveDecision = Decision & { validate?: (a: Answer) => string | null };

type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never;

export function* ask<A extends Answer>(g: G, d: WithoutId<Decision>, validate?: (a: A) => string | null): Gen<A> {
  const decision = { ...d, id: ++g.state.decisionSeq } as LiveDecision;
  if (validate) decision.validate = validate as (a: Answer) => string | null;
  // jogador que saiu da partida não decide (CR 800.4g-h): resposta padrão
  if (g.state.players[d.player]?.left) return defaultAnswer(decision) as A;
  const a = yield decision;
  return a as A;
}

/** resposta neutra, usada para quem saiu da partida e pelos testes */
export function defaultAnswer(d: Decision): Answer {
  switch (d.kind) {
    case 'priority': return { kind: 'priority', action: 'pass' };
    case 'select': return { kind: 'select', ids: d.items.filter((i) => !i.disabled).slice(0, d.min).map((i) => i.id) };
    case 'number': return { kind: 'number', value: d.min };
    case 'payment': return d.canCancel ? { kind: 'payment', cancel: true } : { kind: 'payment', auto: true };
    // quem tem exigência de ataque (CR 508.1d) ataca um alvo que a cumpre
    case 'attackers': return { kind: 'attackers', attacks: d.candidates.flatMap((c) => (c.required?.length ? [[c.obj, c.required[0]] as [ObjId, TargetRef]] : [])) };
    case 'blockers': return { kind: 'blockers', blocks: [] };
    case 'damage': return { kind: 'damage', assign: d.lethal.slice() };
    case 'arrange': return { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, d.destinations[0]])), order: d.items.map((i) => i.id) };
    case 'mulligan': return { kind: 'mulligan', keep: true };
  }
}

/** validação estrutural comum a todas as decisões */
export function validateShape(d: Decision, a: Answer): string | null {
  if (a.kind !== d.kind) return `Resposta do tipo ${a.kind} para decisão ${d.kind}`;
  switch (d.kind) {
    case 'priority': {
      const ans = a as Extract<Answer, { kind: 'priority' }>;
      return d.actions.some((x) => x.id === ans.action) ? null : 'Ação indisponível';
    }
    case 'select': {
      const ans = a as Extract<Answer, { kind: 'select' }>;
      if (!Array.isArray(ans.ids)) return 'Seleção inválida';
      if (new Set(ans.ids).size !== ans.ids.length) return 'Item repetido';
      if (ans.ids.length < d.min || ans.ids.length > d.max) return `Escolha entre ${d.min} e ${d.max}`;
      for (const id of ans.ids) {
        const it = d.items.find((i) => i.id === id);
        if (!it || it.disabled) return 'Item indisponível';
      }
      return null;
    }
    case 'number': {
      const ans = a as Extract<Answer, { kind: 'number' }>;
      return Number.isInteger(ans.value) && ans.value >= d.min && ans.value <= d.max ? null : `Escolha um número de ${d.min} a ${d.max}`;
    }
    case 'payment': return null;
    case 'attackers': return Array.isArray((a as Extract<Answer, { kind: 'attackers' }>).attacks) ? null : 'Ataque inválido';
    case 'blockers': return Array.isArray((a as Extract<Answer, { kind: 'blockers' }>).blocks) ? null : 'Bloqueio inválido';
    case 'damage': {
      const ans = a as Extract<Answer, { kind: 'damage' }>;
      if (!Array.isArray(ans.assign) || ans.assign.length !== d.recipients.length) return 'Atribuição inválida';
      if (ans.assign.some((n) => !Number.isInteger(n) || n < 0)) return 'Valores inválidos';
      return ans.assign.reduce((s, n) => s + n, 0) === d.amount ? null : `Atribua exatamente ${d.amount}`;
    }
    case 'arrange': {
      const ans = a as Extract<Answer, { kind: 'arrange' }>;
      const ids = d.items.map((i) => i.id).sort();
      if (!ans.order || [...ans.order].sort().join() !== ids.join()) return 'Ordem inválida';
      for (const id of ids) if (!d.destinations.includes(ans.placement?.[id])) return 'Destino inválido';
      return null;
    }
    case 'mulligan': return typeof (a as Extract<Answer, { kind: 'mulligan' }>).keep === 'boolean' ? null : 'Resposta inválida';
  }
}

// ---------------------------------------------------------------------------
// Atalhos
// ---------------------------------------------------------------------------
export function* chooseItems(g: G, player: PlayerId, prompt: string, items: ChoiceItem[], min: number, max: number, ordered = false): Gen<string[]> {
  if (items.filter((i) => !i.disabled).length === 0 && min === 0) return [];
  const a = yield* ask<Extract<Answer, { kind: 'select' }>>(g, { kind: 'select', player, prompt, items, min, max, ordered });
  return a.ids;
}

export function* chooseOne(g: G, player: PlayerId, prompt: string, items: ChoiceItem[]): Gen<string> {
  const ids = yield* chooseItems(g, player, prompt, items, 1, 1);
  return ids[0];
}

export function* yesNo(g: G, player: PlayerId, prompt: string, yes = 'Sim', no = 'Não'): Gen<boolean> {
  const r = yield* chooseOne(g, player, prompt, [{ id: 'yes', label: yes }, { id: 'no', label: no }]);
  return r === 'yes';
}

export function* chooseNumber(g: G, player: PlayerId, prompt: string, min: number, max: number): Gen<number> {
  if (min === max) return min;
  const a = yield* ask<Extract<Answer, { kind: 'number' }>>(g, { kind: 'number', player, prompt, min, max });
  return a.value;
}

export const COLOR_NAMES: Record<Color, string> = { W: 'branco', U: 'azul', B: 'preto', R: 'vermelho', G: 'verde' };

export function* chooseColor(g: G, player: PlayerId, prompt: string, colors: Color[] = ['W', 'U', 'B', 'R', 'G']): Gen<Color> {
  if (colors.length === 1) return colors[0];
  const r = yield* chooseOne(g, player, prompt, colors.map((c) => ({ id: c, label: COLOR_NAMES[c] })));
  return r as Color;
}

export function objItem(g: G, id: ObjId, label: string): ChoiceItem {
  return { id: String(id), label, obj: id };
}

export function playerItem(g: G, p: PlayerId): ChoiceItem {
  return { id: `p${p}`, label: g.state.players[p].name, player: p };
}
