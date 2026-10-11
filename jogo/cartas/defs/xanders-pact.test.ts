import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Xander's Pact";
const pantanos = Array(6).fill('Swamp');
const forests = Array(10).fill('Forest');
const BAIXA = 'Pagar: baixa 2 (sacrifique uma criatura com força 2 ou mais)';

describe(N, () => {
  it('cada oponente exila o topo; você conjura essas mágicas neste turno pagando vida igual ao valor de mana', () => {
    // Bruno: Rapacious Dragon (valor de mana 5); Carla: um terreno, que não pode ser jogado assim
    const tg = setup({ players: 3, battlefield: [pantanos, [], []], hand: [[N], [], []], library: [forests, ['Rapacious Dragon', ...forests], ['Island', ...forests]] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolveAll();
    expect(tg.state.zones.exile.map((id) => tg.state.objects[id].def).sort()).toEqual(['Island', 'Rapacious Dragon']);
    expect(tg.canCast('Rapacious Dragon')).toBe(true);
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
    tg.cast('Rapacious Dragon', '*').resolveAll();
    // todos os Swamps já estavam virados: o custo foi a vida
    expect(tg.find('Rapacious Dragon', 'battlefield', 0)).not.toBeNull();
    expect(tg.life(0)).toBe(35);
  });

  it('a permissão acaba no fim do turno', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []], library: [forests, ['Sol Ring', ...forests]] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolveAll();
    expect(tg.canCast('Sol Ring')).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Sol Ring')).toBe(false);
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
  });

  it('CR 702.153a: com a baixa paga, a cópia resolve primeiro e cada oponente exila duas cartas', () => {
    const tg = setup({ battlefield: [[...pantanos, 'Indomitable Ancients'], []], hand: [[N], []], library: [forests, ['Sol Ring', 'Sol Ring', ...forests]] });
    tg.choose('custo adicional opcional', [BAIXA]).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.state.zones.exile).toHaveLength(2);
    // as duas podem ser conjuradas: 1 de vida cada
    tg.cast('Sol Ring', '*').resolveAll();
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(2);
    expect(tg.life(0)).toBe(38);
  });
});
