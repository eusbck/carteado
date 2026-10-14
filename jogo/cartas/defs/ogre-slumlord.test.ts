import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Ogre Slumlord';

describe(NOME, () => {
  it('uma criatura que não é ficha morre: cria uma Rat, que tem toque mortífero; ficha morrendo não dispara', () => {
    const tg = setup({ battlefield: [[NOME], ['Wall of Omens', { name: 'Squirrel', token: true }]] });
    tg.yes('Ogre Slumlord', true);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    const rat = tg.bf('Rat');
    expect(hasKw(tg.g, rat, 'deathtouch')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf('Squirrel')]));
    tg.resolveAll();
    expect(tg.all('Rat').length).toBe(1);
  });
});
