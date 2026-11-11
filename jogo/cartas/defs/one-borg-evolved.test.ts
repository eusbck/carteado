import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'One, Borg Evolved';

describe(N, () => {
  it('as criaturas artefato que você controla têm voar, golpe duplo, vigilância, ameaçar, vínculo com a vida e resguardo {2}', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }, 'Wall of Omens'], []] });
    for (const id of [tg.bf(N), tg.bf('Borg')]) {
      for (const kw of ['flying', 'double strike', 'vigilance', 'menace', 'lifelink', 'ward']) expect(hasKw(tg.g, id, kw), kw).toBe(true);
    }
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'flying')).toBe(false);
  });
});
