import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Warp World';
const montanhas = Array(8).fill('Mountain');

describe(N, () => {
  it('cada jogador embaralha os permanentes no grimório, revela o mesmo número de cartas e põe no campo artefatos, criaturas, terrenos e depois encantamentos', () => {
    // você: 8 Mountains; grimório só com permanentes → voltam 8 cartas para o campo
    const tg = setup({
      battlefield: [montanhas, ['Elvish Mystic', 'Sol Ring']], hand: [[N], []],
      library: [['Indomitable Ancients', 'Impact Tremors'], ['Silver Myr']],
    });
    tg.cast(N).resolveAll();
    // 8 permanentes seus → 8 das 10 cartas do seu grimório (8 Mountains, Ancients, Impact Tremors) entram
    expect(tg.names(0, 'battlefield')).toHaveLength(8);
    expect(tg.names(0, 'library')).toHaveLength(2);
    // o oponente tinha 2 permanentes e 3 cartas no grimório depois de embaralhar: entram 2
    expect(tg.names(1, 'battlefield')).toHaveLength(2);
    expect(tg.names(1, 'library')).toHaveLength(1);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('instantâneas e feitiços revelados vão para o fundo do grimório', () => {
    // um permanente seu a mais do que os 8 terrenos: 9 cartas reveladas de um grimório de 9 (8 Mountains e Hex... e Preordain)
    const tg = setup({ battlefield: [[...montanhas, 'Elvish Mystic', 'Silver Myr'], []], hand: [[N], []], library: [[], []] });
    tg.state.zones.library[0] = [];
    tg.cast(N).resolveAll();
    // todas as 10 cartas eram permanentes: voltam todas
    expect(tg.names(0, 'battlefield')).toHaveLength(10);
    const com = setup({ battlefield: [[...montanhas], []], hand: [[N], []], library: [Array(8).fill('Hex'), []] });
    com.cast(N).resolveAll();
    // 8 revelações entre 8 Mountains e 8 Hex: as Mountains reveladas entram e as Hex reveladas ficam no grimório
    const noCampo = com.names(0, 'battlefield').length;
    expect(com.names(0, 'battlefield').every((n) => n === 'Mountain')).toBe(true);
    expect(com.names(0, 'library')).toHaveLength(16 - noCampo);
    expect(com.names(0, 'graveyard')).toEqual([N]);
  });

  it('fichas contam para o número de cartas reveladas e deixam de existir', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [[], Array(5).fill('Forest')] });
    tg.run(createTokens(tg.g, 1, 'Cat', 3));
    tg.cast(N).resolveAll();
    expect(tg.all('Cat')).toHaveLength(0);
    // três fichas → três Forests reveladas entram
    expect(tg.names(1, 'battlefield')).toEqual(['Forest', 'Forest', 'Forest']);
    expect(tg.names(1, 'library')).toHaveLength(2);
  });
});
