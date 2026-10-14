import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Sunhome, Fortress of the Legion';

describe(NOME, () => {
  it('CR 605: produz {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{2}{R}{W}, {T}: golpe duplo até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Plains', 'Mountain', 'Plains', 'Wall of Omens'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate(NOME, 'golpe duplo').resolve();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'double strike')).toBe(true);
    tg.passTo('cleanup');
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'double strike')).toBe(false);
  });
});
