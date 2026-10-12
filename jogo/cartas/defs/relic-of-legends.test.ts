import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Relic of Legends';

describe(N, () => {
  it('{T}: uma mana de qualquer cor; virar uma criatura lendária desvirada sua: outra mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N, 'Tokka & Rahzar, Unsupervised', 'Indomitable Ancients'], []] });
    const relic = tg.bf(N);
    // uma opção por cor para cada uma das duas habilidades
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === relic)).toHaveLength(10);
    activateMana(tg, N, 'U');
    expect(tg.state.objects[relic].tapped).toBe(true);
    // a segunda habilidade continua disponível com a relíquia virada
    const resta = manaOptions(tg.g, 0).filter((o) => o.obj === relic);
    expect(resta).toHaveLength(5);
  });
});