import { describe, expect, it } from 'vitest';
import { destroy, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Atsushi, the Blazing Sky';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('voar e atropelar; ao morrer, o modo dos Treasures cria três fichas', () => {
    const tg = setup({ battlefield: [[N], []], library: [forests, forests] });
    expect(hasKw(tg.g, tg.bf(N), 'flying') && hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.choose('', ['Crie três fichas de Treasure']);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(3);
    expect(tg.names(0, 'exile')).toEqual([]);
  });

  it('o outro modo exila as duas do topo, que podem ser jogadas até o fim do seu próximo turno', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', 'Island', ...forests], forests] });
    tg.choose('', ['Exile as duas cartas do topo do seu grimório. Até o fim do seu próximo turno, você pode jogar essas cartas']);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring', 'Island']);
    expect(tg.all('Treasure')).toHaveLength(0);
    // no turno do oponente não é hora de artefato nem de terreno; no seu próximo turno, sim
    tg.passTo('main1', 0);
    tg.play('Island');
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.find('Island')).not.toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('o que não foi jogado até o fim do seu próximo turno continua exilado e não pode mais ser jogado', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', 'Island', ...forests], forests] });
    tg.choose('', ['Exile as duas cartas do topo do seu grimório. Até o fim do seu próximo turno, você pode jogar essas cartas']);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    tg.passTo('main1', 0);
    expect(tg.canCast('Sol Ring')).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring', 'Island']);
    expect(tg.canCast('Sol Ring')).toBe(false);
  });
});
