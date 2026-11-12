import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Shared Roots';

describe(N, () => {
  it('põe um terreno básico do grimório no campo virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Strip Mine', 'Swamp'], []] });
    tg.choose('Shared Roots', ['Swamp']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });
});
