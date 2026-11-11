import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Stratagem Emulator';

describe(N, () => {
  it('quando morre, cria fichas Borg iguais à força que tinha', () => {
    const tg = setup({ battlefield: [[N, 'Tempered Steel'], []] });
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    // 2/1 com Tempered Steel = 4/3
    expect(tg.all('Borg')).toHaveLength(4);
  });
});
