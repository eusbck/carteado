import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Braids, Arisen Nightmare";

describe(C, () => {
  it('sacrifica um terreno; o oponente que não sacrifica perde 2 e você compra', () => {
    const tg = setup({ battlefield: [[C, 'Swamp'], ['Wall of Omens']], library: [['Opt', 'Opt'], ['Opt']] });
    tg.lenient = true;
    tg.yes('Braids: sacrificar');
    tg.choose('Sacrifique um artefato', ['Swamp']);
    tg.passTo('end').resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});
