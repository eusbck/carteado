import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Carnivorous Cultivator // Enroot';

describe(N, () => {
  it('entra preparada; Enroot, conjurada do exílio, põe um terreno do grimório no cemitério', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Island', 'Mountain'], []] });
    tg.cast('Carnivorous Cultivator').resolve();
    expect(tg.state.objects[tg.bf('Carnivorous Cultivator')].prepared).toBe(true);
    tg.choose('Procure uma carta de terreno', ['Mountain']).cast('Enroot', 'prepared').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Mountain']);
  });
  it('dano de combate a um jogador: devolve um terreno do cemitério à mão', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Swamp'], []] });
    tg.attack([['Carnivorous Cultivator', 1]]).passTo('main2', 0);
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
});
