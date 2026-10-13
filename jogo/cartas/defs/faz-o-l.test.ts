import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Faz o L';
const lib = Array(8).fill('Island');
const terras = ['Swamp', 'Swamp', 'Mountain', 'Mountain', 'Mountain'];

describe(N, () => {
  it('o oponente que escolhe sacrificar perde uma criatura', () => {
    const tg = setup({ battlefield: [terras, ['Elvish Mystic']], hand: [[N], []], library: [lib, ['Sol Ring', ...lib]] });
    tg.choose('Faz o L', ['Você sacrifica uma criatura']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'exile')).toEqual([]);
  });

  it('o oponente que escolhe o topo: a carta é exilada e você pode jogá-la neste turno com mana de qualquer tipo', () => {
    const tg = setup({ battlefield: [terras, ['Elvish Mystic']], hand: [[N], []], library: [lib, ['Llanowar Elves', ...lib]] });
    tg.choose('Faz o L', ['O oponente exila a carta do topo do seu grimório e pode jogá-la neste turno']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Llanowar Elves']);
    // sobrou uma Mountain: paga o {G}
    tg.cast('Llanowar Elves', '*').resolveAll();
    expect(tg.state.objects[tg.bf('Llanowar Elves')].controller).toBe(0);
    expect(tg.find('Elvish Mystic', 'battlefield')).not.toBeNull();
  });

  it('quem não tem criatura não pode escolher sacrificar', () => {
    const tg = setup({ battlefield: [terras, []], hand: [[N], []], library: [lib, ['Sol Ring', ...lib]] });
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
  });
});
