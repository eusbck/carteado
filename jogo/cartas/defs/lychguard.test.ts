import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lychguard';

describe(N, () => {
  it('{3}{B}, sacrifique: devolve à mão todas as cartas de criatura lendária do seu cemitério', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Swamp')], []], graveyard: [['Szarekh, the Silent King', 'Silver Myr', 'Patriot, Shield Wielder'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Patriot, Shield Wielder', 'Szarekh, the Silent King']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Silver Myr']);
  });
});