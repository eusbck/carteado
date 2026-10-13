import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Imbrochável';
const C = 'Bolsonaro, o Genocida';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('desvira a criatura, que ganha indestrutível e atropelar até o fim do turno', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', { name: 'Elvish Mystic', tapped: true }], []], hand: [[N], []], library: [lib, lib] });
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']).cast(N).resolveAll();
    const e = tg.bf('Elvish Mystic');
    expect(tg.state.objects[e].tapped).toBe(false);
    expect(hasKw(tg.g, e, 'trample')).toBe(true);
    tg.run(destroy(tg.g, [e]));
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.pt(e)).toEqual([1, 1]);
  });

  it('no seu comandante, também dá +3/+3', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', { name: C, commander: true }], []], hand: [[N], []], library: [lib, lib] });
    tg.choose('criatura alvo que você controla', [C]).cast(N).resolveAll();
    expect(tg.pt(tg.bf(C))).toEqual([7, 7]);
  });
});
