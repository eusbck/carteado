import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Screams from Within', () => {
  it('volta e escolhe outra criatura para encantar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Elvish Mystic', 'Wall of Omens']], hand: [['Screams from Within'], []] });
    tg.choose('criatura', ['Elvish Mystic']);
    tg.cast('Screams from Within').resolve();
    // Elvish Mystic 1/1 com -1/-1 morre; a Aura volta presa à Wall of Omens
    tg.choose('vai encantar', ['Wall of Omens']).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    const s = tg.bf('Screams from Within');
    expect(tg.state.objects[s].attachedTo).toBe(tg.bf('Wall of Omens'));
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
  });
});
