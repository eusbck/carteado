import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Serra Avenger';

describe(N, () => {
  it('nos seus três primeiros turnos não pode ser conjurada; no quarto, pode (contando turnos extras)', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], onStart: (t) => { t.state.players[0].turnsTaken = 3; } });
    tg.refresh();
    expect(tg.canCast(N)).toBe(false);
    // o próximo turno de Ana é o quarto
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.state.players[0].turnsTaken).toBe(4);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
  });
});
