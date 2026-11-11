import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Unwinding Clock';

describe(N, () => {
  it('na etapa de desvirar do oponente, os seus artefatos desviram e as outras permanentes não', () => {
    const tg = setup({ battlefield: [[N, { name: 'Sol Ring', tapped: true }, { name: 'Island', tapped: true }], []], step: 'end' });
    tg.passTo('main1', 1);
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });

  it('com dois Unwinding Clock, os artefatos desviram uma vez só', () => {
    const tg = setup({ battlefield: [[N, N, { name: 'Sol Ring', tapped: true }], []], step: 'end' });
    tg.passTo('main1', 1);
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
  });
});
