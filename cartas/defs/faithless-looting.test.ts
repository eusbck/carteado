import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Faithless Looting', () => {
  it('compra duas e descarta duas; por recapitular, vai para o exílio', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Faithless Looting'], []], library: [['Plains', 'Island', 'Swamp', 'Forest'], []] });
    tg.choose('escarte', ['Plains', 'Island']).cast('Faithless Looting').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.choose('escarte', ['Swamp', 'Forest']).cast('Faithless Looting', 'flashback').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Faithless Looting']);
  });
});
