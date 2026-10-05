import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf, destroy } from '../../motor/api.ts';

describe('Oft-Nabbed Goat', () => {
  it('só os oponentes do controlador podem ativar; ao morrer com marcadores, o dono compra e os outros perdem vida', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [['Oft-Nabbed Goat', 'Swamp'], ['Swamp', 'Swamp'], []], library: [['Island', 'Island', 'Island'], ['Plains', 'Plains'], []] });
    const goat = tg.bf('Oft-Nabbed Goat');
    tg.activate('Oft-Nabbed Goat').resolve();
    expect(controllerOf(tg.g, goat)).toBe(1);
    expect(tg.names(1, 'hand')).toEqual(['Plains']);
    // agora o controlador é Bruno: ele não pode mais ativar
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes(String(goat)))).toBe(false);
    tg.run(destroy(tg.g, [goat]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
  });
});
