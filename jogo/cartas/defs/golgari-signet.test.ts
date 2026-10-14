import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'Golgari Signet';

function acao(tg: TestGame, rotulo: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label === rotulo)!.id });
  tg.settle();
}

describe(NOME, () => {
  it('CR 605: produz {B}{G} de uma vez', () => expect(alternativasDeMana(NOME)).toEqual(['BG']));
  it('{1}, {T}: paga o {1} com mana de outra fonte e adiciona {B}{G}', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp'], []] });
    acao(tg, 'Swamp: adicionar {B}');
    acao(tg, `${NOME}: adicionar {B}{G}`);
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'G']);
  });
});
