import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Arbor Elf', () => {
  it('desvira a Floresta alvo (de qualquer jogador)', () => {
    const tg = setup({ battlefield: [['Arbor Elf', { name: 'Forest', tapped: true }], [{ name: 'Forest', tapped: true }]] });
    const minha = tg.bf('Forest', 0);
    tg.choose('Floresta alvo', [minha]).activate('Arbor Elf').resolve();
    expect(tg.state.objects[minha].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Forest', 1)].tapped).toBe(true);
  });
});
