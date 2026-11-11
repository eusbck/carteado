import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Exploration';

describe(N, () => {
  it('você pode jogar dois terrenos no seu turno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest', 'Forest', 'Forest'], []] });
    tg.play('Forest').play('Forest');
    expect(() => tg.play('Forest')).toThrow();
  });
  it('com duas Exploration, você joga três terrenos no turno', () => {
    const tg = setup({ battlefield: [[N, N], []], hand: [['Forest', 'Forest', 'Forest', 'Forest'], []] });
    tg.play('Forest').play('Forest').play('Forest');
    expect(() => tg.play('Forest')).toThrow();
  });
});
