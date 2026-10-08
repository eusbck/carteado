import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, moveObjects } from '../../motor/api.ts';

describe('Gau, Feral Youth', () => {
  it('fúria: ataca e recebe +1/+1; sem carta saindo do cemitério, não dispara', () => {
    const tg = setup({ battlefield: [['Gau, Feral Youth'], []], library: [['Island'], ['Island']] });
    tg.attack([['Gau, Feral Youth', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
    tg.passTo('cleanup');
    expect(tg.life(1)).toBe(37);
  });
  it('fora do campo, usa a última força conhecida', () => {
    const tg = setup({ step: 'main2', battlefield: [[{ name: 'Gau, Feral Youth', counters: { '+1/+1': 2 } }], []], graveyard: [['Plains'], []], library: [['Island'], ['Island']] });
    tg.run(moveObjects(tg.g, [{ id: tg.state.zones.graveyard[0][0], to: 'hand' }], 'effect'));
    tg.passTo('end');
    tg.run(destroy(tg.g, [tg.bf('Gau, Feral Youth')]));
    tg.resolve();
    expect(tg.life(1)).toBe(36);
  });
});
