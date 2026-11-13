import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Flusterstorm';

describe(N, () => {
  it('anula a instantânea ou feitiço a menos que quem a controla pague {1}', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Island']], hand: [[N], ['Opt']], library: [[], ['Forest', 'Forest']] });
    tg.yes('a mágica não ser anulada', false);
    tg.cast('Opt').pass().cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Opt']);
    expect(tg.names(1, 'hand')).toEqual([]);
  });
  it('CR 118.12a: quem controla a mágica paga {1} e ela resolve', () => {
    // Flusterstorm é a segunda mágica do turno: a cópia da tempestade também pede {1}
    const tg = setup({ active: 1, battlefield: [['Island'], ['Island', 'Island', 'Island']], hand: [[N], ['Opt']], library: [[], ['Forest', 'Forest']] });
    tg.yes('a mágica não ser anulada', true).yes('a mágica não ser anulada', true);
    tg.cast('Opt').pass().cast(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
  });
  it('conta as mágicas conjuradas antes no turno, inclusive as anuladas; cada cópia pode ter um alvo novo', () => {
    // o oponente conjura Opt e Brainstorm; Flusterstorm é a terceira mágica do turno: duas cópias
    const tg = setup({ active: 1, battlefield: [['Island'], ['Island', 'Island']], hand: [[N], ['Opt', 'Brainstorm']], library: [[], Array(6).fill('Forest')] });
    tg.cast('Opt').cast('Brainstorm').pass();
    const brainstorm = tg.find('Brainstorm', 'stack')!;
    const opt = tg.find('Opt', 'stack')!;
    tg.choose('mágica instantânea ou de feitiço alvo', [brainstorm]);
    tg.yes('Escolher novos alvos', true).choose('cópia de Flusterstorm', [opt]);
    tg.yes('Escolher novos alvos', false);
    for (let i = 0; i < 3; i++) tg.yes('a mágica não ser anulada', false);
    tg.cast(N);
    tg.resolve(); // a tempestade: duas cópias
    const copias = tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy);
    expect(copias).toHaveLength(2);
    tg.resolveAll();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Brainstorm', 'Opt']);
  });
});
