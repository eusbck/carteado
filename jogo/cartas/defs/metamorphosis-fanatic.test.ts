import { describe, expect, it } from 'vitest';
import { draw, hasKw } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

describe('Metamorphosis Fanatic', () => {
  it('comprada no turno do oponente e conjurada pelo milagre {1}{B}: devolve uma criatura com um marcador de vínculo com a vida', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Swamp', 'Swamp'], []],
      graveyard: [['Wall of Omens'], []],
      library: [['Metamorphosis Fanatic'], ['Forest']],
    });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', true).choose('carta de criatura alvo', ['Wall of Omens']);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolve(); // milagre: vai para a pilha
    tg.resolve(); // a criatura entra
    const fan = tg.bf('Metamorphosis Fanatic');
    expect(hasKw(tg.g, fan, 'lifelink')).toBe(true);
    tg.resolve(); // o gatilho de entrar
    const wall = tg.bf('Wall of Omens');
    expect(tg.state.objects[wall].counters.lifelink).toBe(1);
    expect(hasKw(tg.g, wall, 'lifelink')).toBe(true);
  });
});
