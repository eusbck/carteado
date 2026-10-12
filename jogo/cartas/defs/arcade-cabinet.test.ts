import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Arcade Cabinet';

describe(N, () => {
  it('um marcador em até quatro criaturas ao entrar; {2}, {T} e uma ficha: dobra cada tipo de marcador da criatura alvo', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Forest'), { name: 'Silver Myr', counters: { '+1/+1': 1, shield: 1 } }, 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('criatura alvo', ['Silver Myr', 'Elvish Mystic']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.choose('Sacrifique', ['Soldier']).choose('criatura alvo', ['Silver Myr']).activate(N).resolveAll();
    expect(tg.find('Soldier')).toBeNull();
    expect(tg.state.objects[tg.bf('Silver Myr')].counters).toMatchObject({ '+1/+1': 4, shield: 2 });
  });
});