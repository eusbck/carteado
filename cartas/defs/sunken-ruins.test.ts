import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'Sunken Ruins';

/** escolhe a ação de prioridade pelo rótulo (ex.: "Island: adicionar {U}") */
function acao(tg: TestGame, rotulo: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label === rotulo)!.id });
  tg.settle();
}
const reserva = (tg: TestGame) => tg.state.players[0].manaPool.map((u) => u.type).join('');

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['BB', 'C', 'UB', 'UU']));
  it('{U/B}, {T}: paga o híbrido com {U} e adiciona {B}{B}', () => {
    const tg = setup({ battlefield: [[NOME, 'Island'], []] });
    acao(tg, 'Island: adicionar {U}');
    acao(tg, `${NOME}: adicionar {B}{B}`);
    expect(reserva(tg)).toBe('BB');
  });
  it('{U/B}, {T}: paga o híbrido com {B} e adiciona {U}{B}', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp'], []] });
    acao(tg, 'Swamp: adicionar {B}');
    acao(tg, `${NOME}: adicionar {U}{B}`);
    expect(reserva(tg)).toBe('UB');
  });
  it('o híbrido não aceita mana de outra cor', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest'], []] });
    acao(tg, 'Forest: adicionar {G}');
    acao(tg, `${NOME}: adicionar {U}{U}`);
    expect(reserva(tg)).toBe('G');
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
});
