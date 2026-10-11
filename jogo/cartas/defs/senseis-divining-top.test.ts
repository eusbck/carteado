import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Sensei's Divining Top";

describe(N, () => {
  it('{1}: olha as três do topo e as põe de volta na ordem escolhida', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [['Sol Ring', 'Hex', 'Languish', 'Island'], []] });
    const [a, b, c] = tg.state.zones.library[0];
    tg.choose("Sensei's Divining Top", [b, c, a]);
    tg.activate(N, '{1}: Olhe').resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Hex', 'Languish', 'Sol Ring', 'Island']);
  });

  it('{T}: compra uma carta e o Top vai para o topo do grimório', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Hex'], []] });
    tg.activate(N, '{T}: Compre').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library')).toEqual([N, 'Hex']);
    expect(tg.find(N)).toBeNull();
  });
});
