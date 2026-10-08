import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

describe('Dragonlord Dromoka', () => {
  it('CR 701.6: esta mágica não pode ser anulada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains', 'Sol Ring', 'Sol Ring'], ['Island', 'Island']], hand: [['Dragonlord Dromoka'], ['Counterspell']] });
    tg.cast('Dragonlord Dromoka').pass();
    tg.choose('mágica alvo', ['Dragonlord Dromoka']).cast('Counterspell').resolve().resolve();
    expect(tg.find('Dragonlord Dromoka')).not.toBeNull();
  });

  it('voar e vínculo com a vida', () => expect(temPalavrasChave('Dragonlord Dromoka', 'flying', 'lifelink')).toBe(true));

  it('oponentes não conjuram mágicas no seu turno, mas podem no deles', () => {
    const tg = setup({ battlefield: [['Dragonlord Dromoka'], ['Swamp', 'Swamp', 'Indomitable Ancients']], hand: [[], ['Infernal Grasp']] });
    tg.pass();
    expect(tg.canCast('Infernal Grasp')).toBe(false);
    const tg2 = setup({ active: 1, battlefield: [['Dragonlord Dromoka'], ['Swamp', 'Swamp']], hand: [[], ['Infernal Grasp']] });
    expect(tg2.canCast('Infernal Grasp')).toBe(true);
  });
});
