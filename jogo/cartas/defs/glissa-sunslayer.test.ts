import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Glissa Sunslayer', () => {
  it('remove marcadores de tipos diferentes', () => {
    const tg = setup({ battlefield: [['Glissa Sunslayer'], [{ name: 'Wall of Omens', counters: { '+1/+1': 3, oil: 2 } }]], library: [['Island'], ['Island']] });
    tg.choose('escolha 1 modo', ['Remova até três marcadores do permanente alvo']).choose('de onde remover', ['Wall of Omens']);
    tg.choose('até três marcadores', ['+1/+1#0', 'oil#0', 'oil#1']);
    tg.attack([['Glissa Sunslayer', 1]]).passTo('combatDamage').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters).toEqual({ '+1/+1': 2 });
  });
  it('compra e perde 1 de vida', () => {
    const tg = setup({ battlefield: [['Glissa Sunslayer'], []], library: [['Island'], ['Island']] });
    tg.choose('escolha 1 modo', ['Você compra uma carta e perde 1 de vida']);
    tg.attack([['Glissa Sunslayer', 1]]).passTo('combatDamage').resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
