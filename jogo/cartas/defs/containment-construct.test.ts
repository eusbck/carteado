import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Containment Construct', () => {
  it('carta descartada pode ser exilada e jogada neste turno', () => {
    const tg = setup({ battlefield: [['Containment Construct', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Big Score', 'Forest'], []], library: [['Island', 'Island'], []] });
    tg.choose('escarte', ['Forest']).yes('Containment Construct', true);
    tg.cast('Big Score').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Forest']);
    tg.play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
  });
});
