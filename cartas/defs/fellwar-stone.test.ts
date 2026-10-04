import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

function cores(oponente: (string | { name: string; tapped: boolean })[]): string[] {
  const tg = setup({ battlefield: [['Fellwar Stone', 'Plains'], oponente] });
  const id = tg.bf('Fellwar Stone');
  return [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort();
}

describe('Fellwar Stone', () => {
  it('produz uma mana só, das cores dos terrenos dos oponentes', () => expect(cores(['Island', 'Mountain', 'Sol Ring'])).toEqual(['R', 'U']));
  it('vale mesmo com os terrenos do oponente virados', () => expect(cores([{ name: 'Swamp', tapped: true }])).toEqual(['B']));
  it('nunca produz incolor', () => expect(cores(['Reliquary Tower'])).toEqual([]));
});
