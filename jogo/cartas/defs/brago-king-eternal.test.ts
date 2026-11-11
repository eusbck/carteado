import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Brago, King Eternal';

describe(C, () => {
  it('ao causar dano de combate, pisca os permanentes escolhidos', () => {
    const tg = setup({ battlefield: [[C, { name: 'Sol Ring', tapped: true }], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.choose('permanentes não terreno', ['Sol Ring']);
    tg.attack([[C, 1]]).passTo('endCombat');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
  });
});
