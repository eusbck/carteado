import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "King Solomon's Frogs";

describe(N, () => {
  it('conjurado, exila até uma permanente de valor de mana 3 ou maior de cada oponente, que compra uma carta', () => {
    // Indomitable Ancients tem valor 4; Sol Ring, 1
    const tg = setup({ battlefield: [Array(4).fill('Plains'), ['Indomitable Ancients', 'Sol Ring']], hand: [[N], []], library: [['Island'], ['Forest', 'Forest']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('para cada oponente')) return null;
      expect(d.items.filter((i) => !i.disabled).map((i) => i.label)).toEqual(['Indomitable Ancients']);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'flash')).toBe(true);
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
  });

  it('posto no campo sem ser conjurado, não dispara; {3}, {T}, exile: você vira o monarca', () => {
    const tg = setup({ battlefield: [Array(3).fill('Plains'), ['Indomitable Ancients']] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('para cada oponente')) throw new Error('não devia disparar'); return null; });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    tg.activate(N).resolveAll();
    expect(tg.state.monarch).toBe(0);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });
});