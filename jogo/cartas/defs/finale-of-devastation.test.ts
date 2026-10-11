import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Finale of Devastation';

describe(N, () => {
  it('busca no grimório uma criatura com valor de mana X ou menos e a põe no campo', () => {
    const tg = setup({ battlefield: [Array(6).fill('Forest'), []], hand: [[N], []], library: [['Island', 'Indomitable Ancients', 'Zetalpa, Primal Dawn'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Procure uma carta de criatura')) return null;
      // Zetalpa tem valor de mana 8: não serve com X = 4
      expect(d.items.filter((i) => !i.disabled).map((i) => i.label)).not.toContain('Zetalpa, Primal Dawn');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.number('valor de X', 4).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });

  it('pode pegar a criatura do cemitério', () => {
    const tg = setup({ battlefield: [Array(6).fill('Forest'), []], hand: [[N], []], graveyard: [['Silver Myr'], []], library: [['Island'], []] });
    tg.choose('do seu cemitério', ['Silver Myr']);
    tg.number('valor de X', 2).cast(N).resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
  });

  it('com X 10 ou mais, as suas criaturas, inclusive a que entrou, recebem +X/+X e ímpeto', () => {
    const tg = setup({ battlefield: [[...Array(12).fill('Forest'), 'Elvish Mystic'], []], hand: [[N], []], library: [['Silver Myr', 'Island'], []] });
    tg.choose('Procure uma carta de criatura', ['Silver Myr']);
    tg.number('valor de X', 10).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([11, 11]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([11, 11]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'haste')).toBe(true);
  });
});