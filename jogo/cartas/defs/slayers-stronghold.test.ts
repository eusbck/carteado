import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = "Slayers' Stronghold";

describe(NOME, () => {
  it('CR 605: produz {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{R}{W}, {T}: +2/+0, vigilância e ímpeto até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Plains', { name: 'Wall of Omens', ready: false }], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate(NOME, '+2/+0').resolve();
    const w = tg.bf('Wall of Omens');
    expect(tg.pt(w)).toEqual([2, 4]);
    expect(hasKw(tg.g, w, 'vigilance')).toBe(true);
    expect(hasKw(tg.g, w, 'haste')).toBe(true);
  });
});
