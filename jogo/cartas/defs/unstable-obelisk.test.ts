import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const U = 'Unstable Obelisk';

describe(U, () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana(U)).toEqual(['C']));
  it('{7}, {T}, sacrifique: destrói o permanente alvo', () => {
    const tg = setup({ battlefield: [[U, ...Array(7).fill('Mountain')], ['Sol Ring', 'Indomitable Ancients']] });
    tg.choose('permanente alvo', ['Sol Ring']);
    tg.activate(U, 'Destrua');
    expect(tg.names(0, 'graveyard')).toEqual([U]);
    tg.resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
  it('não usa a própria mana para pagar o {7}', () => {
    const tg = setup({ battlefield: [[U, ...Array(6).fill('Mountain')], ['Sol Ring']] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
