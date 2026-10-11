import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Crucible of Fire';

describe(C, () => {
  it('as criaturas Dragon que você controla recebem +3/+3 (inclusive as que entram depois)', () => {
    const tg = setup({ battlefield: [[C, 'Rapacious Dragon', 'Wall of Omens'], ['Thunderbreak Regent']] });
    expect(tg.pt(tg.bf('Rapacious Dragon'))).toEqual([6, 6]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
    expect(tg.pt(tg.bf('Thunderbreak Regent'))).toEqual([4, 4]); // de oponente
    tg.run(createTokens(tg.g, 0, 'Dragon 5/5', 1));
    const ficha = tg.all('Dragon').find((id) => tg.state.objects[id].isToken)!;
    expect(tg.pt(ficha)).toEqual([8, 8]);
  });
});
