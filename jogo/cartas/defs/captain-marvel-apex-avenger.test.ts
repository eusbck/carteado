import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Captain Marvel, Apex Avenger';

describe(N, () => {
  it('marcadores que você põe em outra criatura que não é Kree podem ser repetidos em Captain Marvel', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Captain Mar-Vell, Space-Born'], []] });
    for (const kw of ['flying', 'double strike', 'indestructible']) expect(hasKw(tg.g, tg.bf(N), kw)).toBe(true);
    tg.yes('Captain Marvel', true);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Silver Myr') }, '+1/+1', 2, 0);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    // Mar-Vell é Kree: não dispara
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Captain Mar-Vell, Space-Born') }, '+1/+1', 1, 0);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });
});