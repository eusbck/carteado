import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Breath Weapon', () => {
  it('causa 2 de dano a cada criatura que não é Dragon, de todos os jogadores', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', 'Goldspan Dragon', 'Elvish Mystic'], ['Indomitable Ancients', 'Rapacious Dragon']],
      hand: [['Breath Weapon'], []],
    });
    tg.cast('Breath Weapon').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Elvish Mystic', 'graveyard', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
    expect(tg.state.objects[tg.bf('Goldspan Dragon')].damage).toBe(0);
    expect(tg.state.objects[tg.bf('Rapacious Dragon')].damage).toBe(0);
  });
});
