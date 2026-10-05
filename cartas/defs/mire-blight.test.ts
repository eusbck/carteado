import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage, destroy } from '../../motor/api.ts';

describe('Mire Blight', () => {
  it('destrói a criatura encantada no disparo, mesmo que a Aura saia', () => {
    const tg = setup({ battlefield: [['Gau, Feral Youth'], ['Wall of Omens', { name: 'Mire Blight', attachTo: 'Wall of Omens' }]] });
    dealDamage(tg.g, [{ source: tg.bf('Gau, Feral Youth'), target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 1, combat: false }]);
    tg.run(destroy(tg.g, [tg.bf('Mire Blight')]));
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
