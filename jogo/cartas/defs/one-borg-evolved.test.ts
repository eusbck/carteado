import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('One, Borg Evolved', () => {
  it('criaturas-artefato suas ganham as seis habilidades', () => {
    const tg = setup({ battlefield: [['One, Borg Evolved', 'Ornithopter'], []] });
    const o = tg.bf('Ornithopter');
    for (const kw of ['flying', 'double strike', 'vigilance', 'menace', 'lifelink', 'ward']) expect(hasKw(tg.g, o, kw)).toBe(true);
  });
});
