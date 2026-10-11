import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Soothsaying';

describe(N, () => {
  it('{X}: olha as X do topo e as põe de volta na ordem escolhida', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], library: [['Sol Ring', 'Hex', 'Languish', 'Island'], []] });
    const [a, b, c] = tg.state.zones.library[0];
    tg.number('valor de X', 3).choose('Soothsaying', [c, a, b]);
    tg.activate(N, '{X}').resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Languish', 'Sol Ring', 'Hex', 'Island']);
  });

  it('{3}{U}{U}: embaralha o seu grimório (as mesmas cartas continuam lá)', () => {
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Island')], []], library: [['Sol Ring', 'Hex', 'Languish', 'Island'], []] });
    tg.activate(N, '{3}{U}{U}').resolveAll();
    expect(tg.names(0, 'library').sort()).toEqual(['Hex', 'Island', 'Languish', 'Sol Ring']);
  });
});
