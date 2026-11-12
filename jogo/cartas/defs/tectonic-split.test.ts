import { describe, expect, it } from 'vitest';
import { hasKw, isLand } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Tectonic Split';

describe(N, () => {
  it('custo adicional: sacrifica metade dos terrenos, arredondado para cima; os terrenos ganham "três manas de uma cor"', () => {
    const lands = ['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Mountain'];
    const tg = setup({ battlefield: [lands, []], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.find(N)).not.toBeNull();
    expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(true);
    // 7 terrenos: 4 sacrificados
    const restantes = tg.state.zones.battlefield.filter((id) => isLand(tg.g, id));
    expect(restantes.length).toBe(3);
    tg.state.objects[restantes[0]].tapped = false;
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === restantes[0]).map((o) => o.alt.join(''))).toContain('RRR');
  });

  it('sem terrenos, o custo é sacrificar zero', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Elvish Mystic', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.find(N)).not.toBeNull();
  });
});
