import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Slumbering Walker', () => {
  it('entra com dois -1/-1; o alvo é escolhido depois de remover o marcador', () => {
    const tg = setup({
      step: 'main2', battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Slumbering Walker'], []],
      graveyard: [['Elvish Mystic', 'Glissa Sunslayer'], []], library: [['Island'], ['Island']],
    });
    tg.cast('Slumbering Walker').resolve();
    const w = tg.bf('Slumbering Walker');
    expect(tg.pt(w)).toEqual([2, 5]);
    tg.yes('remover um marcador');
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('força 2 ou menos') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.passTo('end').resolveAll();
    expect(opcoes).toEqual(['Elvish Mystic']);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.pt(w)).toEqual([3, 6]);
  });
});
