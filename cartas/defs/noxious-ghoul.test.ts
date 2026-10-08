import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Noxious Ghoul', () => {
  it('ao entrar, todas as criaturas não Zombie (de todos) recebem -1/-1 até o fim do turno', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Elvish Mystic', { name: 'Zombie 2/2', token: true }], ['Wall of Omens', 'Elvish Mystic']],
      hand: [['Noxious Ghoul'], []], library: [[], ['Island']],
    });
    tg.cast('Noxious Ghoul').resolve().resolve();
    expect(tg.all('Elvish Mystic').length).toBe(0);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    expect(tg.pt(tg.bf('Zombie 2/2'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Noxious Ghoul'))).toEqual([3, 3]);
    tg.passUntil((x) => x.state.turn.active === 1);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('outro Zombie de qualquer jogador entrando também dispara; não Zombie não', () => {
    const tg = setup({ battlefield: [['Noxious Ghoul'], ['Wall of Omens']] });
    tg.run(createTokens(tg.g, 1, 'Zombie 2/2', 2));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
    tg.run(createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
  });
  it('CR 611.2c: criatura que entra depois da resolução não é afetada', () => {
    const tg = setup({ battlefield: [['Noxious Ghoul', 'Wall of Omens'], []] });
    tg.run(createTokens(tg.g, 0, 'Zombie 2/2', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-1, 3]);
    tg.run(createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Soldier'))).toEqual([1, 1]);
  });
});
