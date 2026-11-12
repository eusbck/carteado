import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { entraVirado } from '../../testes/padroes.ts';

const N = 'Rivendell';

describe(N, () => {
  it('entra desvirado só com uma criatura lendária já no campo', () => {
    expect(entraVirado(N)).toBe(true);
    expect(entraVirado(N, ['Memnite'])).toBe(true);
    expect(entraVirado(N, ['Tetsuko Umezawa, Fugitive'])).toBe(false);
  });
  it('{1}{U}, {T}: vidência 2, só com criatura lendária', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], library: [['Forest', 'Swamp', 'Plains'], []] });
    expect(() => tg.activate(N, 'Vidência')).toThrow();
    const tg2 = setup({ battlefield: [[N, 'Island', 'Island', 'Tetsuko Umezawa, Fugitive'], []], library: [['Forest', 'Swamp', 'Plains'], []] });
    tg2.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg2.activate(N, 'Vidência').resolve();
    expect(tg2.names(0, 'library')).toEqual(['Plains', 'Forest', 'Swamp']);
  });
});
