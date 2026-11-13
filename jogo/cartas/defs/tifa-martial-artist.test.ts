import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tifa, Martial Artist';

describe(N, () => {
  it('com força 7 ou mais no primeiro combate, desvira as criaturas e há um combate adicional, sem fase principal no meio', () => {
    const tg = setup({ battlefield: [[N, 'Jumbo Cactuar', 'Silver Myr'], []], step: 'beginCombat', life: 20000 });
    tg.attack([['Jumbo Cactuar', 1], ['Silver Myr', 1]]).passUntil((t) => t.state.turn.step === 'endCombat');
    expect(tg.state.objects[tg.bf('Jumbo Cactuar')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(false);
    tg.passUntil((t) => t.state.turn.step !== 'endCombat');
    expect(tg.state.turn.step).toBe('beginCombat');
    expect(tg.state.turn.combatCount).toBe(2);
  });

  it('a força de cada criatura conta sozinha; duas de força 4 não disparam', () => {
    const tg = setup({ battlefield: [[N, 'Zetalpa, Primal Dawn', { name: 'Silver Myr', counters: { '+1/+1': 2 } }], []], step: 'beginCombat' });
    tg.attack([['Zetalpa, Primal Dawn', 1], ['Silver Myr', 1]]).passTo('main2', 0);
    expect(tg.state.turn.combatCount).toBe(1);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true);
  });
});
