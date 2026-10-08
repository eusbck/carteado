import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Path of Ancestry', () => {
  it('conjurar uma criatura que compartilha tipo faz vidência 1', () => {
    const tg = setup({
      battlefield: [['Path of Ancestry', 'Plains', 'Plains', 'Plains'], []], command: [[{ name: 'Gau, Feral Youth', commander: true }], []],
      hand: [['Mangara, the Diplomat'], []], library: [['Island', 'Island'], []],
    });
    let videncias = 0;
    tg.script.push((d) => (d.kind === 'arrange' && d.prompt.includes('Vidência') ? (videncias++, { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])), order: d.items.map((i) => i.id) }) : null));
    tg.cast('Mangara, the Diplomat').resolveAll();
    expect(tg.find('Mangara, the Diplomat')).not.toBeNull();
    expect(videncias).toBe(1);
  });
  it('criatura sem tipo em comum não faz vidência', () => {
    const tg = setup({
      battlefield: [['Path of Ancestry', 'Plains'], []], command: [[{ name: 'Gau, Feral Youth', commander: true }], []],
      hand: [['Wall of Omens'], []], library: [['Island', 'Island'], []],
    });
    let videncias = 0;
    tg.script.push((d) => (d.kind === 'arrange' ? (videncias++, { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])), order: d.items.map((i) => i.id) }) : null));
    tg.cast('Wall of Omens').resolveAll();
    expect(videncias).toBe(0);
  });
});
