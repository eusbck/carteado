import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kitt Kanto, Mayhem Diva';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('ao entrar, cria um Citizen 1/1 verde e branco', () => {
    const tg = setup({ battlefield: [[], []], library: [lib, lib] });
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Citizen'))).toEqual([1, 1]);
  });

  it('no combate do oponente, virando duas criaturas suas, a criatura alvo dele recebe +2/+2, atropelar e é goadada', () => {
    const tg = setup({ active: 1, players: 3, battlefield: [[N, 'Elvish Mystic'], ['Silver Myr'], []], library: [lib, lib, lib] });
    const myr = tg.bf('Silver Myr');
    tg.choose('Kitt Kanto', [N, 'Elvish Mystic']).choose('criatura alvo', ['Silver Myr']);
    tg.passTo('declareAttackers', 1);
    expect(tg.state.objects[tg.bf(N)].tapped && tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.pt(myr)).toEqual([3, 3]);
    expect(hasKw(tg.g, myr, 'trample')).toBe(true);
    expect(tg.state.objects[myr].goadedBy.map((x) => x.player)).toEqual([0]);
  });

  it('é opcional: sem virar, nada acontece', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Elvish Mystic'], ['Silver Myr']], library: [lib, lib] });
    tg.choose('Kitt Kanto', []);
    tg.passTo('declareAttackers', 1);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
  });
});
