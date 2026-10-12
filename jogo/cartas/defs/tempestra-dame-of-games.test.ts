import { describe, expect, it } from 'vitest';
import { hasKw, isLegendary } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tempestra, Dame of Games';

describe(N, () => {
  it('sacrificando um artefato, cria uma cópia não lendária com ímpeto de outra criatura sua, sacrificada na próxima etapa final', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Sol Ring', 'Rat King, Pale Piper'], []] });
    tg.choose('Sacrifique', ['Sol Ring']).choose('outra criatura alvo que você controla', ['Rat King, Pale Piper']).activate(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    const ficha = tg.all('Rat King, Pale Piper').find((id) => tg.state.objects[id].isToken)!;
    expect(isLegendary(tg.g, ficha)).toBe(false);
    expect(hasKw(tg.g, ficha, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.all('Rat King, Pale Piper')).toHaveLength(1);
  });
});