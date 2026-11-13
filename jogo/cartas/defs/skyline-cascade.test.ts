import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const N = 'Skyline Cascade';

describe(N, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(N)).toEqual(['U']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(N)).toBe(true));
  it('a criatura virada do oponente não desvira na etapa de desvirar seguinte dele, mas desvira na outra', () => {
    const tg = setup({ battlefield: [[], [{ name: 'Indomitable Ancients', tapped: true }]], hand: [[N], []], library: [['Island', 'Island', 'Island'], ['Island', 'Island', 'Island']] });
    tg.choose('oponente controla', ['Indomitable Ancients']).play(N).resolve();
    const id = tg.bf('Indomitable Ancients');
    tg.passTo('main1', 1);
    expect(tg.state.objects[id].tapped).toBe(true);
    tg.passTo('main1', 0).passTo('main1', 1);
    expect(tg.state.objects[id].tapped).toBe(false);
  });
});
