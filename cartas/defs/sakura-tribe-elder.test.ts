import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sakura-Tribe Elder', () => {
  it('sacrifique (mesmo com enjoo de invocação): terreno básico no campo virado', () => {
    const tg = setup({ battlefield: [[{ name: 'Sakura-Tribe Elder', ready: false }], []], library: [['Wall of Omens', 'Forest'], []] });
    tg.choose('terreno básico', ['Forest']).activate('Sakura-Tribe Elder').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Sakura-Tribe Elder']);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
});
