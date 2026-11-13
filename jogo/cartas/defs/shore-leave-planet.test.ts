import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shore Leave Planet';

describe(N, () => {
  it('entra virado e gera {U}', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('{4}{U}: vira uma cópia da sua criatura até o fim do turno, sem ser lendária e como artefato Robot', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Island', 'Island', 'Hugh, First of Many'], []] });
    tg.choose('criatura alvo que você controla', ['Hugh, First of Many']).activate(N, 'cópia').resolveAll();
    const ids = tg.all('Hugh, First of Many');
    expect(ids).toHaveLength(2);
    const copia = ids.find((id) => tg.state.objects[id].def === N)!;
    const ch = chars(tg.g, copia);
    expect(ch.supertypes).not.toContain('Legendary');
    expect(ch.types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(ch.types).not.toContain('Land');
    expect(ch.subtypes).toEqual(expect.arrayContaining(['Borg', 'Robot']));
    tg.passTo('main1', 1);
    expect(chars(tg.g, tg.bf(N)).types).toContain('Land');
  });
});
