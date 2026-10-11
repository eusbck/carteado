import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Genesis Ultimatum';
const terrenos = ['Forest', 'Forest', 'Island', 'Island', 'Island', 'Mountain', 'Mountain'];
const topo = ['Indomitable Ancients', 'Preordain', 'Sol Ring', 'Plains', 'Elvish Mystic', 'Silver Myr'];

describe(N, () => {
  it('põe no campo as permanentes escolhidas, o resto vai para a mão e a mágica é exilada', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [topo, []] });
    tg.choose('Genesis Ultimatum', ['Indomitable Ancients', 'Sol Ring', 'Plains']).cast(N).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => !terrenos.includes(n)).sort()).toEqual(['Indomitable Ancients', 'Plains', 'Sol Ring']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Elvish Mystic', 'Preordain']);
    expect(tg.names(0, 'library')).toEqual(['Silver Myr']);
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });

  it('pode não escolher nenhuma permanente', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [topo, []] });
    tg.choose('Genesis Ultimatum', []).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(5);
    expect(tg.names(0, 'battlefield')).toHaveLength(terrenos.length);
  });
});
