import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Think Twice';

describe(N, () => {
  it('da mão compra uma carta; do cemitério, por recapitular {2}{U}, compra e vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Plains', 'Swamp'], []] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Swamp']);
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(5);
  });

  it('anulada depois de conjurada por recapitular, vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Island', 'Island']], graveyard: [[N], []], hand: [[], ['Counterspell']], library: [['Plains'], []] });
    tg.cast(N, 'flashback');
    tg.pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});
