import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Wake the Dragon';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('cria um Dragon 6/6 preto e vermelho com voar e ameaçar; o dano de combate dele rouba um artefato do jogador', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Swamp'), ...Array(3).fill('Mountain')], ['Sol Ring']], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    const dragao = tg.bf('Dragon');
    expect(tg.pt(dragao)).toEqual([6, 6]);
    expect(hasKw(tg.g, dragao, 'flying') && hasKw(tg.g, dragao, 'menace')).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.choose('artefato alvo', ['Sol Ring']);
    tg.attack([[dragao, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(34);
    expect(controllerOf(tg.g, tg.find('Sol Ring')!)).toBe(0);
  });

  it('retrospectiva {6}{B}{R}: conjurada do cemitério e exilada', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), ...Array(4).fill('Mountain')], []], graveyard: [[N], []], library: [lib, lib] });
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.all('Dragon')).toHaveLength(1);
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});
