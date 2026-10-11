import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Mirari's Wake";

describe(N, () => {
  it('as criaturas que você controla recebem +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Silver Myr']] });
    expect(tg.pt(tg.bf('Silver Myr', 0))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Silver Myr', 1))).toEqual([1, 1]);
  });

  it('virando um terreno para mana, você adiciona mais uma mana do tipo que ele produziu', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Sol Ring'], []] });
    activateMana(tg, 'Forest', 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G']);
    // artefato não é terreno: sem mana a mais
    activateMana(tg, 'Sol Ring', 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G', 'C', 'C']);
  });
});