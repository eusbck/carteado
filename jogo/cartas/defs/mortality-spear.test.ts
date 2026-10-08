import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe('Mortality Spear', () => {
  it('com vida ganha no turno, custa {B}{G}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], ['Sol Ring']], hand: [['Mortality Spear'], []] });
    expect(tg.canCast('Mortality Spear')).toBe(false);
    gainLife(tg.g, 0, 1, null);
    tg.refresh().choose('permanente não terreno alvo', ['Sol Ring']).cast('Mortality Spear').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
