import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Delney, Streetwise Lookout';

describe(N, () => {
  it('as suas criaturas de força 2 ou menos não podem ser bloqueadas por criaturas de força 3 ou mais', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']] });
    const [minhaZ] = tg.all('Zetalpa, Primal Dawn').filter((id) => tg.state.objects[id].controller === 0);
    const [delaZ] = tg.all('Zetalpa, Primal Dawn').filter((id) => tg.state.objects[id].controller === 1);
    expect(canBlock(tg.g, delaZ, tg.bf('Elvish Mystic'))).toBe(false);
    expect(canBlock(tg.g, tg.bf('Indomitable Ancients'), tg.bf('Elvish Mystic'))).toBe(true);
    // a de força 4 continua bloqueável
    expect(canBlock(tg.g, delaZ, minhaZ)).toBe(true);
  });

  it('o gatilho de uma criatura sua com força 2 ou menos dispara uma vez a mais', () => {
    // Marionette Apprentice (1/2): outra criatura sua morre, cada oponente perde 1 — duas vezes
    const tg = setup({ battlefield: [[N, 'Marionette Apprentice', 'Elvish Mystic', 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
