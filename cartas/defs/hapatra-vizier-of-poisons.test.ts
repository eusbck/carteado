import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addCounters } from '../../motor/api.ts';

describe('Hapatra, Vizier of Poisons', () => {
  it('dano de combate: marcador -1/-1 na criatura alvo, e isso cria uma Snake', () => {
    const tg = setup({ battlefield: [['Hapatra, Vizier of Poisons'], ['Wall of Omens']], library: [['Island'], ['Island']] });
    tg.choose('criatura alvo para o marcador', ['Wall of Omens']).yes('Hapatra: colocar');
    tg.attack([['Hapatra, Vizier of Poisons', 1]]).passTo('combatDamage').resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['-1/-1']).toBe(1);
    expect(tg.all('Snake').length).toBe(1);
  });
  it('marcadores que matam Hapatra ainda disparam', () => {
    const tg = setup({ battlefield: [['Hapatra, Vizier of Poisons'], []] });
    tg.run((function* () { addCounters(tg.g, { kind: 'obj', id: tg.bf('Hapatra, Vizier of Poisons') }, '-1/-1', 2, 0); })());
    tg.resolveAll();
    expect(tg.find('Hapatra, Vizier of Poisons')).toBeNull();
    expect(tg.all('Snake').length).toBe(1);
  });
  it('marcadores em criaturas diferentes disparam uma vez por criatura', () => {
    const tg = setup({ battlefield: [['Hapatra, Vizier of Poisons', 'Wall of Omens'], ['Wall of Omens']] });
    tg.run((function* () { for (const id of tg.all('Wall of Omens')) addCounters(tg.g, { kind: 'obj', id }, '-1/-1', 1, 0); })());
    tg.resolveAll();
    expect(tg.all('Snake').length).toBe(2);
  });
});
