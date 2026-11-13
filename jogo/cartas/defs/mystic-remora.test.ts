import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mystic Remora';

describe(N, () => {
  it('na sua manutenção ganha um marcador de idade e pede {1} por marcador', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, counters: { age: 1 } }, 'Island', 'Island'], []], library: [['Opt', 'Opt'], ['Forest', 'Forest']] });
    let pedido = '';
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('manutenção cumulativa')) { pedido = d.prompt; return { kind: 'select', ids: ['yes'] }; } return null; });
    tg.passTo('draw', 0);
    expect(pedido).toContain('{2}');
    expect(tg.state.objects[tg.bf(N)].counters.age).toBe(2);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && tg.state.objects[id].tapped)).toHaveLength(2);
  });
  it('pagar a manutenção cumulativa é opcional e por inteiro; sem pagar, é sacrificada', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, counters: { age: 1 } }, 'Island'], []], library: [['Opt', 'Opt'], ['Forest', 'Forest']] });
    tg.yes('manutenção cumulativa', false);
    tg.passTo('draw', 0);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('mágica não criatura de oponente: você pode comprar a menos que ele pague {4}', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Opt']], library: [['Ponder'], ['Forest', 'Forest']] });
    tg.yes('Mystic Remora: comprar', true);
    tg.cast('Opt').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Ponder']);
  });
  it('mágica de criatura não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest']], hand: [[], ['Elvish Mystic']], library: [['Ponder'], []] });
    tg.cast('Elvish Mystic');
    expect(tg.state.zones.stack).toHaveLength(1);
  });
});
