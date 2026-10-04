import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wave of Reckoning', () => {
  it('cada criatura causa a si mesma dano igual à sua força', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Sol Ring', 'Sol Ring', 'Killian, Ink Duelist'], ['Indomitable Ancients', 'Wall of Omens', 'Elvish Mystic']], hand: [['Wave of Reckoning'], []] });
    tg.cast('Wave of Reckoning').resolve();
    expect(tg.find('Killian, Ink Duelist')).toBeNull(); // 2/2: 2 de dano; vínculo com a vida faz Ana ganhar 2
    expect(tg.life(0)).toBe(42);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});
