import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Spellstutter Sprite';

describe(N, () => {
  it('com lampejo; anula a mágica com valor de mana até o número de Faeries que você controla', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island'], ['Island']], hand: [[N], ['Opt']], library: [[], ['Forest', 'Forest']] });
    tg.cast('Opt').pass().choose('mágica alvo com valor de mana X', ['Opt']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Opt']);
    expect(tg.names(1, 'hand')).toEqual([]);
  });
  it('não mira mágica com valor de mana maior que o número de Faeries', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island'], Array(4).fill('Island')], hand: [[N], ['Fact or Fiction']], library: [[], Array(6).fill('Forest')] });
    tg.cast('Fact or Fiction').pass().cast(N).resolve();
    // sem alvo legal o gatilho sai da pilha (CR 603.3d)
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toEqual(['Fact or Fiction']);
  });
  it('com menos Faeries na resolução, o alvo fica ilegal e a mágica resolve', () => {
    const tg = setup({ active: 1, battlefield: [['Island', 'Island'], ['Island']], hand: [[N], ['Opt']], library: [[], ['Forest', 'Forest']] });
    tg.cast('Opt').pass().choose('mágica alvo com valor de mana X', ['Opt']).cast(N).resolve();
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
  });
});
