import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Cloud, Ex-SOLDIER';

describe(C, () => {
  it('ao entrar, anexa um Equipamento seu', () => {
    const tg = setup({ battlefield: [['Mountain', 'Forest', 'Plains', 'Plains', 'Plains', 'Colossus Hammer'], []], hand: [[C], []] });
    tg.choose('Equipamento', ['Colossus Hammer']);
    tg.cast(C).resolveAll();
    expect(tg.state.objects[tg.bf('Colossus Hammer')].attachedTo).toBe(tg.bf(C));
  });
  it('ao atacar: compra por criatura atacante equipada e, com força 7 ou mais, cria dois Treasures', () => {
    const tg = setup({ battlefield: [[{ name: C, ready: true }, { name: 'Colossus Hammer', attachTo: C }, { name: 'Basilisk Collar', attachTo: 'Elvish Mystic' }, { name: 'Elvish Mystic', ready: true }], []], library: [['Opt', 'Opt', 'Opt'], []], step: 'main1' });
    tg.attack([[C, 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(2);
    expect(tg.all('Treasure').length).toBe(2);
  });
});
