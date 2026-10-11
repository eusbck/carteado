import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Marisi, Breaker of the Coil';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('com dano de combate de uma criatura sua, goada cada criatura que o jogador controla', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Elvish Mystic'], ['Silver Myr', 'Indomitable Ancients'], ['Silver Myr']], library: [lib, lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 4]);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    for (const id of [tg.bf('Silver Myr', 1), tg.bf('Indomitable Ancients')]) expect(tg.state.objects[id].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Silver Myr', 2)].goadedBy).toEqual([]);
  });

  it('os oponentes não podem conjurar mágicas durante o combate, mas podem ativar habilidades', () => {
    // Whitemane Lion tem lampejo; Temur Sabertooth tem uma habilidade ativada
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Plains', 'Plains', 'Forest', 'Forest', 'Temur Sabertooth']], hand: [[], ['Whitemane Lion']], library: [lib, lib] });
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Whitemane Lion')).toBe(true);
    tg.pass();
    tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers', 0);
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.state.turn.step).toBe('declareAttackers');
    expect(tg.canCast('Whitemane Lion')).toBe(false);
    // a habilidade ativada continua disponível
    tg.choose('Temur Sabertooth', ['Nenhuma']);
    expect(() => tg.activate('Temur Sabertooth', '{1}{G}')).not.toThrow();
  });
});
