import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Heroic Intervention';

describe(C, () => {
  it('suas permanentes ganham resistência a magia e indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[C], []] });
    tg.cast(C).resolve();
    const elfo = tg.bf('Elvish Mystic');
    expect(hasKw(tg.g, elfo, 'hexproof')).toBe(true);
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
    tg.run(destroy(tg.g, [elfo]));
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(false);
  });
  it('ruling 3: permanentes que você passa a controlar depois não ganham nada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[C], []] });
    tg.cast(C).resolve();
    const elfo = enterCard(tg, 'Elvish Mystic', 0)!;
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(false);
  });
});
