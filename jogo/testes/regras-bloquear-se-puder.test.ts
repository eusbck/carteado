// lote4-c: exigência de bloqueio "[criatura] bloqueia [atacante] neste combate se puder" (CR 509.1c), em
// motor/bloquear-se-puder.ts.
import { describe, expect, it } from 'vitest';
import { defaultAnswer } from '../motor/ask.ts';
import { exigeBloqueio } from '../motor/bloquear-se-puder.ts';
import { validateBlocks } from '../motor/combat.ts';
import type { Decision } from '../motor/types.ts';
import { setup, type TestGame } from './harness.ts';

/** ataca com as criaturas de Ana e, na declaração de bloqueadores de Bruno, cria a exigência e guarda a decisão */
function comExigencia(tg: TestGame, bloqueador: string, atacante: string, atacantes: string[]): Decision {
  let decisao: Decision | null = null;
  tg.script.push((d) => {
    if (d.kind !== 'blockers') return null;
    decisao = d;
    return defaultAnswer(d);
  });
  tg.attack(atacantes.map((a) => [a, 1]));
  tg.passUntil((t) => t.state.turn.step === 'declareAttackers' && !!t.state.combat?.attackers.length);
  exigeBloqueio({ g: tg.g, you: 0, source: tg.bf(atacante) }, tg.bf(bloqueador, 1), tg.bf(atacante));
  tg.passTo('combatDamage');
  return decisao!;
}

describe('Bloqueia se puder (CR 509.1c)', () => {
  it('CR 509.1c: a declaração precisa cumprir a exigência; a resposta padrão bloqueia com a criatura exigida', () => {
    const tg = setup({ battlefield: [['Serra Angel', 'Indomitable Ancients'], ['Wall of Omens']] });
    const d = comExigencia(tg, 'Wall of Omens', 'Indomitable Ancients', ['Indomitable Ancients']);
    expect(d.kind === 'blockers' && d.requiredPairs).toEqual([[tg.bf('Wall of Omens'), tg.bf('Indomitable Ancients')]]);
    // a padrão bloqueou: o Ancients não causou dano a Bruno
    expect(tg.life(1)).toBe(40);
  });
  it('CR 509.1c: sem poder bloquear (voar), a exigência não obriga a nada', () => {
    const tg = setup({ battlefield: [['Serra Angel'], ['Wall of Omens']] });
    const d = comExigencia(tg, 'Wall of Omens', 'Serra Angel', ['Serra Angel']);
    // a Wall of Omens não pode bloquear quem voa: nem há declaração de bloqueadores, e o dano passa
    expect(d).toBeNull();
    expect(tg.life(1)).toBe(36);
  });
  it('CR 509.1c: bloquear outro atacante não cumpre a exigência', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Llanowar Elves'], ['Wall of Omens']] });
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      const parede = tg.bf('Wall of Omens', 1);
      expect(validateBlocks(tg.g, 1, [[parede, tg.bf('Llanowar Elves')]])).toContain('precisa bloquear');
      expect(validateBlocks(tg.g, 1, [[parede, tg.bf('Indomitable Ancients')]])).toBeNull();
      return defaultAnswer(d);
    });
    tg.attack([['Indomitable Ancients', 1], ['Llanowar Elves', 1]]);
    tg.passUntil((t) => t.state.turn.step === 'declareAttackers' && !!t.state.combat?.attackers.length);
    exigeBloqueio({ g: tg.g, you: 0, source: tg.bf('Indomitable Ancients') }, tg.bf('Wall of Omens', 1), tg.bf('Indomitable Ancients'));
    tg.passTo('combatDamage');
  });
});
