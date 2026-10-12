import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Skithiryx, the Blight Dragon';

describe(N, () => {
  it('voar e infectar; {B}: ímpeto; o dano de combate dá marcadores de veneno', () => {
    const tg = setup({ battlefield: [[N, 'Swamp'], []] });
    for (const kw of ['flying', 'infect']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    tg.activate(N, 'ímpeto').resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
    const vida = tg.life(1);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida);
    expect(tg.state.players[1].counters.poison).toBe(4);
  });

  it('{B}{B} regenera: em vez de ser destruído, fica virado e sem dano', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], []] });
    tg.activate(N, 'Regenere').resolveAll();
    runEffect(tg, destroy(tg.g, [tg.bf(N)]));
    tg.refresh();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});