// lote4-b: "precisa ser bloqueada se possível" (CR 509.1c; motor/bloqueio-obrigatorio.ts, gancho mustBeBlockedIfAble).
import { describe, expect, it } from 'vitest';
import { validateBlocks } from '../motor/combat.ts';
import { setup } from './harness.ts';

const MASAMUNE = 'The Masamune';

describe('CR 509.1c: exigência de bloqueio "se possível"', () => {
  const montar = (defensores: string[]) => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients', { name: MASAMUNE, attachTo: 'Indomitable Ancients' }, 'Burnished Hart'], defensores] });
    tg.attack([['Indomitable Ancients', 1], ['Burnished Hart', 1]]);
    tg.passUntil((t) => t.state.turn.step === 'declareAttackers' && t.state.zones.stack.length === 0);
    return tg;
  };

  it('CR 509.1c: sem bloquear a atacante exigida, a declaração é recusada; bloqueando outra no lugar, também', () => {
    const tg = montar(['Wall of Omens']);
    const ancients = tg.bf('Indomitable Ancients');
    const hart = tg.bf('Burnished Hart');
    const wall = tg.bf('Wall of Omens');
    expect(validateBlocks(tg.g, 1, [])).toMatch(/bloqueada se possível/);
    expect(validateBlocks(tg.g, 1, [[wall, hart]])).toMatch(/bloqueada se possível/);
    expect(validateBlocks(tg.g, 1, [[wall, ancients]])).toBeNull();
  });

  it('CR 509.1c: sem criatura que possa bloquear, não há exigência', () => {
    const tg = montar([]);
    expect(validateBlocks(tg.g, 1, [])).toBeNull();
  });

  it('a resposta padrão cumpre a exigência', () => {
    const tg = montar(['Wall of Omens']);
    tg.passTo('combatDamage');
    const bloqueada = (nome: string) => tg.state.combat?.attackers.find((a) => a.id === tg.bf(nome))?.blocked;
    expect(bloqueada('Indomitable Ancients')).toBe(true);
    expect(bloqueada('Burnished Hart')).toBe(false);
  });
});
