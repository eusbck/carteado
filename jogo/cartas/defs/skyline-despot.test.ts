import { describe, expect, it } from 'vitest';
import { becomeMonarch } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const S = 'Skyline Despot';
const ateManutencao = (tg: TestGame) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
const fichas = (tg: TestGame) => tg.all('Dragon').filter((id) => tg.state.objects[id].isToken);

describe(S, () => {
  it('ao entrar, você se torna o monarca e compra uma carta na sua etapa final', () => {
    const tg = setup({ battlefield: [Array(7).fill('Mountain'), []], hand: [[S], []], library: [['Island', 'Island'], ['Island']] });
    tg.cast(S).resolveAll();
    expect(hasKw(tg.g, tg.bf(S), 'flying')).toBe(true);
    expect(tg.state.monarch).toBe(0);
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('na sua manutenção, sendo o monarca, cria uma ficha Dragon 5/5 com voar', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[S], []], library: [['Island'], ['Island']] });
    tg.state.monarch = 0;
    ateManutencao(tg.refresh()).resolve();
    expect(fichas(tg)).toHaveLength(1);
    expect(tg.pt(fichas(tg)[0])).toEqual([5, 5]);
  });
  it('CR 603.4: sem ser o monarca no início da manutenção, não dispara; deixando de ser antes de resolver, não cria', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[S], []], library: [['Island'], ['Island']] });
    tg.state.monarch = 1;
    ateManutencao(tg.refresh());
    expect(tg.state.zones.stack).toHaveLength(0);
    const tg2 = setup({ step: 'end', active: 1, battlefield: [[S], []], library: [['Island'], ['Island']] });
    tg2.state.monarch = 0;
    ateManutencao(tg2.refresh());
    expect(tg2.state.zones.stack).toHaveLength(1);
    becomeMonarch(tg2.g, 1);
    tg2.refresh().resolve();
    expect(fichas(tg2)).toHaveLength(0);
  });
});
