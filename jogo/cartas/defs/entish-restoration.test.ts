import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Entish Restoration';

describe(N, () => {
  it('sacrifica um terreno na resolução e busca dois básicos virados', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island'], []], hand: [[N], []], library: [['Swamp', 'Mountain', 'Plains'], []] });
    tg.choose('sacrifique um terreno', ['Island']).choose('Entish Restoration: procure', ['Swamp', 'Mountain']).cast(N).resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', N].sort());
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
    expect(tg.find('Plains', 'library')).not.toBeNull();
  });
  it('com uma criatura de força 4 ou mais, busca até três', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island', 'Zetalpa, Primal Dawn'], []], hand: [[N], []], library: [['Swamp', 'Mountain', 'Plains'], []] });
    tg.choose('sacrifique um terreno', ['Island']).choose('Entish Restoration: procure', ['Swamp', 'Mountain', 'Plains']).cast(N).resolve();
    for (const n of ['Swamp', 'Mountain', 'Plains']) expect(tg.find(n), n).not.toBeNull();
  });
});
