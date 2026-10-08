import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Blood Artist', () => {
  it('CR 603.10a: dispara para cada criatura que morre junto com ele', () => {
    const tg = setup({ battlefield: [['Blood Artist', 'Wall of Omens', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [['Winds of Rath'], []] });
    tg.choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Bruno']);
    tg.cast('Winds of Rath').resolve();
    expect(tg.state.zones.stack.length).toBe(3); // Blood Artist, Wall of Omens e Indomitable Ancients
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
  });
  it('o jogador alvo perde 1 e você ganha 1', () => {
    const tg = setup({ battlefield: [['Blood Artist', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('jogador alvo', ['Bruno']).choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.resolve().resolve();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(40 - 2 + 1);
  });
});
