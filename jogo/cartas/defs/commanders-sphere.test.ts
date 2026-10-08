import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

function cores(comandantes: string[]): string[] {
  const tg = setup({ battlefield: [["Commander's Sphere"], []], command: [comandantes, []] });
  return [...new Set(manaOptions(tg.g, 0).map((o) => o.alt.join('')))].sort();
}

describe("Commander's Sphere", () => {
  it('mana da identidade do comandante', () => expect(cores(['Terra, Herald of Hope'])).toEqual(['B', 'R', 'W']));
  it('com dois comandantes, a identidade combinada', () => expect(cores(['Dina, Essence Brewer', 'Rootha, Mastering the Moment'])).toEqual(['B', 'G', 'R', 'U']));
  it('sem comandante, não produz mana', () => expect(cores([])).toEqual([]));
  it('comandante incolor não faz produzir {C}', () => expect(cores(['Sol Ring'])).toEqual([]));
  it('sacrifique: compre uma carta', () => {
    const tg = setup({ battlefield: [["Commander's Sphere"], []], library: [['Island'], []] });
    tg.activate("Commander's Sphere", 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
