import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Echo of Eons';
const ilhas = (n: number) => Array.from({ length: n }, () => 'Island');

describe(N, () => {
  it('cada jogador embaralha mão e cemitério no grimório e compra sete; a própria Echo vai para o cemitério', () => {
    const tg = setup({
      battlefield: [ilhas(6), []],
      hand: [[N, 'Sol Ring'], ['Wall of Omens', 'Forest']],
      graveyard: [['Plains'], ['Swamp', 'Mountain']],
      library: [ilhas(5), ilhas(5)],
    });
    tg.cast(N).resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(7);
    expect(tg.state.zones.hand[1].length).toBe(7);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.state.zones.library[0].length).toBe(0);
    expect(tg.state.zones.library[1].length).toBe(2);
  });
  it('com retrospectiva, é conjurada do cemitério por {2}{U} e exilada depois', () => {
    const tg = setup({ battlefield: [ilhas(3), []], graveyard: [[N], []], library: [ilhas(8), ilhas(8)] });
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(7);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });
});
