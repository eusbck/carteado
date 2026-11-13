import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Join the Collective';

describe(N, () => {
  it('destrói todas as criaturas e cria uma ficha Borg para cada criatura que não é artefato destruída', () => {
    const tg = setup({
      battlefield: [[...Array(7).fill('Plains'), 'Wall of Omens', { name: 'Borg', token: true }], ['Zetalpa, Primal Dawn', 'Indomitable Ancients', 'Steel Overseer']],
      hand: [[N], []],
    });
    tg.cast(N).resolveAll();
    // Zetalpa é indestrutível e fica; Muro e Ancients contam; a ficha Borg e o Steel Overseer são artefatos
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find('Steel Overseer')).toBeNull();
    expect(tg.all('Borg')).toHaveLength(2);
  });
});
