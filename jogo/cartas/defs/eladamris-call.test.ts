import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Eladamri's Call";

describe(N, () => {
  it('CR 701.23: procura uma carta de criatura, revela e põe na mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains'], []], hand: [[N], []], library: [['Island', 'Indomitable Ancients', 'Swamp'], []] });
    tg.choose('procure', ['Indomitable Ancients']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Swamp']);
  });
  it('você pode não achar a carta de criatura', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains'], []], hand: [[N], []], library: [['Island', 'Indomitable Ancients'], []] });
    tg.choose('procure', []).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });
});
