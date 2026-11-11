import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Teleportation Circle';

describe(C, () => {
  it('pisca um artefato na sua etapa final', () => {
    const tg = setup({ battlefield: [[C, 'Sol Ring'], []], library: [['Opt'], ['Opt']] });
    const antes = tg.bf('Sol Ring');
    tg.choose('artefato ou criatura', ['Sol Ring']);
    tg.passTo('end').resolveAll();
    expect(tg.bf('Sol Ring')).not.toBe(antes);
  });
});
