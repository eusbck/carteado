import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

const NOME = 'Skyfisher Spider';

describe(NOME, () => {
  it('sacrifica outra criatura e só então escolhe a permanente não terreno a destruir', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest', 'Swamp', 'Forest', { name: 'Squirrel', token: true }], ['Sol Ring']], hand: [[NOME], []] });
    tg.choose('Skyfisher Spider: sacrificar', ['Squirrel']).choose('permanente não terreno', ['Sol Ring']);
    tg.cast(NOME).resolveAll();
    expect(tg.all('Squirrel')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });

  it('quando morre, pode ganhar 1 de vida por carta de criatura no cemitério e exilar-se', () => {
    const tg = setup({ battlefield: [[NOME], []], graveyard: [['Wall of Omens', 'Island'], []] });
    tg.yes('Skyfisher Spider', true);
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'exile')).toEqual([NOME]);
  });
});
