import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Laughing Mad', () => {
  it('descarta como custo e compra duas; por recapitular, vai para o exílio', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Laughing Mad', 'Plains'], []], library: [['Island', 'Island', 'Swamp', 'Swamp'], []] });
    tg.cast('Laughing Mad'); // única carta na mão: o descarte é automático
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
    tg.choose('escarte', ['Island']).cast('Laughing Mad', 'flashback').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Laughing Mad']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Swamp', 'Swamp']);
  });
});
