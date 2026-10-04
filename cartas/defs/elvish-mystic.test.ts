import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Elvish Mystic', () => {
  it('{T}: adiciona {G}', () => expect(alternativasDeMana('Elvish Mystic')).toEqual(['G']));
  it('CR 302.6: com enjoo de invocação não pode virar para mana', () => {
    const tg = setup({ battlefield: [[{ name: 'Elvish Mystic', ready: false }], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(false);
  });
});
