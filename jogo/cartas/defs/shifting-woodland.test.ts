import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shifting Woodland';

describe(N, () => {
  it('entra virado sem Forest; desvirado com uma Forest', () => {
    const tg = setup({ hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const tg2 = setup({ battlefield: [['Forest'], []], hand: [[N], []] });
    tg2.play(N);
    expect(tg2.state.objects[tg2.bf(N)].tapped).toBe(false);
  });
  it('virar cópia não é entrar no campo: os gatilhos de entrar não disparam', () => {
    const tg = setup({
      battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest'], []],
      graveyard: [['Aftermath Analyst', 'Sol Ring', 'Mountain', "Night's Whisper"], []],
      library: [['Island', 'Island', 'Island'], []],
    });
    const id = tg.bf(N);
    tg.choose('carta de permanente alvo', ['Aftermath Analyst']).activate(N, 'Delírio').resolve();
    expect(nameOf(tg.g, id)).toBe('Aftermath Analyst');
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'library').length).toBe(3);
  });
  it('sem quatro tipos no cemitério, não ativa', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest'], []], graveyard: [['Aftermath Analyst', 'Sol Ring', 'Mountain'], []] });
    expect(() => tg.activate(N, 'Delírio')).toThrow();
  });
});
