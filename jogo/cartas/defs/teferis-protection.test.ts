import { describe, expect, it } from 'vitest';
import { dealDamage, gainLife, loseLife } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Teferi's Protection";

describe(N, () => {
  it('até o seu próximo turno a sua vida não muda e você tem proteção contra tudo; as suas permanentes saem de fase e a carta é exilada', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Serra Angel'], ['Indomitable Ancients']], hand: [[N], []] });
    const vida = tg.life(0);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.state.objects[tg.find('Serra Angel')!].phasedOut).toBe(true);
    expect(tg.state.objects[tg.find('Plains')!].phasedOut).toBe(true);
    loseLife(tg.g, 0, 5, null);
    gainLife(tg.g, 0, 5, null);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(vida);
    // no turno do oponente continua valendo; no seu próximo turno, acaba e tudo volta de fase
    tg.passTo('main1', 1);
    loseLife(tg.g, 0, 2, null);
    expect(tg.life(0)).toBe(vida);
    tg.passTo('main1', 0);
    expect(tg.state.objects[tg.find('Serra Angel')!].phasedOut).toBe(false);
    loseLife(tg.g, 0, 2, null);
    expect(tg.life(0)).toBe(vida - 2);
  });
});