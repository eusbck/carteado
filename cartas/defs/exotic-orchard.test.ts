import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

function cores(campoAna: string[], campoBruno: string[]): string[] {
  const tg = setup({ battlefield: [['Exotic Orchard', ...campoAna], campoBruno] });
  const id = tg.bf('Exotic Orchard', 0);
  return [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort();
}

describe('Exotic Orchard', () => {
  it('considera as habilidades dos terrenos do oponente, sem olhar custos', () => {
    expect(cores([], ['Forest', { name: 'Battlefield Forge', tapped: true } as unknown as string])).toEqual(['G', 'R', 'W']);
  });
  it('nunca produz incolor', () => expect(cores([], ['Sol Ring', 'Reliquary Tower'])).toEqual([]));
  it('Exotic Orchards um contra o outro não produzem mana sozinhos', () => {
    expect(cores([], ['Exotic Orchard'])).toEqual([]);
    expect(cores(['Forest'], ['Exotic Orchard'])).toEqual(['G']);
  });
});
