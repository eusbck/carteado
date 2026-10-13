import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Motociata';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('com X = 3, cria três Patriotas e ganha 1 de vida por criatura sua', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains', 'Plains', 'Plains', 'Plains', 'Elvish Mystic'], []], hand: [[N], []], library: [lib, lib] });
    tg.number('X', 3);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Patriota')).toHaveLength(3);
    expect(tg.life(0)).toBe(44);
  });

  it('com X = 0, só ganha vida pelas criaturas que já tem', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains', 'Elvish Mystic'], []], hand: [[N], []], library: [lib, lib] });
    tg.number('X', 0);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'battlefield')).not.toContain('Patriota');
    expect(tg.life(0)).toBe(41);
  });
});
