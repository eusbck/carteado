import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Villainous Hideout';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('a mana colorida só paga mágica de Villain: The Frightful Four sim, Preordain não', () => {
    // {3}{B} com três Islands e o Hideout: só fecha com a mana preta do Hideout
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['The Frightful Four'], []], library: [lib, lib] });
    expect(tg.canCast('The Frightful Four')).toBe(true);
    tg.cast('The Frightful Four').resolveAll();
    expect(tg.find('The Frightful Four')).not.toBeNull();
    // Hex ({4}{B}{B}) não é Villain: com quatro Islands, uma Swamp e o Hideout falta o segundo preto
    const outro = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Island', 'Swamp'], ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients', 'Elvish Mystic', 'Silver Myr', 'Indomitable Ancients']], hand: [['Hex'], []], library: [lib, lib] });
    expect(outro.canCast('Hex')).toBe(false);
  });

  it('{3}, {T}: o Villain alvo que você controla trama', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'The Frightful Four'], []], hand: [['Hex'], []], library: [lib, lib] });
    tg.choose('Villain alvo', ['The Frightful Four']).choose('Descarte', ['Hex']);
    tg.activate(N, '{3}, {T}').resolveAll();
    expect(tg.state.objects[tg.bf('The Frightful Four')].counters['+1/+1']).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
