import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Harrow';

describe(N, () => {
  it('sacrifica um terreno ao conjurar', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island'], []], hand: [[N], []], library: [['Swamp', 'Mountain'], []] });
    tg.choose('Sacrifique', ['Island']).cast(N);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
  it('os dois terrenos entram desvirados e você ainda pode jogar um terreno', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Island'], []], hand: [[N, 'Plains'], []], library: [['Swamp', 'Mountain', 'Hex'], []] });
    tg.choose('Sacrifique', ['Island']).choose('Harrow', ['Swamp', 'Mountain']).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(false);
    tg.play('Plains');
    expect(tg.find('Plains')).not.toBeNull();
  });
});
