import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Alter Reality';

describe(N, () => {
  it('a palavra de cor é escolhida na resolução e a troca não acaba no fim do turno', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Malakir Bloodwitch']], hand: [[N], []], library: [['Opt'], ['Swamp', 'Swamp']] });
    tg.choose('mágica ou permanente alvo', ['Malakir Bloodwitch']).choose('palavra que vai ser trocada', ['branco']).choose('palavra nova', ['verde']).cast(N).resolve();
    expect(kwParams(tg.g, tg.bf('Malakir Bloodwitch'), 'protection')).toEqual(['color:G']);
    tg.passTo('upkeep', 1);
    expect(kwParams(tg.g, tg.bf('Malakir Bloodwitch'), 'protection')).toEqual(['color:G']);
  });
  it('conjurada por retrospectiva, vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Malakir Bloodwitch']], graveyard: [[N], []] });
    tg.choose('mágica ou permanente alvo', ['Malakir Bloodwitch']).cast(N, 'flashback').resolve();
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});
