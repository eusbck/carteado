import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Dazzling Angel';

describe(N, () => {
  it('outra criatura sua que entra faz você ganhar 1 de vida', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Slither Blade', 0);
    enterCard(tg, 'Baleful Strix', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
  });

  it('entrando ao mesmo tempo que outras criaturas, dispara para cada uma delas', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N, 'Slither Blade', 'Segovian Angel'], []] });
    runEffect(tg, putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'teste'));
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
  });
});
