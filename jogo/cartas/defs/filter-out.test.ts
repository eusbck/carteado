import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Filter Out', () => {
  it('devolve à mão dos donos todas as permanentes que não são criatura nem terreno', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Sol Ring'], ['Prismatic Lens', 'Indomitable Ancients', 'Forest']], hand: [['Filter Out'], []] });
    tg.cast('Filter Out').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'hand')).toEqual(['Prismatic Lens']);
    expect(tg.find('Indomitable Ancients', 'battlefield')).not.toBeNull();
    expect(tg.find('Forest', 'battlefield')).not.toBeNull();
  });
});
