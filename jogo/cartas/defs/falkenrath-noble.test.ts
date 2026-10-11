import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Falkenrath Noble';

describe(N, () => {
  it('quando qualquer criatura morre, o jogador alvo perde 1 de vida e você ganha 1', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('jogador alvo', ['Bruno']);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
  });

  it('morrendo junto com outra criatura, dispara para cada uma', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    // dois gatilhos, um alvo para cada
    tg.choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Bruno']);
    tg.run(destroy(tg.g, [tg.bf(N), tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([42, 38]);
  });
});
