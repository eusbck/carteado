import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Splinter, the Mentor';

describe(N, () => {
  it('ameaçar; cria uma ficha Mutagen quando ele ou outra criatura sua que não é ficha sai do campo', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Elvish Mystic']] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    removeCard(tg, tg.bf('Elvish Mystic'));
    tg.resolveAll();
    expect(tg.all('Mutagen')).toHaveLength(0);
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    expect(tg.all('Mutagen')).toHaveLength(1);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.all('Mutagen')).toHaveLength(2);
  });
});