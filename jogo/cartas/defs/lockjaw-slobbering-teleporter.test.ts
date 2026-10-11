import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lockjaw, Slobbering Teleporter';
const imbloqueavel = (tg: ReturnType<typeof setup>, id: number) => tg.state.effects.some((e) => e.affected?.includes(id) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:cantBeBlocked'));

describe(N, () => {
  it('vigilância; ganha um marcador e, com isso, ele e até uma outra criatura sua não podem ser bloqueados', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr', 'Island'], []], hand: [['Sol Ring'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    tg.cast('Sol Ring').resolveAll();
    tg.choose('outra criatura alvo', ['Elvish Mystic']);
    tg.passTo('declareAttackers');
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(imbloqueavel(tg, id)).toBe(true);
    expect(imbloqueavel(tg, tg.bf('Elvish Mystic'))).toBe(true);
    expect(imbloqueavel(tg, tg.bf('Silver Myr'))).toBe(false);
  });

  it('sem mágica que não é de criatura no turno, nada acontece', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('declareAttackers');
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    expect(imbloqueavel(tg, tg.bf(N))).toBe(false);
  });
});
