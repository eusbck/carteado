import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Doomwake Giant', () => {
  it('a própria Doomwake Giant (encantamento criatura) dispara: criaturas dos oponentes -1/-1', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Elvish Mystic'], ['Elvish Mystic', 'Wall of Omens']], hand: [['Doomwake Giant'], []], library: [[], ['Island']] });
    tg.cast('Doomwake Giant').resolve().resolve();
    expect(tg.find('Elvish Mystic', 'battlefield', 1)).toBeNull();
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    tg.passUntil((x) => x.state.turn.active === 1);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('outro encantamento que você controla também dispara', () => {
    const tg = setup({ battlefield: [['Doomwake Giant', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Bastion of Remembrance'], []] });
    tg.cast('Bastion of Remembrance').resolve();
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
  });
});
