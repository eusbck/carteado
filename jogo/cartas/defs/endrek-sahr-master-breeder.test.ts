import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Endrek Sahr, Master Breeder';
const SEPHIROTH = 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel';

describe(NOME, () => {
  it('conjurar uma mágica de criatura cria Thrulls iguais ao valor de mana', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.cast('Wall of Omens');
    tg.resolve();
    expect(tg.all('Thrull')).toHaveLength(2);
  });

  it('com sete Thrulls, Endrek Sahr é sacrificado', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Thrull', 'Thrull', 'Thrull', 'Thrull'].map((n) => (n === 'Thrull' ? { name: n, token: true } : n)), []], hand: [[SEPHIROTH], []] });
    tg.yes('sacrificar outra criatura', false);
    tg.cast(SEPHIROTH).resolveAll();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'graveyard')).toContain(NOME);
  });
});
