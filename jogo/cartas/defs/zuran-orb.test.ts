import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Zuran Orb';

describe(N, () => {
  it('sacrifique um terreno: você ganha 2 de vida', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []] });
    tg.choose('Sacrifique', ['Forest']).activate(N).resolve();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
});
