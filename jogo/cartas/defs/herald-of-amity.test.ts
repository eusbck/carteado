import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Herald of Amity', () => {
  it('conjura a Aura durante a resolução, mesmo fora do tempo de feitiço; o resto vai para o fundo', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], []], hand: [['Herald of Amity'], []],
      library: [['Island', 'Ethereal Armor', 'Swamp', 'Forest', 'Mountain', 'Plains', 'Island', 'Swamp', 'Abrade'], []],
    });
    tg.choose('escolha uma Aura', ['Ethereal Armor']).yes('Conjurar Ethereal Armor').choose('criatura', ['Wall of Omens']);
    tg.cast('Herald of Amity').resolve().resolve();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.state.objects[tg.bf('Ethereal Armor')].attachedTo).toBe(tg.bf('Wall of Omens'));
    expect(tg.names(0, 'library')[0]).toBe('Abrade');
    expect(tg.names(0, 'library').length).toBe(8);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
  it('X conta as Auras na resolução', () => {
    const tg = setup({ battlefield: [[{ name: 'Herald of Amity', ready: true }, 'Wall of Omens', { name: 'Ethereal Armor', attachTo: 'Wall of Omens' }, { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], []], library: [['Island'], ['Island']] });
    tg.attack([['Herald of Amity', 1]]).passTo('declareAttackers').resolve();
    expect(tg.pt(tg.bf('Herald of Amity'))).toEqual([4, 4]);
  });
});
