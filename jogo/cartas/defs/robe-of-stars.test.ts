import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Robe of Stars';

describe(N, () => {
  it('a criatura sai de fase com a túnica e volta com ela anexada, na próxima etapa de desvirar do controlador', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Silver Myr', { name: N, attachTo: 'Silver Myr' }], []] });
    const myr = tg.bf('Silver Myr');
    expect(tg.pt(myr)).toEqual([1, 4]);
    tg.activate(N, 'Projeção').resolveAll();
    expect(tg.state.objects[myr].phasedOut).toBe(true);
    expect(tg.state.objects[tg.bf(N)].phasedOut).toBe(true);
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep');
    expect(tg.state.objects[myr].phasedOut).toBe(true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    expect(tg.state.objects[myr].phasedOut).toBe(false);
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(myr);
  });

  it('a criatura atacante que sai de fase deixa o combate', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Silver Myr', { name: N, attachTo: 'Silver Myr' }], []], step: 'beginCombat' });
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    tg.activate(N, 'Projeção').resolveAll();
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(40);
  });

  it('em resposta ao equipar, a Projeção Astral tira a túnica de fase e ela não se move', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Silver Myr', 'Llanowar Elves', { name: N, attachTo: 'Silver Myr' }], []] });
    tg.choose('criatura alvo', ['Llanowar Elves']).activate(N, 'Equipar');
    tg.activate(N, 'Projeção').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Silver Myr'));
  });
});
