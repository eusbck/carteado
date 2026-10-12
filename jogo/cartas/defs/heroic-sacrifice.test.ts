import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Heroic Sacrifice';

describe(N, () => {
  it('o dano a você e às suas criaturas vai para a criatura escolhida; quando ela morre, os marcadores passam para outra e você compra', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', { name: 'Wall of Omens', counters: { '+1/+1': 2 } }, 'Silver Myr'], ['Serra Angel']],
      hand: [[N], []], library: [['Island', 'Island'], ['Island']],
    });
    const muro = tg.bf('Wall of Omens');
    const vida = tg.life(0);
    tg.choose('criatura alvo que você controla', ['Wall of Omens']).cast(N).resolveAll();
    const anjo = tg.bf('Serra Angel');
    dealDamage(tg.g, [{ source: anjo, target: { kind: 'player', id: 0 }, amount: 2, combat: false }, { source: anjo, target: { kind: 'obj', id: tg.bf('Silver Myr') }, amount: 1, combat: false }]);
    expect(tg.life(0)).toBe(vida);
    expect(tg.state.objects[tg.bf('Silver Myr')].damage).toBe(0);
    expect(tg.state.objects[muro].damage).toBe(3);
    // o dano aos oponentes não muda
    dealDamage(tg.g, [{ source: muro, target: { kind: 'obj', id: anjo }, amount: 1, combat: false }]);
    expect(tg.state.objects[anjo].damage).toBe(1);
    tg.choose('receber os marcadores', ['Silver Myr']);
    dealDamage(tg.g, [{ source: anjo, target: { kind: 'player', id: 0 }, amount: 5, combat: false }]);
    tg.refresh().resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});