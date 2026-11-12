import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ninja of the Deep Hours';

describe(N, () => {
  it('entra pelo ninjutsu atacando o mesmo jogador e compra ao causar dano', () => {
    const tg = setup({ players: 3, battlefield: [['Mist-Cloaked Herald', 'Island', 'Island'], [], []], hand: [[N], [], []], library: [['Forest', 'Forest'], [], []] });
    tg.attack([['Mist-Cloaked Herald', 2]]).passTo('declareBlockers');
    tg.activate(N, 'Ninjutsu').resolveAll();
    const id = tg.bf(N);
    const atk = tg.state.combat!.attackers.find((a) => a.id === id && !a.removed)!;
    expect(atk.target).toEqual({ kind: 'player', id: 2 });
    expect(tg.find('Mist-Cloaked Herald', 'hand', 0)).not.toBeNull();
    tg.yes('comprar', true);
    tg.passTo('main2', 0);
    expect(tg.life(2)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Mist-Cloaked Herald', 'Forest']);
  });
});
