import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Displacer Kitten', () => {
  it('ao conjurar mágica que não é de criatura, pisca um permanente', () => {
    const tg = setup({ battlefield: [['Displacer Kitten', 'Island', { name: 'Sol Ring', tapped: true }], []], hand: [['Opt'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('permanente não terreno', ['Sol Ring']).cast('Opt').resolveAll();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
  });
});
