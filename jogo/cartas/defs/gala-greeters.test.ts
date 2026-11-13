import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/actions.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

describe('Gala Greeters', () => {
  it('cada disparo no turno escolhe um modo diferente; no quarto, nada acontece', () => {
    const tg = setup({ battlefield: [['Gala Greeters'], []] });
    tg.choose('Gala Greeters', ['Coloque um marcador +1/+1 nesta criatura'])
      .choose('Gala Greeters', ['Crie uma ficha de Treasure virada'])
      .choose('Gala Greeters', ['Você ganha 2 pontos de vida']);
    for (let i = 0; i < 4; i++) {
      runEffect(tg, createTokens(tg.g, 0, 'Elf Warrior', 1));
      tg.resolveAll();
    }
    expect(tg.state.objects[tg.bf('Gala Greeters')].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Treasure')].tapped).toBe(true);
    expect(tg.life(0)).toBe(42);
    expect(tg.all('Treasure').length).toBe(1);
  });
});
