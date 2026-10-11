import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fatespinner';

describe(N, () => {
  it('pulando a etapa de compra, o oponente não compra, mas tem fases principais e combate', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
    tg.choose('Fatespinner', ['Etapa de compra']);
    tg.passTo('main1', 1);
    expect(tg.names(1, 'hand')).toEqual([]);
    tg.passTo('beginCombat', 1).passTo('main2', 1);
    expect(tg.state.turn.mainPhaseCount).toBe(2);
    expect(tg.state.turn.combatCount).toBe(1);
  });

  it('pulando a fase principal, o turno vai da compra direto para o combate e do combate para a etapa final', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.choose('Fatespinner', ['Fase principal']);
    tg.passTo('beginCombat', 1);
    expect(tg.names(1, 'hand')).toHaveLength(1);
    expect(tg.state.turn.mainPhaseCount).toBe(0);
    tg.passTo('end', 1);
    expect(tg.state.turn.mainPhaseCount).toBe(0);
  });

  it('pulando a fase de combate, não há combate', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    tg.choose('Fatespinner', ['Fase de combate']);
    tg.passTo('main2', 1);
    expect(tg.state.turn.combatCount).toBe(0);
    expect(tg.state.turn.mainPhaseCount).toBe(2);
    expect(tg.life(0)).toBe(40);
  });

  it('com dois Fatespinner, o oponente escolhe para cada um e pode repetir a escolha', () => {
    const tg = setup({ battlefield: [[N, N], []] });
    tg.choose('Fatespinner', ['Etapa de compra']).choose('Fatespinner', ['Etapa de compra']);
    tg.passTo('main1', 1);
    expect(tg.state.turn.skip).toEqual(['draw']);
    expect(tg.names(1, 'hand')).toEqual([]);
    // no seu turno você não escolhe nada, e o que foi pulado não passa para o turno seguinte
    tg.passTo('main1', 0);
    expect(tg.state.turn.skip).toBeUndefined();
  });
});
