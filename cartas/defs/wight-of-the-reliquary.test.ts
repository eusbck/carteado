import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wight of the Reliquary', () => {
  it('+1/+1 para cada carta de criatura no seu cemitério', () => {
    const tg = setup({ battlefield: [['Wight of the Reliquary'], []], graveyard: [['Wall of Omens', 'Elvish Mystic', 'Forest'], ['Ravenous Chupacabra']] });
    expect(tg.pt(tg.bf('Wight of the Reliquary'))).toEqual([4, 4]);
  });
  it('{T}, sacrifique outra criatura: busca qualquer terreno para o campo virado', () => {
    const tg = setup({ battlefield: [['Wight of the Reliquary', 'Elvish Mystic'], []], library: [['Exotic Orchard', 'Plains'], []] });
    tg.choose('Procure uma carta de terreno', ['Exotic Orchard']).activate('Wight of the Reliquary').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.state.objects[tg.bf('Exotic Orchard')].tapped).toBe(true);
    expect(tg.pt(tg.bf('Wight of the Reliquary'))).toEqual([3, 3]);
  });
});
