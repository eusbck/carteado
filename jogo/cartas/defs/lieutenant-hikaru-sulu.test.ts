import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { canBlock } from '../../motor/combat.ts';

const N = 'Lieutenant Hikaru Sulu';

describe(N, () => {
  it('ao atacar (fica virado), explora: terreno do topo vai para a mão', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Island'], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
  it('explorando uma carta que não é terreno, recebe um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Island'], []] });
    tg.yes('Explorar', false);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(tg.names(0, 'library')[0]).toBe('Sol Ring');
  });
  it('{2}{U}: a criatura alvo não pode ser bloqueada neste turno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Elvish Mystic'], ['Wall of Omens']] });
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(N, '{2}{U}').resolve();
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'))).toBe(false);
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf(N))).toBe(true);
  });
});
