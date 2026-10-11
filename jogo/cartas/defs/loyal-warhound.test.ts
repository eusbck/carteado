import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Loyal Warhound';

describe(N, () => {
  it('vigilância; se um oponente tem mais terrenos, busca uma Plains básica e a põe no campo virada', () => {
    const tg = setup({ battlefield: [['Forest'], ['Forest', 'Forest']], library: [['Forest', 'Plains', 'Forest'], []] });
    tg.choose('Loyal Warhound', ['Plains']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 1]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    const planicie = tg.bf('Plains');
    expect(tg.state.objects[planicie].tapped).toBe(true);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });

  it('com o mesmo número de terrenos, não dispara', () => {
    const tg = setup({ battlefield: [['Forest'], ['Forest']], library: [['Plains'], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Plains')).toBeNull();
  });
});
