import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'H.E.R.B.I.E., Lovable Robot';
const vigiar = (tg: ReturnType<typeof setup>, marca: { viu: boolean }) => tg.script.push((d) => {
  if (d.kind !== 'priority' && d.kind !== 'payment' && d.kind !== 'attackers' && /vigi|cemitério|topo/i.test(d.prompt)) marca.viu = true;
  return null;
});

describe(N, () => {
  it('voar; {T}: {C}; {1}, {T}: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    activateMana(tg, 'Island', 'U');
    activateMana(tg, N, 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
    const so = setup({ battlefield: [[N], []] });
    activateMana(so, N, 'C');
    expect(so.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
  });

  it('no início do combate, vigia 1 só se você conjurou uma mágica que não é de criatura neste turno', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    const a = { viu: false };
    vigiar(tg, a);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(a.viu).toBe(true);
    const sem = setup({ battlefield: [[N, 'Island'], []] });
    const b = { viu: false };
    vigiar(sem, b);
    sem.passTo('declareAttackers');
    expect(b.viu).toBe(false);
  });
});
