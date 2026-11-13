import { describe, expect, it } from 'vitest';
import { gainLife, isRingBearer, ringTemptations, ringTempts } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Frodo, Adventurous Hobbit';

describe(N, () => {
  it('ao entrar, o jogador alvo pode pôr o Sam do grimório na mão', () => {
    const tg = setup({ battlefield: [[], []], library: [['Forest', 'Sam, Loyal Attendant', 'Forest'], []] });
    tg.choose('jogador alvo', ['Ana']).yes('Parceiro com', true).choose('Escolha Sam', ['Sam, Loyal Attendant']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sam, Loyal Attendant']);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
  });

  it('com 3 ou mais de vida ganha no turno, o Anel tenta uma vez; sem isso, nem dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 5, null);
    const mao = tg.names(0, 'hand').length;
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(ringTemptations(tg.g, 0)).toBe(1);
    expect(isRingBearer(tg.g, tg.bf(N), 0)).toBe(true);
    expect(tg.names(0, 'hand').length).toBe(mao); // só a primeira tentação: não compra

    const sem = setup({ battlefield: [[N], []] });
    gainLife(sem.g, 0, 2, null);
    sem.attack([[N, 1]]).passTo('declareBlockers');
    sem.resolveAll();
    expect(ringTemptations(sem.g, 0)).toBe(0);
  });

  it('se Frodo é o Portador do Anel e o Anel já tentou você duas vezes, compra uma carta', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, ringTempts(tg.g, 0));
    gainLife(tg.g, 0, 3, null);
    const mao = tg.names(0, 'hand').length;
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(ringTemptations(tg.g, 0)).toBe(2);
    // o Anel tentado 2 vezes também faz o Portador comprar e descartar ao atacar (emblema), mas esse gatilho só vem no
    // próximo ataque; aqui a mão cresce em uma pela compra do Frodo
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });
});
