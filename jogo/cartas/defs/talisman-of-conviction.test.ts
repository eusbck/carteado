import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Talisman of Conviction';

function virarPara(sufixo: string): number {
  const tg = setup({ battlefield: [[NOME], []] });
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label.endsWith(sufixo))!.id });
  return tg.life(0);
}

describe(NOME, () => {
  it('CR 605: {C}, {R} ou {W}', () => expect(alternativasDeMana(NOME)).toEqual(["C","R","W"]));
  it('CR 120.3a: a mana colorida causa 1 de dano a você; {C} não', () => {
    expect(virarPara('{R}')).toBe(39);
    expect(virarPara('{W}')).toBe(39);
    expect(virarPara('{C}')).toBe(40);
  });
});
