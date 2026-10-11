import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "Evincar's Justice";
const pantanos = (n: number) => Array(n).fill('Swamp');

describe(N, () => {
  it('causa 2 de dano a cada criatura e a cada jogador; sem a recompra, vai para o cemitério', () => {
    const tg = setup({ players: 3, battlefield: [[...pantanos(4), 'Elvish Mystic'], ['Indomitable Ancients'], []], hand: [[N], [], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([38, 38, 38]);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('CR 702.27a: com a recompra {3} paga, a carta volta para a mão ao resolver', () => {
    const tg = setup({ battlefield: [pantanos(7), []], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: recompra {3}']).cast(N).resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.all('Swamp').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('CR 702.27a: anulada, não resolve e vai para o cemitério mesmo com a recompra paga', () => {
    const tg = setup({ battlefield: [pantanos(7), []], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: recompra {3}']).cast(N);
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.life(1)).toBe(40);
  });
});
