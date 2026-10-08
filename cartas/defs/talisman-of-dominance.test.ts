import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Talisman of Dominance';

/** vira o Talisman pela ação de mana cujo rótulo termina com o sufixo; devolve a vida e a reserva */
function virarPara(sufixo: string): [number, string] {
  const tg = setup({ battlefield: [[NOME], []] });
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label.endsWith(sufixo))!.id });
  return [tg.life(0), tg.state.players[0].manaPool.map((u) => u.type).join('')];
}

describe(NOME, () => {
  it('CR 605: {C}, {U} ou {B}', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'U']));
  it('CR 120.3a: a mana colorida causa 1 de dano a você; {C} não', () => {
    expect(virarPara('{U}')).toEqual([39, 'U']);
    expect(virarPara('{B}')).toEqual([39, 'B']);
    expect(virarPara('{C}')).toEqual([40, 'C']);
  });
});
