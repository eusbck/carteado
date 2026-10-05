import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Eccentric Pestfinder // Turn Stones';

describe(NOME, () => {
  it('só prepara se você ganhou vida no turno; ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação', () => {
    const tg = setup({ players: 3, battlefield: [[NOME, 'Swamp', 'Forest'], [], []], library: [['Island', 'Island'], ['Island'], ['Island']] });
    tg.passTo('end');
    expect(tg.state.objects[tg.bf(NOME)].prepared).toBe(false);
    const tg2 = setup({ players: 3, battlefield: [[NOME, 'Swamp', 'Forest'], [], []], library: [['Island', 'Island', 'Island'], ['Island', 'Island'], ['Island', 'Island']] });
    tg2.state.turnStats[0].lifeGained = 1;
    tg2.passTo('end');
    expect(tg2.state.objects[tg2.bf(NOME)].prepared).toBe(true);
    // feitiço: só na próxima fase principal sua (a designação continua)
    tg2.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1');
    tg2.cast('Turn Stones', 'prepared').resolve();
    expect(tg2.all('Pest').length).toBe(2);
    expect(tg2.state.objects[tg2.bf(NOME)].prepared).toBe(false);
  });
});
