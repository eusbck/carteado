import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = "Avacyn's Pilgrim";
describe(N, () => {
  it('{T}: adiciona {W}', () => expect(alternativasDeMana(N)).toEqual(['W']));
  it('CR 302.6: com enjoo de invocação não pode virar para mana', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(false);
  });
});
