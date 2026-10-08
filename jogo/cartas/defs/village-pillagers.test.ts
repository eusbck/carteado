import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Village Pillagers', () => {
  it('o dano ao entrar vira marcadores -1/-1 e as criaturas que morrem dão Tesouros virados', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain')], ['Elvish Mystic', 'Wall of Omens']], hand: [['Village Pillagers'], []] });
    tg.cast('Village Pillagers').resolve().resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    const t = tg.all('Treasure');
    expect(t.length).toBe(1);
    expect(tg.state.objects[t[0]].tapped).toBe(true);
  });
});
