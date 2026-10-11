import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Loran of the Third Path';
const lib = Array(8).fill('Plains');

describe(N, () => {
  it('vigilância; ao entrar, destrói até um artefato ou encantamento alvo', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring', 'Silver Myr']], library: [lib, lib] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([2, 1]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
  });

  it('{T}: você e o oponente alvo compram uma carta cada', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    tg.choose('oponente alvo', ['Bruno']);
    tg.activate(N, '{T}: Você e o oponente').resolveAll();
    expect([tg.names(0, 'hand').length, tg.names(1, 'hand').length]).toEqual([1, 1]);
  });
});
