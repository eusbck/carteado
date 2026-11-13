import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Familiar's Ruse";
const ND = "Night's Whisper";

describe(N, () => {
  it('sem mágica na pilha não dá para conjurar; devolve uma criatura e anula a mágica', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island', 'Memnite']], hand: [[ND], [N]] });
    tg.pass();
    expect(tg.canCast(N)).toBe(false);
    const tg2 = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island', 'Memnite']], hand: [[ND], [N]] });
    tg2.cast(ND).pass();
    tg2.choose('Devolva', ['Memnite']);
    tg2.choose('mágica alvo', [ND]).cast(N).resolve();
    expect(tg2.names(0, 'graveyard')).toEqual([ND]);
    expect(tg2.names(1, 'hand')).toEqual(['Memnite']);
  });
  it('sem criatura para devolver, não dá para conjurar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [[ND], [N]] });
    tg.cast(ND).pass();
    expect(tg.canCast(N)).toBe(false);
  });
});
