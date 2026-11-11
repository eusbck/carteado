import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Locutus of Borg', () => {
  it('criatura-artefato que causa dano de combate cria uma ficha Borg', () => {
    const tg = setup({ battlefield: [['Locutus of Borg', { name: 'Ornithopter', counters: { '+1/+1': 1 } }], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.attack([['Ornithopter', 1]]).passTo('endCombat');
    tg.resolveAll();
    expect(tg.all('Borg').length).toBe(1);
  });
});
