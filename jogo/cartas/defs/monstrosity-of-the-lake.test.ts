import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Monstrosity of the Lake';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('pagando {5} ao entrar, vira as criaturas dos oponentes e põe um marcador de atordoamento em cada uma', () => {
    const tg = setup({ battlefield: [[...Array(10).fill('Island'), 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    tg.yes('Pagar', true);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 6]);
    const anciao = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anciao].tapped).toBe(true);
    expect(tg.state.objects[anciao].counters.stun).toBe(1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    // na etapa de desvirar dele, o marcador sai e a criatura continua virada
    tg.passTo('main1', 1);
    expect(tg.state.objects[anciao].tapped).toBe(true);
    expect(tg.state.objects[anciao].counters.stun ?? 0).toBe(0);
  });

  it('ciclagem de ilha {2}: descarta e busca uma carta de Island', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[N], []], library: [['Swamp', 'Island', 'Swamp'], []] });
    tg.choose('Procure', ['Island']);
    tg.activate(N, 'iclagem').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
