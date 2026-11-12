import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Scroll Rack';

describe(N, () => {
  it('troca cartas da mão pelas do topo e as exiladas vão para o topo na ordem escolhida', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Forest', 'Swamp', 'Cancel'], []], library: [['Plains', 'Mountain', 'Island'], []] });
    tg.choose('exilar viradas para baixo', ['Forest', 'Swamp']);
    tg.choose('ponha as cartas exiladas', ['Swamp', 'Forest']);
    tg.activate(N).resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Cancel', 'Mountain', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Forest', 'Island']);
  });
  it('com o grimório curto, pega só as cartas que houver, sem perder o jogo', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Forest', 'Swamp'], []], library: [['Plains'], []] });
    tg.choose('exilar viradas para baixo', ['Forest', 'Swamp']);
    tg.choose('ponha as cartas exiladas', ['Forest', 'Swamp']);
    tg.activate(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Swamp']);
    expect(tg.state.players[0].left).toBeFalsy();
  });
});
