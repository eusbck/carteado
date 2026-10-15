import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Diabolic Vision', () => {
  it('das cinco do topo, uma vai para a mão e as outras voltam ao topo na ordem escolhida', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [['Diabolic Vision'], []], library: [['Forest', 'Swamp', 'Plains', 'Mountain', 'Island', 'Wall of Omens'], []] });
    tg.choose('vai para a sua mão', ['Plains']).choose('Diabolic Vision: ponha as cartas', ['Island', 'Mountain', 'Forest', 'Swamp']);
    tg.cast('Diabolic Vision').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'library')).toEqual(['Island', 'Mountain', 'Forest', 'Swamp', 'Wall of Omens']);
  });
});
