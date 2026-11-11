// lote3-c: encerrar a fase de combate (CR 724.2), usado por Merciful Mandate.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { endTheCombatPhase } from '../motor/api.ts';

describe('Encerrar a fase de combate (CR 724.2)', () => {
  it('CR 724.2g: fora de uma fase de combate, nada acontece', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []] });
    expect(tg.run(endTheCombatPhase(tg.g))).toBe(false);
    expect(tg.state.turn.step).toBe('main1');
  });
  it('CR 724.2b-e: exila a pilha, tira todos do combate, pula o resto da fase e não dá o dano de combate', () => {
    const tg = setup({ battlefield: [['Elder Gargaroth', 'Forest'], ['Plains', 'Plains']], hand: [['Growth Spiral'], []] });
    tg.attack([['Elder Gargaroth', 1]]).passTo('declareBlockers');
    expect(tg.state.combat).not.toBeNull();
    expect(tg.run(endTheCombatPhase(tg.g))).toBe(true);
    expect(tg.state.combat).toBeNull();
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(40);
    expect(tg.state.turn.step).toBe('main2');
  });
});
