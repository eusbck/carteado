import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Jurati, Cordial Queen', () => {
  it('quando criaturas-artefato causam dano de combate, copia uma ficha de artefato', () => {
    const tg = setup({ battlefield: [['Jurati, Cordial Queen', { name: 'Treasure', token: true }, { name: 'Ornithopter', counters: { '+1/+1': 1 } }], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.choose('ficha de artefato', ['Treasure']);
    tg.attack([['Ornithopter', 1]]).passTo('endCombat');
    tg.resolveAll();
    expect(tg.all('Treasure').length).toBe(2);
  });
});
