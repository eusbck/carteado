import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Locutus of Borg';

describe(N, () => {
  it('tem vínculo com a vida; a criatura artefato que causa dano de combate a um jogador cria uma ficha Borg', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], []] });
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    tg.attack([[N, 1], [tg.bf('Borg'), 1]]).passTo('main2');
    // Locutus (2/4 com vínculo) e a ficha causam dano: duas fichas novas
    expect(tg.all('Borg')).toHaveLength(3);
    expect(tg.life(0)).toBeGreaterThan(40);
  });
});
