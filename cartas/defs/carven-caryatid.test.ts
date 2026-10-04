// cobre: Wall of Blossoms
import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

for (const [nome, terrenos] of [['Carven Caryatid', ['Forest', 'Forest', 'Forest']], ['Wall of Blossoms', ['Forest', 'Forest']]] as const) {
  describe(nome, () => {
    it('defensor; ao entrar, compra uma carta', () => {
      expect(temPalavrasChave(nome, 'defender')).toBe(true);
      const tg = setup({ battlefield: [[...terrenos], []], hand: [[nome], []], library: [['Island'], []] });
      tg.cast(nome).resolve().resolve();
      expect(tg.names(0, 'hand')).toEqual(['Island']);
    });
  });
}
