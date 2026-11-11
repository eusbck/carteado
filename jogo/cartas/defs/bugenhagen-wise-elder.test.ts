import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Bugenhagen, Wise Elder';

describe(C, () => {
  it('na manutenção, com criatura de força 7 ou mais, compra uma carta', () => {
    const tg = setup({ battlefield: [[C, { name: 'Colossus Hammer', attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []], library: [['Opt', 'Opt', 'Opt'], ['Opt', 'Opt']], active: 1, step: 'main2' });
    tg.passTo('draw', 0);
    expect(tg.state.zones.hand[0].length).toBe(2);
  });
  it('ruling 1: sem criatura de força 7 ou mais, não dispara', () => {
    const tg = setup({ battlefield: [[C, 'Elvish Mystic'], []], library: [['Opt', 'Opt', 'Opt'], ['Opt', 'Opt']], active: 1, step: 'main2' });
    tg.passTo('draw', 0);
    expect(tg.state.zones.hand[0].length).toBe(1);
  });
});
