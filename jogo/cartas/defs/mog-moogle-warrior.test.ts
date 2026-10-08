import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Mog, Moogle Warrior', () => {
  it('duas criaturas descartadas criam uma ficha só; carta não criatura dá marcador em cada Moogle', () => {
    const tg = setup({
      players: 3, step: 'main2', battlefield: [['Mog, Moogle Warrior'], [], []],
      hand: [['Wall of Omens'], ['Elvish Mystic'], ['Plains']], library: [['Island', 'Island'], ['Island'], ['Island']],
    });
    tg.choose('Descarte', ['Wall of Omens']).choose('Descarte', ['Elvish Mystic']).choose('Descarte', ['Plains']);
    tg.passTo('end').resolve();
    expect(tg.all('Moogle').length).toBe(1);
    expect(tg.pt(tg.bf('Moogle'))).toEqual([2, 3]);
    expect(tg.pt(tg.bf('Mog, Moogle Warrior'))).toEqual([2, 3]);
    expect([tg.names(0, 'hand'), tg.names(1, 'hand'), tg.names(2, 'hand')]).toEqual([['Island'], ['Island'], ['Island']]);
  });
  it('quem não descarta não compra', () => {
    const tg = setup({ step: 'main2', battlefield: [['Mog, Moogle Warrior'], []], hand: [['Plains'], ['Plains']], library: [['Island'], ['Island']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Descarte') ? { kind: 'select', ids: [] } : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Descarte') ? { kind: 'select', ids: [] } : null));
    tg.passTo('end').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.all('Moogle').length).toBe(0);
  });
});
