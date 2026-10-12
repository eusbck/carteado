import { describe, expect, it } from 'vitest';
import { createTokens, exile } from '../../motor/actions.ts';
import { fixture as setup, removeCard, runEffect } from '../../testes/artefatos.ts';

const N = 'Psychomancer';

describe(N, () => {
  it('ele ou outro artefato seu que não é ficha indo do campo ao cemitério ou ao exílio: o oponente perde 1 e você ganha 1', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Arcade Cabinet', 'Elvish Mystic'], []] });
    const [eu, ele] = [tg.life(0), tg.life(1)];
    for (let i = 0; i < 4; i++) tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('oponente alvo') ? { kind: 'select', ids: [d.items[0].id] } : null));
    removeCard(tg, tg.bf('Sol Ring'));
    tg.resolveAll();
    runEffect(tg, exile(tg.g, [tg.bf('Arcade Cabinet')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([eu + 2, ele - 2]);
    // criatura que não é artefato e ficha de artefato não contam
    removeCard(tg, tg.bf('Elvish Mystic'));
    const [ficha] = runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    removeCard(tg, ficha);
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([eu + 2, ele - 2]);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([eu + 3, ele - 3]);
  });
});