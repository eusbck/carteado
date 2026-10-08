import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Reunion of the House', () => {
  it('criaturas com força 0 não pesam na soma; a mágica vai para o exílio', () => {
    const tg = setup({
      battlefield: [[...Array(7).fill('Plains')], []], hand: [['Reunion of the House'], []],
      graveyard: [['Archfiend of Depravity', 'Gau, Feral Youth', 'Glissa Sunslayer', 'Elvish Mystic', 'Wall of Omens'], []], library: [['Island', 'Island'], []],
    });
    const erro: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'select' || !d.prompt.includes('força total 10')) return null;
      const id = (l: string) => d.items.find((i) => i.label === l)!.id;
      // 5 + 2 + 3 + 1 = 11: conjunto ilegal
      erro.push(x.game.check(0, { kind: 'select', ids: [id('Archfiend of Depravity'), id('Gau, Feral Youth'), id('Glissa Sunslayer'), id('Elvish Mystic')] }));
      // 5 + 2 + 3 + 0 = 10: legal
      return { kind: 'select', ids: [id('Archfiend of Depravity'), id('Gau, Feral Youth'), id('Glissa Sunslayer'), id('Wall of Omens')] };
    });
    tg.cast('Reunion of the House').resolve();
    expect(erro[0]).not.toBeNull();
    expect(['Archfiend of Depravity', 'Gau, Feral Youth', 'Glissa Sunslayer', 'Wall of Omens'].every((n) => tg.find(n) !== null)).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Reunion of the House']);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
  });
});
