import { describe, expect, it } from 'vitest';
import { isType } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Biotransference';

describe(N, () => {
  it('as suas criaturas, mágicas de criatura e cartas de criatura são artefatos; conjurar artefato custa 1 de vida e cria um Necron Warrior', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Wall of Omens'], ['Elvish Mystic']], hand: [['Elvish Mystic'], []], graveyard: [['Serra Angel'], []] });
    expect(isType(tg.g, tg.bf('Wall of Omens'), 'Artifact')).toBe(true);
    expect(isType(tg.g, tg.bf('Elvish Mystic', 1), 'Artifact')).toBe(false);
    expect(isType(tg.g, tg.find('Serra Angel', 'graveyard')!, 'Artifact')).toBe(true);
    const vida = tg.life(0);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.life(0)).toBe(vida - 1);
    expect(tg.all('Necron Warrior')).toHaveLength(1);
  });
});