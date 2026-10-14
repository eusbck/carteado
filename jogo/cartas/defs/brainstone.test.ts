import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Brainstone', () => {
  it('{2}, {T}, sacrifique: compra três e põe duas da mão no topo na ordem escolhida', () => {
    const tg = setup({ battlefield: [['Brainstone', 'Island', 'Island'], []], hand: [['Wall of Omens'], []], library: [['Forest', 'Swamp', 'Plains', 'Mountain'], []] });
    tg.choose('Brainstone: escolha duas cartas', ['Wall of Omens', 'Forest']);
    tg.activate('Brainstone').resolve();
    expect(tg.find('Brainstone')).toBeNull();
    expect(tg.names(0, 'hand').sort()).toEqual(['Plains', 'Swamp']);
    expect(tg.names(0, 'library')).toEqual(['Wall of Omens', 'Forest', 'Mountain']);
  });
});
