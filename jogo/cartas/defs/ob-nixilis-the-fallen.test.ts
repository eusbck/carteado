import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ob Nixilis, the Fallen';

describe(N, () => {
  it('aceitando, o jogador alvo perde 3 de vida e Ob Nixilis ganha três marcadores +1/+1', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Swamp'], []] });
    tg.choose('jogador alvo', ['Bruno']).yes('Ob Nixilis', true).play('Swamp').resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });
  it('recusando, nada acontece', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Swamp'], []] });
    tg.choose('jogador alvo', ['Bruno']).yes('Ob Nixilis', false).play('Swamp').resolveAll();
    expect(tg.life(1)).toBe(40);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
});
