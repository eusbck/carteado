import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bastion Protector';

describe(N, () => {
  it('as criaturas comandantes que você controla recebem +2/+2 e têm indestrutível, sejam de quem forem', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }, 'Elvish Mystic'], [{ name: 'Serra Angel', commander: true }]] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'indestructible')).toBe(true);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([4, 4]);
    // o comandante de outro jogador sob o seu controle também conta
    tg.state.objects[tg.bf('Serra Angel')].controller = 0;
    tg.refresh();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([6, 6]);
  });
});