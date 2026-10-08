import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rampart Architect', () => {
  it('ao entrar e ao atacar, cria um Wall 1/3 com defensor', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Rampart Architect'], []] });
    tg.cast('Rampart Architect').resolve().resolve();
    expect(tg.pt(tg.bf('Wall'))).toEqual([1, 3]);
    const tg2 = setup({ battlefield: [['Rampart Architect'], []] });
    tg2.attack([['Rampart Architect', 1]]).passTo('declareBlockers');
    expect(tg2.all('Wall').length).toBe(1);
  });
  it('criatura sua com defensor morre: pode buscar terreno básico virado', () => {
    const tg = setup({ battlefield: [['Rampart Architect', 'Wall of Omens', 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []], library: [['Forest'], []] });
    tg.yes('terreno básico', true).choose('Procure uma carta', ['Forest']);
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve().resolveAll();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
});
