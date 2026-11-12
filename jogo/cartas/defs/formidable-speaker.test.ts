import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Formidable Speaker';

describe(N, () => {
  it('descartando uma carta, busca uma carta de criatura para a mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N, 'Island'], []], library: [['Forest', 'Indomitable Ancients'], []] });
    tg.choose('Descarte', ['Island']).choose('carta de criatura', ['Indomitable Ancients']).cast(N).resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
  it('sem descartar, não busca', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N, 'Island'], []], library: [['Forest', 'Indomitable Ancients'], []] });
    tg.choose('Descarte', []).cast(N).resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('{1}, {T}: desvira outra permanente alvo', () => {
    const tg = setup({ battlefield: [[N, 'Forest', { name: 'Sol Ring', tapped: true }], []] });
    tg.choose('outra permanente alvo', ['Sol Ring']).activate(N).resolve();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
  });
});
