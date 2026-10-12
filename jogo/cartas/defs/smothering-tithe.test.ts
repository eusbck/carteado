import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Smothering Tithe';

describe(N, () => {
  it('cada carta que o oponente compra dá um Treasure, a menos que ele pague {2}', () => {
    const tg = setup({ battlefield: [[N], ['Forest', 'Forest']], library: [Array(3).fill('Island'), Array(4).fill('Island')] });
    tg.yes('Smothering Tithe', true).yes('Smothering Tithe', false);
    runEffect(tg, draw(tg.g, 1, 2));
    tg.resolveAll();
    // pagou o primeiro; sem mana para o segundo
    expect(tg.all('Treasure')).toHaveLength(1);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(1);
  });
});