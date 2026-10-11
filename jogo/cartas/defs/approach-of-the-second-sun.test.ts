import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/stack.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Approach of the Second Sun';
const planicies = (n: number) => Array(n).fill('Plains');
const ilhas = Array(10).fill('Island');

describe(N, () => {
  it('a primeira vai para a sétima posição do grimório e você ganha 7 de vida', () => {
    const tg = setup({ battlefield: [planicies(7), []], hand: [[N], []], library: [ilhas, ilhas] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(47);
    expect(tg.names(0, 'library')[6]).toBe(N);
    expect(tg.names(0, 'library')).toHaveLength(11);
    expect(tg.state.gameOver).toBeNull();
  });

  it('com menos de seis cartas no grimório, vai para o fundo', () => {
    const tg = setup({ battlefield: [planicies(7), []], hand: [[N], []], library: [['Island', 'Island', 'Island'], ilhas] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Island', 'Island', N]);
  });

  it('conjurando outra da mão depois da primeira, você vence a partida, mesmo que a primeira tenha sido anulada', () => {
    const tg = setup({ battlefield: [planicies(14), []], hand: [[N, N], []], library: [ilhas, ilhas] });
    tg.cast(N);
    tg.run(counter(tg.g, tg.state.zones.stack.at(-1)!));
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.life(0)).toBe(40);
    tg.cast(N).resolveAll();
    expect(tg.state.gameOver?.winners).toEqual([0]);
    expect(tg.state.players[0].won).toBe(true);
  });

  it('a segunda precisa ter sido conjurada da mão', () => {
    const tg = setup({ battlefield: [planicies(14), []], hand: [[N, N], []], library: [ilhas, ilhas] });
    tg.cast(N).resolveAll();
    tg.cast(N);
    // como se tivesse sido conjurada de outra zona
    tg.state.objects[tg.state.zones.stack.at(-1)!].stack!.castFrom = 'graveyard';
    tg.resolveAll();
    expect(tg.state.gameOver).toBeNull();
    expect(tg.life(0)).toBe(54);
  });
});
