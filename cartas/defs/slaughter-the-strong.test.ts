import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Slaughter the Strong', () => {
  it('a soma das escolhidas precisa ser 4 ou menos; força negativa subtrai da soma', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Wall of Omens', 'Elvish Mystic'], ['Archfiend of Depravity', { name: 'Wall of Omens', counters: { '-1/-1': 2 } }, 'Gau, Feral Youth']],
      hand: [['Slaughter the Strong'], []], library: [['Island'], ['Island']],
    });
    const erros: (string | null)[] = [];
    let vez = 0;
    tg.script.push((d, x) => {
      if (d.kind !== 'select' || !d.prompt.includes('Slaughter')) return null;
      vez++;
      return { kind: 'select', ids: d.items.map((i) => i.id) }; // Ana: Wall 0 + Mystic 1
    });
    tg.script.push((d, x) => {
      if (d.kind !== 'select' || !d.prompt.includes('Slaughter')) return null;
      const id = (pre: string) => d.items.find((i) => i.label.startsWith(pre))!.id;
      // Archfiend 5 + Gau 2 = 7: ilegal; Archfiend 5 + Wall (-2) = 3: legal
      erros.push(x.game.check(1, { kind: 'select', ids: [id('Archfiend'), id('Gau')] }));
      return { kind: 'select', ids: [id('Archfiend'), id('Wall of Omens')] };
    });
    tg.cast('Slaughter the Strong').resolve();
    expect(vez).toBe(1);
    expect(erros[0]).toMatch(/passa de 4/);
    expect(tg.all('Wall of Omens').length).toBe(2);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Archfiend of Depravity')).not.toBeNull();
    expect(tg.find('Gau, Feral Youth')).toBeNull();
  });
});
