import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Professor Hojo';

describe(C, () => {
  it('equipar no seu turno sai {2} mais barato e compra uma carta', () => {
    const tg = setup({ battlefield: [[C, 'Basilisk Collar', 'Elvish Mystic'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).activate('Basilisk Collar', 'Equipar');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf('Elvish Mystic'));
    expect(tg.state.zones.hand[0].length).toBe(1);
  });
});
