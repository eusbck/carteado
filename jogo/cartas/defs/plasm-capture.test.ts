import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Plasm Capture';
const anula = ['Forest', 'Forest', 'Island', 'Island'];

describe(N, () => {
  it('com X na mágica anulada, o valor de mana conta o X', () => {
    const tg = setup({
      active: 1, battlefield: [anula, ['Island', 'Island', 'Island', 'Island', 'Slither Blade', 'Triton Shorestalker']],
      hand: [[N], ['Curse of the Swine']],
    });
    tg.number('valor de X', 2).choose('X criaturas alvo', ['Slither Blade', 'Triton Shorestalker']);
    tg.cast('Curse of the Swine');
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.choose('mágica alvo', ['Curse of the Swine']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Curse of the Swine']);
    expect(tg.find('Slither Blade')).not.toBeNull();
    // {X}{U}{U} com X = 2: valor de mana 4
    tg.passTo('main1', 0);
    expect(tg.state.players[0].manaPool).toHaveLength(4);
  });

  it('a mana vem na primeira fase principal do seu próximo turno, não na segunda deste', () => {
    const tg = setup({ battlefield: [[...anula, 'Island', 'Swamp'], []], hand: [[N, 'Baleful Strix'], []] });
    tg.cast('Baleful Strix');
    tg.choose('mágica alvo', ['Baleful Strix']).cast(N).resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Baleful Strix', N]);
    tg.passTo('main2', 0);
    expect(tg.state.players[0].manaPool).toHaveLength(0);
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.state.players[0].manaPool).toHaveLength(2);
  });
});
