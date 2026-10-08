import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'Dimir Signet';

/** escolhe a ação de prioridade pelo rótulo (ex.: "Mountain: adicionar {R}") */
function acao(tg: TestGame, rotulo: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label === rotulo)!.id });
  tg.settle();
}
const reserva = (tg: TestGame) => tg.state.players[0].manaPool.map((u) => u.type).sort();

describe(NOME, () => {
  it('CR 605: produz {U}{B} de uma vez', () => expect(alternativasDeMana(NOME)).toEqual(['UB']));
  it('{1}, {T}: paga o {1} com mana de outra fonte e adiciona {U}{B}', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain'], []] });
    acao(tg, 'Mountain: adicionar {R}');
    acao(tg, `${NOME}: adicionar {U}{B}`);
    expect(reserva(tg)).toEqual(['B', 'U']);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('não paga o próprio {1}: sem outra mana, não adiciona nada', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    acao(tg, `${NOME}: adicionar {U}{B}`);
    expect(reserva(tg)).toEqual([]);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
});
