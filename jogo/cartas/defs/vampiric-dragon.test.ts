import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Vampiric Dragon';

describe(N, () => {
  it('voar; {1}{R}: 1 de dano à criatura alvo; se ela morrer no turno, o dragão ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Mountain')], ['Elvish Mystic', 'Indomitable Ancients', 'Silver Myr']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(N, '{1}{R}').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(id)).toEqual([6, 6]);
    // ferida pelo dragão e morta por outra coisa no mesmo turno: também conta
    tg.script.length = 0;
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, '{1}{R}').resolveAll();
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([7, 7]);
    // criatura que não recebeu dano dele não conta
    tg.run(destroy(tg.g, [tg.bf('Silver Myr')]));
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([7, 7]);
  });
});
