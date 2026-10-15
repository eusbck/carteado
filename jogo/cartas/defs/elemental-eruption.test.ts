import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const N = 'Elemental Eruption';
const terrenos = ['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Island', 'Island'];

describe(N, () => {
  it('conta as mágicas de todos os jogadores, inclusive as anuladas', () => {
    const tg = setup({ battlefield: [terrenos, ['Island', 'Island', 'Island']], hand: [['Opt', 'Opt', N], ['Opt', 'Counterspell']], library: [Array(5).fill('Plains'), Array(5).fill('Plains')] });
    tg.cast('Opt').resolveAll();
    tg.cast('Opt');
    tg.pass();
    // Bruno anula a segunda Opt e conjura a dele: quatro mágicas antes da Eruption
    tg.choose('mágica alvo', ['Opt']).cast('Counterspell').resolveAll();
    tg.pass();
    tg.cast('Opt').resolveAll();
    tg.cast(N);
    tg.resolve();
    // a tempestade criou quatro cópias
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(4);
    tg.resolveAll();
    const dragoes = tg.all('Dragon Elemental');
    expect(dragoes).toHaveLength(5);
    expect(tg.pt(dragoes[0])).toEqual([4, 4]);
    expect(hasKw(tg.g, dragoes[0], 'flying')).toBe(true);
    expect(hasKw(tg.g, dragoes[0], 'prowess')).toBe(true);
  });

  it('as cópias da tempestade não são conjuradas e não contam para outra tempestade', () => {
    const tg = setup({ battlefield: [[...terrenos, ...terrenos], []], hand: [['Opt', N, N], []], library: [Array(5).fill('Plains'), []] });
    tg.cast('Opt').resolveAll();
    tg.cast(N).resolveAll();
    expect(tg.all('Dragon Elemental')).toHaveLength(2);
    // a segunda Eruption vê só a Opt e a primeira Eruption (as cópias não contam)
    tg.cast(N).resolveAll();
    expect(tg.all('Dragon Elemental')).toHaveLength(5);
    expect(tg.state.turnStats[0].spellsCast).toBe(3);
  });

  it('a ficha tem bravura: ganha +1/+1 quando você conjura uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Island'], []], hand: [[N, 'Opt'], []], library: [Array(5).fill('Plains'), []] });
    tg.cast(N).resolveAll();
    const d = tg.bf('Dragon Elemental');
    tg.cast('Opt').resolveAll();
    expect(tg.pt(d)).toEqual([5, 5]);
  });
});
