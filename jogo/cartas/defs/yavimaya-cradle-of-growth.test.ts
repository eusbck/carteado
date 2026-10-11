import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';

const NOME = 'Yavimaya, Cradle of Growth';

describe(NOME, () => {
  it('ele mesmo vira Forest e produz {G}', () => {
    expect(alternativasDeMana(NOME)).toEqual(['G']);
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Forest']);
  });
  it('fora do campo, Yavimaya não é Forest', () => {
    const tg = setup({ battlefield: [[], []], hand: [[NOME], []] });
    expect(chars(tg.g, tg.find(NOME, 'hand')!).subtypes).toEqual([]);
  });
  it('cartas de terreno fora do campo não viram Forest', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Island'], []], graveyard: [['Command Tower'], []] });
    expect(chars(tg.g, tg.find('Island', 'hand')!).subtypes).toEqual(['Island']);
    expect(chars(tg.g, tg.find('Command Tower', 'graveyard')!).subtypes).toEqual([]);
  });
  it('CR 305.6: cada terreno no campo vira Forest e ganha "{T}: Adicione {G}"; nome, outros tipos, básico e lendário não mudam', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Command Tower', 'Sol Ring'], ['Island']] });
    const ilha = tg.bf('Island', 0);
    const ci = chars(tg.g, ilha);
    expect(ci.name).toBe('Island');
    expect(ci.subtypes).toEqual(['Island', 'Forest']);
    expect(ci.supertypes).toEqual(['Basic']);
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual(['Legendary']);
    // o terreno do oponente também vira Forest
    expect(chars(tg.g, tg.bf('Island', 1)).subtypes).toEqual(['Island', 'Forest']);
    // Command Tower continua com a habilidade dela e ganha {G}; Sol Ring não é terreno
    const torre = tg.bf('Command Tower');
    expect(chars(tg.g, torre).subtypes).toEqual(['Forest']);
    expect(chars(tg.g, tg.bf('Sol Ring')).subtypes).toEqual([]);
    const alts = (id: number) => [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort();
    expect(alts(ilha)).toEqual(['G', 'U']);
    expect(alts(torre)).toContain('G');
    // um básico que já é Forest não ganha uma segunda habilidade de mana
    const b = setup({ battlefield: [[NOME, 'Forest'], []] });
    const basico = b.bf('Forest');
    expect(chars(b.g, basico).abilities.filter((a) => a.id === 'basic:G').length).toBe(1);
  });
  it('sem Yavimaya no campo, os terrenos voltam ao normal', () => {
    const tg = setup({ battlefield: [[NOME, 'Island'], []] });
    tg.state.zones.battlefield = tg.state.zones.battlefield.filter((id) => id !== tg.bf(NOME));
    tg.g.bump();
    expect(chars(tg.g, tg.bf('Island')).subtypes).toEqual(['Island']);
  });
});
