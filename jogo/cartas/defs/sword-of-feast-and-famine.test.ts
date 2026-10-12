import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sword of Feast and Famine';

describe(N, () => {
  it('o jogador descarta e os seus terrenos desviram, mesmo que ele não tenha carta na mão', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', { name: 'Plains', tapped: true }, { name: 'Swamp', tapped: true }], []], hand: [[], ['Island']] });
    attach(tg.g, tg.bf(N), tg.bf('Serra Angel'));
    tg.refresh();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([6, 6]);
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(false);
    const vazio = setup({ battlefield: [[N, 'Serra Angel', { name: 'Plains', tapped: true }], []] });
    attach(vazio.g, vazio.bf(N), vazio.bf('Serra Angel'));
    vazio.refresh();
    vazio.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(vazio.state.objects[vazio.bf('Plains')].tapped).toBe(false);
  });
});