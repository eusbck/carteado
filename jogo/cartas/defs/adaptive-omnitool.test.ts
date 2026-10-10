import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Adaptive Omnitool";
describe(N, () => {
  it("bônus conta artefatos; ataque revela um artefato e manda o resto ao fundo de modo reproduzível", () => {

    const opts = { battlefield: [[{ name: N, attachTo: 'Elvish Mystic' }, 'Elvish Mystic', 'Sol Ring'], []], library: [['Forest', 'Sol Ring', 'Island', 'Forest', 'Island', 'Forest', 'Mountain'], ['Forest']] };
    const run = () => { const tg = setup(opts); expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]); tg.choose('Adaptive Omnitool:', ['Sol Ring']).attack([['Elvish Mystic', 1]]).passTo('main2'); return tg; };
    const a = run(), b = run(); expect(a.names(0, 'hand')).toEqual(['Sol Ring']); expect(a.names(0, 'library')[0]).toBe('Mountain'); expect(a.names(0, 'library')).toEqual(b.names(0, 'library')); expect(a.state.log.some(l => l.text.includes('revela Sol Ring'))).toBe(true);
  });
});
