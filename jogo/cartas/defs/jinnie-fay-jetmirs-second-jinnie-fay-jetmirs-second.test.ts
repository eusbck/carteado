import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = "Jinnie Fay, Jetmir's Second // Jinnie Fay, Jetmir's Second";
const GATO = 'Cat verde 2/2 ímpeto';
const CAO = 'Dog verde 3/1 vigilância';

describe(N, () => {
  it('no lugar das fichas, a mesma quantidade de Cat 2/2 com ímpeto', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.choose('Jinnie Fay', ['Cat 2/2 verde com ímpeto']);
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 2));
    expect(tg.all('Treasure')).toHaveLength(0);
    const gatos = tg.all(GATO);
    expect(gatos).toHaveLength(2);
    expect(tg.pt(gatos[0])).toEqual([2, 2]);
    expect(hasKw(tg.g, gatos[0], 'haste')).toBe(true);
  });

  it('ou a mesma quantidade de Dog 3/1 com vigilância; é opcional e não vale para as fichas do oponente', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.choose('Jinnie Fay', ['Dog 3/1 verde com vigilância']);
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    const [cao] = tg.all(CAO);
    expect(tg.pt(cao)).toEqual([3, 1]);
    expect(hasKw(tg.g, cao, 'vigilance')).toBe(true);
    tg.choose('Jinnie Fay', ['Criar as fichas originais']);
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 1));
    expect(tg.all('Treasure')).toHaveLength(1);
    runEffect(tg, createTokens(tg.g, 1, 'Treasure', 1));
    expect(tg.all('Treasure')).toHaveLength(2);
  });

  it('as fichas viram Cat ou Dog por inteiro, mas continuam viradas e atacando como o efeito mandava', () => {
    // Goldlust Triad: a miríade cria uma cópia virada e atacando o outro oponente
    const tg = setup({ players: 3, battlefield: [[N, 'Goldlust Triad'], [], []] });
    tg.yes('Miríade', true).choose('Jinnie Fay', ['Dog 3/1 verde com vigilância']).attack([['Goldlust Triad', 1]]);
    tg.passTo('declareBlockers');
    expect(tg.all('Goldlust Triad')).toHaveLength(1);
    const [cao] = tg.all(CAO);
    expect(tg.state.objects[cao].tapped).toBe(true);
    expect(tg.state.combat!.attackers.find((a) => a.id === cao)?.target).toEqual({ kind: 'player', id: 2 });
    // sem as habilidades da criatura copiada
    expect(hasKw(tg.g, cao, 'flying')).toBe(false);
    tg.passTo('main2');
    // exilada no fim do combate, como a miríade manda
    expect(tg.all(CAO)).toHaveLength(0);
    expect(tg.life(2)).toBe(37);
  });
});
