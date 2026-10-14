import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'Wolfwillow Haven';

function acao(tg: TestGame, rotulo: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  tg.answer({ kind: 'priority', action: d.actions.find((a) => a.label === rotulo)!.id });
  tg.settle();
}

describe(NOME, () => {
  it('o terreno encantado virado para mana dá {G} a mais', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Swamp'], []], hand: [[NOME], []] });
    tg.choose('terreno', ['Swamp']).cast(NOME).resolve();
    acao(tg, 'Swamp: adicionar {B}');
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'G']);
  });

  it('{4}{G}, sacrifique: um Wolf 2/2; só no seu turno', () => {
    const tg = setup({ battlefield: [[{ name: NOME, attachTo: 'Forest' }, 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []] });
    tg.activate(NOME, 'Wolf').resolve();
    expect(tg.pt(tg.bf('Wolf'))).toEqual([2, 2]);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
