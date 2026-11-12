import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Index', () => {
  it('olha as cinco do topo e as põe de volta na ordem que quiser', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Index'], []], library: [['Island', 'Forest', 'Swamp', 'Plains', 'Mountain', 'Sol Ring'], []] });
    tg.choose('Index: ponha as cartas', ['Mountain', 'Plains', 'Swamp', 'Forest', 'Island']);
    tg.cast('Index').resolve();
    expect(tg.names(0, 'library')).toEqual(['Mountain', 'Plains', 'Swamp', 'Forest', 'Island', 'Sol Ring']);
  });
});
