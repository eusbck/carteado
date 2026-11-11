import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Glimmervoid';

describe(C, () => {
  it('sem artefatos, é sacrificado na etapa final', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Opt'], ['Opt']] });
    tg.passTo('end').resolveAll();
    expect(tg.find(C)).toBeNull();
  });
  it('com um artefato, fica', () => {
    const tg = setup({ battlefield: [[C, 'Sol Ring'], []], library: [['Opt'], ['Opt']] });
    tg.passTo('end').resolveAll();
    expect(tg.find(C)).not.toBeNull();
  });
});
