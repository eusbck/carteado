import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Resurrection Orb';

describe(N, () => {
  it('a criatura equipada que morre volta ao campo no início da próxima etapa final, mesmo sem o Orb', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []] });
    attach(tg.g, tg.bf(N), tg.bf('Serra Angel'));
    tg.refresh();
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'lifelink')).toBe(true);
    removeCard(tg, tg.bf('Serra Angel'));
    tg.resolveAll();
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    tg.passTo('upkeep', 1);
    expect(tg.find('Serra Angel')).not.toBeNull();
  });
});