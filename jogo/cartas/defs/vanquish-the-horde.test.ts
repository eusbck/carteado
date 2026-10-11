import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const V = 'Vanquish the Horde';

describe(V, () => {
  it('custa {1} a menos por criatura no campo e destrói todas as criaturas', () => {
    // quatro criaturas: {6}{W}{W} vira {2}{W}{W}
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Indomitable Ancients', 'Elvish Mystic', 'Zetalpa, Primal Dawn']], hand: [[V], []] });
    tg.cast(V).resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull(); // indestrutível (CR 702.12b)
  });
  it('CR 601.2f: a redução não tira o {W}{W}', () => {
    const muitas = Array(10).fill('Wall of Omens');
    expect(setup({ battlefield: [['Plains', 'Mountain', ...muitas], []], hand: [[V], []] }).canCast(V)).toBe(false);
    expect(setup({ battlefield: [['Plains', 'Plains', ...muitas], []], hand: [[V], []] }).canCast(V)).toBe(true);
    expect(setup({ battlefield: [Array(7).fill('Plains'), []], hand: [[V], []] }).canCast(V)).toBe(false);
  });
});
