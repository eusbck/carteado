import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const N = 'Haughty Djinn';

describe(N, () => {
  it('a força conta as instantâneas e os feitiços do cemitério, também fora do campo', () => {
    const tg = setup({ battlefield: [[N], []], hand: [[N], []], graveyard: [['Opt', 'Serum Visions', 'Forest', 'Wall of Omens'], ['Opt']] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 4]);
    const naMao = tg.find(N, 'hand', 0)!;
    expect(chars(tg.g, naMao).power).toBe(2);
  });

  it('instantâneas e feitiços custam {1} a menos, só o genérico', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Plains'], []], hand: [['Think Twice', 'Wall of Omens'], []], library: [['Forest'], []] });
    // Think Twice ({1}{U}) sai por {U}: a Plains continua desvirada
    tg.cast('Think Twice').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens', 'Forest']);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    // Wall of Omens ({1}{W}) é criatura: não fica mais barato
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });
});
