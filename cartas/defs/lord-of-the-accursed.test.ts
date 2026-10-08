import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Lord of the Accursed';
const ficha = { name: 'Zombie 2/2', token: true };

describe(NOME, () => {
  it('os outros Zombies que você controla recebem +1/+1; ele mesmo e os do oponente não', () => {
    const tg = setup({ battlefield: [[NOME, ficha, 'Viscera Seer'], [ficha]] });
    expect(tg.pt(tg.bf(NOME))).toEqual([2, 3]);
    expect(tg.pt(tg.bf('Zombie', 0))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Viscera Seer'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Zombie', 1))).toEqual([2, 2]);
  });

  it('CR 611.2c: todos os Zombies no campo (inclusive do oponente) ganham ameaça até o fim do turno; quem entra depois não', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', ficha, 'Viscera Seer'], [ficha]], library: [['Island'], ['Island']] });
    tg.activate(NOME, 'ameaça').resolve();
    const meu = tg.bf('Zombie', 0);
    const dele = tg.bf('Zombie', 1);
    expect(hasKw(tg.g, tg.bf(NOME), 'menace')).toBe(true);
    expect(hasKw(tg.g, meu, 'menace')).toBe(true);
    expect(hasKw(tg.g, dele, 'menace')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Viscera Seer'), 'menace')).toBe(false);
    const [nova] = tg.run(createTokens(tg.g, 0, 'Zombie 2/2', 1));
    expect(hasKw(tg.g, nova, 'menace')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, meu, 'menace')).toBe(false);
  });
});
