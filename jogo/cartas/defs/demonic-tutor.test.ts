import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Demonic Tutor', () => {
  it('a carta é escolhida na resolução e vai para a mão sem ser comprada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Demonic Tutor'], []], library: [['Island', 'Sol Ring', 'Plains'], []] });
    tg.choose('procure uma carta', ['Sol Ring']).cast('Demonic Tutor').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Plains']);
    expect(tg.state.turnStats[0].cardsDrawn ?? 0).toBe(0);
  });
});
