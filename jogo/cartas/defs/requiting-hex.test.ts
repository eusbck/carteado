import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Requiting Hex';

describe(N, () => {
  it('sem criatura sua só oferece a conjuração sem definhar', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Wall of Omens']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Wall of Omens', 'graveyard', 1)).not.toBeNull();
    expect(tg.life(0)).toBe(40);
  });
  it('paga o custo com uma única criatura e ganha 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Indomitable Ancients', 'Elvish Mystic'], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: definhar 1 (coloque um marcador -1/-1 numa criatura sua)'])
      .choose('criatura alvo', ['Wall of Omens']).choose('blight 1', ['Indomitable Ancients']).cast(N);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['-1/-1'] ?? 0).toBe(0);
    expect(tg.life(0)).toBe(40);
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.life(0)).toBe(42);
  });
  it('pode definhar uma criatura 1/1 que morre antes da mágica resolver', () => {
    const tg = setup({ battlefield: [['Swamp', 'Elvish Mystic'], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: definhar 1 (coloque um marcador -1/-1 numa criatura sua)'])
      .choose('criatura alvo', ['Wall of Omens']).choose('blight 1', ['Elvish Mystic']).cast(N);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find(N, 'stack')).not.toBeNull();
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
  });
  it('CR 608.2b: com alvo ilegal, não destrói nem ganha vida mesmo pagando o custo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Indomitable Ancients'], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: definhar 1 (coloque um marcador -1/-1 numa criatura sua)'])
      .choose('criatura alvo', ['Wall of Omens']).cast(N);
    tg.run(exile(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
  });
  it('marcadores +1/+1 e -1/-1 se anulam depois do pagamento', () => {
    const tg = setup({ battlefield: [['Swamp', { name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: definhar 1 (coloque um marcador -1/-1 numa criatura sua)']).cast(N).resolveAll();
    const o = tg.state.objects[tg.bf('Indomitable Ancients')];
    expect(o.counters['+1/+1']).toBe(1);
    expect(o.counters['-1/-1'] ?? 0).toBe(0);
    expect(tg.life(0)).toBe(42);
  });
  it('não permite mirar criatura com valor de mana maior que 2', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
