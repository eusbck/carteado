import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Darksteel Plate';

describe(C, () => {
  it('indestrutível, e a criatura equipada também', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', C, 'Elvish Mystic'], []] });
    tg.activate(C, 'Equipar').resolve();
    const elfo = tg.bf('Elvish Mystic');
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
    tg.run(destroy(tg.g, [elfo, tg.bf(C)]));
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find(C)).not.toBeNull();
  });
});
