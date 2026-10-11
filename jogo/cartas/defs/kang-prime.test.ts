import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kang Prime';

describe(N, () => {
  it('voar; ao entrar, exila do topo até uma carta que não é terreno, que recebe dois marcadores de tempo e suspender', () => {
    const tg = setup({ battlefield: [[], []], library: [['Swamp', 'Swamp', 'Indomitable Ancients', ...Array(8).fill('Island')], Array(8).fill('Island')] });
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 5]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Swamp', 'Swamp', 'Indomitable Ancients']);
    const carta = tg.state.zones.exile.find((x) => tg.state.objects[x].def === 'Indomitable Ancients')!;
    expect(tg.state.objects[carta].counters.time).toBe(2);
    // duas manutenções suas depois, ela é conjurada sem pagar o custo
    tg.yes('Indomitable Ancients', true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.state.objects[carta]?.counters.time).toBe(1);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Swamp', 'Swamp']);
  });

  it('ao atacar, exila de novo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', ...Array(8).fill('Island')], Array(8).fill('Island')] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    expect(tg.life(1)).toBe(37);
  });
});
