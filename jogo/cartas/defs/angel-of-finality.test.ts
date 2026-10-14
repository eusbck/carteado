import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Angel of Finality';

describe(N, () => {
  it('voar; ao entrar, exila o cemitério do jogador alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], []], hand: [[N], []], graveyard: [['Sol Ring'], ['Baleful Strix', 'Rampant Growth']] });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
    expect(tg.state.zones.exile).toHaveLength(2);
  });
});
