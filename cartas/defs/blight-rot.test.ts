import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Blight Rot', () => {
  it('quatro marcadores -1/-1 na criatura alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Blight Rot'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Blight Rot').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(4);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-2, 6]);
  });
});
