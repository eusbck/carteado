import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Grafted Exoskeleton';

describe(N, () => {
  it('+2/+2 e infectar; equipando outra criatura, a anterior é sacrificada', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Wall of Omens', 'Serra Angel'], []] });
    attach(tg.g, tg.bf(N), tg.bf('Wall of Omens'));
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'infect')).toBe(true);
    tg.choose('criatura alvo que você controla', ['Serra Angel']).activate(N, 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Serra Angel'));
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});