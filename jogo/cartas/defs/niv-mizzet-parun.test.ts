import { describe, expect, it } from 'vitest';
import { P, setup } from '../../testes/harness.ts';

const N = 'Niv-Mizzet, Parun';
const alvoBruno = (tg: ReturnType<typeof setup>) => tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('qualquer alvo') ? { kind: 'select', ids: [d.items.find((i) => i.player === 1)!.id] } : null));

describe(N, () => {
  it('comprar duas cartas dispara duas vezes', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Island'], []], hand: [["Tezzeret's Gambit"], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    for (let i = 0; i < 4; i++) alvoBruno(tg);
    tg.cast("Tezzeret's Gambit").resolveAll();
    // uma compra pelo gatilho de conjurar e duas do Gambit: três de dano
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });

  it('a mágica de um oponente faz você comprar, e a compra causa 1 de dano, tudo antes de a mágica resolver', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Opt']], library: [['Plains', 'Swamp'], ['Forest', 'Mountain']] });
    alvoBruno(tg);
    tg.cast('Opt');
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    tg.resolve();
    expect(tg.life(1)).toBe(39);
    expect(tg.find('Opt', 'stack')).not.toBeNull();
  });

  it('não pode ser anulada', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Mountain', 'Mountain', 'Mountain'], ['Island', 'Island']], hand: [[N], ['Counterspell']], library: [['Plains', 'Swamp'], []] });
    tg.cast(N);
    tg.pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell');
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    void P;
  });
});
