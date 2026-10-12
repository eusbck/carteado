import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Voracious Hydra';
const DOBRA = 'Dobre o número de marcadores +1/+1 nesta criatura';
const LUTA = 'Esta criatura luta com a criatura alvo que você não controla';

describe(N, () => {
  it('primeiro modo: entra com X marcadores e dobra', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), ['Silver Myr']], hand: [[N], []] });
    tg.number('X', 3).choose('escolha', [DOBRA]).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 7]);
  });

  it('segundo modo: luta com a criatura alvo que você não controla', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), ['Silver Myr']], hand: [[N], []] });
    tg.number('X', 3).choose('escolha', [LUTA]).choose('criatura alvo que você não controla', ['Silver Myr']).cast(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.objects[tg.bf(N)].damage).toBe(1);
  });
});