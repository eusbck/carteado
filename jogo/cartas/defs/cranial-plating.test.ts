import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cranial Plating';

describe(N, () => {
  it('a equipada recebe +1/+0 por artefato seu, contando a própria Cranial Plating', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Sol Ring', 'Elvish Mystic'], []] });
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']).activate(N, 'Equipar').resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 1]);
  });

  it('{B}{B} anexa em velocidade de instantânea, até no turno de outro jogador', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Swamp', 'Swamp', 'Elvish Mystic'], []] });
    tg.pass();
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']).activate(N, 'Anexe').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Elvish Mystic'));
  });
});