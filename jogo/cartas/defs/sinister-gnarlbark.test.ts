import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sinister Gnarlbark', () => {
  it('compra e faz blight 1 na etapa final', () => {
    const tg = setup({ step: 'main2', battlefield: [['Sinister Gnarlbark', 'Wall of Omens'], []], library: [['Island'], ['Island']] });
    tg.choose('marcador', ['Wall of Omens']);
    tg.passTo('end').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
  });
});
