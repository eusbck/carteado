import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Game Over';

describe(N, () => {
  it('custa {2} a menos se algum jogador tem metade da vida inicial ou menos; destrói todas as criaturas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Silver Myr'], ['Serra Angel']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    tg.state.players[1].life = Math.floor(tg.state.config.startingLife / 2);
    tg.refresh();
    expect(tg.canCast(N)).toBe(true);
    tg.cast(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Serra Angel')).toBeNull();
  });
});