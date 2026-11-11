import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Academy Ruins';

describe(N, () => {
  it('{1}{U}, {T}: põe a carta de artefato alvo do seu cemitério no topo do grimório', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [['Sol Ring', 'Wall of Omens'], []] });
    tg.choose('carta de artefato alvo', ['Sol Ring']).activate(N, 'Coloque').resolveAll();
    const topo = tg.state.zones.library[0][0];
    expect(tg.state.objects[topo].def).toBe('Sol Ring');
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
});
