import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Biting-Palm Ninja';

describe(N, () => {
  it('removendo o marcador de ameaçar, o reflexivo exila a carta escolhida da mão do jogador atingido', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], ['Forest', 'Sol Ring', 'Cancel']], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.cast(N).resolve();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters.menace).toBe(1);
    expect(hasKw(tg.g, id, 'menace')).toBe(true);
    tg.passTo('main1', 1).passTo('main1', 0);
    tg.yes('remover um marcador', true);
    tg.choose('escolha uma carta que não seja terreno', ['Cancel']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'exile')).toEqual(['Cancel']);
    expect(tg.state.objects[tg.bf(N)].counters.menace ?? 0).toBe(0);
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(false);
  });
});
