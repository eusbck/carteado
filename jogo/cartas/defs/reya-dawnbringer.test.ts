import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Reya Dawnbringer';

describe(N, () => {
  it('na sua manutenção, pode devolver uma carta de criatura do seu cemitério ao campo', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[N], []], graveyard: [['Baleful Strix', 'Rampant Growth'], ['Slither Blade']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de criatura alvo')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.yes('Reya Dawnbringer: devolver', true);
    tg.passTo('draw', 0);
    expect(opcoes).toEqual(['Baleful Strix']);
    expect(tg.find('Baleful Strix')).not.toBeNull();
  });
});
