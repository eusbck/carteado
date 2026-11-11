import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

const N = 'Shuttlecraft Galileo';

describe(N, () => {
  it('jogando um terreno, cria um Officer; a estação vira um Officer e põe um marcador', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Plains'], []] });
    tg.play('Plains').resolveAll();
    const oficial = tg.bf('Officer');
    expect(tg.pt(oficial)).toEqual([1, 1]);
    tg.choose('Vire 1', ['Officer']).activate(N, 'Estação').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge).toBe(1);
    expect(chars(tg.g, tg.bf(N)).types).not.toContain('Creature');
  });
  it('com 6+, é criatura 3/3 com voar; ao atacar, dá voar às atacantes escolhidas', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 6 } }, 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.choose('até sete criaturas atacantes', ['Elvish Mystic']);
    tg.attack([[N, 1], ['Elvish Mystic', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'flying')).toBe(true);
  });
});
