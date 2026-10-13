import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Flávio Bolsonaro, Filhote de Cruz Credo';
const C = 'Bolsonaro, o Genocida';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('sem o seu comandante no campo, recebe +2/+2 e tem ameaçar', () => {
    const tg = setup({ battlefield: [[N], []], command: [[{ name: C, commander: true }], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
  });

  it('com o seu comandante no campo, é um 3/3 comum', () => {
    const tg = setup({ battlefield: [[N, { name: C, commander: true }], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(false);
  });

  it('Rachadinha: sacrifica outra criatura e cria um Tesouro, uma vez por turno', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Llanowar Elves'], []], library: [lib, lib] });
    tg.choose('Sacrifique', ['Elvish Mystic']);
    tg.activate(N, 'Rachadinha').resolveAll();
    expect(tg.names(0, 'battlefield')).toContain('Treasure');
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.actionIds().some((a) => a.startsWith('activate:' + tg.bf(N)))).toBe(false);
  });
});
