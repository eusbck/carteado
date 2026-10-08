import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Betor, Ancestor's Voice", () => {
  it('na etapa final: marcadores = vida ganha; volta criatura com valor de mana até a vida perdida', () => {
    const tg = setup({ battlefield: [["Betor, Ancestor's Voice", 'Wall of Omens'], []], graveyard: [['Elvish Mystic', 'Zetalpa, Primal Dawn'], []] });
    tg.state.turnStats[0].lifeGained = 2;
    tg.state.turnStats[0].lifeLost = 3;
    let opcoes: string[] = [];
    tg.choose('outra criatura alvo', ['Wall of Omens']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('vida perdida')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] };
    });
    tg.passTo('end').resolve();
    expect(opcoes).toEqual(['Elvish Mystic']);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
