import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Iron Man, Bleeding Edge', () => {
  it('copia a mágica de artefato uma vez por turno; a cópia vira ficha', () => {
    const tg = setup({ battlefield: [['Iron Man, Bleeding Edge'], []], hand: [['Ornithopter', 'Memnite'], []] });
    tg.yes('Iron Man');
    tg.cast('Ornithopter').resolveAll();
    expect(tg.all('Ornithopter').length).toBe(2);
    tg.cast('Memnite').resolveAll();
    expect(tg.all('Memnite').length).toBe(1);
  });
});
