// lote3-f: habilidades de mana que funcionam da mão (CR 113.6, 605.1a) e "ative somente como uma instantânea" numa
// habilidade de mana (CR 605.3a, 117.1b), em motor/costs.ts manaOptions
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

describe('habilidades de mana fora do campo e só com prioridade', () => {
  it('CR 113.6: a habilidade de mana que diz "da sua mão" funciona da mão e não do campo', () => {
    const tg = setup({ hand: [['Simian Spirit Guide'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(true);
    const tg2 = setup({ battlefield: [['Simian Spirit Guide'], []] });
    expect(tg2.actionIds().some((a) => a.startsWith('mana:'))).toBe(false);
  });

  it('CR 605.3a: a habilidade de mana da mão paga uma mágica durante o pagamento', () => {
    const tg = setup({ hand: [['Simian Spirit Guide', 'Rite of Flame'], []] });
    expect(tg.canCast('Rite of Flame')).toBe(true);
    tg.cast('Rite of Flame').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Simian Spirit Guide']);
  });

  it('CR 117.1b: a habilidade de mana "só como instantânea" não entra no pagamento, mas pode ser ativada com prioridade', () => {
    const tg = setup({ battlefield: [["Lion's Eye Diamond"], []], hand: [['Dark Ritual'], []] });
    expect(tg.canCast('Dark Ritual')).toBe(false);
    const acao = tg.actionIds().find((a) => a.startsWith('mana:') && a.endsWith('|2'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.players[0].manaPool).toHaveLength(3);
  });
});
