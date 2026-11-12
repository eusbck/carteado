import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Faerie Dreamthief';

describe(N, () => {
  it('ao entrar, vigiar 1', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[N], []], library: [['Forest', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
  it('do cemitério: {2}{B}, exile-a: compra uma carta e perde 1 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], graveyard: [[N], []], library: [['Forest'], []] });
    tg.activate(N, 'compra').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.life(0)).toBe(39);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });
});
