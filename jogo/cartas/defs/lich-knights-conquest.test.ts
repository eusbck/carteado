import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Lich-Knights' Conquest";

describe(C, () => {
  it('sacrifica artefatos e devolve a mesma quantidade de criaturas', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Sol Ring'], []], hand: [[C], []], graveyard: [['Wall of Omens'], []], library: [['Opt'], []] });
    tg.choose('sacrifique artefatos', ['Sol Ring']).choose('Devolva', ['Wall of Omens']).cast(C).resolve().resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
