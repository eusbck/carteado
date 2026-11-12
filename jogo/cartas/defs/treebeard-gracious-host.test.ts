import { describe, expect, it } from 'vitest';
import { gainLife, hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Treebeard, Gracious Host';

describe(N, () => {
  it('atropelar e resguardo; ao entrar cria duas Foods; ganhar vida põe essa quantidade de marcadores num Halfling ou Treefolk', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains', 'Plains', 'Samwise Gamgee', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const ent = tg.bf(N);
    expect(hasKw(tg.g, ent, 'trample')).toBe(true);
    expect(hasKw(tg.g, ent, 'ward')).toBe(true);
    expect(tg.all('Food')).toHaveLength(3); // duas do Treebeard e uma do Samwise
    tg.choose('Halfling ou Treefolk', ['Samwise Gamgee']);
    gainLife(tg.g, 0, 3, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.pt(tg.bf('Samwise Gamgee'))).toEqual([5, 5]);
  });
});
