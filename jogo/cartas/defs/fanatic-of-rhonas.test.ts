import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fanatic of Rhonas';

describe(N, () => {
  it('{T}: {G}; com uma criatura de força 4 ou mais, {T}: {G}{G}{G}{G}', () => {
    const fraco = setup({ battlefield: [[N], []] });
    expect(fraco.pt(fraco.bf(N))).toEqual([1, 4]);
    activateMana(fraco, N, 'G');
    expect(fraco.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
    // Serra Angel tem força 4
    const forte = setup({ battlefield: [[N, 'Serra Angel'], []] });
    const d = forte.pending;
    const acao = d?.kind === 'priority' ? d.actions.find((a) => a.kind === 'mana' && a.obj === forte.bf(N) && a.label.includes('{G}{G}{G}{G}')) : undefined;
    expect(acao).toBeDefined();
    forte.answer({ kind: 'priority', action: acao!.id });
    forte.settle();
    expect(forte.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G', 'G', 'G']);
  });

  it('eternizar: uma ficha cópia, Zombie 4/4 preta sem custo de mana, que mantém as habilidades', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], graveyard: [[N], []] });
    tg.activate(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    const ficha = tg.bf(N);
    const c = chars(tg.g, ficha);
    expect(tg.state.objects[ficha].isToken).toBe(true);
    expect(tg.pt(ficha)).toEqual([4, 4]);
    expect(c.colors).toEqual(['B']);
    expect(c.subtypes.sort()).toEqual(['Druid', 'Snake', 'Zombie']);
    expect(c.manaValue).toBe(0);
    // com força 4, ela mesma liga a habilidade de quatro manas
    expect(c.abilities.length).toBeGreaterThanOrEqual(2);
  });
});