import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Treason of Isengard';

describe(N, () => {
  it('põe uma instantânea ou feitiço do cemitério no topo do grimório e reúne Orcs 2', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Consider', 'Elvish Mystic'], []], library: [['Island'], []] });
    tg.choose('carta instantânea ou de feitiço alvo', ['Consider']).cast(N).resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Consider', 'Island']);
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([2, 2]);
  });

  it('sem alvo, só reúne Orcs 2', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([2, 2]);
  });
});
