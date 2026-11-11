import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Step Through';

describe(N, () => {
  it('devolve duas criaturas alvo para a mão dos donos', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Island'), 'Spellseeker'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('duas criaturas alvo', ['Spellseeker', 'Elvish Mystic']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Spellseeker']);
    expect(tg.names(1, 'hand')).toEqual(['Elvish Mystic']);
  });
  it('a ciclagem de Wizard procura uma carta de Wizard (qualquer tipo de carta com o subtipo)', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Elvish Mystic', 'Spellseeker', 'Forest'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Wizard')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Spellseeker')!.id] };
    });
    tg.activate(N).resolve();
    expect(servem).toEqual(['Spellseeker']);
    expect(tg.names(0, 'hand')).toEqual(['Spellseeker']);
  });
});
