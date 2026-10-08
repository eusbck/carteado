import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Infernal Grasp', () => {
  it('destrói a criatura alvo e você perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(38);
  });
  it('CR 702.12b: indestrutível não é destruído, mas você ainda perde 2', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Zetalpa, Primal Dawn']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast('Infernal Grasp').resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.life(0)).toBe(38);
  });
});
