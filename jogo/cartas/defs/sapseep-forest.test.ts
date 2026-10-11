import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Sapseep Forest';

describe(NOME, () => {
  it('CR 305.6: Forest (não básica) dá {G}', () => {
    expect(alternativasDeMana(NOME)).toEqual(['G']);
    const tg = setup({ battlefield: [[NOME], []] });
    const c = chars(tg.g, tg.bf(NOME));
    expect([c.subtypes, c.supertypes]).toEqual([['Forest'], []]);
  });
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{G}, {T}: ganha 1 de vida, só com duas ou mais permanentes verdes', () => {
    const pode = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(NOME)}:`));
    // um terreno não é verde: Forest e Sapseep Forest não contam
    expect(pode(setup({ battlefield: [[NOME, 'Forest', 'Elvish Mystic'], []] }))).toBe(false);
    const tg = setup({ battlefield: [[NOME, 'Forest', 'Elvish Mystic', 'Sakura-Tribe Elder'], []] });
    expect(pode(tg)).toBe(true);
    tg.activate(NOME, 'vida').resolve();
    expect(tg.life(0)).toBe(41);
  });
});
