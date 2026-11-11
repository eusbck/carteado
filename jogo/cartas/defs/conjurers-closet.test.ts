import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = "Conjurer's Closet";

describe(C, () => {
  it('exila e devolve sob o seu controle na sua etapa final', () => {
    const tg = setup({ battlefield: [[C, 'Wall of Omens'], []], library: [['Opt', 'Opt'], ['Opt']] });
    const antes = tg.bf('Wall of Omens');
    tg.choose('criatura alvo', ['Wall of Omens']);
    tg.passTo('end').resolveAll();
    expect(tg.bf('Wall of Omens', 0)).not.toBe(antes);
  });
});
