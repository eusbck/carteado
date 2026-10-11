import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Midnight Angel Armor';

describe(N, () => {
  it('entrando, cria um Soldier e se anexa a ele: 4/4 com voar e vigilância', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const s = tg.bf('Soldier');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(s);
    expect(tg.pt(s)).toEqual([4, 4]);
    expect(hasKw(tg.g, s, 'flying')).toBe(true);
    expect(hasKw(tg.g, s, 'vigilance')).toBe(true);
  });
});