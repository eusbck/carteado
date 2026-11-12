import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Elvish Harbinger', () => {
  it('busca uma carta de Elfo e a coloca no topo depois de embaralhar', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Elvish Harbinger'], []], library: [['Island', 'Island', 'Llanowar Elves', 'Island'], []] });
    tg.yes('Elvish Harbinger', true).choose('Elfo', ['Llanowar Elves']).cast('Elvish Harbinger').resolve();
    tg.resolveAll();
    expect(tg.names(0, 'library')[0]).toBe('Llanowar Elves');
    expect(tg.names(0, 'library').length).toBe(4);
  });
});
