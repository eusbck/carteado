import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Crashing Drawbridge', () => {
  it('{T}: suas criaturas ganham ímpeto até o fim do turno', () => {
    const tg = setup({ battlefield: [['Crashing Drawbridge', { name: 'Indomitable Ancients', ready: false }], []] });
    tg.activate('Crashing Drawbridge').resolve();
    tg.attack([['Indomitable Ancients', 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(38);
  });
});
