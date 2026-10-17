import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = "Cascade Bluffs";

/** escolhe a ação de prioridade pelo rótulo (ex.: "Mountain: adicionar {R}") */
function acao(tg: TestGame, rotulo: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label === rotulo)!.id });
  tg.settle();
}
const reserva = (tg: TestGame) => tg.state.players[0].manaPool.map((u) => u.type).join('');

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["C","RR","UR","UU"]));
  it('{U/R}, {T}: paga o híbrido com {R} e adiciona {U}{U}', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain'], []] });
    acao(tg, 'Mountain: adicionar {R}');
    acao(tg, `${NOME}: adicionar {U}{U}`);
    expect(reserva(tg)).toBe('UU');
  });
  it('o híbrido não aceita mana de outra cor', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest'], []] });
    acao(tg, 'Forest: adicionar {G}');
    acao(tg, `${NOME}: adicionar {R}{R}`);
    expect(reserva(tg)).toBe('G');
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
});
