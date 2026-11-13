import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Starting Town';

function jogarNoTurno(n: number) {
  const tg = setup({ battlefield: [[], []], hand: [[NOME], []], onStart: (t) => { t.state.players[0].turnsTaken = n; } });
  tg.play(NOME);
  return tg.state.objects[tg.bf(NOME)].tapped;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('no seu primeiro, segundo ou terceiro turno, entra desvirado', () => {
    expect(jogarNoTurno(1)).toBe(false);
    expect(jogarNoTurno(3)).toBe(false);
  });
  it('a partir do quarto turno, entra virado', () => expect(jogarNoTurno(4)).toBe(true));
  it('{T}, pague 1 de vida: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], []], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares');
    expect(tg.life(0)).toBe(39);
  });
  it('Town é um tipo de terreno sem regras próprias (CR 205.3i)', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Town']);
  });
});
