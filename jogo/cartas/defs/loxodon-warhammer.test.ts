import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Loxodon Warhammer';

describe(N, () => {
  it('equipar {3}: a equipada recebe +3/+0, atropelar e vínculo com a vida', () => {
    const tg = setup({ battlefield: [[N, 'Wall of Omens', 'Sol Ring', 'Plains'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate(N, 'Equipar').resolve();
    const w = tg.bf('Wall of Omens');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(w);
    expect(tg.pt(w)).toEqual([3, 4]);
    for (const kw of ['trample', 'lifelink']) expect(hasKw(tg.g, w, kw)).toBe(true);
  });
});
