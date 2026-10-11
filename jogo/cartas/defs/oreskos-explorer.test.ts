import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Oreskos Explorer';

describe(N, () => {
  it('X é o número de jogadores com mais terrenos que você, contado na resolução', () => {
    const tg = setup({
      players: 3, battlefield: [['Forest'], ['Forest', 'Forest'], ['Forest', 'Forest', 'Forest']],
      library: [['Plains', 'Forest', 'Plains', 'Plains'], [], []],
    });
    tg.choose('Oreskos Explorer', ['Plains', 'Plains']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains']);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Plains']);
  });

  it('sem jogador com mais terrenos, não acha nada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], ['Forest']], library: [['Plains', 'Plains'], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
