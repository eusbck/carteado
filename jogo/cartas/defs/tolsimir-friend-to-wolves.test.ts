import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tolsimir, Friend to Wolves';
const TERRENOS = ['Forest', 'Forest', 'Forest', 'Plains', 'Plains'];

describe(N, () => {
  it('Voja entra e dispara o gatilho de Lobo: ganha 3 de vida e luta', () => {
    const tg = setup({ battlefield: [TERRENOS, ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('até uma criatura alvo', ['Elvish Mystic']).cast(N).resolve();
    tg.resolveAll();
    expect(tg.find('Voja, Friend to Elves')).not.toBeNull();
    expect(tg.life(0)).toBe(43);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Voja, Friend to Elves')].damage).toBe(1);
  });
  it('sem alvo, só ganha 3 de vida', () => {
    const tg = setup({ battlefield: [TERRENOS, []], hand: [[N], []] });
    tg.cast(N).resolve();
    tg.resolveAll();
    expect(tg.life(0)).toBe(43);
  });
});
