// Bot aleatório: escolhe sempre uma resposta legal ao acaso. Serve para estressar o motor.
// Usa um gerador próprio (com semente), separado do da partida.

import type { LiveDecision } from '../motor/ask.ts';
import { int, next, seedFrom, shuffle, type RngState } from '../motor/rng.ts';
import type { Answer, Decision, ObjId, TargetRef } from '../motor/types.ts';

export class RandomBot {
  rng: RngState;
  constructor(seed: string) { this.rng = seedFrom(`bot:${seed}`); }

  private pick<T>(arr: T[]): T { return arr[int(this.rng, arr.length)]; }

  answer(d: Decision): Answer {
    const live = d as LiveDecision;
    const ok = (a: Answer) => !live.validate || live.validate(a) === null;
    switch (d.kind) {
      case 'priority': {
        const nonMana = d.actions.filter((a) => a.kind !== 'mana' && a.kind !== 'pass' && a.kind !== 'manual');
        if (nonMana.length === 0 || next(this.rng) < 0.35) return { kind: 'priority', action: 'pass' };
        return { kind: 'priority', action: this.pick(nonMana).id };
      }
      case 'select': {
        const items = d.items.filter((i) => !i.disabled);
        const max = Math.min(d.max, items.length);
        const n = d.min + int(this.rng, Math.max(1, max - d.min + 1));
        const ids = shuffle(this.rng, items.map((i) => i.id)).slice(0, Math.min(n, max));
        return { kind: 'select', ids };
      }
      case 'number': {
        const span = d.max - d.min;
        return { kind: 'number', value: d.min + Math.floor(Math.pow(next(this.rng), 2) * (span + 1)) };
      }
      case 'payment': {
        if (d.canAuto) return { kind: 'payment', auto: true };
        if (d.canCancel) return { kind: 'payment', cancel: true };
        if (d.sources.length) return { kind: 'payment', activate: { source: this.pick(d.sources).id } };
        return { kind: 'payment', auto: true };
      }
      case 'attackers': {
        for (let i = 0; i < 40; i++) {
          const attacks: [ObjId, TargetRef][] = [];
          for (const c of d.candidates) if (next(this.rng) < 0.5) attacks.push([c.obj, this.pick(c.targets)]);
          const a: Answer = { kind: 'attackers', attacks };
          if (ok(a)) return a;
        }
        // atender às exigências: todos atacando, tentando alvos diferentes
        for (let i = 0; i < 40; i++) {
          const a: Answer = { kind: 'attackers', attacks: d.candidates.map((c) => [c.obj, this.pick(c.targets)]) };
          if (ok(a)) return a;
        }
        return { kind: 'attackers', attacks: [] };
      }
      case 'blockers': {
        for (let i = 0; i < 40; i++) {
          const blocks: [ObjId, ObjId][] = [];
          for (const c of d.candidates) if (next(this.rng) < 0.4) blocks.push([c.obj, this.pick(c.canBlock)]);
          const a: Answer = { kind: 'blockers', blocks };
          if (ok(a)) return a;
        }
        return { kind: 'blockers', blocks: [] };
      }
      case 'damage': {
        const assign = d.recipients.map(() => 0);
        let left = d.amount;
        for (let i = 0; i < d.recipients.length && left > 0; i++) {
          const n = i === d.recipients.length - 1 ? left : Math.min(left, d.lethal[i] || 1);
          assign[i] = n;
          left -= n;
        }
        assign[assign.length - 1] += left;
        return { kind: 'damage', assign };
      }
      case 'arrange': {
        const placement: Record<string, 'top' | 'bottom' | 'graveyard'> = {};
        for (const it of d.items) placement[it.id] = this.pick(d.destinations);
        return { kind: 'arrange', placement, order: shuffle(this.rng, d.items.map((i) => i.id)) };
      }
      case 'mulligan':
        return { kind: 'mulligan', keep: d.mulligans >= 2 || next(this.rng) < 0.8 };
    }
  }
}
