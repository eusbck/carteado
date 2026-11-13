import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'World Shaper';

describe(N, () => {
  it('ao atacar, pode moer três cartas', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Hex', 'Island', 'Plains'], []] });
    tg.yes('World Shaper', true).attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'graveyard')).toEqual(['Forest', 'Hex', 'Island']);
  });
  it('ao morrer, devolve todas as cartas de terreno do seu cemitério para o campo viradas', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []], hand: [['Abrade'], []], graveyard: [['Forest', 'Island', 'Hex'], ['Plains']] });
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']).choose('criatura alvo', [N]).cast('Abrade').resolveAll();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.find('Plains', 'graveyard', 1)).not.toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Abrade', 'Hex', N].sort());
  });
});
