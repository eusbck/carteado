import { describe, expect, it } from 'vitest';
import { chars, counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Taurean Mauler';

describe(N, () => {
  it('CR 702.73a: polimorfo, é de todos os tipos de criatura', () => {
    const tg = setup({ battlefield: [[N], []] });
    const tipos = chars(tg.g, tg.bf(N)).subtypes;
    expect(tipos).toContain('Dragon');
    expect(tipos).toContain('Elf');
    expect(tipos).toContain('Shapeshifter');
  });

  it('o gatilho resolve antes da mágica do oponente, mesmo que ela seja anulada', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Mountain']], hand: [[], ['Sol Ring']] });
    tg.yes(N, true).cast('Sol Ring');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(tg.state.zones.stack).toHaveLength(1);
    counter(tg.g, tg.state.zones.stack[0]);
    tg.refresh().settle();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
  });

  it('é opcional, e a sua própria mágica não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Mountain']], hand: [[], ['Sol Ring']] });
    tg.yes(N, false).cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
    const meu = setup({ battlefield: [[N, 'Mountain'], []], hand: [['Sol Ring'], []] });
    meu.cast('Sol Ring');
    expect(meu.state.zones.stack).toHaveLength(1);
  });
});
