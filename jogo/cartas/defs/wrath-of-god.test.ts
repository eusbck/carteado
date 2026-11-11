import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Wrath of God';

describe(N, () => {
  it('destrói todas as criaturas e deixa o resto', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Segovian Angel', 'Sol Ring'], ['Baleful Strix', 'Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def !== 'Plains').map((id) => tg.state.objects[id].def)).toEqual(['Sol Ring']);
  });
});
