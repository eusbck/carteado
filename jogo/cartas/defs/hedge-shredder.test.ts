import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hedge Shredder';

describe(N, () => {
  it('ao atacar, mói duas; as cartas de terreno moídas vão para o campo viradas', () => {
    const tg = setup({ battlefield: [[N, 'Gigantosaurus'], []], library: [['Forest', 'Hex', 'Island'], []] });
    tg.choose('Tripular:', ['Gigantosaurus']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.yes('Hedge Shredder', true).attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
  it('terreno descartado (não vem do grimório) fica no cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []], hand: [['Faithless Looting', 'Forest'], []], library: [['Hex', 'Hex'], []] });
    tg.choose('Descarte', ['Forest', 'Hex']).cast('Faithless Looting').resolveAll();
    expect(tg.find('Forest', 'graveyard')).not.toBeNull();
  });
  it('com uma carta só no grimório, não pergunta e não mói', () => {
    const tg = setup({ battlefield: [[N, 'Gigantosaurus'], []], library: [['Forest'], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('moer duas')) perguntou = true; return null; });
    tg.choose('Tripular:', ['Gigantosaurus']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.names(0, 'library')).toEqual(['Forest']);
  });
});
