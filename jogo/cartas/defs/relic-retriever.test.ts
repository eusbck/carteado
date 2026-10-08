import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

describe('Relic Retriever', () => {
  it('cria Tesouro em qualquer etapa final se uma carta saiu do seu cemitério', () => {
    const tg = setup({ step: 'main2', active: 1, battlefield: [['Relic Retriever'], []], graveyard: [['Island'], []], library: [['Island'], ['Island']] });
    tg.run(exile(tg.g, [tg.state.zones.graveyard[0][0]]));
    tg.passTo('end').resolve();
    expect(tg.all('Treasure').length).toBe(1);
  });
  it('sem carta saindo do cemitério, não dispara', () => {
    const tg = setup({ step: 'main2', battlefield: [['Relic Retriever'], []], library: [['Island'], ['Island']] });
    tg.passTo('cleanup');
    expect(tg.all('Treasure').length).toBe(0);
  });
});
