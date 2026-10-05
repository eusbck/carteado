import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dawnhand Dissident', () => {
  it('exila do cemitério; paga o custo de mana normal e remove três marcadores para conjurar', () => {
    const tg = setup({
      battlefield: [[{ name: 'Dawnhand Dissident', ready: true }, { name: 'Glissa Sunslayer', counters: { '+1/+1': 5 } }, 'Forest'], []], graveyard: [['Elvish Mystic'], []],
    });
    tg.choose('marcador', ['Glissa Sunslayer']).choose('carta alvo num cemitério', ['Elvish Mystic']);
    tg.activate('Dawnhand Dissident', 'Exile').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']);
    // Glissa: 5 +1/+1 e 2 -1/-1 viram 3 +1/+1 (ações de estado)
    for (let i = 0; i < 3; i++) tg.choose('Remova um marcador', ['Glissa Sunslayer: marcador +1/+1']);
    tg.cast('Elvish Mystic', '*').resolve();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Glissa Sunslayer')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
