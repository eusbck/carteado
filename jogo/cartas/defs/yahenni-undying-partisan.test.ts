import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Yahenni, Undying Partisan', () => {
  it('cresce quando criatura de oponente morre; sacrificar outra dá indestrutível', () => {
    const tg = setup({ battlefield: [['Yahenni, Undying Partisan', 'Elvish Mystic'], ['Wall of Omens']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    const y = tg.bf('Yahenni, Undying Partisan');
    expect(tg.pt(y)).toEqual([3, 3]);
    tg.activate('Yahenni, Undying Partisan').resolve();
    expect(hasKw(tg.g, y, 'indestructible')).toBe(true);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
  it('morrendo junto, não é salva pelo marcador', () => {
    const tg = setup({ battlefield: [['Yahenni, Undying Partisan'], ['Wall of Omens']] });
    tg.run(destroy(tg.g, [tg.bf('Yahenni, Undying Partisan'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Yahenni, Undying Partisan']);
  });
});
