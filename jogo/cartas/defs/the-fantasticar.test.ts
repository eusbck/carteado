import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'The Fantasticar';

describe(N, () => {
  it('pode virar criatura artefato 4/4 com voar até o fim do turno quando você conjura uma mágica que não é de criatura', () => {
    const lib = Array(6).fill('Forest');
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(chars(tg.g, id).types).toEqual(['Artifact']);
    tg.yes('virar criatura', true);
    tg.cast('Sol Ring').resolveAll();
    expect(chars(tg.g, id).types.sort()).toEqual(['Artifact', 'Creature']);
    expect(chars(tg.g, id).subtypes).toContain('Vehicle');
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.passTo('main1', 1);
    expect(chars(tg.g, id).types).toEqual(['Artifact']);
  });

  it('na quarta mágica que não é de criatura do turno, pode ser sacrificado para criar quatro Constructs 4/4 com voar e ímpeto', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Sol Ring', 'Sol Ring', 'Sol Ring', 'Sol Ring'], []] });
    tg.yes('virar criatura', false).yes('sacrificar', true);
    for (let i = 0; i < 3; i++) tg.cast('Sol Ring').resolveAll();
    expect(tg.find(N)).not.toBeNull();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.find(N)).toBeNull();
    const fichas = tg.all('Construct');
    expect(fichas).toHaveLength(4);
    expect(tg.pt(fichas[0])).toEqual([4, 4]);
    expect(hasKw(tg.g, fichas[0], 'flying') && hasKw(tg.g, fichas[0], 'haste')).toBe(true);
  });
});
