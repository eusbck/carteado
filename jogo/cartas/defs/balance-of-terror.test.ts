import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Balance of Terror';

describe(N, () => {
  it('I destrói outro artefato ou encantamento; II exila uma permanente sua, que volta na etapa final', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Sol Ring']],
      hand: [[N], []],
      library: [['Forest', 'Forest', 'Forest', 'Forest'], ['Island', 'Island', 'Island']],
    });
    tg.choose('outro artefato ou encantamento', ['Sol Ring']);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    // próximo turno de Ana: capítulo II depois da compra
    tg.choose('outra permanente alvo', ['Wall of Omens']);
    tg.choose('outra permanente alvo', ['Wall of Omens']);
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.resolveAll();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield')).not.toBeNull();
  });
});
