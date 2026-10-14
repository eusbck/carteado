import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

const NOME = 'Sword of the Squeak';

describe(NOME, () => {
  it('Squirrel entra e é equipado; recebe +1/+1 por criatura sua com força ou resistência base 1, inclusive ele', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Rat', token: true, counters: { '+1/+1': 2 } }, 'Wall of Omens', 'Indomitable Ancients'], []] });
    tg.yes('Sword of the Squeak', true);
    const [s] = tg.run(createTokens(tg.g, 0, 'Squirrel', 1));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].attachedTo).toBe(s);
    // Squirrel 1/1 e Rat 1/1 (base, com marcadores) contam; Wall 0/4 e Ancients 2/10 não
    expect(tg.pt(s)).toEqual([3, 3]);
  });
});
