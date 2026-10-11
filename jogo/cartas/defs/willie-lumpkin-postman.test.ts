import { describe, expect, it } from 'vitest';
import { attackCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Willie Lumpkin, Postman';
const lib = Array(8).fill('Forest');
const podeAtacar = (tg: ReturnType<typeof setup>, atacante: number, alvo: number) => attackCandidates(tg.g, atacante).some((c) => c.targets.some((t) => t.kind === 'player' && t.id === alvo));

describe(N, () => {
  it('não pode ser bloqueado; você compra e, se o oponente comprar, ele não ataca você no próximo turno dele', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Elvish Mystic', 'Indomitable Ancients'], []], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 3]);
    tg.yes('Willie Lumpkin', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([1, 1]);
    tg.passTo('main1', 1);
    expect(podeAtacar(tg, 1, 0)).toBe(false);
    // os outros jogadores continuam podendo ser atacados
    expect(podeAtacar(tg, 1, 2)).toBe(true);
    // acabou no turno seguinte dele
    tg.passTo('main1', 2);
    tg.passTo('main1', 0);
    tg.passTo('main1', 1);
    expect(podeAtacar(tg, 1, 0)).toBe(true);
  });

  it('se o oponente não comprar, pode atacar normalmente', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic']], library: [lib, lib] });
    tg.yes('Willie Lumpkin', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([1, 0]);
    tg.passTo('main1', 1);
    expect(podeAtacar(tg, 1, 0)).toBe(true);
  });
});
