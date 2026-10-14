import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

const NOME = 'Honored Dreyleader';

describe(NOME, () => {
  it('entra com um marcador por Squirrel e por Food que você já controla; depois, um por Squirrel ou Food que entra', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', { name: 'Squirrel', token: true }, { name: 'Food', token: true }], [{ name: 'Food', token: true }]], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    const d = tg.bf(NOME);
    expect(tg.state.objects[d].counters['+1/+1']).toBe(2);
    tg.run(createTokens(tg.g, 0, 'Food', 1));
    tg.run(createTokens(tg.g, 0, 'Rat', 1));
    tg.resolveAll();
    expect(tg.state.objects[d].counters['+1/+1']).toBe(3);
  });
});
