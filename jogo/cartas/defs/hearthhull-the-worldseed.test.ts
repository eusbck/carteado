import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Hearthhull, the Worldseed";

describe(C, () => {
  it('com 2+ cargas: sacrifica terreno, compra duas; cada oponente perde 2', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { charge: 2 } }, 'Swamp', 'Forest'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('um terreno', ['Forest']).activate('Hearthhull, the Worldseed', 'Compre').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Opt']);
    expect(tg.life(1)).toBe(38);
  });
});
