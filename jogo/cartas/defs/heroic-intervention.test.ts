import { describe, expect, it } from 'vitest';
import { destroy, isLegalTarget, t } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Heroic Intervention';

describe(N, () => {
  it('as suas permanentes ganham resistência a magia e indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Elvish Mystic', 'Sol Ring'], ['Wall of Omens']], hand: [[N], ['Lightning Bolt']] });
    tg.cast(N).resolve();
    const elfo = tg.bf('Elvish Mystic');
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'hexproof')).toBe(true);
    expect(isLegalTarget(tg.g, t.any(), { kind: 'obj', id: elfo }, 1, tg.find('Lightning Bolt', 'hand', 1)!)).toBe(false);
    runEffect(tg, destroy(tg.g, [elfo, tg.bf('Sol Ring'), tg.bf('Wall of Omens')]));
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    // no turno seguinte o efeito acabou
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'indestructible')).toBe(false);
  });

  it('CR 611.2c: as permanentes que você passa a controlar depois da resolução não ganham nada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    const elfo = enterCard(tg, 'Elvish Mystic', 0)!;
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(false);
    expect(hasKw(tg.g, elfo, 'hexproof')).toBe(false);
  });
});
