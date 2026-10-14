import { describe, expect, it } from 'vitest';
import { chars, nameOf } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Imposter Mech';

describe(N, () => {
  it('entra como cópia de uma criatura do oponente, artefato Vehicle sem tipos de criatura e com tripular 3', () => {
    const tg = fixture({ battlefield: [['Island', 'Island', 'Gigantosaurus'], ['Ripjaw Raptor']], hand: [[N], []] });
    tg.choose('entrar como cópia', ['Ripjaw Raptor']);
    tg.cast(N).resolveAll();
    const m = tg.find('Ripjaw Raptor', 'battlefield', 0)!;
    expect(m).not.toBeNull();
    const c = chars(tg.g, m);
    expect(c.types).toEqual(['Artifact']);
    expect(c.subtypes).toEqual(['Vehicle']);
    expect(nameOf(tg.g, m)).toBe('Ripjaw Raptor');
    // tripula com a habilidade da exceção e vira uma criatura 4/5 com o enfurecer do Raptor
    tg.choose('Tripular:', ['Gigantosaurus']).choose('Tripular:', ['done']).activate('Ripjaw Raptor', 'Tripular').resolveAll();
    expect(chars(tg.g, m).types).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(m)).toEqual([4, 5]);
  });

  it('sem copiar, é o Veículo 3/1 com tripular 3', () => {
    const tg = fixture({ battlefield: [['Island', 'Island'], ['Ripjaw Raptor']], hand: [[N], []] });
    tg.choose('entrar como cópia', ['Não copiar']);
    tg.cast(N).resolveAll();
    expect(chars(tg.g, tg.bf(N)).subtypes).toEqual(['Vehicle']);
  });
});
