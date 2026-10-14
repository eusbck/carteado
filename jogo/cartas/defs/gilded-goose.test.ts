import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Gilded Goose';

describe(NOME, () => {
  it('quando entra, cria uma Food; {1}{G}, {T}: outra Food', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.all('Food').length).toBe(1);
    tg.state.objects[tg.bf(NOME)].controlledSince = 0;
    tg.g.bump();
    tg.refresh();
    tg.activate(NOME, 'Crie').resolve();
    expect(tg.all('Food').length).toBe(2);
  });

  it('{T}, sacrifique uma Food: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Food', token: true }], []] });
    const d = tg.pending!;
    if (d.kind !== 'priority') throw new Error('sem prioridade');
    const acao = d.actions.find((a) => a.label.startsWith(NOME) && a.label.includes('{R}'))!;
    tg.answer({ kind: 'priority', action: acao.id });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
    expect(tg.all('Food')).toEqual([]);
  });
});
