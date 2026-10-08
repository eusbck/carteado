import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Seedborn Muse', () => {
  it('desvira todos os seus permanentes na etapa de desvirar dos outros', () => {
    const virado = (name: string) => ({ name, tapped: true });
    const tg = setup({ players: 3, step: 'end', battlefield: [['Seedborn Muse', virado('Wall of Omens'), virado('Sol Ring'), virado('Plains')], [], [virado('Island')]], library: [[], ['Island'], []] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep');
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true); // de Carla, que não é a ativa
  });
});
