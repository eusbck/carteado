import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Norn's Choirmaster";
const G = 'Giada, Font of Hope';

describe(N, () => {
  it('quando o seu comandante entra, prolifera', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', { name: 'Segovian Angel', counters: { '+1/+1': 1 } }], []], command: [[G], []] });
    tg.choose('Proliferar', ['Segovian Angel']);
    tg.cast(G, 'command').resolveAll();
    expect(tg.state.objects[tg.bf('Segovian Angel')].counters['+1/+1']).toBe(2);
  });

  it('quando o seu comandante ataca, prolifera; outra criatura que ataca não', () => {
    const tg = setup({ battlefield: [[N, { name: G, commander: true }, { name: 'Segovian Angel', counters: { '+1/+1': 1 } }], []] });
    tg.choose('Proliferar', ['Segovian Angel']);
    tg.attack([[G, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Segovian Angel')].counters['+1/+1']).toBe(2);
    tg.passTo('main1', 1).passTo('main1', 0);
    tg.attack([['Segovian Angel', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Segovian Angel')].counters['+1/+1']).toBe(2);
  });
});
