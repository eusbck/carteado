// cobre: Command Tower
import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

function cores(nome: string, comandantes: string[]): string[] {
  const tg = setup({ battlefield: [[nome], []], command: [comandantes, []] });
  return [...new Set(manaOptions(tg.g, 0).map((o) => o.alt.join('')))].sort();
}

for (const nome of ['Arcane Signet', 'Command Tower']) {
  describe(nome, () => {
    it('CR 903.4: mana de uma cor da identidade do comandante', () => expect(cores(nome, ['Terra, Herald of Hope'])).toEqual(['B', 'R', 'W']));
    it('com dois comandantes, a identidade combinada', () => expect(cores(nome, ['Dina, Essence Brewer', 'Rootha, Mastering the Moment'])).toEqual(['B', 'G', 'R', 'U']));
    it('CR 903.4f: sem comandante, não produz mana', () => expect(cores(nome, [])).toEqual([]));
    it('comandante incolor não faz produzir {C}', () => expect(cores(nome, ['Sol Ring'])).toEqual([]));
  });
}
