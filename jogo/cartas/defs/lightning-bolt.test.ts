import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const B = 'Lightning Bolt';

describe(B, () => {
  it('causa 3 de dano a um jogador', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[B], []] });
    tg.choose('qualquer alvo', ['Bruno']).cast(B).resolve();
    expect(tg.life(1)).toBe(37);
  });
  it('causa 3 de dano a uma criatura', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Wall of Omens', 'Indomitable Ancients']], hand: [[B], []] });
    tg.choose('qualquer alvo', ['Indomitable Ancients']).cast(B).resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    const tg2 = setup({ battlefield: [['Mountain'], ['Elvish Mystic']], hand: [[B], []] });
    tg2.choose('qualquer alvo', ['Elvish Mystic']).cast(B).resolve();
    expect(tg2.find('Elvish Mystic')).toBeNull();
  });
  it('é uma instantânea: pode ser conjurada no turno do oponente', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain'], []], hand: [[B], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast(B)).toBe(true);
  });
});
