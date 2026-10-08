import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Culling Ritual', () => {
  it('pode misturar {B} e {G}', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Forest', 'Swamp', 'Forest', 'Elvish Mystic'], ['Arcane Signet', 'Wall of Omens', 'Zetalpa, Primal Dawn', 'Island']],
      hand: [['Culling Ritual'], []],
    });
    tg.number('quantas', 1).cast('Culling Ritual').resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Arcane Signet')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find('Island')).not.toBeNull();
    expect(tg.state.players[0].manaPool.map((m) => m.type).sort()).toEqual(['B', 'G', 'G']);
  });
});
