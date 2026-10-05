import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Carnifex Demon', () => {
  it('entra com dois marcadores -1/-1; põe um em cada outra criatura, inclusive as suas', () => {
    const tg = setup({ battlefield: [Array(7).fill('Swamp').concat(['Wall of Omens']), ['Elvish Mystic']], hand: [['Carnifex Demon'], []] });
    tg.cast('Carnifex Demon').resolve();
    expect(tg.pt(tg.bf('Carnifex Demon'))).toEqual([4, 4]);
    tg.activate('Carnifex Demon').resolve();
    expect(tg.pt(tg.bf('Carnifex Demon'))).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
