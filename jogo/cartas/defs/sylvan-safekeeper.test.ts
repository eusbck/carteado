import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sylvan Safekeeper';

describe(N, () => {
  it('sacrifique um terreno: a criatura alvo sua ganha manto até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Wall of Omens'], []] });
    tg.choose('Sacrifique', ['Forest']).choose('criatura alvo', ['Wall of Omens']).activate(N).resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'shroud')).toBe(true);
    tg.passTo('cleanup');
    tg.passTo('upkeep');
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'shroud')).toBe(false);
  });
});
