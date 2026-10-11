import { describe, expect, it } from 'vitest';
import { controllerOf, isRingBearer } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'In the Darkness Bind Them';
const lib = Array(12).fill('Island');

describe(N, () => {
  it('I: cria um Wraith 3/3 com ameaçar e o Anel tenta você, podendo escolher o próprio Wraith', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Swamp', 'Swamp', 'Mountain'], []], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    const ficha = tg.bf('Wraith');
    expect(tg.pt(ficha)).toEqual([3, 3]);
    expect(hasKw(tg.g, ficha, 'menace')).toBe(true);
    expect(isRingBearer(tg.g, ficha)).toBe(true);
  });

  it('IV: sem alvos, o Anel tenta você mesmo assim; com alvos, rouba uma criatura de cada oponente até o fim do turno', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Elvish Mystic'], ['Indomitable Ancients']], library: [lib, lib] });
    tg.state.objects[tg.bf(N)].counters.lore = 3;
    const anciao = tg.bf('Indomitable Ancients');
    tg.choose('para cada oponente', [anciao]);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(controllerOf(tg.g, anciao)).toBe(0);
    expect(hasKw(tg.g, anciao, 'haste')).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, anciao)).toBe(1);

    const sem = setup({ active: 1, battlefield: [[N, 'Elvish Mystic'], ['Indomitable Ancients']], library: [lib, lib] });
    sem.state.objects[sem.bf(N)].counters.lore = 3;
    sem.choose('para cada oponente', []);
    sem.passTo('main1', 0);
    sem.resolveAll();
    expect(controllerOf(sem.g, sem.bf('Indomitable Ancients'))).toBe(1);
    expect(isRingBearer(sem.g, sem.bf('Elvish Mystic'))).toBe(true);
  });
});
