import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = "Caves of Koilos";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","C","W"]));
  it('CR 120.3a: a mana colorida causa 1 de dano a você; {C} não', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const acts = tg.actionIds().filter((a) => a.startsWith('mana:'));
    const colorida = acts.find((a) => a.endsWith('|1'))!;
    tg.answer({ kind: 'priority', action: colorida });
    expect(tg.life(0)).toBe(39);
  });
});
