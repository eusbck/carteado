import { describe, expect, it } from 'vitest';
import { addCounters, putOntoBattlefield } from '../../motor/actions.ts';
import { setup } from '../../testes/harness.ts';

describe('Hardened Scales', () => {
  it('os marcadores +1/+1 postos numa criatura sua ganham mais um; as dos oponentes não', () => {
    const tg = setup({ battlefield: [['Hardened Scales', 'Llanowar Elves'], ['Elvish Mystic']] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Llanowar Elves') }, '+1/+1', 1, 0);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Elvish Mystic') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(1);
  });
  it('com duas Hardened Scales, dois marcadores a mais', () => {
    const tg = setup({ battlefield: [['Hardened Scales', 'Hardened Scales', 'Llanowar Elves'], []] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Llanowar Elves') }, '+1/+1', 1, 0);
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(3);
  });
  it('a criatura que entraria com marcadores +1/+1 entra com um a mais', () => {
    const tg = setup({ battlefield: [['Hardened Scales'], []], hand: [['Llanowar Elves'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Llanowar Elves', 'hand')!, controller: 0, counters: { '+1/+1': 2 } }], 'effect'));
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(3);
  });
});
