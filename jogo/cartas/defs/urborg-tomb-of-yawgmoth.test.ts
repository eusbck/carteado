import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';

const NOME = 'Urborg, Tomb of Yawgmoth';

describe(NOME, () => {
  it('ele mesmo vira Swamp e produz {B}', () => {
    expect(alternativasDeMana(NOME)).toEqual(['B']);
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Swamp']);
  });
  it('fora do campo, Urborg não é Swamp', () => {
    const tg = setup({ battlefield: [[], []], hand: [[NOME], []] });
    expect(chars(tg.g, tg.find(NOME, 'hand')!).subtypes).toEqual([]);
  });
  it('cartas de terreno fora do campo não viram Swamp', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Island'], []], graveyard: [['Command Tower'], []] });
    expect(chars(tg.g, tg.find('Island', 'hand')!).subtypes).toEqual(['Island']);
    expect(chars(tg.g, tg.find('Command Tower', 'graveyard')!).subtypes).toEqual([]);
  });
  it('CR 305.6: cada terreno no campo vira Swamp e ganha "{T}: Adicione {B}"; nome, outros tipos, básico e lendário não mudam', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Command Tower', 'Sol Ring'], ['Island']] });
    const ilha = tg.bf('Island', 0);
    const ci = chars(tg.g, ilha);
    expect(ci.name).toBe('Island');
    expect(ci.subtypes).toEqual(['Island', 'Swamp']);
    expect(ci.supertypes).toEqual(['Basic']);
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual(['Legendary']);
    // o terreno do oponente também vira Swamp
    expect(chars(tg.g, tg.bf('Island', 1)).subtypes).toEqual(['Island', 'Swamp']);
    // Command Tower continua com a habilidade dela e ganha {B}; Sol Ring não é terreno
    const torre = tg.bf('Command Tower');
    expect(chars(tg.g, torre).subtypes).toEqual(['Swamp']);
    expect(chars(tg.g, tg.bf('Sol Ring')).subtypes).toEqual([]);
    const alts = (id: number) => [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort();
    expect(alts(ilha)).toEqual(['B', 'U']);
    expect(alts(torre)).toContain('B');
    // um básico que já é Swamp não ganha uma segunda habilidade de mana
    const b = setup({ battlefield: [[NOME, 'Swamp'], []] });
    const basico = b.bf('Swamp');
    expect(chars(b.g, basico).abilities.filter((a) => a.id === 'basic:B').length).toBe(1);
  });
  it('sem Urborg no campo, os terrenos voltam ao normal', () => {
    const tg = setup({ battlefield: [[NOME, 'Island'], []] });
    tg.state.zones.battlefield = tg.state.zones.battlefield.filter((id) => id !== tg.bf(NOME));
    tg.g.bump();
    expect(chars(tg.g, tg.bf('Island')).subtypes).toEqual(['Island']);
  });
});
