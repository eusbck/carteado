import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Voracious Bibliophile';

describe(N, () => {
  it('mágica com dois alvos: compra duas cartas; sem alvo, não dispara', () => {
    const tg = setup({ battlefield: [[N, ...Array(6).fill('Island'), 'Spellseeker'], ['Elvish Mystic']], hand: [['Step Through', 'Opt'], []], library: [['Ponder', 'Forest', 'Swamp'], []] });
    tg.choose('duas criaturas alvo', ['Spellseeker', 'Elvish Mystic']).cast('Step Through');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Opt', 'Ponder']);
    tg.resolveAll();
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
  it('a mágica de Aura tem um alvo e compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], ['Elvish Mystic']], hand: [['Amphibian Downpour'], []], library: [['Ponder'], []] });
    tg.cast('Amphibian Downpour').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Ponder']);
  });
});
