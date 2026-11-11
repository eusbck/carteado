import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Bitterblossom";

describe(C, () => {
  it('na manutenção perde 1 de vida e cria uma Faerie Rogue voadora', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Opt'], ['Opt']], step: 'untap' });
    tg.passTo('upkeep').resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(hasKw(tg.g, tg.all('Faerie Rogue')[0], 'flying')).toBe(true);
  });
});
