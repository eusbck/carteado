import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { alternativasDeMana, temPalavrasChave } from '../../testes/padroes.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Birds of Paradise';
describe(N, () => {
  it('voar; {T}: adiciona uma mana de qualquer cor', () => {
    expect(temPalavrasChave(N, 'flying')).toBe(true);
    expect(alternativasDeMana(N)).toEqual(['B', 'G', 'R', 'U', 'W']);
  });
  it('CR 302.6: com enjoo de invocação não pode virar para mana', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }], []] });
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(N))).toHaveLength(0);
  });
});
