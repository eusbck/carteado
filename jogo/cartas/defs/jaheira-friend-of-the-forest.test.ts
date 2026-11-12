import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Jaheira, Friend of the Forest';

describe(N, () => {
  it('todas as fichas, não só as de criatura, ganham "{T}: Adicione {G}"', () => {
    const tg = setup({ battlefield: [[N, { name: 'Treasure', token: true }, { name: 'Servo', token: true }, 'Elvish Mystic'], [{ name: 'Food', token: true }]] });
    const opcoes = (id: number) => manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''));
    expect(opcoes(tg.bf('Treasure'))).toContain('G');
    expect(opcoes(tg.bf('Servo'))).toEqual(['G']);
    // Elvish Mystic não é ficha: só a própria mana
    expect(opcoes(tg.bf('Elvish Mystic'))).toEqual(['G']);
    expect(manaOptions(tg.g, 1)).toEqual([]); // a Food do oponente não ganha
  });

  it('CR 302.6: a ficha de criatura que acabou de entrar não pode virar para a mana; a de artefato pode', () => {
    const tg = setup({ battlefield: [[N], []] });
    const [servo] = runEffect(tg, createTokens(tg.g, 0, 'Servo', 1));
    const [food] = runEffect(tg, createTokens(tg.g, 0, 'Food', 1));
    const objs = manaOptions(tg.g, 0).map((o) => o.obj);
    expect(objs).not.toContain(servo);
    expect(objs).toContain(food);
  });
});
