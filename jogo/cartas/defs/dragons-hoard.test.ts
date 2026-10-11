import { describe, expect, it } from 'vitest';
import { createTokens, putOntoBattlefield } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const H = "Dragon's Hoard";

describe(H, () => {
  it('Dragon seu entra: põe um marcador de ouro; de oponente ou não Dragon, não', () => {
    const tg = setup({ battlefield: [[H], []], hand: [['Wall of Omens'], ['Thunderbreak Regent']], library: [['Island'], []] });
    tg.run(createTokens(tg.g, 0, 'Dragon 5/5', 1));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(H)].counters.gold).toBe(1);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Thunderbreak Regent', 'hand')!, controller: 1 }], 'effect'));
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Wall of Omens', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(H)].counters.gold).toBe(1);
  });
  it('{T}, remova um marcador de ouro: compre uma carta; sem marcador, não ativa', () => {
    const tg = setup({ battlefield: [[{ name: H, counters: { gold: 1 } }], []], library: [['Island', 'Plains'], []] });
    tg.activate(H, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf(H)].counters.gold ?? 0).toBe(0);
    const tg2 = setup({ battlefield: [[H], []], library: [['Island'], []] });
    expect(tg2.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
  it('{T}: adiciona uma mana de qualquer cor', () => expect(alternativasDeMana(H)).toEqual(['B', 'G', 'R', 'U', 'W']));
});
